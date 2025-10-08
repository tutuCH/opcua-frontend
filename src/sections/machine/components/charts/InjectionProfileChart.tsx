import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Area,
  AreaChart
} from 'recharts';
import { Activity, TrendingUp, RefreshCw, Database, Zap } from 'lucide-react';
import { useMachineTimeSeries } from '@/hooks/useTimeSeriesData';
import { TimeSeriesPoint } from '@/services/timeSeriesService';

interface InjectionProfilePoint {
  timeInCycle: number; // 0-100% of cycle
  pressure: number;    // Injection pressure (bar)
  velocity: number;    // Injection velocity (mm/s)
  position: number;    // Screw position (mm)
  phase: string;       // injection, packing, cooling
  temperature: number; // Average barrel temperature
  timestamp: Date;
}

interface InjectionCycle {
  cycleNumber: number;
  startTime: Date;
  duration: number; // seconds
  profile: InjectionProfilePoint[];
  maxPressure: number;
  maxVelocity: number;
  switchoverPoint: number; // % of cycle
  qualityFlag: 'good' | 'warning' | 'defect';
}

export function InjectionProfileChart() {
  const [selectedMachine, setSelectedMachine] = useState<string>('postgres machine 1');
  const [timeRange, setTimeRange] = useState('-1h');
  const [selectedCycle, setSelectedCycle] = useState<number | 'latest'>('latest');
  const [showIdealProfile, setShowIdealProfile] = useState(true);
  const [overlayMultipleCycles, setOverlayMultipleCycles] = useState(false);

  // Use machine time-series data
  const machineTimeSeries = useMachineTimeSeries(selectedMachine, {
    historicalRange: timeRange
  });

  // Convert time-series data to injection cycles
  const injectionCycles = useMemo((): InjectionCycle[] => {
    const rawData = machineTimeSeries.combinedData || [];

    // Filter for production cycles and group by approximate cycle periods
    const productionData = rawData
      .filter((point: TimeSeriesPoint) => point.status === 2) // Production mode
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (productionData.length < 20) return []; // Need enough data points

    const cycles: InjectionCycle[] = [];
    const cycleDuration = 25; // seconds (typical injection molding cycle)

    // Group data points into cycles based on time windows
    for (let i = 0; i < productionData.length - 20; i += 20) {
      const cycleData = productionData.slice(i, i + 20);
      const startTime = cycleData[0].timestamp;

      // Generate injection profile based on real temperature and simulated injection parameters
      const profile: InjectionProfilePoint[] = cycleData.map((point, index) => {
        const timeInCycle = (index / 19) * 100; // 0-100%
        const avgTemp = Object.values(point.temperatures).reduce((sum, temp) => sum + temp, 0) / 7;

        // Simulate injection profile phases
        let pressure = 0;
        let velocity = 0;
        let position = 0;
        let phase = 'injection';

        if (timeInCycle <= 30) {
          // Injection phase (0-30%)
          phase = 'injection';
          pressure = 20 + (timeInCycle / 30) * 80; // Ramp up to 100 bar
          velocity = 150 - (timeInCycle / 30) * 50; // Ramp down from 150 to 100 mm/s
          position = (timeInCycle / 30) * 85; // Screw advances
        } else if (timeInCycle <= 70) {
          // Packing phase (30-70%)
          phase = 'packing';
          const packingProgress = (timeInCycle - 30) / 40;
          pressure = 100 - packingProgress * 30; // Ramp down from 100 to 70 bar
          velocity = 10; // Low velocity during packing
          position = 85 + packingProgress * 10; // Slight additional advance
        } else {
          // Cooling phase (70-100%)
          phase = 'cooling';
          pressure = 10; // Minimal pressure
          velocity = 0; // No movement
          position = 95; // Final position
        }

        // Add temperature-based variation
        const tempVariation = (avgTemp - 220) / 10;
        pressure += tempVariation * 5;
        velocity += tempVariation * 2;

        return {
          timeInCycle: Number(timeInCycle.toFixed(1)),
          pressure: Number(pressure.toFixed(1)),
          velocity: Number(velocity.toFixed(1)),
          position: Number(position.toFixed(1)),
          phase,
          temperature: avgTemp,
          timestamp: point.timestamp
        };
      });

      const maxPressure = Math.max(...profile.map(p => p.pressure));
      const maxVelocity = Math.max(...profile.map(p => p.velocity));
      const switchoverPoint = 30; // Switchover at 30% of cycle

      // Determine quality based on pressure stability
      const pressureVariation = Math.max(...profile.map(p => p.pressure)) - Math.min(...profile.map(p => p.pressure));
      const qualityFlag: 'good' | 'warning' | 'defect' =
        pressureVariation < 15 ? 'good' :
        pressureVariation < 25 ? 'warning' : 'defect';

      cycles.push({
        cycleNumber: cycles.length + 1,
        startTime,
        duration: cycleDuration,
        profile,
        maxPressure,
        maxVelocity,
        switchoverPoint,
        qualityFlag
      });
    }

    return cycles.slice(-10); // Keep last 10 cycles
  }, [machineTimeSeries.combinedData]);

  // Generate ideal injection profile for comparison
  const idealProfile = useMemo((): InjectionProfilePoint[] => {
    const points: InjectionProfilePoint[] = [];

    for (let t = 0; t <= 100; t += 5) {
      let pressure = 0;
      let velocity = 0;
      let position = 0;
      let phase = 'injection';

      if (t <= 30) {
        // Ideal injection phase
        phase = 'injection';
        pressure = 25 + (t / 30) * 75; // Smooth ramp to 100 bar
        velocity = 150 - (t / 30) * 50; // Smooth ramp down
        position = (t / 30) * 85;
      } else if (t <= 70) {
        // Ideal packing phase
        phase = 'packing';
        const packingProgress = (t - 30) / 40;
        pressure = 100 - packingProgress * 25; // Smooth ramp down
        velocity = 15; // Consistent low velocity
        position = 85 + packingProgress * 10;
      } else {
        // Ideal cooling phase
        phase = 'cooling';
        pressure = 15; // Consistent low pressure
        velocity = 0;
        position = 95;
      }

      points.push({
        timeInCycle: t,
        pressure,
        velocity,
        position,
        phase,
        temperature: 220,
        timestamp: new Date()
      });
    }

    return points;
  }, []);

  // Get selected cycle data
  const selectedCycleData = useMemo(() => {
    if (injectionCycles.length === 0) return null;

    if (selectedCycle === 'latest') {
      return injectionCycles[injectionCycles.length - 1];
    }

    return injectionCycles.find(cycle => cycle.cycleNumber === selectedCycle) || null;
  }, [injectionCycles, selectedCycle]);

  // Combine actual and ideal profile data for chart display
  const chartData = useMemo(() => {
    if (!selectedCycleData) return [];

    // Create a combined dataset with both actual and ideal values
    return selectedCycleData.profile.map(point => {
      // Find corresponding ideal point
      const idealPoint = idealProfile.find(ideal => Math.abs(ideal.timeInCycle - point.timeInCycle) < 2.5) ||
                         idealProfile[Math.floor(point.timeInCycle / 5)];

      return {
        ...point,
        idealPressure: idealPoint?.pressure || 0,
        idealVelocity: idealPoint?.velocity || 0
      };
    });
  }, [selectedCycleData, idealProfile]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm">{`Time: ${label}% of cycle`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('Pressure') ? ' bar' :
                                                   entry.name.includes('Velocity') ? ' mm/s' : ''}`}
            </p>
          ))}
          {payload[0]?.payload?.phase && (
            <p className="text-xs text-gray-500 capitalize">
              Phase: {payload[0].payload.phase}
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
          <CardTitle>Injection Profile Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            <Select value={String(selectedCycle)} onValueChange={(value) => {
              setSelectedCycle(value === 'latest' ? 'latest' : parseInt(value));
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Cycle</SelectItem>
                {injectionCycles.map(cycle => (
                  <SelectItem key={cycle.cycleNumber} value={String(cycle.cycleNumber)}>
                    Cycle {cycle.cycleNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant={machineTimeSeries.isConnected ? "default" : "secondary"}
                     className={machineTimeSeries.isConnected ? "bg-green-500" : ""}>
                {machineTimeSeries.isConnected ? "Live" : "Offline"}
              </Badge>
              <Badge variant="outline">
                {injectionCycles.length} cycles
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

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center space-x-2">
              <Switch id="ideal-profile" checked={showIdealProfile} onCheckedChange={setShowIdealProfile} />
              <Label htmlFor="ideal-profile">Show Ideal Profile</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="overlay-cycles" checked={overlayMultipleCycles} onCheckedChange={setOverlayMultipleCycles} />
              <Label htmlFor="overlay-cycles">Overlay Multiple Cycles</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Injection KPIs */}
      {selectedCycleData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max Pressure</p>
                  <p className="text-2xl font-bold">
                    {selectedCycleData.maxPressure.toFixed(1)} bar
                  </p>
                  <p className="text-xs text-muted-foreground">Target: 100 bar</p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max Velocity</p>
                  <p className="text-2xl font-bold">
                    {selectedCycleData.maxVelocity.toFixed(1)} mm/s
                  </p>
                  <p className="text-xs text-muted-foreground">Target: 150 mm/s</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Switchover</p>
                  <p className="text-2xl font-bold">
                    {selectedCycleData.switchoverPoint}%
                  </p>
                  <p className="text-xs text-muted-foreground">Target: 30%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quality</p>
                  <p className={`text-2xl font-bold ${
                    selectedCycleData.qualityFlag === 'good' ? 'text-green-600' :
                    selectedCycleData.qualityFlag === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedCycleData.qualityFlag.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cycle {selectedCycleData.cycleNumber}
                  </p>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  selectedCycleData.qualityFlag === 'good' ? 'bg-green-100' :
                  selectedCycleData.qualityFlag === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <div className={`h-3 w-3 rounded-full ${
                    selectedCycleData.qualityFlag === 'good' ? 'bg-green-600' :
                    selectedCycleData.qualityFlag === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Injection Profile Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            Injection Profile - {selectedCycleData ? `Cycle ${selectedCycleData.cycleNumber}` : 'No Data'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-96 w-full">
            {selectedCycleData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timeInCycle"
                    label={{ value: '% of Cycle', position: 'insideBottom', dy: 10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="pressure"
                    label={{ value: 'Pressure (bar)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="velocity"
                    orientation="right"
                    label={{ value: 'Velocity (mm/s)', angle: -90, position: 'insideRight' }}
                    tick={{ fontSize: 12 }}
                  />

                  {/* Phase markers - using pressure yAxis as reference */}
                  <ReferenceLine x={30} stroke="#94a3b8" strokeDasharray="2 2" label="Switchover" yAxisId="pressure" />
                  <ReferenceLine x={70} stroke="#94a3b8" strokeDasharray="2 2" label="Cooling" yAxisId="pressure" />

                  {/* Ideal profile lines */}
                  {showIdealProfile && (
                    <>
                      <Line
                        yAxisId="pressure"
                        type="monotone"
                        dataKey="idealPressure"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Ideal Pressure"
                        connectNulls={false}
                      />
                      <Line
                        yAxisId="velocity"
                        type="monotone"
                        dataKey="idealVelocity"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Ideal Velocity"
                        connectNulls={false}
                      />
                    </>
                  )}

                  {/* Actual profile lines */}
                  <Line
                    yAxisId="pressure"
                    type="monotone"
                    dataKey="pressure"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                    name="Actual Pressure"
                    connectNulls={false}
                  />
                  <Line
                    yAxisId="velocity"
                    type="monotone"
                    dataKey="velocity"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={false}
                    name="Actual Velocity"
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
                  <p>No injection data available</p>
                  <p className="text-sm">Machine needs to be in production mode with sufficient data</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}