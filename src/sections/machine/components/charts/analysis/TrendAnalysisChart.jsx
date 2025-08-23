"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { TREND_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { processTrendData, calculateControlLimits, calculateMovingAverage } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend from "../common/ChartLegend"
import ChartTooltip from "../common/ChartTooltip"

/**
 * Trend analysis chart with statistical control limits
 * Shows data trends, moving averages, and 3-sigma control limits
 */
export default function TrendAnalysisChart({
  data = [],
  parameter = 'cycleTime',
  timeRange = '24h',
  selectedMachine = 'all',
  height,
  compact = false,
  showControlLimits = true,
  showMovingAverage = true,
  movingAverageWindow = 20,
  showTrendLine = true
}) {
  const processedData = React.useMemo(() => {
    const trendData = processTrendData(data, { 
      parameter, 
      timeRange, 
      selectedMachine 
    });

    // Add moving average if enabled
    if (showMovingAverage && trendData.length > 0) {
      return calculateMovingAverage(trendData, parameter, movingAverageWindow);
    }

    return trendData;
  }, [data, parameter, timeRange, selectedMachine, showMovingAverage, movingAverageWindow]);

  const chartHeight = height || TREND_CHART_CONFIG.height;
  const { colors, controlLimits: controlConfig } = TREND_CHART_CONFIG;

  // Calculate statistical control limits
  const controlLimits = React.useMemo(() => {
    if (!showControlLimits || !processedData.length) return null;
    
    const values = processedData.map(item => item[parameter]).filter(v => v !== null && v !== undefined);
    if (values.length < 10) return null; // Need minimum data points
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + (val - mean)**2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean,
      ucl: mean + (controlConfig.sigma * stdDev), // Upper Control Limit
      lcl: mean - (controlConfig.sigma * stdDev), // Lower Control Limit
      uwl: mean + (2 * stdDev), // Upper Warning Limit
      lwl: mean - (2 * stdDev)  // Lower Warning Limit
    };
  }, [processedData, parameter, showControlLimits, controlConfig.sigma]);

  // Legend items
  const legendItems = React.useMemo(() => {
    const items = [
      {
        dataKey: parameter,
        label: `${parameter} Data`,
        color: colors.data,
        type: 'line',
        showMarker: true
      }
    ];

    if (showMovingAverage) {
      items.push({
        dataKey: `${parameter}_ma`,
        label: `Moving Average (${movingAverageWindow})`,
        color: colors.trend,
        type: 'line',
        dashed: false
      });
    }

    if (showControlLimits && controlLimits) {
      items.push(
        {
          dataKey: 'ucl',
          label: 'Upper Control Limit',
          color: colors.upperLimit,
          type: 'line',
          dashed: true
        },
        {
          dataKey: 'lcl',
          label: 'Lower Control Limit',
          color: colors.lowerLimit,
          type: 'line',
          dashed: true
        },
        {
          dataKey: 'mean',
          label: 'Process Mean',
          color: colors.mean,
          type: 'line',
          dashed: true
        }
      );
    }

    return items;
  }, [parameter, colors, showMovingAverage, movingAverageWindow, showControlLimits, controlLimits]);

  // Calculate process capability if we have control limits
  const processCapability = React.useMemo(() => {
    if (!controlLimits || !processedData.length) return null;
    
    const values = processedData.map(item => item[parameter]).filter(v => v !== null && v !== undefined);
    const inControl = values.filter(v => v >= controlLimits.lcl && v <= controlLimits.ucl).length;
    const outOfControl = values.length - inControl;
    
    return {
      total: values.length,
      inControl,
      outOfControl,
      percentage: (inControl / values.length) * 100
    };
  }, [controlLimits, processedData, parameter]);

  return (
    <ChartContainer
      title="Trend Analysis"
      description={`Statistical trend analysis for ${parameter} with control limits`}
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
        <ResponsiveContainer width="100%" height={chartHeight - (compact ? 120 : 180)}>
          <LineChart
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
              label={{ 
                value: 'Value', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />

            {/* Control Limit Lines */}
            {showControlLimits && controlLimits && (
              <>
                <ReferenceLine 
                  y={controlLimits.ucl} 
                  stroke={colors.upperLimit}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <ReferenceLine 
                  y={controlLimits.lcl} 
                  stroke={colors.lowerLimit}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <ReferenceLine 
                  y={controlLimits.uwl} 
                  stroke={CHART_COLORS.status.warning}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <ReferenceLine 
                  y={controlLimits.lwl} 
                  stroke={CHART_COLORS.status.warning}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <ReferenceLine 
                  y={controlLimits.mean} 
                  stroke={colors.mean}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              </>
            )}

            {/* Data Line */}
            <Line
              type="monotone"
              dataKey={parameter}
              stroke={colors.data}
              strokeWidth={2}
              dot={{ fill: colors.data, strokeWidth: 0, r: 2 }}
              activeDot={{ r: 4, stroke: colors.data, strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Moving Average Line */}
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey={`${parameter}_ma`}
                stroke={colors.trend}
                strokeWidth={3}
                dot={false}
                connectNulls={false}
              />
            )}

            <ChartTooltip
              valueFormatter={(value, entry) => {
                if (entry.dataKey.includes('_ma')) {
                  return `${value.toFixed(3)} (MA)`;
                }
                return value.toFixed(3);
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Process Capability Statistics */}
        {!compact && processCapability && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Total Points</div>
              <div className="text-xl font-bold">{processCapability.total}</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-xs font-medium text-green-700">In Control</div>
              <div className="text-xl font-bold text-green-600">{processCapability.inControl}</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-xs font-medium text-red-700">Out of Control</div>
              <div className="text-xl font-bold text-red-600">{processCapability.outOfControl}</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-xs font-medium text-blue-700">Control %</div>
              <div className="text-xl font-bold text-blue-600">
                {processCapability.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Control Limits Info */}
        {!compact && controlLimits && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
            <div className="flex justify-between">
              <span>Mean: {controlLimits.mean.toFixed(3)}</span>
              <span>UCL: {controlLimits.ucl.toFixed(3)}</span>
              <span>LCL: {controlLimits.lcl.toFixed(3)}</span>
              <span>σ: {((controlLimits.ucl - controlLimits.mean) / 3).toFixed(3)}</span>
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}