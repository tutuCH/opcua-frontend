import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw,
  Activity,
  Users,
  Clock
} from 'lucide-react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { getMachineDataService } from '@/services/websocketService';

interface WebSocketStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function WebSocketStatus({ showDetails = false, className = '' }: WebSocketStatusProps) {
  const {
    isConnected,
    isConnecting,
    error,
    subscribedMachines,
    alerts
  } = useWebSocketContext();

  const handleReconnect = async () => {
    const service = getMachineDataService();
    if (!service.isConnected()) {
      try {
        await service.connect();
      } catch (error) {
        console.error('Failed to reconnect:', error);
      }
    }
  };

  const handlePing = () => {
    const service = getMachineDataService();
    service.ping();
  };

  if (!showDetails) {
    // Simple status badge
    return (
      <div className={className}>
        {isConnecting ? (
          <Badge variant="secondary">
            <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-1" />
            Connecting...
          </Badge>
        ) : isConnected ? (
          <Badge variant="default" className="bg-green-500">
            <Wifi className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge variant="destructive">
            <WifiOff className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        )}
      </div>
    );
  }

  // Detailed status card
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">WebSocket Connection</h3>
          <div className="flex items-center gap-2">
            {isConnecting ? (
              <Badge variant="secondary">
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-1" />
                Connecting...
              </Badge>
            ) : isConnected ? (
              <Badge variant="default" className="bg-green-500">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>

        {/* Connection Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{subscribedMachines.length} machines subscribed</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>{alerts.length} recent alerts</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Recent Alerts</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-center gap-2 text-xs p-2 bg-muted rounded">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="font-medium">{alert.deviceId}</span>
                  <span className="text-muted-foreground">{alert.alert?.message}</span>
                  <div className="flex items-center gap-1 ml-auto text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReconnect}
            disabled={isConnected || isConnecting}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePing}
            disabled={!isConnected}
          >
            <Activity className="h-3 w-3 mr-1" />
            Ping
          </Button>
        </div>

        {/* Connection Info */}
        {isConnected && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              <div>Backend URL: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}</div>
              <div>Transport: WebSocket</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component for displaying connection status in the header/nav
export function WebSocketIndicator() {
  const { isConnected, isConnecting, error } = useWebSocketContext();
  
  return (
    <div className="flex items-center gap-1">
      {isConnecting ? (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
          <span>Connecting...</span>
        </div>
      ) : isConnected ? (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Wifi className="h-3 w-3" />
          <span>Live</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </div>
      )}
    </div>
  );
}

export default WebSocketStatus;