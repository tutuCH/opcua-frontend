import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Scatter
} from 'recharts';
import { TrendingUp, AlertTriangle, RefreshCw, Database, Target } from 'lucide-react';
import { useMachineTimeSeries } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';

interface SPCDataPoint {
  cycle: number;
  cycleTime: number;
  timestamp: string;
  timeDisplay: string;
  status: number;
  operationMode: number;
  isOutOfControl: boolean;
  violationType?: 'ucl' | 'lcl' | 'trend' | 'range';
}

interface SPCStatistics {
  mean: number;
  ucl: number;
  lcl: number;
  range: number;
  sigma: number;
  cpk: number;
  violations: SPCDataPoint[];
}

export function SPCControlChart() {
  const [selectedMachine, setSelectedMachine] = useState<string>('postgres machine 1');
  const [timeRange, setTimeRange] = useState('-4h');
  const [showViolations, setShowViolations] = useState(true);

  // Use machine time-series data
  const machineTimeSeries = useMachineTimeSeries(selectedMachine, {
    historicalRange: timeRange
  });

  // Convert time-series data to SPC format
  const spcData = useMemo((): SPCDataPoint[] => {
    const rawData = machineTimeSeries.combinedData || [];

    // Filter for SPC data (production cycles) and sort by timestamp
    const spcRawData = rawData
      .filter((point: TimeSeriesPoint) => point.status === 2) // Production mode only
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return spcRawData.map((point: TimeSeriesPoint, index) => {
      // Simulate cycle time from temperature variations (real SPC data would come from CYCN/ECYCT)
      const avgTemp = Object.values(point.temperatures).reduce((sum, temp) => sum + temp, 0) / 7;
      const cycleTime = 25 + (avgTemp - 220) * 0.1 + (Math.random() - 0.5) * 2;

      return {
        cycle: index + 1,
        cycleTime: Number(cycleTime.toFixed(2)),
        timestamp: point.timestamp.toISOString(),
        timeDisplay: point.timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: point.status,
        operationMode: point.operationMode,
        isOutOfControl: false, // Will be calculated in statistics
        violationType: undefined
      };
    });
  }, [machineTimeSeries.combinedData]);

  // Calculate SPC statistics
  const spcStatistics = useMemo((): SPCStatistics | null => {
    if (spcData.length < 10) return null; // Need minimum data for meaningful statistics

    const cycleTimes = spcData.map(d => d.cycleTime);
    const mean = cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length;

    // Calculate standard deviation
    const variance = cycleTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / cycleTimes.length;
    const sigma = Math.sqrt(variance);

    // Control limits (±3σ)
    const ucl = mean + 3 * sigma;
    const lcl = Math.max(0, mean - 3 * sigma); // Can't have negative cycle time

    // Process capability (assuming USL=35, LSL=15 for cycle time)
    const usl = 35;
    const lsl = 15;
    const cpk = Math.min(
      (usl - mean) / (3 * sigma),
      (mean - lsl) / (3 * sigma)
    );

    // Identify violations
    const violations = spcData.filter(point => {
      if (point.cycleTime > ucl) {
        point.isOutOfControl = true;
        point.violationType = 'ucl';
        return true;
      }
      if (point.cycleTime < lcl) {
        point.isOutOfControl = true;
        point.violationType = 'lcl';
        return true;
      }
      return false;
    });

    // Check for trends (7 consecutive points above/below mean)
    for (let i = 6; i < spcData.length; i++) {
      const last7 = spcData.slice(i - 6, i + 1);
      const allAbove = last7.every(p => p.cycleTime > mean);
      const allBelow = last7.every(p => p.cycleTime < mean);

      if (allAbove || allBelow) {
        last7.forEach(point => {
          if (!point.isOutOfControl) {
            point.isOutOfControl = true;
            point.violationType = 'trend';
            violations.push(point);
          }
        });
      }
    }

    return {
      mean,
      ucl,
      lcl,
      range: ucl - lcl,
      sigma,
      cpk,
      violations
    };
  }, [spcData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm">{`Cycle: ${label}`}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`Cycle Time: ${data.cycleTime}s`}
          </p>
          <p className="text-xs text-gray-500">{`Time: ${data.timeDisplay}`}</p>
          {data.isOutOfControl && (
            <p className="text-xs text-red-600 font-medium">
              ⚠️ Out of Control ({data.violationType?.toUpperCase()})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>SPC Control Chart - Cycle Time Stability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <Select value={timeRange} onValueChange={(value) => {
              setTimeRange(value);
              machineTimeSeries.requestHistoricalData(value);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1h">1 hour</SelectItem>
                <SelectItem value="-4h">4 hours</SelectItem>
                <SelectItem value="-24h">24 hours</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant={machineTimeSeries.isConnected ? "default" : "secondary"}
                     className={machineTimeSeries.isConnected ? "bg-green-500" : ""}>
                {machineTimeSeries.isConnected ? "Live" : "Offline"}
              </Badge>
              <Badge variant="outline">
                {spcData.length} cycles
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={machineTimeSeries.refreshData}
              disabled={!machineTimeSeries.isConnected}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SPC Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mean (X̄)</p>
                <p className="text-2xl font-bold">
                  {spcStatistics ? spcStatistics.mean.toFixed(2) : '—'}s
                </p>
                <p className="text-xs text-muted-foreground">Target: 25.0s</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cpk</p>
                <p className="text-2xl font-bold text-green-600">
                  {spcStatistics ? spcStatistics.cpk.toFixed(2) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {spcStatistics && spcStatistics.cpk >= 1.33 ? 'Capable' :
                   spcStatistics && spcStatistics.cpk >= 1.0 ? 'Marginal' : 'Poor'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold text-red-600">
                  {spcStatistics ? spcStatistics.violations.length : 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {spcStatistics ?
                    ((spcStatistics.violations.length / spcData.length) * 100).toFixed(1) + '%' :
                    '0%'} of cycles
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
                <p className="text-sm font-medium text-muted-foreground">Sigma (σ)</p>
                <p className="text-2xl font-bold">
                  {spcStatistics ? spcStatistics.sigma.toFixed(3) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Process variation</p>
              </div>
              <Database className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main SPC Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>X-bar Control Chart - {selectedMachine}</CardTitle>
            <div className="flex items-center gap-2">
              {spcStatistics && spcStatistics.violations.length > 0 && (
                <Badge variant="destructive">
                  {spcStatistics.violations.length} violations
                </Badge>
              )}
              <Badge variant={spcStatistics && spcStatistics.cpk >= 1.33 ? "default" : "secondary"}>
                Cpk: {spcStatistics ? spcStatistics.cpk.toFixed(2) : '—'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-96 w-full">
            {spcData.length > 0 && spcStatistics ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={spcData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="cycle"
                    label={{ value: 'Cycle Number', position: 'insideBottom', dy: 10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Cycle Time (s)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />

                  {/* Control Lines */}
                  <ReferenceLine
                    y={spcStatistics.mean}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label="Mean"
                  />
                  <ReferenceLine
                    y={spcStatistics.ucl}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label="UCL"
                  />
                  <ReferenceLine
                    y={spcStatistics.lcl}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label="LCL"
                  />

                  {/* Data Line */}
                  <Line
                    type="monotone"
                    dataKey="cycleTime"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload?.isOutOfControl && showViolations) {
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill="#ef4444"
                            stroke="white"
                            strokeWidth={2}
                          />
                        );
                      }
                      return <circle cx={cx} cy={cy} r={2} fill="#2563eb" />;
                    }}
                    connectNulls={false}
                  />

                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No cycle data available</p>
                  <p className="text-sm">Machine needs to be in production mode (STS=2)</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Violations Alert */}
      {spcStatistics && spcStatistics.violations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Process Control Alert:</strong> {spcStatistics.violations.length} out-of-control
            points detected. Review process parameters and investigate root causes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}