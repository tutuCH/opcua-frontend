"use client"

import * as React from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { DOWNTIME_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { processDowntimeData, calculateParetoData } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend from "../common/ChartLegend"
import ChartTooltip from "../common/ChartTooltip"

/**
 * Downtime analysis chart with Pareto analysis
 * Shows downtime by category with cumulative percentage (80/20 rule)
 */
export default function DowntimeChart({
  data = [],
  timeRange = '7d',
  selectedMachine = 'all',
  height,
  compact = false,
  showPareto = true,
  showCumulative = true,
  sortByDuration = true
}) {
  const processedData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return processDowntimeData(data);
  }, [data, timeRange, selectedMachine]);

  // Calculate Pareto analysis data
  const paretoData = React.useMemo(() => {
    if (!processedData.length) return [];
    
    const analysis = calculateParetoData(processedData);
    
    if (sortByDuration) {
      return analysis.sort((a, b) => b.duration - a.duration);
    }
    
    return analysis;
  }, [processedData, sortByDuration]);

  const chartHeight = height || DOWNTIME_CHART_CONFIG.height;
  const { colors, paretoLine, categories } = DOWNTIME_CHART_CONFIG;

  // Legend items
  const legendItems = React.useMemo(() => {
    const items = [
      {
        dataKey: 'duration',
        label: 'Downtime Duration',
        color: colors.blue,
        type: 'bar',
        unit: 'min'
      },
      {
        dataKey: 'count',
        label: 'Incident Count',
        color: colors.green,
        type: 'bar',
        unit: 'incidents'
      }
    ];

    if (showPareto) {
      items.push({
        dataKey: 'cumulativePercent',
        label: 'Cumulative %',
        color: paretoLine,
        type: 'line',
        unit: '%'
      });
    }

    return items;
  }, [colors, showPareto, paretoLine]);

  // Calculate totals for summary
  const totals = React.useMemo(() => {
    if (!paretoData.length) return null;

    return {
      totalDuration: paretoData.reduce((sum, item) => sum + item.duration, 0),
      totalIncidents: paretoData.reduce((sum, item) => sum + item.count, 0),
      topCategory: paretoData[0]?.category || 'N/A',
      topCategoryPercent: paretoData[0]?.percent || 0
    };
  }, [paretoData]);

  // Find 80% threshold for Pareto analysis
  const pareto80Index = React.useMemo(() => paretoData.findIndex(item => item.cumulativePercent >= 80), [paretoData]);

  return (
    <ChartContainer
      title="Downtime Analysis"
      description="Pareto analysis of downtime events by category and duration"
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
            data={paretoData}
            margin={{
              top: 20,
              right: 60,
              left: 20,
              bottom: 60
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            
            <XAxis 
              dataKey="category"
              tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
              height={80}
            />
            
            {/* Left Y-Axis for duration */}
            <YAxis 
              yAxisId="left"
              orientation="left"
              label={{ 
                value: 'Duration (min)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            
            {/* Right Y-Axis for cumulative percentage */}
            {showPareto && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                label={{ 
                  value: 'Cumulative %', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle' }
                }}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
            )}

            {/* Duration Bars */}
            <Bar 
              yAxisId="left"
              dataKey="duration" 
              fill={colors.blue}
              fillOpacity={0.8}
              radius={[2, 2, 0, 0]}
            />

            {/* Incident Count Bars (smaller, overlaid) */}
            <Bar 
              yAxisId="left"
              dataKey="countScaled" 
              fill={colors.green}
              fillOpacity={0.6}
              radius={[1, 1, 0, 0]}
            />

            {/* Pareto Line */}
            {showPareto && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativePercent"
                stroke={paretoLine}
                strokeWidth={3}
                dot={{ fill: paretoLine, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: paretoLine, strokeWidth: 2 }}
                connectNulls={false}
              />
            )}

            <ChartTooltip
              valueFormatter={(value, entry) => {
                if (entry.dataKey === 'duration') return `${value.toFixed(0)} min`;
                if (entry.dataKey === 'count') return `${value} incidents`;
                if (entry.dataKey === 'cumulativePercent') return `${value.toFixed(1)}%`;
                return value;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary Statistics */}
        {!compact && totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Total Downtime</div>
              <div className="text-xl font-bold text-red-600">
                {Math.round(totals.totalDuration / 60)}h {totals.totalDuration % 60}m
              </div>
              <div className="text-xs text-muted-foreground">
                {totals.totalIncidents} incidents
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Top Category</div>
              <div className="text-lg font-bold text-red-600">{totals.topCategory}</div>
              <div className="text-xs text-muted-foreground">
                {totals.topCategoryPercent.toFixed(1)}% of total
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Avg per Incident</div>
              <div className="text-xl font-bold">
                {(totals.totalDuration / totals.totalIncidents).toFixed(1)}m
              </div>
              <div className="text-xs text-muted-foreground">duration</div>
            </div>
            
            {pareto80Index >= 0 && (
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-xs font-medium text-blue-700">80% Rule</div>
                <div className="text-xl font-bold text-blue-600">
                  {pareto80Index + 1} categories
                </div>
                <div className="text-xs text-blue-600">cause 80% downtime</div>
              </div>
            )}
          </div>
        )}

        {/* Category Breakdown */}
        {!compact && paretoData.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Downtime Categories</div>
            <div className="space-y-1">
              {paretoData.slice(0, 5).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{item.category}</span>
                    {index <= pareto80Index && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        Top 80%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {Math.round(item.duration)}min ({item.percent.toFixed(1)}%)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.count} incidents • {item.cumulativePercent.toFixed(1)}% cumulative
                    </div>
                  </div>
                </div>
              ))}
              
              {paretoData.length > 5 && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  ... and {paretoData.length - 5} more categories
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}