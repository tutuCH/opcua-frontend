// React hook for managing time-series data with hybrid WebSocket + REST API integration (v2.0)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { getTimeSeriesManager, TimeSeriesPoint, MachineTimeSeries } from '@/services/timeSeriesService';
import { getMachineDataService } from '@/services/websocketService';

export interface UseTimeSeriesDataOptions {
  deviceIds?: string[];
  autoSubscribe?: boolean;
  historicalRange?: string; // e.g., '-1h', '-4h', '-24h'
  enableRealtime?: boolean;
  enableSPC?: boolean;
}

export interface UseTimeSeriesDataReturn {
  // Data access
  getMachineData: (deviceId: string) => MachineTimeSeries | null;
  getCombinedData: (deviceId: string) => TimeSeriesPoint[];
  getLatestData: (deviceId: string) => TimeSeriesPoint | null;
  getDataSummary: (deviceId: string) => any;

  // Available machines
  availableMachines: string[];

  // WebSocket status
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Statistics
  totalDataPoints: number;
  lastUpdateTime: Date | null;

  // Control functions
  requestHistoricalData: (deviceId: string, timeRange?: string) => void;
  clearMachineData: (deviceId: string) => void;
  refreshData: () => void;
}

export function useTimeSeriesData(options: UseTimeSeriesDataOptions = {}): UseTimeSeriesDataReturn {
  const {
    deviceIds = [],
    autoSubscribe = true,
    historicalRange = '-1h',
    enableRealtime = true,
    enableSPC = true
  } = options;

  const [availableMachines, setAvailableMachines] = useState<string[]>([]);
  const [totalDataPoints, setTotalDataPoints] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const timeSeriesManager = useRef(getTimeSeriesManager());
  const subscribedDevices = useRef(new Set<string>());

  // WebSocket connection through context
  const {
    isConnected,
    isConnecting,
    error,
    subscribeToMachine,
    requestMachineStatus,
    requestMachineHistory,
    subscribedMachines: wsSubscribedMachines,
    realtimeData,
    spcData,
    historyData,
    realtimeUpdateCount,
    spcUpdateCount,
    historyUpdateCount
  } = useWebSocketContext();

  // Note: Realtime data processing is now handled centrally in WebSocketContext
  // This eliminates duplicate processing when multiple components use this hook

  // Note: SPC data processing is now handled centrally in WebSocketContext
  // This eliminates duplicate processing when multiple components use this hook

  // Note: Historical data processing is now handled centrally in WebSocketContext
  // This eliminates duplicate processing when multiple components use this hook

  // Request historical data for a device (v2.0 - uses REST API)
  const requestHistoricalData = useCallback(async (deviceId: string, timeRange: string = historicalRange) => {
    try {
      // Extract machine ID from device ID (e.g., "postgres machine 1" -> "1")
      const machineId = deviceId.replace('postgres machine ', '');

      console.log(`📚 Requesting historical data via REST API for ${deviceId} (${timeRange})`);

      // Use REST API to load historical data
      const webSocketService = getMachineDataService();
      await timeSeriesManager.current.loadHistoricalDataREST(webSocketService, machineId, {
        timeRange,
        limit: 1000
      });

      setRefreshTrigger(prev => prev + 1);
      setLastUpdateTime(new Date());

    } catch (error) {
      console.error(`❌ Failed to load historical data for ${deviceId}:`, error);
    }
  }, [historicalRange]);

  // React to data updates from WebSocket context (triggers re-renders and data access)
  useEffect(() => {
    setLastUpdateTime(new Date());
    setRefreshTrigger(prev => prev + 1);
  }, [realtimeUpdateCount, spcUpdateCount, historyUpdateCount]);

  // Subscribe to devices when connected (v2.0 hybrid approach)
  useEffect(() => {
    if (isConnected && autoSubscribe && deviceIds.length > 0) {
      deviceIds.forEach(deviceId => {
        if (!subscribedDevices.current.has(deviceId)) {
          console.log(`🔌 Auto-subscribing to device: ${deviceId} (WebSocket for real-time, REST for historical)`);

          // Subscribe for real-time updates via WebSocket
          subscribeToMachine(deviceId);
          requestMachineStatus(deviceId);

          // Load historical data via REST API (no delay needed)
          requestHistoricalData(deviceId, historicalRange);

          subscribedDevices.current.add(deviceId);
        }
      });
    }
  }, [isConnected, autoSubscribe, deviceIds, historicalRange, subscribeToMachine, requestMachineStatus, requestHistoricalData]);

  // Update available machines list
  useEffect(() => {
    const machines = timeSeriesManager.current.getAvailableMachines();
    setAvailableMachines(machines);

    // Calculate total data points
    let total = 0;
    machines.forEach(deviceId => {
      const summary = timeSeriesManager.current.getDataSummary(deviceId);
      total += summary.totalPoints;
    });
    setTotalDataPoints(total);
  }, [refreshTrigger]);

  // Clear data for a specific machine
  const clearMachineData = useCallback((deviceId: string) => {
    timeSeriesManager.current.clearMachineData(deviceId);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Refresh all data
  const refreshData = useCallback(() => {
    if (isConnected) {
      availableMachines.forEach(deviceId => {
        requestMachineStatus(deviceId);
        requestHistoricalData(deviceId);
      });
    }
  }, [isConnected, availableMachines, requestMachineStatus, requestHistoricalData]);

  // Data access functions
  const getMachineData = useCallback((deviceId: string) => {
    return timeSeriesManager.current.getMachineData(deviceId);
  }, [refreshTrigger]);

  const getCombinedData = useCallback((deviceId: string) => {
    return timeSeriesManager.current.getCombinedTimeSeries(deviceId);
  }, [refreshTrigger]);

  const getLatestData = useCallback((deviceId: string) => {
    return timeSeriesManager.current.getLatestData(deviceId);
  }, [refreshTrigger]);

  const getDataSummary = useCallback((deviceId: string) => {
    return timeSeriesManager.current.getDataSummary(deviceId);
  }, [refreshTrigger]);

  return {
    // Data access
    getMachineData,
    getCombinedData,
    getLatestData,
    getDataSummary,

    // Available machines
    availableMachines,

    // WebSocket status
    isConnected,
    isConnecting,
    error,

    // Statistics
    totalDataPoints,
    lastUpdateTime,

    // Control functions
    requestHistoricalData,
    clearMachineData,
    refreshData
  };
}

// Hook for single machine time-series data
export function useMachineTimeSeries(deviceId: string, options: Omit<UseTimeSeriesDataOptions, 'deviceIds'> = {}) {
  const timeSeriesData = useTimeSeriesData({
    ...options,
    deviceIds: [deviceId]
  });

  return {
    ...timeSeriesData,
    // Single machine specific data
    machineData: timeSeriesData.getMachineData(deviceId),
    combinedData: timeSeriesData.getCombinedData(deviceId),
    latestData: timeSeriesData.getLatestData(deviceId),
    dataSummary: timeSeriesData.getDataSummary(deviceId),

    // Single machine controls
    requestHistoricalData: (timeRange?: string) => timeSeriesData.requestHistoricalData(deviceId, timeRange),
    clearData: () => timeSeriesData.clearMachineData(deviceId)
  };
}

export default useTimeSeriesData;