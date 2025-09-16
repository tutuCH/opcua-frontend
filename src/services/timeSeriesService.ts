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

  constructor() {
    // Cleanup old data every 5 minutes
    setInterval(() => this.cleanupOldData(), 5 * 60 * 1000);
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

  // Add historical data points
  addHistoricalData(eventData: WebSocketEventData): TimeSeriesPoint[] {
    if (!isHistoricalData(eventData.data)) {
      console.warn('Invalid historical data format:', eventData);
      return [];
    }

    const deviceId = String(eventData.deviceId);
    this.initializeMachine(deviceId);

    const dataPoints: TimeSeriesPoint[] = eventData.data.map(point => ({
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

    return dataPoints;
  }

  // Add SPC data point
  addSPCData(eventData: WebSocketEventData): TimeSeriesPoint | null {
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