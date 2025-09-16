import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Scatter,
  ScatterChart
} from 'recharts'
import { AlertTriangle, TrendingUp, TrendingDown, Target, RefreshCw, Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMachineTimeSeries } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';

interface QualityDataPoint {
  time: string;
  timeDisplay: string;
  dimension: number;
  rejectRate: number;
  temperature: number;
  withinSpec: boolean;
  condition: string;
  mold: string;
  oilTemp: number;
  status: number;
  operationMode: number;
}

export function QualityView() {
  const { t } = useTranslation();
  const [selectedMachine, setSelectedMachine] = useState<string>('postgres machine 1');
  const [timeRange, setTimeRange] = useState('-4h');
  const [selectedMetric, setSelectedMetric] = useState('dimension');
  const [showSPCBands, setShowSPCBands] = useState(true);
  const [showOutliers, setShowOutliers] = useState(true);

  // Use time-series data hook
  const machineTimeSeries = useMachineTimeSeries(selectedMachine, {
    historicalRange: timeRange
  });

  // Convert time-series data to quality analysis format
  const qualityData = useMemo((): QualityDataPoint[] => {
    const rawData = machineTimeSeries.combinedData || [];

    return rawData.map((point: TimeSeriesPoint) => {
      // Convert temperature to dimensional quality estimate
      const avgTemp = Object.values(point.temperatures).reduce((sum, temp) => sum + temp, 0) / 7;
      const dimension = 2.5 + (avgTemp - 220) * 0.01 + (Math.random() - 0.5) * 0.2;
      const rejectRate = Math.max(0, Math.abs(dimension - 2.5) * 3);

      const hour = point.timestamp.getHours();
      const condition = hour < 6 || hour >= 22 ? 'Night Shift' : hour < 14 ? 'Day Shift' : 'Evening Shift';

      return {
        time: point.timestamp.toISOString(),
        timeDisplay: point.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dimension: Number(dimension.toFixed(3)),
        rejectRate: Number(rejectRate.toFixed(2)),
        temperature: avgTemp,
        withinSpec: dimension >= 2.0 && dimension <= 3.0,
        condition,
        mold: 'M-2024-001',
        oilTemp: point.oilTemp,
        status: point.status,
        operationMode: point.operationMode
      };
    }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [machineTimeSeries.combinedData]);

  // Calculate SPC statistics
  const spcStats = useMemo(() => {
    if (qualityData.length === 0) return null;

    const dimensions = qualityData.map(d => d.dimension);
    const mean = dimensions.reduce((a, b) => a + b, 0) / dimensions.length;
    const stdDev = Math.sqrt(dimensions.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / dimensions.length);

    const limits = {
      target: 2.5,
      upperSpec: 3.0,
      lowerSpec: 2.0,
      ucl: mean + 3 * stdDev,
      lcl: mean - 3 * stdDev,
      upl: mean + 2 * stdDev,
      lpl: mean - 2 * stdDev,
      uwl: mean + stdDev,
      lwl: mean - stdDev
    };

    const violationCount = qualityData.filter(d => !d.withinSpec).length;
    const violationPercent = ((violationCount / qualityData.length) * 100).toFixed(1);

    return { limits, violationCount, violationPercent, mean, stdDev };
  }, [qualityData]);

  const currentValue = qualityData.length > 0 ? qualityData[qualityData.length - 1] : null;
  const cpk = spcStats ? Math.min(
    (spcStats.limits.upperSpec - spcStats.mean) / (3 * spcStats.stdDev),
    (spcStats.mean - spcStats.limits.lowerSpec) / (3 * spcStats.stdDev)
  ) : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quality Analysis Dashboard</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres machine 1">Machine 1</SelectItem>
                  <SelectItem value="postgres machine 2">Machine 2</SelectItem>
                  <SelectItem value="postgres machine 3">Machine 3</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dimension">Dimension</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="rejectRate">Reject Rate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={(value) => {
                setTimeRange(value);
                machineTimeSeries.requestHistoricalData(value);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1h">1 hour</SelectItem>
                  <SelectItem value="-4h">4 hours</SelectItem>
                  <SelectItem value="-24h">24 hours</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={machineTimeSeries.refreshData}
                disabled={!machineTimeSeries.isConnected}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="spc-bands" checked={showSPCBands} onCheckedChange={setShowSPCBands} />
                <Label htmlFor="spc-bands">SPC Bands</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="outliers" checked={showOutliers} onCheckedChange={setShowOutliers} />
                <Label htmlFor="outliers">Show Outliers</Label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={machineTimeSeries.isConnected ? "default" : "secondary"}
                     className={machineTimeSeries.isConnected ? "bg-green-500" : ""}>
                {machineTimeSeries.isConnected ? "Live Data" : "Disconnected"}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>{qualityData.length} points</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">
                  {currentValue ? currentValue.dimension.toFixed(3) : '—'} mm
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {spcStats?.limits.target || 2.5} mm
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spec Violations</p>
                <p className="text-2xl font-bold text-red-600">
                  {spcStats?.violationCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {spcStats?.violationPercent || 0}% of readings
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Process Capability</p>
                <p className="text-2xl font-bold text-green-600">
                  {cpk > 0 ? cpk.toFixed(2) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Cpk Index</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Machine Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentValue?.status === 2 ? 'Production' :
                   currentValue?.status === 1 ? 'Online' :
                   currentValue?.status === 0 ? 'Offline' : 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {machineTimeSeries.lastUpdateTime?.toLocaleTimeString() || 'No updates'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Quality Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quality Control Chart - {selectedMachine}</CardTitle>
            <div className="flex items-center gap-2">
              {spcStats && spcStats.violationCount > 0 && (
                <Badge variant="destructive">
                  {spcStats.violationPercent}% violations
                </Badge>
              )}
              <Badge variant="outline">
                {qualityData.length} data points
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-96 w-full">
            {qualityData.length > 0 && spcStats ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="timeDisplay"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#6b7280"
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    tick={{ fontSize: 12 }}
                  />

                  {/* SPC Bands */}
                  {showSPCBands && (
                    <>
                      <ReferenceArea
                        y1={spcStats.limits.lowerSpec}
                        y2={spcStats.limits.upperSpec}
                        fill="#10b981"
                        fillOpacity={0.1}
                        stroke="none"
                      />
                      <ReferenceArea
                        y1={spcStats.limits.lwl}
                        y2={spcStats.limits.uwl}
                        fill="#3b82f6"
                        fillOpacity={0.08}
                        stroke="none"
                      />
                      <ReferenceArea
                        y1={spcStats.limits.lpl}
                        y2={spcStats.limits.upl}
                        fill="#f59e0b"
                        fillOpacity={0.08}
                        stroke="none"
                      />
                    </>
                  )}

                  {/* Control Lines */}
                  <ReferenceLine y={spcStats.limits.target} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                  <ReferenceLine y={spcStats.limits.upperSpec} stroke="#dc2626" strokeWidth={1} />
                  <ReferenceLine y={spcStats.limits.lowerSpec} stroke="#dc2626" strokeWidth={1} />
                  <ReferenceLine y={spcStats.limits.ucl} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
                  <ReferenceLine y={spcStats.limits.lcl} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />

                  {/* Data Line */}
                  <Line
                    type="monotone"
                    dataKey="dimension"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (showOutliers && !payload?.withinSpec) {
                        return <circle cx={cx} cy={cy} r={3} fill="#dc2626" stroke="white" strokeWidth={1} />;
                      }
                      return false;
                    }}
                    connectNulls={false}
                  />

                  <Tooltip
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(3)} mm`,
                      'Dimension'
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#1f2937'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No quality data available</p>
                  <p className="text-sm">Connect to WebSocket and select a machine</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {spcStats && (
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-600"></div>
                <span>Target ({spcStats.limits.target})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-red-600"></div>
                <span>Spec Limits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-amber-600 opacity-60" style={{ borderStyle: 'dashed' }}></div>
                <span>±3σ</span>
              </div>
              {showOutliers && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  <span>Out of Spec</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Process Status */}
      <Card>
        <CardHeader>
          <CardTitle>Process Status & Shift Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="w-1 h-8 bg-green-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Current Status</p>
                <p className="text-sm text-muted-foreground">
                  {currentValue?.status === 2 ? 'Production Mode - Active' :
                   currentValue?.status === 1 ? 'Online - Standby' :
                   currentValue?.status === 0 ? 'Offline' : 'Unknown Status'}
                </p>
              </div>
              <Badge variant={currentValue?.status === 2 ? "default" : "secondary"}>
                {currentValue?.status === 2 ? "Active" : "Standby"}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="w-1 h-8 bg-blue-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Data Collection</p>
                <p className="text-sm text-muted-foreground">
                  Last update: {machineTimeSeries.lastUpdateTime?.toLocaleString() || 'No data received'}
                </p>
              </div>
              <Badge variant="outline">
                {machineTimeSeries.isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="w-1 h-8 bg-amber-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Quality Analysis</p>
                <p className="text-sm text-muted-foreground">
                  {spcStats?.violationCount === 0 ? 'All measurements within specification' :
                   `${spcStats?.violationCount || 0} violations detected`}
                </p>
              </div>
              <Badge variant={spcStats?.violationCount === 0 ? "default" : "destructive"}>
                {spcStats?.violationCount === 0 ? "Good" : "Alert"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}