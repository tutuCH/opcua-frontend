"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { TEMPERATURE_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { processTemperatureData } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend, { generateLegendItems } from "../common/ChartLegend"
import { TemperatureTooltip } from "../common/ChartTooltip"

/**
 * Real-time temperature zone chart for injection molding machines
 * Displays T1-T10 temperature zones with control limits and status indicators
 */
export default function TemperatureChart({ 
  data = [], 
  timeRange = '1h',
  selectedMachine = 'all',
  height,
  compact = false,
  showControlLimits = true,
  showAlarms = true 
}) {
  const processedData = React.useMemo(() => processTemperatureData(data, { timeRange, selectedMachine }), [data, timeRange, selectedMachine]);

  const chartHeight = height || TEMPERATURE_CHART_CONFIG.height;
  const { temperatureRange, zones, colors } = TEMPERATURE_CHART_CONFIG;

  // Generate legend items from temperature zones
  const legendItems = React.useMemo(() => zones.map((zone, index) => ({
      dataKey: zone.name,
      label: zone.label,
      color: colors[index % colors.length],
      type: 'line',
      unit: '°C',
      showMarker: true
    })), [zones, colors]);

  // Get current temperature values for legend
  const currentValues = React.useMemo(() => {
    if (!processedData.length) return {};
    
    const latest = processedData[processedData.length - 1];
    const values = {};
    zones.forEach(zone => {
      values[zone.name] = latest[zone.name] || 0;
    });
    return values;
  }, [processedData, zones]);

  const legendItemsWithValues = React.useMemo(() => generateLegendItems(
      zones.reduce((acc, zone, index) => {
        acc[zone.name] = {
          label: zone.label,
          color: colors[index % colors.length],
          type: 'line',
          unit: '°C',
          showMarker: true,
          precision: 1
        };
        return acc;
      }, {}),
      processedData,
      currentValues
    ), [zones, colors, processedData, currentValues]);

  return (
    <ChartContainer
      title="Temperature Zones"
      description="Real-time temperature monitoring for all heating zones"
      height={chartHeight}
      loading={!processedData.length && data.length === 0}
      compact={compact}
    >
      <div className="space-y-4">
        {/* Legend */}
        <ChartLegend
          items={legendItemsWithValues}
          orientation="horizontal"
          position="top"
          compact={compact}
        />

        {/* Chart */}
        <ResponsiveContainer width="100%" height={chartHeight - (compact ? 80 : 120)}>
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
              domain={[temperatureRange.min, temperatureRange.max]}
              label={{ 
                value: 'Temperature (°C)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />

            {/* Control limit lines */}
            {showControlLimits && (
              <>
                <ReferenceLine 
                  y={temperatureRange.ideal.max} 
                  stroke={CHART_COLORS.status.warning}
                  strokeDasharray="5 5"
                  label={{ value: "Max Ideal", position: "right" }}
                />
                <ReferenceLine 
                  y={temperatureRange.ideal.min} 
                  stroke={CHART_COLORS.status.warning}
                  strokeDasharray="5 5" 
                  label={{ value: "Min Ideal", position: "right" }}
                />
              </>
            )}

            {/* Alarm limit lines */}
            {showAlarms && (
              <>
                <ReferenceLine 
                  y={280} 
                  stroke={CHART_COLORS.status.error}
                  strokeDasharray="2 2"
                  label={{ value: "High Alarm", position: "right" }}
                />
                <ReferenceLine 
                  y={150} 
                  stroke={CHART_COLORS.status.error}
                  strokeDasharray="2 2"
                  label={{ value: "Low Alarm", position: "right" }}
                />
              </>
            )}

            {/* Temperature zone lines */}
            {zones.map((zone, index) => (
              <Line
                key={zone.name}
                type="monotone"
                dataKey={zone.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, stroke: colors[index % colors.length], strokeWidth: 2 }}
                connectNulls={false}
              />
            ))}

            <TemperatureTooltip />
          </LineChart>
        </ResponsiveContainer>

        {/* Zone Status Indicators */}
        {!compact && (
          <div className="grid grid-cols-5 gap-2 pt-2 border-t">
            {zones.map((zone, index) => {
              const currentTemp = currentValues[zone.name] || 0;
              const status = currentTemp > 280 || currentTemp < 150 ? 'error' :
                           currentTemp > temperatureRange.ideal.max || currentTemp < temperatureRange.ideal.min ? 'warning' : 'good';
              
              return (
                <div key={zone.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-xs font-medium">{zone.label}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-mono">{currentTemp.toFixed(1)}°C</span>
                    <div className={`w-2 h-2 rounded-full ${
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