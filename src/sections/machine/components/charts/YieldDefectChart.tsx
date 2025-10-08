import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingDown, TrendingUp, RefreshCw, Database, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { useMachineTimeSeries } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';

interface YieldData {
  period: string;
  shift: string;
  good: number;
  bad: number;
  total: number;
  yieldRate: number;
  defectRate: number;
  target: number;
  timestamp: Date;
}

interface DefectCategory {
  category: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface ProductionSummary {
  totalProduced: number;
  totalGood: number;
  totalDefects: number;
  overallYield: number;
  targetYield: number;
  trend: 'up' | 'down' | 'stable';
}

export function YieldDefectChart() {
  const [selectedMachine, setSelectedMachine] = useState<string>('postgres machine 1');
  const [timeRange, setTimeRange] = useState('-24h');
  const [groupBy, setGroupBy] = useState<'hour' | 'shift' | 'day'>('shift');

  // Use machine time-series data
  const machineTimeSeries = useMachineTimeSeries(selectedMachine, {
    historicalRange: timeRange
  });

  // Convert time-series data to yield/defect data
  const yieldData = useMemo((): YieldData[] => {
    const rawData = machineTimeSeries.combinedData || [];

    // Filter for production data and group by time periods
    const productionData = rawData
      .filter((point: TimeSeriesPoint) => point.status === 2) // Production mode only
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (productionData.length === 0) return [];

    const periods: YieldData[] = [];
    const groupSize = groupBy === 'hour' ? 12 : groupBy === 'shift' ? 20 : 60; // Points per period

    for (let i = 0; i < productionData.length; i += groupSize) {
      const periodData = productionData.slice(i, i + groupSize);
      if (periodData.length < 5) continue; // Skip incomplete periods

      const startTime = periodData[0].timestamp;
      const avgTemp = periodData.reduce((sum, point) => {
        return sum + Object.values(point.temperatures).reduce((tSum, temp) => tSum + temp, 0) / 7;
      }, 0) / periodData.length;

      // Simulate production counts based on temperature stability
      const tempVariation = Math.max(...periodData.map(p =>
        Object.values(p.temperatures).reduce((sum, temp) => sum + temp, 0) / 7
      )) - Math.min(...periodData.map(p =>
        Object.values(p.temperatures).reduce((sum, temp) => sum + temp, 0) / 7
      ));

      // Good production correlates with temperature stability
      const baseProduction = 100;
      const qualityFactor = Math.max(0.85, 1 - (tempVariation / 50)); // Less variation = higher quality
      const good = Math.round(baseProduction * qualityFactor);
      const bad = Math.round(baseProduction * (1 - qualityFactor));
      const total = good + bad;

      const yieldRate = (good / total) * 100;
      const defectRate = (bad / total) * 100;
      const target = 95; // 95% yield target

      // Determine shift
      const hour = startTime.getHours();
      const shift = hour < 6 || hour >= 22 ? 'Night' : hour < 14 ? 'Day' : 'Evening';

      // Period label
      const period = groupBy === 'hour' ?
        startTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }) :
        groupBy === 'shift' ?
        `${shift} ${startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` :
        startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      periods.push({
        period,
        shift,
        good,
        bad,
        total,
        yieldRate: Number(yieldRate.toFixed(2)),
        defectRate: Number(defectRate.toFixed(2)),
        target,
        timestamp: startTime
      });
    }

    return periods.slice(-12); // Keep last 12 periods
  }, [machineTimeSeries.combinedData, groupBy]);

  // Generate defect categories (Pareto analysis)
  const defectCategories = useMemo((): DefectCategory[] => {
    if (yieldData.length === 0) return [];

    const totalDefects = yieldData.reduce((sum, period) => sum + period.bad, 0);
    if (totalDefects === 0) return [];

    // Simulate defect categories based on production data patterns
    const categories = [
      { category: 'Short Shot', count: Math.round(totalDefects * 0.35), description: 'Incomplete filling', severity: 'high' as const },
      { category: 'Flash', count: Math.round(totalDefects * 0.25), description: 'Excess material', severity: 'medium' as const },
      { category: 'Burn Mark', count: Math.round(totalDefects * 0.18), description: 'Discoloration', severity: 'medium' as const },
      { category: 'Warp', count: Math.round(totalDefects * 0.12), description: 'Dimensional distortion', severity: 'high' as const },
      { category: 'Splay', count: Math.round(totalDefects * 0.08), description: 'Surface streaks', severity: 'low' as const },
      { category: 'Other', count: Math.round(totalDefects * 0.02), description: 'Miscellaneous', severity: 'low' as const }
    ];

    // Calculate percentages and cumulative percentages
    let cumulativeCount = 0;
    return categories.map(cat => {
      const percentage = (cat.count / totalDefects) * 100;
      cumulativeCount += cat.count;
      const cumulativePercentage = (cumulativeCount / totalDefects) * 100;

      return {
        ...cat,
        percentage: Number(percentage.toFixed(1)),
        cumulativePercentage: Number(cumulativePercentage.toFixed(1))
      };
    }).filter(cat => cat.count > 0);
  }, [yieldData]);

  // Calculate production summary
  const productionSummary = useMemo((): ProductionSummary => {
    if (yieldData.length === 0) {
      return {
        totalProduced: 0,
        totalGood: 0,
        totalDefects: 0,
        overallYield: 0,
        targetYield: 95,
        trend: 'stable'
      };
    }

    const totalGood = yieldData.reduce((sum, period) => sum + period.good, 0);
    const totalDefects = yieldData.reduce((sum, period) => sum + period.bad, 0);
    const totalProduced = totalGood + totalDefects;
    const overallYield = (totalGood / totalProduced) * 100;

    // Calculate trend (compare last 3 vs previous 3 periods)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (yieldData.length >= 6) {
      const recent = yieldData.slice(-3).reduce((sum, p) => sum + p.yieldRate, 0) / 3;
      const previous = yieldData.slice(-6, -3).reduce((sum, p) => sum + p.yieldRate, 0) / 3;
      trend = recent > previous + 1 ? 'up' : recent < previous - 1 ? 'down' : 'stable';
    }

    return {
      totalProduced,
      totalGood,
      totalDefects,
      overallYield: Number(overallYield.toFixed(2)),
      targetYield: 95,
      trend
    };
  }, [yieldData]);

  const COLORS = {
    good: '#22c55e',
    bad: '#ef4444',
    target: '#94a3b8',
    cumulative: '#f59e0b'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('Rate') ? '%' : ''}`}
            </p>
          ))}
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
          <CardTitle>Yield & Defect Analysis</CardTitle>
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
                <SelectItem value="-4h">4 hours</SelectItem>
                <SelectItem value="-24h">24 hours</SelectItem>
                <SelectItem value="-7d">7 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={(value: 'hour' | 'shift' | 'day') => setGroupBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">By Hour</SelectItem>
                <SelectItem value="shift">By Shift</SelectItem>
                <SelectItem value="day">By Day</SelectItem>
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
        </CardContent>
      </Card>

      {/* Production Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Yield</p>
                <p className="text-2xl font-bold text-green-600">
                  {productionSummary.overallYield.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {productionSummary.targetYield}%
                </p>
              </div>
              <div className="flex items-center">
                {productionSummary.trend === 'up' && <TrendingUp className="h-8 w-8 text-green-600" />}
                {productionSummary.trend === 'down' && <TrendingDown className="h-8 w-8 text-red-600" />}
                {productionSummary.trend === 'stable' && <Target className="h-8 w-8 text-gray-600" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Produced</p>
                <p className="text-2xl font-bold">
                  {productionSummary.totalProduced.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Parts</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Good Parts</p>
                <p className="text-2xl font-bold text-green-600">
                  {productionSummary.totalGood.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((productionSummary.totalGood / productionSummary.totalProduced) * 100).toFixed(1)}%
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
                <p className="text-sm font-medium text-muted-foreground">Defects</p>
                <p className="text-2xl font-bold text-red-600">
                  {productionSummary.totalDefects.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((productionSummary.totalDefects / productionSummary.totalProduced) * 100).toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="yield" className="w-full">
        <TabsList>
          <TabsTrigger value="yield">Yield by Period</TabsTrigger>
          <TabsTrigger value="pareto">Defect Pareto</TabsTrigger>
          <TabsTrigger value="trend">Yield Trend</TabsTrigger>
        </TabsList>

        {/* Yield by Period */}
        <TabsContent value="yield">
          <Card>
            <CardHeader>
              <CardTitle>Yield by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                {yieldData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />

                      <ReferenceLine y={95} stroke={COLORS.target} strokeDasharray="5 5" label="Target 95%" />

                      <Bar dataKey="good" stackId="a" fill={COLORS.good} name="Good Parts" />
                      <Bar dataKey="bad" stackId="a" fill={COLORS.bad} name="Defective Parts" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No production data available</p>
                      <p className="text-sm">Machine needs to be in production mode</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pareto Chart */}
        <TabsContent value="pareto">
          <Card>
            <CardHeader>
              <CardTitle>Defect Categories - Pareto Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                {defectCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={defectCategories} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />

                      <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 2" label="80%" />

                      <Bar yAxisId="left" dataKey="count" fill="#94a3b8" name="Defect Count" />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cumulativePercentage"
                        stroke={COLORS.cumulative}
                        strokeWidth={3}
                        name="Cumulative %"
                        dot={{ fill: COLORS.cumulative, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No defects detected</p>
                      <p className="text-sm">All production within quality standards</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yield Trend */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Yield Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                {yieldData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={yieldData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />

                      <ReferenceLine y={95} stroke={COLORS.target} strokeDasharray="5 5" label="Target" />
                      <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" label="Warning" />

                      <Line
                        type="monotone"
                        dataKey="yieldRate"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Yield Rate %"
                        dot={{ fill: '#3b82f6', r: 4 }}
                        connectNulls={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trend data available</p>
                      <p className="text-sm">Insufficient production history</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}