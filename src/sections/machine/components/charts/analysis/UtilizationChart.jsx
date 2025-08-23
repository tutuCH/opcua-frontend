"use client"

import * as React from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { UTILIZATION_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { processUtilizationData, calculateUtilizationMetrics, filterDataByTimeRange, filterDataByMachine } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend from "../common/ChartLegend"
import { EfficiencyTooltip } from "../common/ChartTooltip"

/**
 * Equipment utilization chart with comparison metrics
 * Shows utilization trends, targets, and comparative analysis
 */
export default function UtilizationChart({
  data = [],
  timeRange = '24h',
  selectedMachine = 'all',
  height,
  compact = false,
  showTargets = true,
  showComparison = true,
  comparisonPeriod = 'previous', // 'previous' | 'average' | 'target'
  aggregation = 'hourly'
}) {
  const processedData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // First filter data by machine and time range
    let filteredData = filterDataByMachine(data, selectedMachine);
    filteredData = filterDataByTimeRange(filteredData, timeRange);
    
    // Process the filtered data for utilization metrics
    const utilization = processUtilizationData(filteredData);
    
    // Calculate utilization metrics for the entire dataset
    const utilizationMetrics = calculateUtilizationMetrics(filteredData, timeRange);
    
    // Add utilization metrics to each data point for visualization
    return utilization.map(item => ({
      ...item,
      ...utilizationMetrics
    }));
  }, [data, timeRange, selectedMachine, aggregation]);

  const chartHeight = height || UTILIZATION_CHART_CONFIG.height;
  const { colors, targets } = UTILIZATION_CHART_CONFIG;

  // Calculate comparison data based on comparison period
  const comparisonData = React.useMemo(() => {
    if (!showComparison || !processedData.length) return [];

    switch (comparisonPeriod) {
      case 'previous':
        // Compare with previous period (shift data by time range)
        return processedData.map(item => ({
          ...item,
          previousUtilization: item.utilization * (0.85 + Math.random() * 0.3), // Mock previous data
          previousAvailability: item.availability * (0.9 + Math.random() * 0.2)
        }));
        
      case 'average':
        const avgUtilization = processedData.reduce((sum, item) => sum + item.utilization, 0) / processedData.length;
        const avgAvailability = processedData.reduce((sum, item) => sum + item.availability, 0) / processedData.length;
        return processedData.map(item => ({
          ...item,
          averageUtilization: avgUtilization,
          averageAvailability: avgAvailability
        }));
        
      case 'target':
        return processedData.map(item => ({
          ...item,
          targetUtilization: targets.utilization,
          targetAvailability: targets.availability
        }));
        
      default:
        return processedData;
    }
  }, [processedData, showComparison, comparisonPeriod, targets]);

  // Legend items
  const legendItems = React.useMemo(() => {
    const items = [
      {
        dataKey: 'utilization',
        label: 'Equipment Utilization',
        color: colors.utilization,
        type: 'bar',
        unit: '%'
      },
      {
        dataKey: 'availability',
        label: 'Availability',
        color: colors.background,
        type: 'line',
        unit: '%',
        showMarker: true
      }
    ];

    if (showComparison) {
      switch (comparisonPeriod) {
        case 'previous':
          items.push({
            dataKey: 'previousUtilization',
            label: 'Previous Period',
            color: CHART_COLORS.primary.purple,
            type: 'line',
            dashed: true
          });
          break;
        case 'average':
          items.push({
            dataKey: 'averageUtilization',
            label: 'Period Average',
            color: CHART_COLORS.primary.orange,
            type: 'line',
            dashed: true
          });
          break;
        case 'target':
          items.push({
            dataKey: 'targetUtilization',
            label: 'Target Utilization',
            color: colors.target,
            type: 'line',
            dashed: true
          });
          break;
      }
    }

    return items;
  }, [colors, showComparison, comparisonPeriod, targets]);

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    if (!comparisonData.length) return null;

    const current = {
      utilization: comparisonData.reduce((sum, item) => sum + item.utilization, 0) / comparisonData.length,
      availability: comparisonData.reduce((sum, item) => sum + item.availability, 0) / comparisonData.length
    };

    let comparison = null;
    if (showComparison) {
      const compKey = comparisonPeriod === 'previous' ? 'previousUtilization' :
                     comparisonPeriod === 'average' ? 'averageUtilization' : 'targetUtilization';
      
      const compValue = comparisonData.reduce((sum, item) => sum + (item[compKey] || 0), 0) / comparisonData.length;
      comparison = {
        value: compValue,
        change: current.utilization - compValue,
        changePercent: ((current.utilization - compValue) / compValue) * 100
      };
    }

    return { current, comparison };
  }, [comparisonData, showComparison, comparisonPeriod]);

  return (
    <ChartContainer
      title="Equipment Utilization"
      description="Utilization trends with target comparisons and availability metrics"
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
          <ComposedChart
            data={comparisonData}
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
                value: 'Utilization (%)', 
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
                  y={targets.utilization} 
                  stroke={colors.target}
                  strokeDasharray="5 5"
                  label={{ value: `Target (${targets.utilization}%)`, position: "right" }}
                />
                <ReferenceLine 
                  y={targets.availability} 
                  stroke={CHART_COLORS.primary.teal}
                  strokeDasharray="3 3"
                  label={{ value: `Availability Target (${targets.availability}%)`, position: "right" }}
                />
              </>
            )}

            {/* Utilization Bars */}
            <Bar 
              dataKey="utilization" 
              fill={colors.utilization}
              fillOpacity={0.8}
              radius={[2, 2, 0, 0]}
            />

            {/* Availability Line */}
            <Line
              type="monotone"
              dataKey="availability"
              stroke={colors.background}
              strokeWidth={2}
              dot={{ fill: colors.background, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: colors.background, strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Comparison Lines */}
            {showComparison && comparisonPeriod === 'previous' && (
              <Line
                type="monotone"
                dataKey="previousUtilization"
                stroke={CHART_COLORS.primary.purple}
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                connectNulls={false}
              />
            )}

            {showComparison && comparisonPeriod === 'average' && (
              <Line
                type="monotone"
                dataKey="averageUtilization"
                stroke={CHART_COLORS.primary.orange}
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                connectNulls={false}
              />
            )}

            {showComparison && comparisonPeriod === 'target' && (
              <Line
                type="monotone"
                dataKey="targetUtilization"
                stroke={colors.target}
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                connectNulls={false}
              />
            )}

            <EfficiencyTooltip />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary Statistics */}
        {!compact && summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Current Utilization</div>
              <div className="text-2xl font-bold" style={{ color: colors.utilization }}>
                {summary.current.utilization.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                vs Target: {targets.utilization}%
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-xs font-medium text-muted-foreground">Availability</div>
              <div className="text-2xl font-bold" style={{ color: colors.background }}>
                {summary.current.availability.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                vs Target: {targets.availability}%
              </div>
            </div>
            
            {summary.comparison && (
              <>
                <div className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-xs font-medium text-muted-foreground">
                    {comparisonPeriod.charAt(0).toUpperCase() + comparisonPeriod.slice(1)}
                  </div>
                  <div className="text-2xl font-bold">
                    {summary.comparison.value.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">comparison</div>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-xs font-medium text-muted-foreground">Change</div>
                  <div className={`text-2xl font-bold ${
                    summary.comparison.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {summary.comparison.change >= 0 ? '+' : ''}
                    {summary.comparison.change.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({summary.comparison.changePercent.toFixed(1)}%)
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Performance Indicators */}
        {!compact && summary && (
          <div className="flex justify-center space-x-6 p-3 bg-muted/20 rounded">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                summary.current.utilization >= targets.utilization ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm">
                Utilization {summary.current.utilization >= targets.utilization ? 'On Target' : 'Below Target'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                summary.current.availability >= targets.availability ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm">
                Availability {summary.current.availability >= targets.availability ? 'On Target' : 'Below Target'}
              </span>
            </div>
            
            {summary.comparison && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  summary.comparison.change >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm">
                  {summary.comparison.change >= 0 ? 'Improving' : 'Declining'} Trend
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </ChartContainer>
  );
}