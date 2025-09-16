import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  getMachineDataService, 
  MachineDataService, 
  WebSocketEventData, 
  MachineAlert 
} from '@/services/websocketService';

export interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  subscribeToMachine: (deviceId: string) => void;
  unsubscribeFromMachine: (deviceId: string) => void;
  requestMachineStatus: (deviceId: string) => void;
  requestMachineHistory: (deviceId: string, timeRange?: string) => void;
  subscribedMachines: string[];
}

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onRealtimeUpdate?: (data: WebSocketEventData) => void;
  onSPCUpdate?: (data: WebSocketEventData) => void;
  onMachineStatus?: (data: WebSocketEventData) => void;
  onMachineHistory?: (data: WebSocketEventData) => void;
  onMachineAlert?: (data: WebSocketEventData) => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    onRealtimeUpdate,
    onSPCUpdate,
    onMachineStatus,
    onMachineHistory,
    onMachineAlert,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribedMachines, setSubscribedMachines] = useState<string[]>([]);

  const serviceRef = useRef<MachineDataService | null>(null);
  const cleanupFunctions = useRef<(() => void)[]>([]);
  const isInitialized = useRef(false);

  // Initialize service and setup event listeners
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) {
      return;
    }
    
    console.log('Initializing WebSocket service...');
    isInitialized.current = true;
    serviceRef.current = getMachineDataService();
    
    // Setup event listeners
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
      onError?.(err);
    });
    cleanup.push(errorCleanup);

    // Optional event listeners
    if (onRealtimeUpdate) {
      const realtimeCleanup = serviceRef.current.onRealtimeUpdate(onRealtimeUpdate);
      cleanup.push(realtimeCleanup);
    }

    if (onSPCUpdate) {
      const spcCleanup = serviceRef.current.onSPCUpdate(onSPCUpdate);
      cleanup.push(spcCleanup);
    }

    if (onMachineStatus) {
      const statusCleanup = serviceRef.current.onMachineStatus(onMachineStatus);
      cleanup.push(statusCleanup);
    }

    if (onMachineHistory) {
      const historyCleanup = serviceRef.current.onMachineHistory(onMachineHistory);
      cleanup.push(historyCleanup);
    }

    if (onMachineAlert) {
      const alertCleanup = serviceRef.current.onMachineAlert(onMachineAlert);
      cleanup.push(alertCleanup);
    }

    cleanupFunctions.current = cleanup;

    // Initialize state from current service connection immediately
    if (serviceRef.current) {
      const current = serviceRef.current.isConnected();
      setIsConnected(current);
    }

    // Auto-connect if enabled and not already connected/connecting
    if (autoConnect && serviceRef.current && !serviceRef.current.isConnected()) {
      console.log('Auto-connecting to WebSocket...');
      setIsConnecting(true);
      serviceRef.current.connect().catch((err) => {
        console.error('WebSocket connection failed:', err);
        setError(err.message || 'Failed to connect to WebSocket');
        setIsConnecting(false);
      });
    }

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket hooks...');
      cleanup.forEach(fn => fn());
      isInitialized.current = false;
    };
  }, []); // Empty dependency array to prevent re-running

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

  return {
    isConnected,
    isConnecting,
    error,
    subscribeToMachine,
    unsubscribeFromMachine,
    requestMachineStatus,
    requestMachineHistory,
    subscribedMachines
  };
}

// Hook for real-time machine data
export function useMachineRealtime(deviceId: string) {
  const [realtimeData, setRealtimeData] = useState<WebSocketEventData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const hasSubscribed = useRef(false);

  const { 
    isConnected, 
    subscribeToMachine, 
    unsubscribeFromMachine 
  } = useWebSocket({
    autoConnect: true, // Ensure connection for per-machine realtime usage
    onRealtimeUpdate: useCallback((data) => {
      if (String(data.deviceId) === String(deviceId)) {
        setRealtimeData(data);
        setLastUpdate(new Date());
      }
    }, [deviceId])
  });

  useEffect(() => {
    if (isConnected && deviceId && !hasSubscribed.current) {
      console.log(`Subscribing to machine: ${deviceId}`);
      subscribeToMachine(deviceId);
      hasSubscribed.current = true;
    }

    return () => {
      if (deviceId && hasSubscribed.current) {
        console.log(`Unsubscribing from machine: ${deviceId}`);
        unsubscribeFromMachine(deviceId);
        hasSubscribed.current = false;
      }
    };
  }, [isConnected, deviceId, subscribeToMachine, unsubscribeFromMachine]);

  return {
    realtimeData,
    lastUpdate,
    isConnected
  };
}

// Hook for machine status
export function useMachineStatus(deviceId: string) {
  const [statusData, setStatusData] = useState<WebSocketEventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    isConnected, 
    requestMachineStatus 
  } = useWebSocket({
    onMachineStatus: (data) => {
      if (String(data.deviceId) === String(deviceId)) {
        setStatusData(data);
        setIsLoading(false);
      }
    }
  });

  const refreshStatus = useCallback(() => {
    if (isConnected && deviceId) {
      setIsLoading(true);
      requestMachineStatus(deviceId);
    }
  }, [isConnected, deviceId, requestMachineStatus]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    statusData,
    isLoading,
    refreshStatus,
    isConnected
  };
}

// Hook for machine alerts
export function useMachineAlerts() {
  const [alerts, setAlerts] = useState<WebSocketEventData[]>([]);

  useWebSocket({
    onMachineAlert: (data) => {
      setAlerts(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 alerts
    }
  });

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const removeAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    alerts,
    clearAlerts,
    removeAlert
  };
}

export default useWebSocket;
