import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Pin, MoreHorizontal, Wifi, WifiOff, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { WebSocketEventData, MachineRealtimeData } from '@/services/websocketService';

export interface MachineData {
  id: string;
  name: string;
  site: string;
  line: string;
  status: 'Running' | 'Idle' | 'Alarm' | 'Maintenance' | 'Warning' | 'Offline';
  utilization: number;
  utilizationTrend: 'up' | 'down';
  cycleTime: number;
  cycleTimeDelta: number;
  shotCount: number;
  condition: string;
  mold: string;
  pinned: boolean;
  lastAlarm: string | null;
  alarmTime: string | null;
  dataAge: number;
  setpointsChanged: boolean;
  // WebSocket real-time data
  temperature?: number;
  oilTemperature?: number;
  operationMode?: number;
  autoTestStatus?: number;
  lastUpdate?: Date;
}

interface SparklineData {
  time: number;
  cycleTime: number;
  shotRate: number;
}

interface MachineCardProps {
  machine: MachineData;
  sparklineData: SparklineData[];
  isConnected?: boolean;
  realtimeData?: WebSocketEventData;
}

const statusColors = {
  Running: 'bg-teal-600',
  Idle: 'bg-slate-500', 
  Alarm: 'bg-red-600',
  Maintenance: 'bg-amber-500',
  Warning: 'bg-orange-500',
  Offline: 'bg-gray-400'
} as const;

export function MachineCard({ machine, sparklineData, isConnected = false, realtimeData }: MachineCardProps) {
  const { t } = useTranslation();
  
  const formatLastUpdate = (lastUpdate?: Date) => {
    if (!lastUpdate) return null;
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };
  
  const getOperationModeText = (mode?: number) => {
    switch (mode) {
      case -1: return 'Stopped';
      case 0: return 'Manual';
      case 1: return 'Auto';
      case 2: return 'Setup';
      default: return 'Unknown';
    }
  };
  
  return (
    <Card className="relative">
      {/* Status Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusColors[machine.status]} rounded-t-lg`} />
      {machine.status === 'Alarm' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-lg animate-pulse" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{machine.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${machine.pinned ? 'text-blue-600' : 'text-muted-foreground'}`}
              >
                <Pin className="h-3 w-3" />
              </Button>
              {/* WebSocket connection indicator */}
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{machine.site} › {machine.line}</span>
              {machine.lastUpdate && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastUpdate(machine.lastUpdate)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`${statusColors[machine.status]} text-white text-xs`}
          >
            ● {t(`machineStatus.${machine.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-bold">{machine.utilization}%</p>
              {machine.utilizationTrend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('machineCard.utilization')}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-bold">{machine.cycleTime}s</p>
              {machine.cycleTimeDelta !== 0 && (
                <span className={`text-xs ${machine.cycleTimeDelta < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {machine.cycleTimeDelta > 0 ? '+' : ''}{machine.cycleTimeDelta}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('machineCard.cycleTime')}</p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-bold">{machine.shotCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('machineCard.shotCount')}</p>
          </div>
        </div>

        {/* Sparklines */}
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('machineCard.cycleTime60min')}</p>
            <div className="h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="cycleTime" 
                    stroke="#3b82f6" 
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('machineCard.shotRateMin')}</p>
            <div className="h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="shotRate" 
                    stroke="#10b981" 
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground truncate">
            {machine.condition} · {machine.mold}
          </p>
          {/* Real-time temperature data */}
          {(machine.temperature || machine.oilTemperature) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {machine.temperature && (
                <span>T1: {machine.temperature}°C</span>
              )}
              {machine.oilTemperature && (
                <>
                  {machine.temperature && <span>•</span>}
                  <span>Oil: {machine.oilTemperature}°C</span>
                </>
              )}
            </div>
          )}
          {/* Operation mode */}
          {machine.operationMode !== undefined && (
            <div className="text-xs text-muted-foreground">
              Mode: {getOperationModeText(machine.operationMode)}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {machine.setpointsChanged && (
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
              {t('machineCard.setpointsChanged')}
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={`text-xs ${
              machine.dataAge > 10 ? 'text-red-600 border-red-600' : 
              machine.dataAge > 5 ? 'text-amber-600 border-amber-600' : 
              'text-muted-foreground'
            }`}
          >
            {t('machineCard.dataAge')}: {machine.dataAge}s
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-1">
            <Button variant="outline" size="sm">
              {t('machineCard.openMachine')}
            </Button>
            <Button variant="outline" size="sm">
              {t('machineCard.quality24h')}
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}