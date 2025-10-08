import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { TrendingUp, AlertTriangle, RefreshCw, Activity, Clock, CheckCircle } from 'lucide-react';
import { useMachineTimeSeries } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';

interface OEEMetrics {
  availability: number;
  performance: number;
  quality: number;
  overall: number;
  plannedTime: number;
  actualRuntime: number;
  idealCycleTime: number;
  actualCycleTime: number;
  goodParts: number;
  totalParts: number;
  downtime: number;
}

interface SemiDonutData {
  name: string;
  value: number;
  color: string;
}

export function OEEGauges() {
  const [selectedMachine, setSelectedMachine] = useState<string>('postgres machine 1');
  const [timeRange, setTimeRange] = useState('-8h');

  // Use machine time-series data
  const machineTimeSeries = useMachineTimeSeries(selectedMachine, {
    historicalRange: timeRange
  });

  // Calculate OEE metrics from time-series data
  const oeeMetrics = useMemo((): OEEMetrics | null => {
    const rawData = machineTimeSeries.combinedData || [];

    if (rawData.length < 5) return null;

    // Sort data by timestamp
    const sortedData = rawData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate time-based metrics
    const totalTimeMs = sortedData[sortedData.length - 1].timestamp.getTime() - sortedData[0].timestamp.getTime();
    const totalTimeHours = totalTimeMs / (1000 * 60 * 60);

    // Planned production time (assume 16 hours for 2-shift operation)
    const plannedTime = Math.min(totalTimeHours, 16);

    // Runtime calculation (status >= 1 = running)
    const runningPoints = sortedData.filter(point => point.status >= 1);
    const actualRuntime = (runningPoints.length / sortedData.length) * totalTimeHours;

    // Availability = (Actual Runtime / Planned Time) * 100
    const availability = (actualRuntime / plannedTime) * 100;

    // Performance metrics (from production cycles - status = 2)
    const productionData = sortedData.filter(point => point.status === 2);

    // Simulate cycle time data from temperature variations
    const cycleTimes = productionData.map(point => {
      const avgTemp = Object.values(point.temperatures).reduce((sum, temp) => sum + temp, 0) / 7;
      return 25 + (avgTemp - 220) * 0.1 + (Math.random() - 0.5) * 2;
    });

    const idealCycleTime = 25; // Target cycle time in seconds
    const actualCycleTime = cycleTimes.length > 0
      ? cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length
      : idealCycleTime;

    // Performance = (Ideal Cycle Time / Actual Cycle Time) * 100
    const performance = (idealCycleTime / actualCycleTime) * 100;

    // Quality metrics (simulate based on temperature stability)
    const totalParts = cycleTimes.length;
    const tempVariations = cycleTimes.map((_, index) => {
      if (index === 0) return 0;
      const currentPoint = productionData[index];
      const prevPoint = productionData[index - 1];
      const currentAvgTemp = Object.values(currentPoint.temperatures).reduce((sum, temp) => sum + temp, 0) / 7;
      const prevAvgTemp = Object.values(prevPoint.temperatures).reduce((sum, temp) => sum + temp, 0) / 7;
      return Math.abs(currentAvgTemp - prevAvgTemp);
    });

    // Good parts based on temperature stability (less variation = better quality)
    const goodParts = tempVariations.filter(variation => variation < 2.0).length;

    // Quality = (Good Parts / Total Parts) * 100
    const quality = totalParts > 0 ? (goodParts / totalParts) * 100 : 100;

    // Overall OEE = Availability × Performance × Quality / 10000
    const overall = (availability * performance * quality) / 10000;

    // Downtime calculation
    const downtimePoints = sortedData.filter(point => point.status === 0);
    const downtime = (downtimePoints.length / sortedData.length) * totalTimeHours;

    return {
      availability: Math.min(availability, 100),
      performance: Math.min(performance, 100),
      quality: Math.min(quality, 100),
      overall: Math.min(overall, 100),
      plannedTime,
      actualRuntime,
      idealCycleTime,
      actualCycleTime,
      goodParts,
      totalParts,
      downtime
    };
  }, [machineTimeSeries.combinedData]);

  // Create semi-donut chart data
  const createSemiDonutData = (value: number, label: string): SemiDonutData[] => {
    const percentage = Math.max(0, Math.min(100, value));
    const remaining = 100 - percentage;

    let color = '#ef4444'; // Red for poor performance
    if (percentage >= 85) color = '#10b981'; // Green for excellent
    else if (percentage >= 75) color = '#f59e0b'; // Yellow for good
    else if (percentage >= 60) color = '#f97316'; // Orange for fair

    return [
      { name: label, value: percentage, color },
      { name: 'Remaining', value: remaining, color: '#f3f4f6' }
    ];
  };

  const SemiDonutGauge = ({
    data,
    title,
    value,
    icon: Icon,
    target
  }: {
    data: SemiDonutData[],
    title: string,
    value: number,
    icon: any,
    target: number
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="90%"
                startAngle={180}
                endAngle={0}
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center value display */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
            <div className="text-2xl font-bold" style={{ color: data[0].color }}>
              {value.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Target: {target}%
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-2 flex justify-center">
          <Badge
            variant={value >= target ? "default" : "secondary"}
            className={value >= target ? "bg-green-500" : ""}
          >
            {value >= target ? "On Target" : "Below Target"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const getOEEStatus = (oee: number) => {
    if (oee >= 85) return { status: 'World Class', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (oee >= 75) return { status: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (oee >= 60) return { status: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { status: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>OEE Dashboard - Overall Equipment Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="-4h">4 hours</SelectItem>
                <SelectItem value="-8h">8 hours (shift)</SelectItem>
                <SelectItem value="-24h">24 hours</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant={machineTimeSeries.isConnected ? "default" : "secondary"}
                     className={machineTimeSeries.isConnected ? "bg-green-500" : ""}>
                {machineTimeSeries.isConnected ? "Live" : "Offline"}
              </Badge>
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
        </CardContent>
      </Card>

      {oeeMetrics ? (
        <>
          {/* Overall OEE Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Overall OEE</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {oeeMetrics.overall.toFixed(1)}%
                    </span>
                    <Badge
                      className={`${getOEEStatus(oeeMetrics.overall).bgColor} ${getOEEStatus(oeeMetrics.overall).color}`}
                      variant="secondary"
                    >
                      {getOEEStatus(oeeMetrics.overall).status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    World Class Target: ≥85%
                  </p>
                </div>

                <div className="md:col-span-3 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {oeeMetrics.availability.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Availability</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {oeeMetrics.performance.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Performance</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {oeeMetrics.quality.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Quality</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OEE Component Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SemiDonutGauge
              data={createSemiDonutData(oeeMetrics.availability, 'Availability')}
              title="Availability"
              value={oeeMetrics.availability}
              icon={Clock}
              target={90}
            />

            <SemiDonutGauge
              data={createSemiDonutData(oeeMetrics.performance, 'Performance')}
              title="Performance"
              value={oeeMetrics.performance}
              icon={Activity}
              target={95}
            />

            <SemiDonutGauge
              data={createSemiDonutData(oeeMetrics.quality, 'Quality')}
              title="Quality"
              value={oeeMetrics.quality}
              icon={CheckCircle}
              target={99}
            />
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Runtime</p>
                    <p className="text-2xl font-bold">
                      {oeeMetrics.actualRuntime.toFixed(1)}h
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {oeeMetrics.plannedTime.toFixed(1)}h planned
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cycle Time</p>
                    <p className="text-2xl font-bold">
                      {oeeMetrics.actualCycleTime.toFixed(1)}s
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Target: {oeeMetrics.idealCycleTime}s
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Good Parts</p>
                    <p className="text-2xl font-bold text-green-600">
                      {oeeMetrics.goodParts}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {oeeMetrics.totalParts} total
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Downtime</p>
                    <p className="text-2xl font-bold text-red-600">
                      {oeeMetrics.downtime.toFixed(1)}h
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((oeeMetrics.downtime / oeeMetrics.plannedTime) * 100).toFixed(1)}% of planned
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Alerts */}
          {oeeMetrics.overall < 75 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>OEE Performance Alert:</strong> Overall equipment effectiveness is below 75%.
                Review availability ({oeeMetrics.availability.toFixed(1)}%),
                performance ({oeeMetrics.performance.toFixed(1)}%),
                and quality ({oeeMetrics.quality.toFixed(1)}%) metrics for improvement opportunities.
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Insufficient data for OEE calculation</p>
              <p className="text-sm">Need at least 5 data points to calculate meaningful metrics</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}