import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Pin, 
  Settings, 
  MoreHorizontal,
  Zap
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const mockSparklineData = Array.from({ length: 60 }, (_, i) => ({
  time: i,
  cycleTime: 12 + Math.sin(i / 10) * 2 + Math.random() * 0.5,
  shotRate: 4.8 + Math.sin(i / 8) * 0.3 + Math.random() * 0.2
}))

const machineStatuses = ['Running', 'Idle', 'Alarm', 'Maintenance'] as const
const statusColors = {
  Running: 'bg-teal-600',
  Idle: 'bg-slate-500', 
  Alarm: 'bg-red-600',
  Maintenance: 'bg-amber-500'
}

const machines = [
  {
    id: 'M001',
    name: 'Injection Molding #1',
    site: 'Site A',
    line: 'Line 1',
    status: 'Running' as const,
    utilization: 87,
    utilizationTrend: 'up' as const,
    cycleTime: 12.3,
    cycleTimeDelta: -0.4,
    shotCount: 1245,
    condition: 'High Speed Cycle',
    mold: 'M-2024-001',
    pinned: true,
    lastAlarm: 'Safety door open',
    alarmTime: '12m ago',
    dataAge: 2.1,
    setpointsChanged: true
  },
  {
    id: 'M002', 
    name: 'Injection Molding #2',
    site: 'Site A',
    line: 'Line 1',
    status: 'Idle' as const,
    utilization: 65,
    utilizationTrend: 'down' as const,
    cycleTime: 14.7,
    cycleTimeDelta: 0.8,
    shotCount: 892,
    condition: 'Standard Cycle',
    mold: 'M-2024-003',
    pinned: false,
    lastAlarm: 'Temperature warning',
    alarmTime: '1h ago',
    dataAge: 3.2,
    setpointsChanged: false
  },
  {
    id: 'M003',
    name: 'Injection Molding #3', 
    site: 'Site A',
    line: 'Line 2',
    status: 'Alarm' as const,
    utilization: 45,
    utilizationTrend: 'down' as const,
    cycleTime: 0,
    cycleTimeDelta: 0,
    shotCount: 567,
    condition: 'Emergency Stop',
    mold: 'M-2024-002',
    pinned: false,
    lastAlarm: 'Hydraulic pressure low',
    alarmTime: 'Active',
    dataAge: 1.8,
    setpointsChanged: false
  },
  {
    id: 'M004',
    name: 'Injection Molding #4',
    site: 'Site B', 
    line: 'Line 1',
    status: 'Maintenance' as const,
    utilization: 0,
    utilizationTrend: 'down' as const,
    cycleTime: 0,
    cycleTimeDelta: 0,
    shotCount: 2134,
    condition: 'Scheduled Maintenance',
    mold: 'M-2024-004',
    pinned: true,
    lastAlarm: 'Planned maintenance',
    alarmTime: '30m ago',
    dataAge: 5.2,
    setpointsChanged: false
  },
  {
    id: 'M005',
    name: 'Injection Molding #5',
    site: 'Site B',
    line: 'Line 2', 
    status: 'Running' as const,
    utilization: 92,
    utilizationTrend: 'up' as const,
    cycleTime: 11.8,
    cycleTimeDelta: -0.2,
    shotCount: 1567,
    condition: 'Optimized Cycle',
    mold: 'M-2024-005',
    pinned: false,
    lastAlarm: null,
    alarmTime: null,
    dataAge: 1.5,
    setpointsChanged: true
  },
  {
    id: 'M006',
    name: 'Injection Molding #6',
    site: 'Site B',
    line: 'Line 2',
    status: 'Running' as const,
    utilization: 78,
    utilizationTrend: 'up' as const,
    cycleTime: 13.1,
    cycleTimeDelta: 0.3,
    shotCount: 998,
    condition: 'Standard Cycle',
    mold: 'M-2024-006',
    pinned: false,
    lastAlarm: 'Quality check required',
    alarmTime: '45m ago',
    dataAge: 2.8,
    setpointsChanged: false
  }
]

export function ProductionStatus() {
  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Machines</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-teal-600">3</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-white"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alarms</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold">61%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Tiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine.id} className="relative">
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusColors[machine.status]} rounded-t-lg`} />
            {machine.status === 'Alarm' && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-lg" />
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
                      <LineChart data={mockSparklineData}>
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
                      <LineChart data={mockSparklineData}>
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
        ))}
      </div>
    </div>
  )
}