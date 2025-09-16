import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  getMachineDataService,
  MachineDataService,
  WebSocketEventData,
  MachineAlert
} from '@/services/websocketService';

export interface WebSocketContextValue {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Real-time data streams
  realtimeData: Map<string, WebSocketEventData>;
  spcData: Map<string, WebSocketEventData>;
  statusData: Map<string, WebSocketEventData>;
  historyData: Map<string, WebSocketEventData>;
  alerts: WebSocketEventData[];

  // Update counters for components to track changes
  realtimeUpdateCount: number;
  spcUpdateCount: number;
  statusUpdateCount: number;
  historyUpdateCount: number;
  alertUpdateCount: number;

  // Machine management
  subscribeToMachine: (deviceId: string) => void;
  unsubscribeFromMachine: (deviceId: string) => void;
  requestMachineStatus: (deviceId: string) => void;
  requestMachineHistory: (deviceId: string, timeRange?: string) => void;
  subscribedMachines: string[];

  // Data access helpers
  getRealtimeData: (deviceId: string) => WebSocketEventData | null;
  getSPCData: (deviceId: string) => WebSocketEventData | null;
  getStatusData: (deviceId: string) => WebSocketEventData | null;
  getHistoryData: (deviceId: string) => WebSocketEventData | null;

  // Alert management
  clearAlerts: () => void;
  removeAlert: (index: number) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data stores
  const [realtimeData, setRealtimeData] = useState<Map<string, WebSocketEventData>>(new Map());
  const [spcData, setSPCData] = useState<Map<string, WebSocketEventData>>(new Map());
  const [statusData, setStatusData] = useState<Map<string, WebSocketEventData>>(new Map());
  const [historyData, setHistoryData] = useState<Map<string, WebSocketEventData>>(new Map());
  const [alerts, setAlerts] = useState<WebSocketEventData[]>([]);

  // Update counters for reactive updates
  const [realtimeUpdateCount, setRealtimeUpdateCount] = useState(0);
  const [spcUpdateCount, setSPCUpdateCount] = useState(0);
  const [statusUpdateCount, setStatusUpdateCount] = useState(0);
  const [historyUpdateCount, setHistoryUpdateCount] = useState(0);
  const [alertUpdateCount, setAlertUpdateCount] = useState(0);

  // Machine subscriptions
  const [subscribedMachines, setSubscribedMachines] = useState<string[]>([]);

  const serviceRef = useRef<MachineDataService | null>(null);
  const cleanupFunctions = useRef<(() => void)[]>([]);
  const isInitialized = useRef(false);

  // Initialize service and setup event listeners
  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    console.log('🌐 Initializing WebSocket context service...');
    isInitialized.current = true;
    serviceRef.current = getMachineDataService();

    const cleanup: (() => void)[] = [];

    // Connection status listener
    const connectionCleanup = serviceRef.current.onConnectionChange((connected) => {
      setIsConnected(connected);
      setIsConnecting(false);
      if (connected) {
        setError(null);
      }
    });
    cleanup.push(connectionCleanup);

    // Error listener
    const errorCleanup = serviceRef.current.onError((err) => {
      setError(err.message || 'WebSocket connection error');
      setIsConnecting(false);
    });
    cleanup.push(errorCleanup);

    // Real-time data listener
    const realtimeCleanup = serviceRef.current.onRealtimeUpdate((data) => {
      setRealtimeData(prev => {
        const next = new Map(prev);
        next.set(String(data.deviceId), data);
        return next;
      });
      setRealtimeUpdateCount(prev => prev + 1);
    });
    cleanup.push(realtimeCleanup);

    // SPC data listener
    const spcCleanup = serviceRef.current.onSPCUpdate((data) => {
      setSPCData(prev => {
        const next = new Map(prev);
        next.set(String(data.deviceId), data);
        return next;
      });
      setSPCUpdateCount(prev => prev + 1);
    });
    cleanup.push(spcCleanup);

    // Status data listener
    const statusCleanup = serviceRef.current.onMachineStatus((data) => {
      setStatusData(prev => {
        const next = new Map(prev);
        next.set(String(data.deviceId), data);
        return next;
      });
      setStatusUpdateCount(prev => prev + 1);
    });
    cleanup.push(statusCleanup);

    // History data listener
    const historyCleanup = serviceRef.current.onMachineHistory((data) => {
      setHistoryData(prev => {
        const next = new Map(prev);
        next.set(String(data.deviceId), data);
        return next;
      });
      setHistoryUpdateCount(prev => prev + 1);
    });
    cleanup.push(historyCleanup);

    // Alert listener
    const alertCleanup = serviceRef.current.onMachineAlert((data) => {
      setAlerts(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 alerts
      setAlertUpdateCount(prev => prev + 1);
    });
    cleanup.push(alertCleanup);

    cleanupFunctions.current = cleanup;

    // Initialize state from current service connection immediately
    if (serviceRef.current) {
      const current = serviceRef.current.isConnected();
      setIsConnected(current);
    }

    // Auto-connect if enabled and not already connected/connecting
    if (autoConnect && serviceRef.current && !serviceRef.current.isConnected()) {
      console.log('🔄 Auto-connecting to WebSocket...');
      setIsConnecting(true);
      serviceRef.current.connect().catch((err) => {
        console.error('❌ WebSocket connection failed:', err);
        setError(err.message || 'Failed to connect to WebSocket');
        setIsConnecting(false);
      });
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket context...');
      cleanup.forEach(fn => fn());
      isInitialized.current = false;
    };
  }, [autoConnect]);

  // Machine subscription management
  const subscribeToMachine = useCallback((deviceId: string) => {
    if (serviceRef.current) {
      serviceRef.current.subscribeToMachine(deviceId);
      setSubscribedMachines(prev => {
        if (!prev.includes(deviceId)) {
          return [...prev, deviceId];
        }
        return prev;
      });
    }
  }, []);

  const unsubscribeFromMachine = useCallback((deviceId: string) => {
    if (serviceRef.current) {
      serviceRef.current.unsubscribeFromMachine(deviceId);
      setSubscribedMachines(prev => prev.filter(id => id !== deviceId));
    }
  }, []);

  const requestMachineStatus = useCallback((deviceId: string) => {
    if (serviceRef.current) {
      serviceRef.current.requestMachineStatus(deviceId);
    }
  }, []);

  const requestMachineHistory = useCallback((deviceId: string, timeRange?: string) => {
    if (serviceRef.current) {
      serviceRef.current.requestMachineHistory(deviceId, timeRange);
    }
  }, []);

  // Data access helpers
  const getRealtimeData = useCallback((deviceId: string) => {
    return realtimeData.get(String(deviceId)) || null;
  }, [realtimeData]);

  const getSPCData = useCallback((deviceId: string) => {
    return spcData.get(String(deviceId)) || null;
  }, [spcData]);

  const getStatusData = useCallback((deviceId: string) => {
    return statusData.get(String(deviceId)) || null;
  }, [statusData]);

  const getHistoryData = useCallback((deviceId: string) => {
    return historyData.get(String(deviceId)) || null;
  }, [historyData]);

  // Alert management
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const removeAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const contextValue: WebSocketContextValue = {
    // Connection state
    isConnected,
    isConnecting,
    error,

    // Real-time data streams
    realtimeData,
    spcData,
    statusData,
    historyData,
    alerts,

    // Update counters
    realtimeUpdateCount,
    spcUpdateCount,
    statusUpdateCount,
    historyUpdateCount,
    alertUpdateCount,

    // Machine management
    subscribeToMachine,
    unsubscribeFromMachine,
    requestMachineStatus,
    requestMachineHistory,
    subscribedMachines,

    // Data access helpers
    getRealtimeData,
    getSPCData,
    getStatusData,
    getHistoryData,

    // Alert management
    clearAlerts,
    removeAlert
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export default WebSocketContext;