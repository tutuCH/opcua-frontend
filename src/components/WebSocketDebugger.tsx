import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { getMachineDataService } from '@/services/websocketService';

export function WebSocketDebugger() {
  const [testDeviceId, setTestDeviceId] = useState('1');
  const [realtimeMessages, setRealtimeMessages] = useState<any[]>([]);
  const [spcMessages, setSpcMessages] = useState<any[]>([]);
  const [statusMessages, setStatusMessages] = useState<any[]>([]);

  const {
    isConnected,
    isConnecting,
    error,
    subscribeToMachine,
    unsubscribeFromMachine,
    requestMachineStatus,
    requestMachineHistory,
    subscribedMachines,
    realtimeData,
    spcData,
    statusData,
    realtimeUpdateCount,
    spcUpdateCount,
    statusUpdateCount
  } = useWebSocketContext();

  // Update message lists when context data changes
  useEffect(() => {
    const latestRealtime = Array.from(realtimeData.values());
    if (latestRealtime.length > 0) {
      const mostRecent = latestRealtime[latestRealtime.length - 1];
      console.log('🔄 Realtime data received:', mostRecent);
      setRealtimeMessages(prev => {
        // Only add if it's truly new (not already in the list)
        if (prev.length === 0 || prev[0]?.timestamp !== mostRecent.timestamp) {
          return [mostRecent, ...prev.slice(0, 4)];
        }
        return prev;
      });
    }
  }, [realtimeData, realtimeUpdateCount]);

  useEffect(() => {
    const latestSpc = Array.from(spcData.values());
    if (latestSpc.length > 0) {
      const mostRecent = latestSpc[latestSpc.length - 1];
      console.log('📊 SPC data received:', mostRecent);
      setSpcMessages(prev => {
        if (prev.length === 0 || prev[0]?.timestamp !== mostRecent.timestamp) {
          return [mostRecent, ...prev.slice(0, 4)];
        }
        return prev;
      });
    }
  }, [spcData, spcUpdateCount]);

  useEffect(() => {
    const latestStatus = Array.from(statusData.values());
    if (latestStatus.length > 0) {
      const mostRecent = latestStatus[latestStatus.length - 1];
      console.log('📋 Status data received:', mostRecent);
      setStatusMessages(prev => {
        if (prev.length === 0 || prev[0]?.timestamp !== mostRecent.timestamp) {
          return [mostRecent, ...prev.slice(0, 4)];
        }
        return prev;
      });
    }
  }, [statusData, statusUpdateCount]);

  const handleSubscribe = () => {
    subscribeToMachine(testDeviceId);
  };

  const handleUnsubscribe = () => {
    unsubscribeFromMachine(testDeviceId);
  };

  const handleRequestStatus = () => {
    requestMachineStatus(testDeviceId);
  };

  const handleRequestHistory = () => {
    requestMachineHistory(testDeviceId, '-1h');
  };

  const handlePing = () => {
    const service = getMachineDataService();
    service.ping();
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>WebSocket Connection Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>
              {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Subscribed to: {subscribedMachines.length} machines
            </span>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="deviceId">Device ID:</Label>
              <Input
                id="deviceId"
                value={testDeviceId}
                onChange={(e) => setTestDeviceId(e.target.value)}
                className="w-20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSubscribe} disabled={!isConnected} size="sm">
                Subscribe
              </Button>
              <Button onClick={handleUnsubscribe} disabled={!isConnected} size="sm" variant="outline">
                Unsubscribe
              </Button>
              <Button onClick={handleRequestStatus} disabled={!isConnected} size="sm" variant="outline">
                Get Status
              </Button>
              <Button onClick={handleRequestHistory} disabled={!isConnected} size="sm" variant="outline">
                Get History
              </Button>
              <Button onClick={handlePing} disabled={!isConnected} size="sm" variant="outline">
                Ping
              </Button>
            </div>
          </div>

          {/* Message History */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Realtime Messages ({realtimeMessages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {realtimeMessages.map((msg, i) => (
                  <div key={i} className="text-xs p-2 bg-green-50 rounded">
                    <div><strong>Device:</strong> {msg.deviceId}</div>
                    <div><strong>Time:</strong> {new Date(msg.timestamp).toLocaleTimeString()}</div>
                    <div><strong>STS:</strong> {msg.data?.Data?.STS}</div>
                    <div><strong>T1:</strong> {msg.data?.Data?.T1}°C</div>
                    <div><strong>OT:</strong> {msg.data?.Data?.OT}°C</div>
                  </div>
                ))}
                {realtimeMessages.length === 0 && (
                  <div className="text-xs text-muted-foreground">No realtime messages yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">SPC Messages ({spcMessages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {spcMessages.map((msg, i) => (
                  <div key={i} className="text-xs p-2 bg-blue-50 rounded">
                    <div><strong>Device:</strong> {msg.deviceId}</div>
                    <div><strong>Time:</strong> {new Date(msg.timestamp).toLocaleTimeString()}</div>
                    <div><strong>CYCN:</strong> {msg.data?.Data?.CYCN}</div>
                    <div><strong>ECYCT:</strong> {msg.data?.Data?.ECYCT}s</div>
                  </div>
                ))}
                {spcMessages.length === 0 && (
                  <div className="text-xs text-muted-foreground">No SPC messages yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status Messages ({statusMessages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {statusMessages.map((msg, i) => (
                  <div key={i} className="text-xs p-2 bg-gray-50 rounded">
                    <div><strong>Device:</strong> {msg.deviceId}</div>
                    <div><strong>Source:</strong> {msg.source}</div>
                    <div><strong>Time:</strong> {new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
                {statusMessages.length === 0 && (
                  <div className="text-xs text-muted-foreground">No status messages yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WebSocketDebugger;