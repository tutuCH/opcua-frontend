import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { TrendingUp, Target, RefreshCw, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMachineTimeSeries } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';

export function CorrelationChart() {
  const { t } = useTranslation();
  const [selectedMachine, setSelectedMachine] = useState<string>('postgres machine 1');
  const [xAxis, setXAxis] = useState('T1');
  const [yAxis, setYAxis] = useState('T2');
  const [timeRange, setTimeRange] = useState('-4h');

  // Use time-series data hook
  const machineTimeSeries = useMachineTimeSeries(selectedMachine, {
    historicalRange: timeRange
  });

  // Convert time-series data to correlation format
  const correlationData = useMemo(() => {
    const rawData = machineTimeSeries.combinedData || [];

    return rawData.map((point: TimeSeriesPoint, index) => {
      const xValue = xAxis === 'oilTemp' ? point.oilTemp : point.temperatures[xAxis as keyof typeof point.temperatures];
      const yValue = yAxis === 'oilTemp' ? point.oilTemp : point.temperatures[yAxis as keyof typeof point.temperatures];

      return {
        x: xValue,
        y: yValue,
        timestamp: point.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: point.status,
        operationMode: point.operationMode,
        pointColor: point.status === 2 ? '#10b981' : point.status === 1 ? '#3b82f6' : '#ef4444'
      };
    }).filter(point => point.x > 0 && point.y > 0); // Filter out invalid readings
  }, [machineTimeSeries.combinedData, xAxis, yAxis]);

  // Calculate correlation coefficient
  const correlation = useMemo(() => {
    if (correlationData.length < 2) return 0;

    const xValues = correlationData.map(d => d.x);
    const yValues = correlationData.map(d => d.y);

    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
    const sumY2 = yValues.reduce((acc, y) => acc + y * y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }, [correlationData]);

  const temperatureOptions = [
    { value: 'T1', label: 'Zone 1' },
    { value: 'T2', label: 'Zone 2' },
    { value: 'T3', label: 'Zone 3' },
    { value: 'T4', label: 'Zone 4' },
    { value: 'T5', label: 'Zone 5' },
    { value: 'T6', label: 'Zone 6' },
    { value: 'T7', label: 'Zone 7' },
    { value: 'oilTemp', label: 'Oil Temperature' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Correlation Analysis</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger>
                <SelectValue placeholder="X-Axis" />
              </SelectTrigger>
              <SelectContent>
                {temperatureOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Y-Axis" />
              </SelectTrigger>
              <SelectContent>
                {temperatureOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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

            <Button
              variant="outline"
              onClick={machineTimeSeries.refreshData}
              disabled={!machineTimeSeries.isConnected}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Correlation (r)</p>
                <p className="text-2xl font-bold">{correlation.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">{correlationData.length}</p>
                <p className="text-xs text-muted-foreground">Valid measurements</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connection</p>
                <p className="text-2xl font-bold text-green-600">
                  {machineTimeSeries.isConnected ? 'Live' : 'Offline'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {machineTimeSeries.lastUpdateTime?.toLocaleTimeString() || 'No updates'}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                machineTimeSeries.isConnected ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <div className={`h-3 w-3 rounded-full ${
                  machineTimeSeries.isConnected ? 'bg-green-600' : 'bg-gray-600'
                }`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Correlation Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {temperatureOptions.find(o => o.value === xAxis)?.label} vs{' '}
              {temperatureOptions.find(o => o.value === yAxis)?.label}
            </CardTitle>
            <Badge variant={Math.abs(correlation) > 0.7 ? "default" : "secondary"}>
              r = {correlation.toFixed(3)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-96 w-full">
            {correlationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={temperatureOptions.find(o => o.value === xAxis)?.label}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={temperatureOptions.find(o => o.value === yAxis)?.label}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [`${value}°C`, name]}
                    labelFormatter={(value) => `Time: ${correlationData[0]?.timestamp}`}
                  />
                  <Scatter dataKey="y" fill="#3b82f6">
                    {correlationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pointColor} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No correlation data available</p>
                  <p className="text-sm">Connect to WebSocket and select a machine</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Production (STS=2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Online (STS=1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Offline (STS=0)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}