"use client"

import * as React from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line } from "recharts"
import { CORRELATION_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { processCorrelationData, calculateLinearRegression } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend from "../common/ChartLegend"
import { CorrelationTooltip } from "../common/ChartTooltip"

/**
 * Correlation chart for analyzing relationships between variables
 * Shows scatter plot with optional regression line and correlation coefficient
 */
export default function CorrelationChart({
  data = [],
  xParameter = 'cycleTime',
  yParameter = 'injectionPressure', 
  timeRange = '24h',
  selectedMachine = 'all',
  height,
  compact = false,
  showRegression = true,
  showConfidence = false,
  colorByEfficiency = false
}) {
  const processedData = React.useMemo(() => processCorrelationData(data, {
      xParameter,
      yParameter,
      timeRange,
      selectedMachine,
      colorByEfficiency
    }), [data, xParameter, yParameter, timeRange, selectedMachine, colorByEfficiency]);

  const chartHeight = height || CORRELATION_CHART_CONFIG.height;
  const { colors, pointSize } = CORRELATION_CHART_CONFIG;

  // Calculate regression line if enabled
  const regression = React.useMemo(() => {
    if (!showRegression || processedData.length < 5) return null;
    
    return calculateLinearRegression(
      processedData.map(d => d.x),
      processedData.map(d => d.y)
    );
  }, [processedData, showRegression]);

  // Generate regression line data points
  const regressionLineData = React.useMemo(() => {
    if (!regression || !processedData.length) return [];
    
    const xValues = processedData.map(d => d.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    
    return [
      { x: minX, y: regression.slope * minX + regression.intercept },
      { x: maxX, y: regression.slope * maxX + regression.intercept }
    ];
  }, [regression, processedData]);

  // Legend items
  const legendItems = React.useMemo(() => {
    const items = [
      {
        dataKey: 'points',
        label: 'Data Points',
        color: colors.points,
        type: 'scatter'
      }
    ];

    if (showRegression && regression) {
      items.push({
        dataKey: 'regression',
        label: `Regression Line (R² = ${regression.rSquared.toFixed(3)})`,
        color: colors.regression,
        type: 'line'
      });
    }

    return items;
  }, [colors, showRegression, regression]);

  // Calculate correlation statistics
  const stats = React.useMemo(() => {
    if (processedData.length < 2) return null;
    
    const xValues = processedData.map(d => d.x);
    const yValues = processedData.map(d => d.y);
    
    const xMean = xValues.reduce((sum, val) => sum + val, 0) / xValues.length;
    const yMean = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
    
    const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
    const xDenominator = Math.sqrt(xValues.reduce((sum, x) => sum + (x - xMean)**2, 0));
    const yDenominator = Math.sqrt(yValues.reduce((sum, y) => sum + (y - yMean)**2, 0));
    
    const correlation = numerator / (xDenominator * yDenominator);
    
    return {
      correlation,
      strength: Math.abs(correlation) > 0.8 ? 'Strong' :
                Math.abs(correlation) > 0.5 ? 'Moderate' :
                Math.abs(correlation) > 0.3 ? 'Weak' : 'Very Weak',
      direction: correlation > 0 ? 'Positive' : 'Negative',
      xMean,
      yMean,
      count: processedData.length
    };
  }, [processedData]);

  return (
    <ChartContainer
      title="Correlation Analysis"
      description={`Relationship between ${xParameter} and ${yParameter}`}
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
          <ScatterChart
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
              dataKey="x"
              type="number"
              name={xParameter}
              label={{ 
                value: xParameter, 
                position: 'insideBottom',
                offset: -10 
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            
            <YAxis 
              dataKey="y"
              type="number"
              name={yParameter}
              label={{ 
                value: yParameter, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />

            {/* Mean reference lines */}
            {stats && (
              <>
                <ReferenceLine 
                  x={stats.xMean} 
                  stroke={CHART_COLORS.primary.orange}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <ReferenceLine 
                  y={stats.yMean} 
                  stroke={CHART_COLORS.primary.orange}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              </>
            )}

            {/* Data Points */}
            <Scatter
              dataKey="y"
              fill={colorByEfficiency ? undefined : colors.points}
              stroke={colorByEfficiency ? undefined : colors.points}
              strokeWidth={1}
            >
              {colorByEfficiency && processedData.map((entry, index) => {
                const efficiency = entry.efficiency || 0;
                const color = efficiency > 80 ? CHART_COLORS.quality.excellent :
                             efficiency > 60 ? CHART_COLORS.quality.good :
                             efficiency > 40 ? CHART_COLORS.quality.acceptable : 
                             CHART_COLORS.quality.poor;
                
                return (
                  <Scatter 
                    key={index} 
                    cx={entry.x} 
                    cy={entry.y} 
                    fill={color}
                    stroke={color}
                    r={pointSize}
                  />
                );
              })}
            </Scatter>

            <CorrelationTooltip />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Regression Line Overlay (custom implementation since Recharts doesn't support it directly) */}
        {showRegression && regression && regressionLineData.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <ResponsiveContainer width="100%" height={chartHeight - (compact ? 100 : 160)}>
              <LineChart data={regressionLineData}>
                <Line
                  type="linear"
                  dataKey="y"
                  stroke={colors.regression}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Statistics Summary */}
        {!compact && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Correlation</div>
              <div className="text-xl font-bold">{stats.correlation.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">{stats.direction}</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Strength</div>
              <div className="text-lg font-bold">{stats.strength}</div>
              <div className="text-xs text-muted-foreground">
                {Math.abs(stats.correlation) > 0.5 ? '📈' : '📊'}
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Data Points</div>
              <div className="text-xl font-bold">{stats.count}</div>
              <div className="text-xs text-muted-foreground">samples</div>
            </div>
            
            {regression && (
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-xs font-medium text-muted-foreground">R-Squared</div>
                <div className="text-xl font-bold">{regression.rSquared.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">fit quality</div>
              </div>
            )}
          </div>
        )}

        {/* Regression Equation */}
        {!compact && regression && (
          <div className="text-center p-2 bg-primary/5 rounded text-sm">
            <span className="font-mono">
              y = {regression.slope.toFixed(4)}x + {regression.intercept.toFixed(4)}
            </span>
            <span className="text-muted-foreground ml-2">
              (R² = {regression.rSquared.toFixed(4)})
            </span>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}