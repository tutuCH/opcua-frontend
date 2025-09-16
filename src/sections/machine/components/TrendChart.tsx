import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Legend
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Database, Activity } from 'lucide-react'
import { useTimeSeriesData, useMachineTimeSeries } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';

const temperatureZones = [
  { key: 'T1', color: '#ef4444', name: 'Zone 1' },
  { key: 'T2', color: '#f97316', name: 'Zone 2' },
  { key: 'T3', color: '#eab308', name: 'Zone 3' },
  { key: 'T4', color: '#22c55e', name: 'Zone 4' },
  { key: 'T5', color: '#06b6d4', name: 'Zone 5' },
  { key: 'T6', color: '#3b82f6', name: 'Zone 6' },
  { key: 'T7', color: '#8b5cf6', name: 'Zone 7' }
];

interface ChartDataPoint {
  timestamp: Date;
  timeDisplay: string;
  T1: number;
  T2: number;
  T3: number;
  T4: number;
  T5: number;
  T6: number;
  T7: number;
  oilTemp: number;
  status: number;
  operationMode: number;
  sourceType: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium text-sm">{`Time: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}°C`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart() {
  const [selectedZones, setSelectedZones] = useState(
    temperatureZones.map(zone => zone.key)
  );
  const [showOilTemp, setShowOilTemp] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<string>('postgres machine 1');
  const [timeRange, setTimeRange] = useState('-1h');
  const [primaryMetric, setPrimaryMetric] = useState('temperature');

  // Use time-series data hook
  const timeSeriesData = useTimeSeriesData({
    deviceIds: [selectedMachine],
    autoSubscribe: true,
    historicalRange: timeRange,
    enableRealtime: true,
    enableSPC: false
  });

  const machineTimeSeries = useMachineTimeSeries(selectedMachine, {
    historicalRange: timeRange
  });

  // Convert time-series data to chart format
  const chartData = useMemo((): ChartDataPoint[] => {
    const rawData = machineTimeSeries.combinedData || [];

    return rawData.map((point: TimeSeriesPoint) => ({
      timestamp: point.timestamp,
      timeDisplay: point.timestamp.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      T1: point.temperatures.T1,
      T2: point.temperatures.T2,
      T3: point.temperatures.T3,
      T4: point.temperatures.T4,
      T5: point.temperatures.T5,
      T6: point.temperatures.T6,
      T7: point.temperatures.T7,
      oilTemp: point.oilTemp,
      status: point.status,
      operationMode: point.operationMode,
      sourceType: point.sourceType
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [machineTimeSeries.combinedData]);

  const toggleZone = (zoneKey: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneKey)
        ? prev.filter(key => key !== zoneKey)
        : [...prev, zoneKey]
    );
  };

  const getLatestTemp = (zone: string) => {
    if (chartData.length === 0) return 0;
    const latest = chartData[chartData.length - 1];
    return latest[zone as keyof ChartDataPoint] as number;
  };

  const getTrend = (zone: string) => {
    if (chartData.length < 2) return 'stable';
    const latest = getLatestTemp(zone) as number;
    const previous = chartData[chartData.length - 2][zone as keyof ChartDataPoint] as number;
    const diff = latest - previous;

    if (Math.abs(diff) < 0.5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const getTemperatureAlerts = () => {
    const alerts = [];
    const latest = machineTimeSeries.latestData;

    if (!latest) return alerts;

    // Check for temperature variations
    const temps = Object.values(latest.temperatures);
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;

    temps.forEach((temp, index) => {
      const deviation = Math.abs(temp - avgTemp);
      if (deviation > 5) {
        alerts.push({
          type: 'warning',
          zone: `Zone ${index + 1}`,
          message: `Temperature deviation of ${deviation.toFixed(1)}°C from average`,
          temp: temp
        });
      }
    });

    // Check oil temperature
    if (latest.oilTemp > 60) {
      alerts.push({
        type: 'warning',
        zone: 'Oil System',
        message: `Oil temperature high: ${latest.oilTemp}°C`,
        temp: latest.oilTemp
      });
    }

    return alerts;
  };

  const dataSummary = machineTimeSeries.dataSummary;
  const alerts = getTemperatureAlerts();
  const latestData = machineTimeSeries.latestData;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend Analysis</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Machine</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres machine 1">Machine 1</SelectItem>
                  <SelectItem value="postgres machine 2">Machine 2</SelectItem>
                  <SelectItem value="postgres machine 3">Machine 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time Window</Label>
              <Select value={timeRange} onValueChange={(value) => {
                setTimeRange(value);
                machineTimeSeries.requestHistoricalData(value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-15m">Last 15 Minutes</SelectItem>
                  <SelectItem value="-1h">Last 1 Hour</SelectItem>
                  <SelectItem value="-4h">Last 4 Hours</SelectItem>
                  <SelectItem value="-24h">Last 24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-oil" checked={showOilTemp} onCheckedChange={setShowOilTemp} />
              <Label htmlFor="show-oil">Show Oil Temperature</Label>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={timeSeriesData.isConnected ? "default" : "secondary"}
                     className={timeSeriesData.isConnected ? "bg-green-500" : ""}>
                {timeSeriesData.isConnected ? "Live Data" : "Disconnected"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={timeSeriesData.refreshData}
                disabled={!timeSeriesData.isConnected}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">
                  {latestData ?
                    (Object.values(latestData.temperatures).reduce((a, b) => a + b, 0) / 7).toFixed(1)
                    : '—'}°C
                </p>
                <p className="text-xs text-muted-foreground">Target: 220°C</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {latestData?.status === 2 ? 'Production' :
                   latestData?.status === 1 ? 'Online' :
                   latestData?.status === 0 ? 'Offline' : 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">STS: {latestData?.status || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold text-blue-600">{dataSummary?.totalPoints || 0}</p>
                <p className="text-xs text-muted-foreground">Realtime: {dataSummary?.realtimePoints || 0}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
                <p className="text-xs text-muted-foreground">Temperature warnings</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Zone Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {temperatureZones.map((zone) => {
          const temp = getLatestTemp(zone.key);
          const trend = getTrend(zone.key);
          const isSelected = selectedZones.includes(zone.key);

          return (
            <Card
              key={zone.key}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => toggleZone(zone.key)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{zone.name}</span>
                  {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                  {trend === 'stable' && <Activity className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="text-2xl font-bold" style={{ color: zone.color }}>
                  {temp > 0 ? temp.toFixed(1) : '—'}°C
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: 220°C
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Temperature Trends - {selectedMachine}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {chartData.length > 0 ? `${chartData.length} points` : 'No data'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-96 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timeDisplay"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                  />

                  {/* Target lines */}
                  <ReferenceLine y={220} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                  <ReferenceLine y={230} stroke="#dc2626" strokeWidth={1} />
                  <ReferenceLine y={210} stroke="#dc2626" strokeWidth={1} />

                  {/* Temperature zone lines */}
                  {temperatureZones.map((zone) =>
                    selectedZones.includes(zone.key) && (
                      <Line
                        key={zone.key}
                        type="monotone"
                        dataKey={zone.key}
                        stroke={zone.color}
                        strokeWidth={2}
                        dot={false}
                        name={zone.name}
                        connectNulls={false}
                      />
                    )
                  )}

                  {/* Oil temperature line */}
                  {showOilTemp && (
                    <Line
                      type="monotone"
                      dataKey="oilTemp"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Oil Temperature"
                      connectNulls={false}
                    />
                  )}

                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Brush for zooming */}
                  <Brush dataKey="timeDisplay" height={30} stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No temperature data available</p>
                  <p className="text-sm">Check WebSocket connection and machine status</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Temperature Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Alerts & Recommendations</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.zone} - {alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Current temperature: {alert.temp.toFixed(1)}°C
                    </p>
                  </div>
                  <Badge variant="outline">Warning</Badge>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Optimal Performance</p>
                  <p className="text-sm text-muted-foreground">
                    All temperature zones operating within normal parameters.
                  </p>
                </div>
                <Badge variant="outline">Good</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}