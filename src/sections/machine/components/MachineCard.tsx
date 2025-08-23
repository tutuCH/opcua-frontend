import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Pin, MoreHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export interface MachineData {
  id: string;
  name: string;
  site: string;
  line: string;
  status: 'Running' | 'Idle' | 'Alarm' | 'Maintenance';
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
}

interface SparklineData {
  time: number;
  cycleTime: number;
  shotRate: number;
}

interface MachineCardProps {
  machine: MachineData;
  sparklineData: SparklineData[];
}

const statusColors = {
  Running: 'bg-teal-600',
  Idle: 'bg-slate-500', 
  Alarm: 'bg-red-600',
  Maintenance: 'bg-amber-500'
} as const;

export function MachineCard({ machine, sparklineData }: MachineCardProps) {
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
            </div>
            <p className="text-xs text-muted-foreground">{machine.site} › {machine.line}</p>
          </div>
          <Badge 
            variant="secondary" 
            className={`${statusColors[machine.status]} text-white text-xs`}
          >
            ● {machine.status}
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
            <p className="text-xs text-muted-foreground">Utilization</p>
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
            <p className="text-xs text-muted-foreground">Cycle Time</p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-bold">{machine.shotCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Shot Count</p>
          </div>
        </div>

        {/* Sparklines */}
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cycle Time (60min)</p>
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
            <p className="text-xs text-muted-foreground mb-1">Shot Rate (/min)</p>
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
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {machine.setpointsChanged && (
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
              Setpoints changed
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
            Data age: {machine.dataAge}s
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-1">
            <Button variant="outline" size="sm">
              Open Machine
            </Button>
            <Button variant="outline" size="sm">
              24h Quality
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