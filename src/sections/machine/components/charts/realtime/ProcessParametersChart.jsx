"use client"

import * as React from "react"
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { PROCESS_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { processParameterData, calculateControlLimits } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend, { generateLegendItems } from "../common/ChartLegend"
import ChartTooltip from "../common/ChartTooltip"

/**
 * Process parameters chart with Statistical Process Control (SPC) overlays
 * Displays cycle time, injection pressure, speed with control limits
 */
export default function ProcessParametersChart({
  data = [],
  timeRange = '1h',
  selectedMachine = 'all',
  selectedParameter = 'all',
  height,
  compact = false,
  showSPCLimits = true,
  showTrendLines = true
}) {
  const processedData = React.useMemo(() => processParameterData(data, { 
      timeRange, 
      selectedMachine, 
      selectedParameter 
    }), [data, timeRange, selectedMachine, selectedParameter]);

  const chartHeight = height || PROCESS_CHART_CONFIG.height;
  const { parameters } = PROCESS_CHART_CONFIG;

  // Calculate control limits for SPC
  const controlLimits = React.useMemo(() => {
    if (!showSPCLimits) return {};
    return calculateControlLimits(processedData, parameters);
  }, [processedData, parameters, showSPCLimits]);

  // Filter parameters based on selection
  const visibleParameters = React.useMemo(() => {
    if (selectedParameter === 'all') return parameters;
    return parameters.filter(param => param.key === selectedParameter);
  }, [parameters, selectedParameter]);

  // Generate legend items
  const legendItems = React.useMemo(() => {
    const items = visibleParameters.map(param => ({
      dataKey: param.key,
      label: param.label,
      color: param.color,
      type: param.type,
      unit: param.label.match(/\((.*?)\)/)?.[1] || ''
    }));

    // Add control limit lines to legend if enabled
    if (showSPCLimits) {
      items.push(
        {
          dataKey: 'ucl',
          label: 'Upper Control Limit',
          color: CHART_COLORS.status.error,
          type: 'line',
          dashed: true
        },
        {
          dataKey: 'lcl',
          label: 'Lower Control Limit', 
          color: CHART_COLORS.status.error,
          type: 'line',
          dashed: true
        }
      );
    }

    return items;
  }, [visibleParameters, showSPCLimits]);

  return (
    <ChartContainer
      title="Process Parameters"
      description="Statistical process control monitoring with SPC overlays"
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
        <ResponsiveContainer width="100%" height={chartHeight - (compact ? 80 : 120)}>
          <ComposedChart
            data={processedData}
            margin={{
              top: 20,
              right: 60,
              left: 60,
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
            
            {/* Left Y-Axis for cycle time and injection speed */}
            <YAxis 
              yAxisId="left"
              orientation="left"
              label={{ 
                value: 'Time (s) / Speed', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            
            {/* Right Y-Axis for pressure */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ 
                value: 'Pressure (bar)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />

            {/* SPC Control Limits */}
            {showSPCLimits && Object.entries(controlLimits).map(([paramKey, limits]) => (
              <React.Fragment key={paramKey}>
                {limits.ucl && (
                  <ReferenceLine
                    yAxisId={visibleParameters.find(p => p.key === paramKey)?.yAxisId || 'left'}
                    y={limits.ucl}
                    stroke={CHART_COLORS.status.error}
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                )}
                {limits.lcl && (
                  <ReferenceLine
                    yAxisId={visibleParameters.find(p => p.key === paramKey)?.yAxisId || 'left'}
                    y={limits.lcl}
                    stroke={CHART_COLORS.status.error}
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                )}
                {limits.mean && (
                  <ReferenceLine
                    yAxisId={visibleParameters.find(p => p.key === paramKey)?.yAxisId || 'left'}
                    y={limits.mean}
                    stroke={CHART_COLORS.primary.orange}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Parameter Lines/Areas */}
            {visibleParameters.map(param => (
              param.type === 'area' ? (
                <Area
                  key={param.key}
                  yAxisId={param.yAxisId}
                  type="monotone"
                  dataKey={param.key}
                  stroke={param.color}
                  fill={param.color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ) : (
                <Line
                  key={param.key}
                  yAxisId={param.yAxisId}
                  type="monotone"
                  dataKey={param.key}
                  stroke={param.color}
                  strokeWidth={2}
                  dot={{ fill: param.color, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: param.color, strokeWidth: 2 }}
                  connectNulls={false}
                />
              )
            ))}

            <ChartTooltip
              valueFormatter={(value, entry) => {
                const param = visibleParameters.find(p => p.key === entry.dataKey);
                const unit = param?.label.match(/\((.*?)\)/)?.[1] || '';
                return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* SPC Status Summary */}
        {!compact && showSPCLimits && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            {visibleParameters.map(param => {
              const limits = controlLimits[param.key];
              const current = processedData.length > 0 ? 
                processedData[processedData.length - 1][param.key] : 0;
              
              let status = 'good';
              if (limits?.ucl && current > limits.ucl) status = 'error';
              else if (limits?.lcl && current < limits.lcl) status = 'error';
              else if (limits?.uwl && current > limits.uwl) status = 'warning';
              else if (limits?.lwl && current < limits.lwl) status = 'warning';

              return (
                <div key={param.key} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <div className="text-sm font-medium">{param.label}</div>
                    <div className="text-xs text-muted-foreground">SPC Status</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono">
                      {current.toFixed(2)}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'good' ? 'bg-green-500' :
                      status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChartContainer>
  );
}