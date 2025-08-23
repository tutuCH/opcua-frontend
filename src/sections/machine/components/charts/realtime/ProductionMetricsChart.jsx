"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { OEE_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { calculateOEEMetrics, processProductionData, filterDataByTimeRange, filterDataByMachine } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend from "../common/ChartLegend"
import { EfficiencyTooltip } from "../common/ChartTooltip"

/**
 * Production metrics chart with efficiency calculations
 * Displays OEE, availability, performance, and quality metrics
 */
export default function ProductionMetricsChart({
  data = [],
  timeRange = '1h', 
  selectedMachine = 'all',
  height,
  compact = false,
  showTargets = true,
  aggregation = 'hourly' // 'hourly' | 'daily' | 'shift'
}) {
  const processedData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // First filter data by machine and time range
    let filteredData = filterDataByMachine(data, selectedMachine);
    filteredData = filterDataByTimeRange(filteredData, timeRange);
    
    // Process the filtered data for production metrics
    const production = processProductionData(filteredData);
    
    // Calculate OEE metrics for the entire dataset
    const oeeMetrics = calculateOEEMetrics(filteredData, timeRange);
    
    // Add OEE metrics to each data point for visualization
    return production.map(item => ({
      ...item,
      ...oeeMetrics
    }));
  }, [data, timeRange, selectedMachine, aggregation]);

  const chartHeight = height || OEE_CHART_CONFIG.height;
  const { colors, thresholds } = OEE_CHART_CONFIG;

  // Legend items for OEE metrics
  const legendItems = [
    {
      dataKey: 'oee',
      label: 'Overall Equipment Effectiveness',
      color: colors.oee,
      type: 'bar',
      unit: '%'
    },
    {
      dataKey: 'availability',
      label: 'Availability',
      color: colors.availability,
      type: 'bar',
      unit: '%'
    },
    {
      dataKey: 'performance',
      label: 'Performance', 
      color: colors.performance,
      type: 'bar',
      unit: '%'
    },
    {
      dataKey: 'quality',
      label: 'Quality',
      color: colors.quality,
      type: 'bar',
      unit: '%'
    }
  ];

  // Calculate averages for summary
  const averages = React.useMemo(() => {
    if (!processedData.length) return {};
    
    const sums = processedData.reduce((acc, item) => ({
      oee: acc.oee + (item.oee || 0),
      availability: acc.availability + (item.availability || 0),
      performance: acc.performance + (item.performance || 0),
      quality: acc.quality + (item.quality || 0)
    }), { oee: 0, availability: 0, performance: 0, quality: 0 });

    return Object.entries(sums).reduce((acc, [key, sum]) => {
      acc[key] = sum / processedData.length;
      return acc;
    }, {});
  }, [processedData]);

  return (
    <ChartContainer
      title="Production Metrics"
      description="OEE analysis with availability, performance, and quality breakdown"
      height={chartHeight}
      loading={!processedData.length && data.length === 0}
      compact={compact}
    >
      <div className="space-y-4">
        {/* Legend */}
        <ChartLegend
          items={legendItems}
          orientation="horizontal"
          position="top"
          compact={compact}
        />

        {/* Chart */}
        <ResponsiveContainer width="100%" height={chartHeight - (compact ? 100 : 160)}>
          <BarChart
            data={processedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            
            <XAxis 
              dataKey="formattedTime"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            
            <YAxis 
              domain={[0, 100]}
              label={{ 
                value: 'Efficiency (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />

            {/* Target reference lines */}
            {showTargets && (
              <>
                <ReferenceLine 
                  y={thresholds.excellent} 
                  stroke={CHART_COLORS.quality.excellent}
                  strokeDasharray="5 5"
                  label={{ value: "Excellent", position: "right" }}
                />
                <ReferenceLine 
                  y={thresholds.good} 
                  stroke={CHART_COLORS.quality.good}
                  strokeDasharray="5 5"
                  label={{ value: "Good", position: "right" }}
                />
                <ReferenceLine 
                  y={thresholds.acceptable} 
                  stroke={CHART_COLORS.quality.acceptable}
                  strokeDasharray="5 5"
                  label={{ value: "Acceptable", position: "right" }}
                />
              </>
            )}

            {/* OEE Metrics Bars */}
            <Bar dataKey="oee" fill={colors.oee} radius={[2, 2, 0, 0]} />
            <Bar dataKey="availability" fill={colors.availability} radius={[2, 2, 0, 0]} />
            <Bar dataKey="performance" fill={colors.performance} radius={[2, 2, 0, 0]} />
            <Bar dataKey="quality" fill={colors.quality} radius={[2, 2, 0, 0]} />

            <EfficiencyTooltip />
          </BarChart>
        </ResponsiveContainer>

        {/* Metrics Summary */}
        {!compact && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            {Object.entries(averages).map(([metric, value]) => {
              const config = legendItems.find(item => item.dataKey === metric);
              const status = value >= thresholds.excellent ? 'excellent' :
                           value >= thresholds.good ? 'good' :
                           value >= thresholds.acceptable ? 'acceptable' : 'poor';
              
              return (
                <div key={metric} className="flex flex-col items-center p-3 bg-muted/50 rounded">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {config?.label || metric}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold" style={{ color: config?.color }}>
                      {value.toFixed(1)}%
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'excellent' ? 'bg-emerald-500' :
                      status === 'good' ? 'bg-green-500' :
                      status === 'acceptable' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-1">
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Period Summary */}
        {!compact && processedData.length > 0 && (
          <div className="flex justify-between items-center p-3 bg-primary/5 rounded text-sm">
            <span className="text-muted-foreground">
              {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)} Summary
            </span>
            <span className="font-medium">
              {processedData.length} data points • Last updated: {
                new Date(processedData[processedData.length - 1]?.timestamp || Date.now())
                  .toLocaleTimeString()
              }
            </span>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}