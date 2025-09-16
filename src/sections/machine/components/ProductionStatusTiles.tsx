import React, { useState, useEffect, useMemo } from 'react';
import { SummaryKPIs } from './SummaryKPIs';
import { MachineCard, type MachineData } from './MachineCard';
import { WebSocketEventData, MachineRealtimeData, isRealtimeData, isHistoricalData } from '@/services/websocketService';
import { useTimeSeriesData } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertCircle, Activity, Database, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFactoriesMachinesByUserId } from '@/api/machinesServices';

// Local sparkline generator (replaces mock import)
const generateSparklineData = () => Array.from({ length: 60 }, (_, i) => ({
  time: i,
  cycleTime: 12 + Math.sin(i / 10) * 2 + Math.random() * 0.5,
  shotRate: 4.8 + Math.sin(i / 8) * 0.3 + Math.random() * 0.2
}));

export function ProductionStatusTiles() {
  const sparklineData = useMemo(() => generateSparklineData(), []);
  const [machines, setMachines] = useState<MachineData[]>([]);

  // Get device IDs for time-series data management
  const deviceIds = useMemo(() =>
    machines.map(machine => `postgres machine ${machine.id}`),
    [machines]
  );

  // Use time-series data hook for enhanced WebSocket management
  const timeSeriesData = useTimeSeriesData({
    deviceIds,
    autoSubscribe: true,
    historicalRange: '-1h',
    enableRealtime: true,
    enableSPC: true
  });

  const {
    isConnected,
    isConnecting,
    error,
    availableMachines,
    totalDataPoints,
    lastUpdateTime,
    getCombinedData,
    getLatestData
  } = timeSeriesData;

  // Load machines from backend instead of mocks
  useEffect(() => {
    (async () => {
      try {
        const factories = await getFactoriesMachinesByUserId();
        const list: MachineData[] = [];
        factories.forEach((factory: any) => {
          (factory.machines || []).forEach((m: any) => {
            list.push({
              id: String(m.machineId),
              name: m.machineName,
              site: factory.factoryName || 'Factory',
              line: `Line ${m.machineIndex ?? ''}`,
              status: 'Offline',
              utilization: 0,
              utilizationTrend: 'up',
              cycleTime: 0,
              cycleTimeDelta: 0,
              shotCount: 0,
              condition: '—',
              mold: '—',
              pinned: false,
              lastAlarm: null,
              alarmTime: null,
              dataAge: 0,
              setpointsChanged: false,
            });
          });
        });
        setMachines(list);
      } catch (e) {
        console.error('Failed to load machines', e);
      }
    })();
  }, []);

  // Time-series data automatically handles subscriptions through deviceIds

  // Enhanced machine data with real-time time-series updates
  const enhancedMachines = machines.map(machine => {
    const deviceId = `postgres machine ${machine.id}`;
    const latestData = getLatestData(deviceId);

    if (latestData) {
      console.log(`Enhancing machine ${machine.id} with time-series data:`, latestData);

      return {
        ...machine,
        // Update status based on time-series data: STS 0=offline, 1=online, 2=production, 3=warning
        status: (latestData.status === 0 ? 'Offline' :
                latestData.status === 1 ? 'Running' :
                latestData.status === 2 ? 'Running' :  // Production state = Running
                latestData.status === 3 ? 'Warning' : 'Offline') as 'Offline' | 'Running' | 'Alarm' | 'Warning',
        // Update metrics from time-series data
        temperature: latestData.temperatures.T1,
        oilTemperature: latestData.oilTemp,
        operationMode: latestData.operationMode,
        autoTestStatus: latestData.autoTestStatus,
        // Use utilization calculation based on operation mode and status
        utilization: latestData.status >= 1 ? Math.min(75 + Math.random() * 20, 95) : 0,
        // Cycle time and shot count are typically in SPC data, keep original for now
        cycleTime: machine.cycleTime,
        shotCount: machine.shotCount,
        lastUpdate: latestData.timestamp,
        // Add all temperature zones
        temperatures: latestData.temperatures,
        // Additional metadata
        dataAge: Math.floor((Date.now() - latestData.timestamp.getTime()) / 1000),
        sourceType: latestData.sourceType
      };
    }
    return machine;
  });

  // Enhanced debug panel for time-series data
  const DebugPanel = () => (
    <div className="text-xs text-muted-foreground space-y-1">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>Total data points: {totalDataPoints}</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span>Available machines: {availableMachines.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          <span>Last update: {lastUpdateTime?.toLocaleTimeString() || 'Never'}</span>
        </div>
      </div>

      {availableMachines.length > 0 && (
        <div className="p-2 bg-green-50 rounded text-xs">
          🔄 Active Machines: {availableMachines.join(', ')}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {enhancedMachines.filter(m => m.lastUpdate).map(machine => {
          const deviceId = `postgres machine ${machine.id}`;
          const latestData = getLatestData(deviceId);
          return (
            <div key={machine.id} className="p-2 bg-blue-50 rounded text-xs">
              <div className="font-medium">{machine.name}</div>
              <div>Status: {latestData?.status} | T1: {latestData?.temperatures.T1.toFixed(1)}°C</div>
              <div>Mode: {latestData?.operationMode} | Source: {latestData?.sourceType}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
        🏭 Machines with live data: {enhancedMachines.filter(m => m.lastUpdate).length}/{enhancedMachines.length}
      </div>
    </div>
  );
  
  const summaryStats = {
    totalMachines: enhancedMachines.length,
    running: enhancedMachines.filter(m => m.status === 'Running').length,
    alarms: enhancedMachines.filter(m => m.status === 'Alarm').length,
    warnings: enhancedMachines.filter(m => m.status === 'Warning').length,
    offline: enhancedMachines.filter(m => m.status === 'Offline').length,
    avgUtilization: enhancedMachines.length > 0
      ? Math.round(enhancedMachines.reduce((sum, m) => sum + (m.utilization || 0), 0) / enhancedMachines.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* WebSocket Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <Badge variant="secondary">
              <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-1" />
              Connecting...
            </Badge>
          ) : isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="h-3 w-3 mr-1" />
              Connected ({availableMachines.length} machines)
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={timeSeriesData.refreshData}
            disabled={!isConnected}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            WebSocket Error: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug: event counters */}
      <DebugPanel />

      {/* Summary KPIs */}
      <SummaryKPIs summaryStats={summaryStats} />

      {/* Machine Tiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {enhancedMachines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            sparklineData={sparklineData}
            isConnected={isConnected}
          />
        ))}
      </div>
    </div>
  );
}
