import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  ScatterChart, 
  Clock, 
  PieChart, 
  Settings, 
  MoreHorizontal, 
  Calendar, 
  CalendarDays, 
  Database, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  ScatterChart as RechartsScatter, 
  Cell, 
  PieChart as RechartsPie, 
  ComposedChart 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Import sample data
import elinkSampleData from '../../../_mock/elink_full_samples.json';

// Process sample data into machine metrics
const processedMachineData = elinkSampleData.map((item, index) => ({
  id: item.devId,
  name: `Injection Molding Machine ${item.devId}`,
  status: item.Data.STS === 1 ? 'Running' : item.Data.STS === 2 ? 'Warning' : 'Idle',
  utilization: Math.round((item.Data.EIPM / 2000) * 100),
  cycleTime: item.Data.ECYCT,
  shotCount: item.Data.CYCN,
  temperature: Math.round((item.Data.T1 + item.Data.T2 + item.Data.T3) / 3),
  pressure: item.Data.IPP || item.Data.IP1,
  oilTemp: item.Data.OT,
  dataAge: Math.random() * 5 + 1,
  timestamp: new Date(item.timestamp)
}));

// Create trend data from sample
const trendData = elinkSampleData.slice(0, 20).map((item, index) => ({
  time: index,
  timestamp: new Date(item.timestamp).toLocaleTimeString(),
  cycleTime: item.Data.ECYCT,
  temperature: Math.round((item.Data.T1 + item.Data.T2 + item.Data.T3) / 3),
  pressure: item.Data.IPP || item.Data.IP1 || 0,
  utilization: Math.round((item.Data.EIPM / 2000) * 100),
  shotCount: item.Data.CYCN,
  oilTemp: item.Data.OT,
  defectRate: Math.random() * 5, // Simulated quality data
  efficiency: 85 + Math.random() * 15
}));

// Quality data processing
const qualityData = elinkSampleData.slice(0, 24).map((item, index) => ({
  hour: index,
  timestamp: new Date(item.timestamp).toLocaleTimeString(),
  temperature: Math.round((item.Data.T1 + item.Data.T2 + item.Data.T3) / 3),
  cycleTime: item.Data.ECYCT,
  defectRate: Math.random() * 8,
  upperLimit: 35,
  lowerLimit: 15,
  target: 25,
  stability: 90 + Math.random() * 10,
  capability: 1.2 + Math.random() * 0.5
}));

// Reports data processing  
const reportsData = {
  daily: {
    totalShots: elinkSampleData.reduce((sum, item) => sum + item.Data.CYCN, 0),
    avgCycleTime: elinkSampleData.reduce((sum, item) => sum + item.Data.ECYCT, 0) / elinkSampleData.length,
    efficiency: 89.5,
    defectRate: 2.3,
    downtime: 45
  },
  weekly: {
    totalShots: 156789,
    avgCycleTime: 26.8,
    efficiency: 91.2,
    defectRate: 1.8,
    downtime: 280
  },
  monthly: {
    totalShots: 678945,
    avgCycleTime: 27.1,
    efficiency: 88.7,
    defectRate: 2.1,
    downtime: 1200
  }
};

// Correlation data
const correlationData = elinkSampleData.slice(0, 50).map(item => ({
  temperature: Math.round((item.Data.T1 + item.Data.T2 + item.Data.T3) / 3),
  cycleTime: item.Data.ECYCT,
  pressure: item.Data.IPP || item.Data.IP1 || 0,
  quality: 95 - Math.random() * 10
}));

// Utilization data
const utilizationData = [
  { name: 'Running', value: 65, color: '#10b981' },
  { name: 'Idle', value: 20, color: '#6b7280' },
  { name: 'Maintenance', value: 10, color: '#f59e0b' },
  { name: 'Downtime', value: 5, color: '#ef4444' }
];

// Timeline events
const timelineEvents = [
  { time: '08:00', type: 'start', event: 'Production Start', status: 'normal' },
  { time: '09:15', type: 'warning', event: 'Temperature Alert', status: 'warning' },
  { time: '10:30', type: 'maintenance', event: 'Scheduled Maintenance', status: 'maintenance' },
  { time: '11:45', type: 'quality', event: 'Quality Check', status: 'normal' },
  { time: '13:00', type: 'break', event: 'Lunch Break', status: 'idle' },
  { time: '14:20', type: 'alarm', event: 'Pressure Alarm', status: 'alarm' },
  { time: '15:35', type: 'normal', event: 'Production Resume', status: 'normal' }
];

// Gantt data for equipment scheduling
const ganttData = [
  { equipment: 'Machine C02', task: 'Production Run A', start: 8, duration: 4, status: 'running' },
  { equipment: 'Machine C02', task: 'Maintenance', start: 12, duration: 1, status: 'maintenance' },
  { equipment: 'Machine C02', task: 'Production Run B', start: 13, duration: 5, status: 'scheduled' },
  { equipment: 'Mold M-001', task: 'Setup', start: 7, duration: 1, status: 'setup' },
  { equipment: 'Mold M-001', task: 'Active', start: 8, duration: 6, status: 'active' },
  { equipment: 'Mold M-001', task: 'Changeover', start: 14, duration: 2, status: 'changeover' }
];

// Traceability data
const traceabilityData = [
  { lot: 'LOT-2025-001', material: 'PP-HD-001', quantity: 500, status: 'In Process', quality: 'Pass' },
  { lot: 'LOT-2025-002', material: 'PE-LD-002', quantity: 750, status: 'Completed', quality: 'Pass' },
  { lot: 'LOT-2025-003', material: 'ABS-001', quantity: 300, status: 'Hold', quality: 'Fail' },
  { lot: 'LOT-2025-004', material: 'PP-HD-002', quantity: 650, status: 'In Process', quality: 'Pass' }
];

const statusColors = {
  Running: '#10b981',
  Warning: '#f59e0b', 
  Idle: '#6b7280',
  Alarm: '#ef4444'
};

export default function MissionControlView() {
  const [selectedView, setSelectedView] = useState('production');
  const [selectedMachine, setSelectedMachine] = useState(null);

  const views = [
    { id: 'production', label: 'Production Status', icon: Activity, usesElinkData: true },
    { id: 'quality', label: '24h Quality View', icon: BarChart3, usesElinkData: true },
    { id: 'reports', label: 'Reports', icon: FileText, usesElinkData: true },
    { id: 'trends', label: 'Trend Analysis', icon: TrendingUp, usesElinkData: true },
    { id: 'correlation', label: 'Correlation', icon: ScatterChart, usesElinkData: false },
    { id: 'timeline', label: 'Summary Timeline', icon: Clock, usesElinkData: false },
    { id: 'utilization', label: 'Utilization', icon: PieChart, usesElinkData: true },
    { id: 'gantt', label: 'Equipment Gantt', icon: CalendarDays, usesElinkData: false },
    { id: 'traceability', label: 'Traceability', icon: Database, usesElinkData: false }
  ];

  const summaryStats = useMemo(() => {
    const runningMachines = processedMachineData.filter(m => m.status === 'Running').length;
    const warningMachines = processedMachineData.filter(m => m.status === 'Warning').length;
    const avgUtilization = Math.round(
      processedMachineData.reduce((sum, m) => sum + m.utilization, 0) / processedMachineData.length
    );
    
    return {
      totalMachines: processedMachineData.length,
      running: runningMachines,
      warnings: warningMachines,
      avgUtilization
    };
  }, []);

  // Production Status View (uses elink data)
  const renderProductionStatus = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Machines</p>
                <p className="text-2xl font-bold">{summaryStats.totalMachines}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Running</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.running}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Warnings</p>
                <p className="text-2xl font-bold text-amber-600">{summaryStats.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Utilization</p>
                <p className="text-2xl font-bold">{summaryStats.avgUtilization}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedMachineData.slice(0, 6).map((machine) => (
          <Card key={machine.id} className="relative">
            {/* Status indicator */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
              style={{ backgroundColor: statusColors[machine.status] }}
            />
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{machine.name}</CardTitle>
                  <CardDescription>Device ID: {machine.id}</CardDescription>
                </div>
                <Badge 
                  style={{ 
                    backgroundColor: statusColors[machine.status],
                    color: 'white'
                  }}
                >
                  {machine.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold">{machine.utilization}%</p>
                  <p className="text-xs text-muted-foreground">Utilization</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{machine.cycleTime?.toFixed(1)}s</p>
                  <p className="text-xs text-muted-foreground">Cycle Time</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{machine.shotCount?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Shot Count</p>
                </div>
              </div>

              {/* Trend Chart */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Temperature Trend (°C)</p>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData.slice(0, 10)}>
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Temp: {machine.temperature}°C</Badge>
                <Badge variant="outline">Pressure: {machine.pressure?.toFixed(0)} bar</Badge>
                <Badge variant="outline">Oil: {machine.oilTemp}°C</Badge>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMachine(machine)}>
                    Details
                  </Button>
                  <Button variant="outline" size="sm">Charts</Button>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // 24h Quality View (uses elink data)
  const renderQualityView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">24-Hour Quality Metrics</h2>
        <Badge className="bg-green-100 text-green-800">Live Data</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Overall Quality</p>
            <p className="text-2xl font-bold text-green-600">97.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Defect Rate</p>
            <p className="text-2xl font-bold text-red-600">2.8%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Process Capability</p>
            <p className="text-2xl font-bold">1.45</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Stability Index</p>
            <p className="text-2xl font-bold text-blue-600">94.7%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SPC Control Chart - Cycle Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={qualityData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="upperLimit" stroke="#ef4444" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="lowerLimit" stroke="#ef4444" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="cycleTime" stroke="#3b82f6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={qualityData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="defectRate" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Reports View (uses elink data)
  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Production Reports</h2>
      
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Shots</p>
                <p className="text-2xl font-bold">{reportsData.daily.totalShots.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{reportsData.daily.avgCycleTime.toFixed(1)}s</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Efficiency</p>
                <p className="text-2xl font-bold text-green-600">{reportsData.daily.efficiency}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Defect Rate</p>
                <p className="text-2xl font-bold text-red-600">{reportsData.daily.defectRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Downtime</p>
                <p className="text-2xl font-bold text-amber-600">{reportsData.daily.downtime}min</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Shots</p>
                <p className="text-2xl font-bold">{reportsData.weekly.totalShots.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{reportsData.weekly.avgCycleTime.toFixed(1)}s</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Efficiency</p>
                <p className="text-2xl font-bold text-green-600">{reportsData.weekly.efficiency}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Defect Rate</p>
                <p className="text-2xl font-bold text-red-600">{reportsData.weekly.defectRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Downtime</p>
                <p className="text-2xl font-bold text-amber-600">{reportsData.weekly.downtime}min</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Shots</p>
                <p className="text-2xl font-bold">{reportsData.monthly.totalShots.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{reportsData.monthly.avgCycleTime.toFixed(1)}s</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Efficiency</p>
                <p className="text-2xl font-bold text-green-600">{reportsData.monthly.efficiency}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Defect Rate</p>
                <p className="text-2xl font-bold text-red-600">{reportsData.monthly.defectRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Downtime</p>
                <p className="text-2xl font-bold text-amber-600">{reportsData.monthly.downtime}min</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Trend Analysis (uses elink data)
  const renderTrendAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Process Trend Analysis</h2>
        <Badge className="bg-green-100 text-green-800">Live Data</Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cycle Time Trends</CardTitle>
            <CardDescription>Real-time cycle time performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="cycleTime" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Trends</CardTitle>
            <CardDescription>Multi-zone temperature monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pressure Analysis</CardTitle>
            <CardDescription>Injection pressure monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Trend</CardTitle>
            <CardDescription>Equipment efficiency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="utilization" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Correlation Analysis (demo)
  const renderCorrelation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Parameter Correlation Analysis</h2>
        <Badge variant="secondary">Demo</Badge>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This view shows demo data for correlation analysis functionality.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temperature vs Cycle Time</CardTitle>
            <CardDescription>Correlation: -0.65 (Strong Negative)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsScatter data={correlationData}>
                  <XAxis dataKey="temperature" name="Temperature" unit="°C" />
                  <YAxis dataKey="cycleTime" name="Cycle Time" unit="s" />
                  <Tooltip />
                  <RechartsScatter dataKey="cycleTime" fill="#3b82f6" />
                </RechartsScatter>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pressure vs Quality</CardTitle>
            <CardDescription>Correlation: 0.78 (Strong Positive)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsScatter data={correlationData}>
                  <XAxis dataKey="pressure" name="Pressure" unit="bar" />
                  <YAxis dataKey="quality" name="Quality" unit="%" />
                  <Tooltip />
                  <RechartsScatter dataKey="quality" fill="#10b981" />
                </RechartsScatter>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Timeline View (demo)
  const renderTimeline = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Production Timeline</h2>
        <Badge variant="secondary">Demo</Badge>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This view shows demo data for timeline functionality.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Today's Events</CardTitle>
          <CardDescription>Real-time production events and status changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="text-sm font-mono text-muted-foreground min-w-16">
                  {event.time}
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  event.status === 'normal' ? 'bg-green-500' :
                  event.status === 'warning' ? 'bg-yellow-500' :
                  event.status === 'alarm' ? 'bg-red-500' :
                  event.status === 'maintenance' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium">{event.event}</p>
                  <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
                </div>
                <Badge variant={
                  event.status === 'normal' ? 'default' :
                  event.status === 'warning' ? 'destructive' :
                  'secondary'
                }>
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Utilization View (uses elink data)
  const renderUtilization = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Equipment Utilization</h2>
        <Badge className="bg-green-100 text-green-800">Live Data</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Equipment Effectiveness (OEE)</CardTitle>
            <CardDescription>Current: 87.5% | Target: 85%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie data={utilizationData}>
                  <Tooltip />
                  <RechartsPie 
                    data={utilizationData}
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {utilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPie>
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {utilizationData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Equipment Gantt (demo)
  const renderGantt = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Equipment Scheduling</h2>
        <Badge variant="secondary">Demo</Badge>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This view shows demo data for Gantt chart scheduling functionality.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Equipment and resource allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ganttData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.equipment}</span>
                  <Badge variant={
                    item.status === 'running' ? 'default' :
                    item.status === 'maintenance' ? 'destructive' :
                    item.status === 'scheduled' ? 'secondary' :
                    'outline'
                  }>
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{item.task}</div>
                <div className="flex space-x-1">
                  {[...Array(24)].map((_, hour) => (
                    <div
                      key={hour}
                      className={`h-6 flex-1 border ${
                        hour >= item.start && hour < item.start + item.duration
                          ? item.status === 'running' ? 'bg-green-500' :
                            item.status === 'maintenance' ? 'bg-red-500' :
                            item.status === 'scheduled' ? 'bg-blue-500' :
                            'bg-gray-500'
                          : 'bg-gray-100'
                      }`}
                      title={`${hour}:00 - ${item.task}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Traceability View (demo)
  const renderTraceability = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Material Traceability</h2>
        <Badge variant="secondary">Demo</Badge>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This view shows demo data for material traceability functionality.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Material Tracking</CardTitle>
          <CardDescription>Current lot status and quality records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Number</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traceabilityData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.lot}</TableCell>
                  <TableCell>{item.material}</TableCell>
                  <TableCell>{item.quantity} kg</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === 'Completed' ? 'default' :
                      item.status === 'In Process' ? 'secondary' :
                      'destructive'
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {item.quality === 'Pass' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>{item.quality}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Mission Control Dashboard | OPC-UA Industrial Monitoring</title>
        <meta 
          name="description" 
          content="Advanced industrial machine monitoring with real-time insights and analytics" 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mission Control Dashboard</h1>
              <p className="text-muted-foreground">Real-time industrial machine monitoring and analytics</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">Live Data</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {views.map((view) => (
              <Button
                key={view.id}
                variant={selectedView === view.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView(view.id)}
                className="text-xs"
              >
                <view.icon className="h-4 w-4 mr-2" />
                {view.label}
                {!view.usesElinkData && (
                  <Badge variant="secondary" className="ml-2 text-xs">Demo</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {selectedView === 'production' && renderProductionStatus()}
          {selectedView === 'quality' && renderQualityView()}
          {selectedView === 'reports' && renderReports()}
          {selectedView === 'trends' && renderTrendAnalysis()}
          {selectedView === 'correlation' && renderCorrelation()}
          {selectedView === 'timeline' && renderTimeline()}
          {selectedView === 'utilization' && renderUtilization()}
          {selectedView === 'gantt' && renderGantt()}
          {selectedView === 'traceability' && renderTraceability()}
        </div>
      </div>
    </>
  );
}