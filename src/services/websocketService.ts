import { io, Socket } from 'socket.io-client';

export interface MachineRealtimeData {
  devId: string;
  topic: string;
  sendTime: string;
  sendStamp: number;
  time: string;
  timestamp: number;
  Data: {
    OT?: number;    // Oil Temperature (°C)
    ATST?: number;  // Auto Time Start
    OPM?: number;   // Operation Mode (-1=stopped, 0=manual, 1=auto, 2=setup)
    STS?: number;   // Status (0=offline, 1=online, 2=error, 3=warning)
    T1?: number;    // Temperature Zone 1 (°C)
    T2?: number;    // Temperature Zone 2 (°C)
    T3?: number;    // Temperature Zone 3 (°C)
    T4?: number;    // Temperature Zone 4 (°C)
    T5?: number;    // Temperature Zone 5 (°C)
    T6?: number;    // Temperature Zone 6 (°C)
    T7?: number;    // Temperature Zone 7 (°C)
  };
  lastUpdated?: string; // Added for cached data responses
}

// Historical data format from InfluxDB
export interface MachineHistoricalPoint {
  result: string;
  table: number;
  _start: string;
  _stop: string;
  _time: string;
  _measurement: string;
  application: string;
  device_id: string;
  topic: string;
  auto_start: number;
  oil_temp: number;
  operate_mode: number;
  status: number;
  temp_1: number;
  temp_2: number;
  temp_3: number;
  temp_4: number;
  temp_5: number;
  temp_6: number;
  temp_7: number;
}

export interface MachineSPCData {
  devId: string;
  topic: string;
  sendTime: string;
  sendStamp: number;
  time: string;
  timestamp: number;
  Data: {
    CYCN?: string;    // Cycle Number
    ECYCT?: string;   // Effective Cycle Time (seconds)
    EISS?: string;    // Effective Injection Start Time
    EIVM?: string;    // Effective Injection Velocity Max (mm/s)
    EIPM?: string;    // Effective Injection Pressure Max (bar)
    ESIPT?: string;   // Effective Switch-over Injection Pressure Time (s)
    ESIPP?: string;   // Effective Switch-over Injection Pressure Position (%)
    ESIPS?: string;   // Effective Switch-over Injection Pressure Speed (mm/s)
    EIPT?: string;    // Effective Injection Pressure Time (s)
    EIPSE?: string;   // Effective Injection Pressure Start End
    EPLST?: string;   // Effective Plasticizing Time (s)
    EPLSSE?: string;  // Effective Plasticizing Start End
    EPLSPM?: string;  // Effective Plasticizing Pressure Max (bar)
    ET1?: string;     // Effective Temperature 1 (°C)
    ET2?: string;     // Effective Temperature 2 (°C)
    ET3?: string;     // Effective Temperature 3 (°C)
    ET4?: string;     // Effective Temperature 4 (°C)
    ET5?: string;     // Effective Temperature 5 (°C)
    ET6?: string;     // Effective Temperature 6 (°C)
    ET7?: string;     // Effective Temperature 7 (°C)
    ET8?: string;     // Effective Temperature 8 (°C)
    ET9?: string;     // Effective Temperature 9 (°C)
    ET10?: string;    // Effective Temperature 10 (°C)
  };
}

export interface MachineAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface WebSocketEventData {
  deviceId: string;
  data: MachineRealtimeData | MachineSPCData | MachineHistoricalPoint[] | any;
  timestamp?: string;
  source?: 'cache' | 'requested';
  timeRange?: string;
  alert?: MachineAlert;
}

// Helper functions to identify data types
export function isRealtimeData(data: any): data is MachineRealtimeData {
  return data && typeof data === 'object' && data.Data && typeof data.Data.STS !== 'undefined';
}

export function isHistoricalData(data: any): data is MachineHistoricalPoint[] {
  return Array.isArray(data) && data.length > 0 && data[0]._measurement === 'realtime';
}

export function isSPCData(data: any): data is MachineSPCData {
  return data && typeof data === 'object' && data.Data && typeof data.Data.CYCN !== 'undefined';
}

export type EventCallback = (data: WebSocketEventData) => void;
export type AlertCallback = (data: WebSocketEventData) => void;
export type ErrorCallback = (error: any) => void;
export type ConnectionCallback = (isConnected: boolean) => void;

export class MachineDataService {
  private socket: Socket | null = null;
  private subscribedMachines = new Set<string>();
  private baseUrl: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  // Event callbacks
  private realtimeCallbacks = new Set<EventCallback>();
  private spcCallbacks = new Set<EventCallback>();
  private statusCallbacks = new Set<EventCallback>();
  private historyCallbacks = new Set<EventCallback>();
  private alertCallbacks = new Set<AlertCallback>();
  private errorCallbacks = new Set<ErrorCallback>();
  private connectionCallbacks = new Set<ConnectionCallback>();

  constructor() {
    const explicitWs = (import.meta as any).env?.VITE_WS_URL as string | undefined;
    if (explicitWs) {
      this.baseUrl = explicitWs;
    } else {
      const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000';
      this.baseUrl = String(backendUrl).replace(/^http/, 'ws');
    }
  }

  connect(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Return resolved promise if already connected
    if (this.socket?.connected) {
      console.log('WebSocket already connected, reusing existing connection');
      return Promise.resolve();
    }

    // Prevent multiple simultaneous connections
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress...');
      return Promise.resolve();
    }

    console.log('Creating new WebSocket connection to:', this.baseUrl);
    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Clean up any existing socket first
        if (this.socket && !this.socket.connected) {
          this.socket.removeAllListeners();
          this.socket.disconnect();
          this.socket = null;
        }

        this.socket = io(this.baseUrl, {
          transports: ['websocket'],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          forceNew: false, // Don't force new connection
          multiplex: true  // Reuse existing connection
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('Connected to OPC UA Dashboard WebSocket');
          this.isConnecting = false;
          this.connectionPromise = null;
          this.notifyConnectionCallbacks(true);
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from OPC UA Dashboard:', reason);
          this.isConnecting = false;
          this.connectionPromise = null;
          this.subscribedMachines.clear();
          this.notifyConnectionCallbacks(false);
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnecting = false;
          this.connectionPromise = null;
          this.notifyErrorCallbacks(error);
          reject(error);
        });

        this.socket.on('connection', (data) => {
          console.log('Server confirmed connection:', data.message);
          // Some environments (e.g., certain proxies) may emit custom 'connection' first
          this.notifyConnectionCallbacks(true);
        });

        // Data event listeners
        this.socket.on('realtime-update', (data: WebSocketEventData) => {
          try {
            // Debug log for verification
            // eslint-disable-next-line no-console
            console.log('WS realtime-update', (data as any)?.deviceId, (data as any)?.timestamp);
          } catch {}
          this.notifyRealtimeCallbacks(data);
        });

        this.socket.on('spc-update', (data: WebSocketEventData) => {
          try {
            // Debug log for verification
            // eslint-disable-next-line no-console
            console.log('WS spc-update', (data as any)?.deviceId, (data as any)?.timestamp);
          } catch {}
          this.notifySPCCallbacks(data);
        });

        this.socket.on('machine-status', (data: WebSocketEventData) => {
          this.notifyStatusCallbacks(data);
        });

        this.socket.on('machine-history', (data: WebSocketEventData) => {
          this.notifyHistoryCallbacks(data);
        });

        this.socket.on('machine-alert', (data: WebSocketEventData) => {
          this.notifyAlertCallbacks(data);
        });

        // Subscription confirmations
        this.socket.on('subscription-confirmed', (data) => {
          console.log(`Subscribed to machine: ${data.deviceId}`);
          // Ensure UI reflects an active, healthy connection
          this.notifyConnectionCallbacks(true);
        });

        this.socket.on('unsubscription-confirmed', (data) => {
          console.log(`Unsubscribed from machine: ${data.deviceId}`);
        });

        // Error handling
        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.notifyErrorCallbacks(error);
        });

        // Health check response
        this.socket.on('pong', (data) => {
          console.log('Server timestamp:', data.timestamp);
        });

      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscribedMachines.clear();
    this.isConnecting = false;
    this.connectionPromise = null;
  }

  subscribeToMachine(deviceId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to machine:', deviceId);
      return;
    }

    if (!this.subscribedMachines.has(deviceId)) {
      this.socket.emit('subscribe-machine', { deviceId });
      this.subscribedMachines.add(deviceId);
    }
  }

  unsubscribeFromMachine(deviceId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected. Cannot unsubscribe from machine:', deviceId);
      return;
    }

    if (this.subscribedMachines.has(deviceId)) {
      this.socket.emit('unsubscribe-machine', { deviceId });
      this.subscribedMachines.delete(deviceId);
    }
  }

  requestMachineStatus(deviceId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected. Cannot request machine status:', deviceId);
      return;
    }

    this.socket.emit('get-machine-status', { deviceId });
  }

  requestMachineHistory(deviceId: string, timeRange: string = '-1h') {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected. Cannot request machine history:', deviceId);
      return;
    }

    this.socket.emit('get-machine-history', { deviceId, timeRange });
  }

  ping() {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket not connected. Cannot ping server');
      return;
    }

    this.socket.emit('ping');
  }

  // Event callback management
  onRealtimeUpdate(callback: EventCallback) {
    this.realtimeCallbacks.add(callback);
    return () => this.realtimeCallbacks.delete(callback);
  }

  onSPCUpdate(callback: EventCallback) {
    this.spcCallbacks.add(callback);
    return () => this.spcCallbacks.delete(callback);
  }

  onMachineStatus(callback: EventCallback) {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  onMachineHistory(callback: EventCallback) {
    this.historyCallbacks.add(callback);
    return () => this.historyCallbacks.delete(callback);
  }

  onMachineAlert(callback: AlertCallback) {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  onError(callback: ErrorCallback) {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  // Private notification methods
  private notifyRealtimeCallbacks(data: WebSocketEventData) {
    this.realtimeCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in realtime callback:', error);
      }
    });
  }

  private notifySPCCallbacks(data: WebSocketEventData) {
    this.spcCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in SPC callback:', error);
      }
    });
  }

  private notifyStatusCallbacks(data: WebSocketEventData) {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  private notifyHistoryCallbacks(data: WebSocketEventData) {
    this.historyCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in history callback:', error);
      }
    });
  }

  private notifyAlertCallbacks(data: WebSocketEventData) {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  private notifyErrorCallbacks(error: any) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  private notifyConnectionCallbacks(isConnected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSubscribedMachines(): string[] {
    return Array.from(this.subscribedMachines);
  }
}

// Singleton instance with proper initialization check
let machineDataService: MachineDataService | null = null;

export function getMachineDataService(): MachineDataService {
  if (!machineDataService) {
    console.log('Creating new MachineDataService singleton instance');
    machineDataService = new MachineDataService();
  } else {
    console.log('Reusing existing MachineDataService singleton instance');
  }
  return machineDataService;
}

// Function to reset the singleton (useful for testing or cleanup)
export function resetMachineDataService() {
  if (machineDataService) {
    machineDataService.disconnect();
    machineDataService = null;
  }
}

export default getMachineDataService;
