"use client"

import * as React from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { OEE_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { calculateOEEMetrics, processOEEData } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend from "../common/ChartLegend"
import { EfficiencyTooltip } from "../common/ChartTooltip"

/**
 * Overall Equipment Effectiveness (OEE) chart with breakdown metrics
 * Shows OEE components: Availability × Performance × Quality
 */
export default function OEEChart({
  data = [],
  timeRange = '24h',
  selectedMachine = 'all',
  height,
  compact = false,
  showBreakdown = true,
  showTargets = true,
  aggregation = 'hourly' // 'hourly' | 'shift' | 'daily'
}) {
  const processedData = React.useMemo(() => {
    const oeeData = processOEEData(data, {
      timeRange,
      selectedMachine,
      aggregation
    });
    
    return oeeData.map(item => ({
      ...item,
      ...calculateOEEMetrics(item)
    }));
  }, [data, timeRange, selectedMachine, aggregation]);

  const chartHeight = height || OEE_CHART_CONFIG.height;
  const { colors, thresholds } = OEE_CHART_CONFIG;

  // Legend items for OEE components
  const legendItems = React.useMemo(() => {
    const items = [
      {
        dataKey: 'oee',
        label: 'OEE (Overall)',
        color: colors.oee,
        type: 'line',
        unit: '%',
        showMarker: true
      }
    ];

    if (showBreakdown) {
      items.push(
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
      );
    }

    return items;
  }, [colors, showBreakdown]);

  // Calculate period averages
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

  // Calculate trend direction
  const trends = React.useMemo(() => {
    if (processedData.length < 2) return {};
    
    const getSlope = (key) => {
      const values = processedData.map(item => item[key] || 0);
      const n = values.length;
      const xSum = (n * (n - 1)) / 2;
      const ySum = values.reduce((sum, val) => sum + val, 0);
      const xySum = values.reduce((sum, val, i) => sum + (val * i), 0);
      const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;
      
      return (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    };

    return {
      oee: getSlope('oee'),
      availability: getSlope('availability'),
      performance: getSlope('performance'),
      quality: getSlope('quality')
    };
  }, [processedData]);

  return (
    <ChartContainer
      title="OEE Analysis"
      description="Overall Equipment Effectiveness with component breakdown"
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
        <ResponsiveContainer width="100%" height={chartHeight - (compact ? 100 : 180)}>
          <ComposedChart
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
                  label={{ value: "Excellent (85%)", position: "right" }}
                />
                <ReferenceLine 
                  y={thresholds.good} 
                  stroke={CHART_COLORS.quality.good}
                  strokeDasharray="5 5"
                  label={{ value: "Good (70%)", position: "right" }}
                />
                <ReferenceLine 
                  y={thresholds.acceptable} 
                  stroke={CHART_COLORS.quality.acceptable}
                  strokeDasharray="5 5"
                  label={{ value: "Acceptable (50%)", position: "right" }}
                />
              </>
            )}

            {/* Component Bars */}
            {showBreakdown && (
              <>
                <Bar 
                  dataKey="availability" 
                  fill={colors.availability}
                  fillOpacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="performance" 
                  fill={colors.performance}
                  fillOpacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="quality" 
                  fill={colors.quality}
                  fillOpacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
              </>
            )}

            {/* OEE Line */}
            <Line
              type="monotone"
              dataKey="oee"
              stroke={colors.oee}
              strokeWidth={3}
              dot={{ fill: colors.oee, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: colors.oee, strokeWidth: 2 }}
              connectNulls={false}
            />

            <EfficiencyTooltip />
          </ComposedChart>
        </ResponsiveContainer>

        {/* OEE Summary Cards */}
        {!compact && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            {Object.entries(averages).map(([metric, value]) => {
              const trend = trends[metric] || 0;
              const trendIcon = trend > 0.1 ? '📈' : trend < -0.1 ? '📉' : '📊';
              const status = value >= thresholds.excellent ? 'excellent' :
                           value >= thresholds.good ? 'good' :
                           value >= thresholds.acceptable ? 'acceptable' : 'poor';
              
              const metricConfig = legendItems.find(item => item.dataKey === metric);
              
              return (
                <div key={metric} className="text-center p-4 bg-muted/50 rounded">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {metricConfig?.label.split(' ')[0] || metric}
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <span className="text-2xl font-bold" style={{ color: metricConfig?.color }}>
                      {value.toFixed(1)}%
                    </span>
                    <span className="text-lg">{trendIcon}</span>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-1">
                    {status}
                  </div>
                  {Math.abs(trend) > 0.1 && (
                    <div className="text-xs text-muted-foreground">
                      {trend > 0 ? '+' : ''}{trend.toFixed(2)}%/period
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* OEE Calculation Formula */}
        {!compact && averages.oee && (
          <div className="text-center p-3 bg-primary/5 rounded">
            <div className="text-sm font-medium mb-2">OEE Calculation</div>
            <div className="font-mono text-sm">
              {averages.availability.toFixed(1)}% × {averages.performance.toFixed(1)}% × {averages.quality.toFixed(1)}% = {averages.oee.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Availability × Performance × Quality = OEE
            </div>
          </div>
        )}

        {/* Loss Analysis */}
        {!compact && averages.oee && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-red-50 rounded text-center">
              <div className="font-medium text-red-700">Availability Loss</div>
              <div className="text-red-600">{(100 - averages.availability).toFixed(1)}%</div>
            </div>
            <div className="p-2 bg-orange-50 rounded text-center">
              <div className="font-medium text-orange-700">Performance Loss</div>
              <div className="text-orange-600">{(100 - averages.performance).toFixed(1)}%</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded text-center">
              <div className="font-medium text-yellow-700">Quality Loss</div>
              <div className="text-yellow-600">{(100 - averages.quality).toFixed(1)}%</div>
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}