// React hook for managing time-series data with WebSocket integration
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { getTimeSeriesManager, TimeSeriesPoint, MachineTimeSeries } from '@/services/timeSeriesService';

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

  // Process realtime updates from context
  useEffect(() => {
    if (!enableRealtime) return;

    realtimeData.forEach((data) => {
      const dataPoint = timeSeriesManager.current.addRealtimeData(data);
      if (dataPoint) {
        setLastUpdateTime(new Date());
        setRefreshTrigger(prev => prev + 1);
      }
    });
  }, [realtimeData, realtimeUpdateCount, enableRealtime]);

  // Process SPC updates from context
  useEffect(() => {
    if (!enableSPC) return;

    spcData.forEach((data) => {
      const dataPoint = timeSeriesManager.current.addSPCData(data);
      if (dataPoint) {
        setLastUpdateTime(new Date());
        setRefreshTrigger(prev => prev + 1);
      }
    });
  }, [spcData, spcUpdateCount, enableSPC]);

  // Process historical data from context
  useEffect(() => {
    historyData.forEach((data) => {
      console.log('📚 Received historical data:', {
        deviceId: data.deviceId,
        timeRange: data.timeRange,
        dataLength: Array.isArray(data.data) ? data.data.length : 'not array'
      });

      const dataPoints = timeSeriesManager.current.addHistoricalData(data);
      if (dataPoints.length > 0) {
        setLastUpdateTime(new Date());
        setRefreshTrigger(prev => prev + 1);
      }
    });
  }, [historyData, historyUpdateCount]);

  // Subscribe to devices when connected
  useEffect(() => {
    if (isConnected && autoSubscribe && deviceIds.length > 0) {
      deviceIds.forEach(deviceId => {
        if (!subscribedDevices.current.has(deviceId)) {
          console.log(`🔌 Auto-subscribing to device: ${deviceId}`);
          subscribeToMachine(deviceId);
          requestMachineStatus(deviceId);

          // Request historical data after a short delay
          setTimeout(() => {
            requestHistoricalData(deviceId, historicalRange);
          }, 1000);

          subscribedDevices.current.add(deviceId);
        }
      });
    }
  }, [isConnected, autoSubscribe, deviceIds, historicalRange, subscribeToMachine, requestMachineStatus]);

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

  // Request historical data for a device
  const requestHistoricalData = useCallback((deviceId: string, timeRange: string = historicalRange) => {
    if (isConnected) {
      console.log(`📚 Requesting historical data for ${deviceId} (${timeRange})`);
      requestMachineHistory(deviceId, timeRange);
      timeSeriesManager.current.initializeMachine(deviceId);
    } else {
      console.warn('Cannot request historical data: WebSocket not connected');
    }
  }, [isConnected, requestMachineHistory, historicalRange]);

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