// Time-series data management service for machine monitoring
import { WebSocketEventData, isRealtimeData, isHistoricalData } from './websocketService';

export interface TimeSeriesPoint {
  timestamp: Date;
  deviceId: string;
  temperatures: {
    T1: number;
    T2: number;
    T3: number;
    T4: number;
    T5: number;
    T6: number;
    T7: number;
  };
  oilTemp: number;
  status: number;
  operationMode: number;
  autoTestStatus: number;
  sourceType: 'realtime' | 'historical' | 'spc';
  rawData?: any; // Store original data for debugging
}

export interface MachineTimeSeries {
  deviceId: string;
  realtimeData: TimeSeriesPoint[];
  historicalData: TimeSeriesPoint[];
  spcData: TimeSeriesPoint[];
  lastUpdate: Date | null;
  dataWindow: number; // Hours of data to keep
}

export class TimeSeriesDataManager {
  private machineData = new Map<string, MachineTimeSeries>();
  private maxDataAge = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  private maxPoints = 1000; // Maximum points per series to prevent memory issues

  // Event deduplication tracking
  private processedEvents = new Map<string, Set<string>>(); // deviceId -> Set of event signatures
  private maxEventSignatures = 1000; // Keep track of last 1000 event signatures per device

  constructor() {
    // Cleanup old data every 5 minutes
    setInterval(() => this.cleanupOldData(), 5 * 60 * 1000);
    // Cleanup old event signatures every hour
    setInterval(() => this.cleanupOldEventSignatures(), 60 * 60 * 1000);
  }

  // Generate unique signature for event to detect duplicates
  private generateEventSignature(eventData: WebSocketEventData, eventType: string): string {
    const timestamp = eventData.timestamp ||
                     (eventData.data?.timestamp) ||
                     (eventData.data?.sendStamp) ||
                     Date.now();

    // Create signature based on device, timestamp, event type, and data hash
    let dataHash = '';
    if (eventData.data && typeof eventData.data === 'object') {
      // For realtime data, use key temperature values
      if (eventData.data.Data) {
        dataHash = `${eventData.data.Data.T1}_${eventData.data.Data.STS}_${eventData.data.Data.OPM}`;
      } else if (Array.isArray(eventData.data)) {
        // For historical data, use length and first/last items
        dataHash = `${eventData.data.length}_${eventData.data[0]?._time}`;
      } else if (eventData.data.realtime) {
        // For nested historical format
        dataHash = `${eventData.data.realtime.length}_${eventData.data.spc?.length || 0}`;
      }
    }

    return `${eventData.deviceId}_${timestamp}_${eventType}_${dataHash}`;
  }

  // Check if event has already been processed
  private isDuplicateEvent(eventData: WebSocketEventData, eventType: string): boolean {
    const deviceId = String(eventData.deviceId);
    const signature = this.generateEventSignature(eventData, eventType);

    if (!this.processedEvents.has(deviceId)) {
      this.processedEvents.set(deviceId, new Set());
    }

    const deviceSignatures = this.processedEvents.get(deviceId)!;

    if (deviceSignatures.has(signature)) {
      console.warn(`🔄 Duplicate ${eventType} event detected for ${deviceId}, skipping...`);
      return true;
    }

    // Add signature and trim if too many
    deviceSignatures.add(signature);
    if (deviceSignatures.size > this.maxEventSignatures) {
      const signaturesArray = Array.from(deviceSignatures);
      const toRemove = signaturesArray.slice(0, signaturesArray.length - this.maxEventSignatures);
      toRemove.forEach(sig => deviceSignatures.delete(sig));
    }

    return false;
  }

  // Initialize a machine's time series data
  initializeMachine(deviceId: string, dataWindow: number = 4): void {
    if (!this.machineData.has(deviceId)) {
      this.machineData.set(deviceId, {
        deviceId,
        realtimeData: [],
        historicalData: [],
        spcData: [],
        lastUpdate: null,
        dataWindow
      });
      console.log(`📊 Initialized time-series data for device: ${deviceId}`);
    }
  }

  // Add real-time data point
  addRealtimeData(eventData: WebSocketEventData): TimeSeriesPoint | null {
    if (!isRealtimeData(eventData.data)) {
      console.warn('Invalid realtime data format:', eventData);
      return null;
    }

    // Check for duplicate events
    if (this.isDuplicateEvent(eventData, 'realtime')) {
      return null;
    }

    const deviceId = String(eventData.deviceId);
    this.initializeMachine(deviceId);

    const dataPoint: TimeSeriesPoint = {
      timestamp: new Date(eventData.timestamp || eventData.data.sendTime || Date.now()),
      deviceId,
      temperatures: {
        T1: eventData.data.Data?.T1 ?? 0,
        T2: eventData.data.Data?.T2 ?? 0,
        T3: eventData.data.Data?.T3 ?? 0,
        T4: eventData.data.Data?.T4 ?? 0,
        T5: eventData.data.Data?.T5 ?? 0,
        T6: eventData.data.Data?.T6 ?? 0,
        T7: eventData.data.Data?.T7 ?? 0,
      },
      oilTemp: eventData.data.Data?.OT ?? 0,
      status: eventData.data.Data?.STS ?? 0,
      operationMode: eventData.data.Data?.OPM ?? 0,
      autoTestStatus: eventData.data.Data?.ATST ?? 0,
      sourceType: 'realtime',
      rawData: eventData.data
    };

    const machineTimeSeries = this.machineData.get(deviceId)!;

    // Add to realtime data array
    machineTimeSeries.realtimeData.push(dataPoint);
    machineTimeSeries.lastUpdate = new Date();

    // Keep only recent data
    this.trimDataArray(machineTimeSeries.realtimeData);

    console.log(`📈 Added realtime data point for ${deviceId}:`, {
      timestamp: dataPoint.timestamp.toISOString(),
      T1: dataPoint.temperatures.T1,
      status: dataPoint.status,
      totalPoints: machineTimeSeries.realtimeData.length
    });

    return dataPoint;
  }

  // Add historical data points (supports both WebSocket and REST API formats)
  addHistoricalData(eventData: WebSocketEventData): TimeSeriesPoint[] {
    // Handle REST API format (from new v2.0 backend)
    if (eventData.data && eventData.data.data && Array.isArray(eventData.data.data)) {
      return this.addHistoricalDataFromREST(eventData);
    }

    // Handle legacy WebSocket format (deprecated)
    if (!isHistoricalData(eventData.data)) {
      console.warn('Invalid historical data format:', eventData);
      return [];
    }

    // Check for duplicate events
    if (this.isDuplicateEvent(eventData, 'historical')) {
      return [];
    }

    const deviceId = String(eventData.deviceId);
    this.initializeMachine(deviceId);

    let rawDataArray: any[] = [];

    // Handle different backend response formats
    if (Array.isArray(eventData.data)) {
      // Direct array format: [{ _time, temp_1, ... }, ...]
      rawDataArray = eventData.data;
    } else if (eventData.data && typeof eventData.data === 'object' && Array.isArray(eventData.data.realtime)) {
      // Nested object format: { realtime: [...], spc: [...] }
      rawDataArray = eventData.data.realtime;
    } else {
      console.warn('Unknown historical data format:', eventData.data);
      return [];
    }

    const dataPoints: TimeSeriesPoint[] = rawDataArray.map(point => ({
      timestamp: new Date(point._time),
      deviceId,
      temperatures: {
        T1: point.temp_1 ?? 0,
        T2: point.temp_2 ?? 0,
        T3: point.temp_3 ?? 0,
        T4: point.temp_4 ?? 0,
        T5: point.temp_5 ?? 0,
        T6: point.temp_6 ?? 0,
        T7: point.temp_7 ?? 0,
      },
      oilTemp: point.oil_temp ?? 0,
      status: point.status ?? 0,
      operationMode: point.operate_mode ?? 0,
      autoTestStatus: point.auto_start ?? 0,
      sourceType: 'historical',
      rawData: point
    }));

    const machineTimeSeries = this.machineData.get(deviceId)!;

    // Replace historical data (it's a snapshot, not incremental)
    machineTimeSeries.historicalData = dataPoints;
    machineTimeSeries.lastUpdate = new Date();

    console.log(`📚 Added historical data for ${deviceId}: ${dataPoints.length} points from ${eventData.timeRange || 'unknown range'}`);

    // Also process SPC data if it exists in the nested format
    if (eventData.data && typeof eventData.data === 'object' && Array.isArray(eventData.data.spc) && eventData.data.spc.length > 0) {
      console.log(`📊 Processing ${eventData.data.spc.length} SPC data points from historical response`);
      // Process SPC data points if needed - for now just log them
      // TODO: Add SPC data processing if required
    }

    return dataPoints;
  }

  // Add historical data from REST API format (v2.0)
  addHistoricalDataFromREST(responseData: any): TimeSeriesPoint[] {
    const deviceId = String(responseData.deviceId || responseData.metadata?.deviceId);
    this.initializeMachine(deviceId);

    if (!responseData.data || !Array.isArray(responseData.data.data)) {
      console.warn('Invalid REST API historical data format:', responseData);
      return [];
    }

    const rawDataArray = responseData.data.data;
    const dataPoints: TimeSeriesPoint[] = rawDataArray.map(point => ({
      timestamp: new Date(point._time),
      deviceId,
      temperatures: {
        T1: point.temp_1 ?? 0,
        T2: point.temp_2 ?? 0,
        T3: point.temp_3 ?? 0,
        T4: point.temp_4 ?? 0,
        T5: point.temp_5 ?? 0,
        T6: point.temp_6 ?? 0,
        T7: point.temp_7 ?? 0,
      },
      oilTemp: point.oil_temp ?? 0,
      status: point.status ?? 0,
      operationMode: point.operate_mode ?? 0,
      autoTestStatus: point.auto_start ?? 0,
      sourceType: 'historical',
      rawData: point
    }));

    const machineTimeSeries = this.machineData.get(deviceId)!;

    // Replace historical data (it's a snapshot, not incremental)
    machineTimeSeries.historicalData = dataPoints;
    machineTimeSeries.lastUpdate = new Date();

    const metadata = responseData.data.metadata || {};
    console.log(`📚 Added REST API historical data for ${deviceId}: ${dataPoints.length} points from ${metadata.timeRange || 'unknown range'}`);

    return dataPoints;
  }

  // Add SPC data point
  addSPCData(eventData: WebSocketEventData): TimeSeriesPoint | null {
    // Check for duplicate events
    if (this.isDuplicateEvent(eventData, 'spc')) {
      return null;
    }

    // SPC data might not have temperature info, but has cycle data
    const deviceId = String(eventData.deviceId);
    this.initializeMachine(deviceId);

    const dataPoint: TimeSeriesPoint = {
      timestamp: new Date(eventData.timestamp || Date.now()),
      deviceId,
      temperatures: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0 }, // SPC usually doesn't have temp
      oilTemp: 0,
      status: 0,
      operationMode: 0,
      autoTestStatus: 0,
      sourceType: 'spc',
      rawData: eventData.data
    };

    const machineTimeSeries = this.machineData.get(deviceId)!;
    machineTimeSeries.spcData.push(dataPoint);
    this.trimDataArray(machineTimeSeries.spcData);

    console.log(`📊 Added SPC data point for ${deviceId}`);
    return dataPoint;
  }

  // Get time series data for a machine
  getMachineData(deviceId: string): MachineTimeSeries | null {
    return this.machineData.get(deviceId) || null;
  }

  // Get combined time series data (historical + realtime) sorted by timestamp
  getCombinedTimeSeries(deviceId: string): TimeSeriesPoint[] {
    const machineData = this.getMachineData(deviceId);
    if (!machineData) return [];

    const combined = [
      ...machineData.historicalData,
      ...machineData.realtimeData
    ];

    // Sort by timestamp and remove duplicates
    combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Remove duplicates based on timestamp (keep realtime over historical)
    const uniquePoints = combined.filter((point, index, array) => {
      if (index === 0) return true;
      const prevPoint = array[index - 1];
      const timeDiff = Math.abs(point.timestamp.getTime() - prevPoint.timestamp.getTime());

      // If timestamps are within 5 seconds, consider them the same point
      if (timeDiff < 5000) {
        // Keep realtime data over historical
        return point.sourceType === 'realtime';
      }
      return true;
    });

    return uniquePoints;
  }

  // Get latest data point for a machine
  getLatestData(deviceId: string): TimeSeriesPoint | null {
    const machineData = this.getMachineData(deviceId);
    if (!machineData) return null;

    const realtime = machineData.realtimeData;
    if (realtime.length > 0) {
      return realtime[realtime.length - 1];
    }

    const historical = machineData.historicalData;
    if (historical.length > 0) {
      return historical[historical.length - 1];
    }

    return null;
  }

  // Get data for specific time range
  getDataInRange(deviceId: string, startTime: Date, endTime: Date): TimeSeriesPoint[] {
    const combined = this.getCombinedTimeSeries(deviceId);
    return combined.filter(point =>
      point.timestamp >= startTime && point.timestamp <= endTime
    );
  }

  // Get all available machines
  getAvailableMachines(): string[] {
    return Array.from(this.machineData.keys());
  }

  // Get summary statistics for a machine
  getDataSummary(deviceId: string): {
    totalPoints: number;
    realtimePoints: number;
    historicalPoints: number;
    spcPoints: number;
    timeSpan: { start: Date | null; end: Date | null };
    lastUpdate: Date | null;
  } {
    const machineData = this.getMachineData(deviceId);
    if (!machineData) {
      return {
        totalPoints: 0,
        realtimePoints: 0,
        historicalPoints: 0,
        spcPoints: 0,
        timeSpan: { start: null, end: null },
        lastUpdate: null
      };
    }

    const combined = this.getCombinedTimeSeries(deviceId);
    const timeSpan = combined.length > 0 ? {
      start: combined[0].timestamp,
      end: combined[combined.length - 1].timestamp
    } : { start: null, end: null };

    return {
      totalPoints: combined.length,
      realtimePoints: machineData.realtimeData.length,
      historicalPoints: machineData.historicalData.length,
      spcPoints: machineData.spcData.length,
      timeSpan,
      lastUpdate: machineData.lastUpdate
    };
  }

  // Cleanup old data points
  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - this.maxDataAge);
    let cleanedCount = 0;

    this.machineData.forEach((machineTimeSeries, deviceId) => {
      const beforeRealtime = machineTimeSeries.realtimeData.length;
      const beforeSPC = machineTimeSeries.spcData.length;

      machineTimeSeries.realtimeData = machineTimeSeries.realtimeData.filter(
        point => point.timestamp > cutoffTime
      );
      machineTimeSeries.spcData = machineTimeSeries.spcData.filter(
        point => point.timestamp > cutoffTime
      );

      const removedRealtime = beforeRealtime - machineTimeSeries.realtimeData.length;
      const removedSPC = beforeSPC - machineTimeSeries.spcData.length;
      cleanedCount += removedRealtime + removedSPC;

      if (removedRealtime + removedSPC > 0) {
        console.log(`🧹 Cleaned ${removedRealtime + removedSPC} old data points for ${deviceId}`);
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Total cleanup: ${cleanedCount} old data points removed`);
    }
  }

  // Cleanup old event signatures to prevent memory leaks
  private cleanupOldEventSignatures(): void {
    let cleanedCount = 0;

    this.processedEvents.forEach((signatures, deviceId) => {
      const beforeCount = signatures.size;

      // Keep only recent signatures (half of max)
      if (signatures.size > this.maxEventSignatures / 2) {
        const signaturesArray = Array.from(signatures);
        const toKeep = signaturesArray.slice(-Math.floor(this.maxEventSignatures / 2));

        signatures.clear();
        toKeep.forEach(sig => signatures.add(sig));

        const removedCount = beforeCount - signatures.size;
        cleanedCount += removedCount;

        if (removedCount > 0) {
          console.log(`🧹 Cleaned ${removedCount} old event signatures for ${deviceId}`);
        }
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Total event signature cleanup: ${cleanedCount} signatures removed`);
    }
  }

  // Trim data array to prevent memory issues
  private trimDataArray(dataArray: TimeSeriesPoint[]): void {
    if (dataArray.length > this.maxPoints) {
      const toRemove = dataArray.length - this.maxPoints;
      dataArray.splice(0, toRemove);
      console.log(`✂️ Trimmed ${toRemove} data points to maintain performance`);
    }
  }

  // Clear all data for a machine
  clearMachineData(deviceId: string): void {
    if (this.machineData.has(deviceId)) {
      this.machineData.delete(deviceId);
      console.log(`🗑️ Cleared all data for device: ${deviceId}`);
    }
  }

  // Clear all data
  clearAllData(): void {
    this.machineData.clear();
    console.log('🗑️ Cleared all time-series data');
  }

  // Load historical data via REST API (v2.0 hybrid approach)
  async loadHistoricalDataREST(
    webSocketService: any,
    machineId: string,
    options: {
      timeRange?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<TimeSeriesPoint[]> {
    try {
      // Convert machineId to deviceId format if needed
      const deviceId = machineId.includes('postgres machine') ? machineId : `postgres machine ${machineId}`;
      this.initializeMachine(deviceId);

      console.log(`📚 Loading historical data via REST API for ${deviceId}...`);

      // Load realtime history
      const realtimeResponse = await webSocketService.getRealtimeHistory(machineId, options);

      // Process REST API response
      const eventData = {
        deviceId,
        data: realtimeResponse,
        timeRange: options.timeRange || '-1h'
      };

      const dataPoints = this.addHistoricalDataFromREST(eventData);

      console.log(`📚 Successfully loaded ${dataPoints.length} historical data points for ${deviceId}`);
      return dataPoints;

    } catch (error) {
      console.error(`❌ Failed to load historical data for ${machineId}:`, error);
      return [];
    }
  }

  // Load SPC data via REST API (v2.0 hybrid approach)
  async loadSPCDataREST(
    webSocketService: any,
    machineId: string,
    options: {
      timeRange?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    try {
      console.log(`📊 Loading SPC data via REST API for ${machineId}...`);

      const spcResponse = await webSocketService.getSPCHistory(machineId, options);

      console.log(`📊 Successfully loaded SPC data for ${machineId}:`, spcResponse);
      return spcResponse.data || [];

    } catch (error) {
      console.error(`❌ Failed to load SPC data for ${machineId}:`, error);
      return [];
    }
  }
}

// Singleton instance
let timeSeriesManager: TimeSeriesDataManager | null = null;

export function getTimeSeriesManager(): TimeSeriesDataManager {
  if (!timeSeriesManager) {
    timeSeriesManager = new TimeSeriesDataManager();
    console.log('📊 Created TimeSeriesDataManager singleton');
  }
  return timeSeriesManager;
}

export default getTimeSeriesManager;