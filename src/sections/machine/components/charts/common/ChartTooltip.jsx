"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "src/lib/utils"

/**
 * Enhanced chart tooltip component with rich formatting
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  coordinate,
  labelFormatter,
  valueFormatter,
  showTimestamp = true,
  showUnits = true,
  showStatusIndicators = true,
  customContent = null,
  className
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Custom content override
  if (customContent) {
    return customContent({ active, payload, label, coordinate });
  }

  // Format timestamp if it's a date
  const formatLabel = (label) => {
    if (labelFormatter) {
      return labelFormatter(label);
    }
    
    if (showTimestamp && label) {
      try {
        const date = new Date(label);
        if (!isNaN(date.getTime())) {
          return format(date, 'MMM dd, HH:mm:ss');
        }
      } catch (e) {
        // If not a valid date, return as is
      }
    }
    
    return label;
  };

  // Format values with units and precision
  const formatValue = (value, entry) => {
    if (valueFormatter) {
      return valueFormatter(value, entry);
    }

    if (typeof value !== 'number') {
      return value;
    }

    // Get precision from payload data
    const precision = entry.payload?.precision || 1;
    const formattedValue = value.toFixed(precision);
    
    // Add units if available and enabled
    if (showUnits && entry.unit) {
      return `${formattedValue} ${entry.unit}`;
    }
    
    return formattedValue;
  };

  // Get status indicator based on value
  const getStatusIndicator = (value, entry) => {
    if (!showStatusIndicators || !entry.thresholds) {
      return null;
    }

    const { thresholds } = entry;
    
    if (thresholds.error && value >= thresholds.error) {
      return 'error';
    } if (thresholds.warning && value >= thresholds.warning) {
      return 'warning';
    } if (thresholds.good && value >= thresholds.good) {
      return 'good';
    }
    
    return 'neutral';
  };

  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[200px] max-w-[400px]",
      "text-sm space-y-2",
      className
    )}>
      {/* Timestamp/Label */}
      {label && (
        <div className="text-xs text-muted-foreground font-medium border-b border-border pb-2">
          {formatLabel(label)}
        </div>
      )}

      {/* Payload Items */}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const status = getStatusIndicator(entry.value, entry);
          
          return (
            <div key={index} className="flex items-center justify-between gap-3">
              {/* Name and Color Indicator */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium text-foreground truncate">
                  {entry.name || entry.dataKey}
                </span>
              </div>

              {/* Value and Status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono font-medium text-foreground">
                  {formatValue(entry.value, entry)}
                </span>
                
                {status && (
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'good' && "bg-green-500",
                    status === 'warning' && "bg-yellow-500",
                    status === 'error' && "bg-red-500",
                    status === 'neutral' && "bg-gray-400"
                  )} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Statistics */}
      {payload.length > 1 && (
        <div className="border-t border-border pt-2 space-y-1">
          {/* Average */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Average:</span>
            <span className="font-mono">
              {(payload.reduce((sum, entry) => sum + (entry.value || 0), 0) / payload.length).toFixed(1)}
            </span>
          </div>
          
          {/* Range */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Range:</span>
            <span className="font-mono">
              {Math.min(...payload.map(p => p.value || 0)).toFixed(1)} - {Math.max(...payload.map(p => p.value || 0)).toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Machine/Device ID if available */}
      {payload[0]?.payload?.devId && (
        <div className="text-xs text-muted-foreground border-t border-border pt-2">
          Machine: <span className="font-medium">{payload[0].payload.devId}</span>
        </div>
      )}
    </div>
  );
}

// Specialized tooltip components for different chart types

export const TemperatureTooltip = ({ active, payload, label }) => (
  <ChartTooltip
    active={active}
    payload={payload}
    label={label}
    valueFormatter={(value) => `${value.toFixed(1)}°C`}
    showUnits={false}
  />
);

export const PressureTooltip = ({ active, payload, label }) => (
  <ChartTooltip
    active={active}
    payload={payload}
    label={label}
    valueFormatter={(value) => `${value.toFixed(1)} bar`}
    showUnits={false}
  />
);

export const EfficiencyTooltip = ({ active, payload, label }) => (
  <ChartTooltip
    active={active}
    payload={payload}
    label={label}
    valueFormatter={(value) => `${value.toFixed(1)}%`}
    showUnits={false}
  />
);

export const TimeTooltip = ({ active, payload, label }) => (
  <ChartTooltip
    active={active}
    payload={payload}
    label={label}
    valueFormatter={(value) => `${value.toFixed(2)}s`}
    showUnits={false}
  />
);

// Tooltip for correlation charts
export const CorrelationTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          {data.formattedTime}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span>X Value:</span>
            <span className="font-mono">{data.x?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Y Value:</span>
            <span className="font-mono">{data.y?.toFixed(2)}</span>
          </div>
          {data.efficiency && (
            <div className="flex justify-between gap-4">
              <span>Efficiency:</span>
              <span className="font-mono">{data.efficiency.toFixed(1)}%</span>
            </div>
          )}
        </div>
        {data.devId && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Machine: {data.devId}
          </div>
        )}
      </div>
    </div>
  );
};

// Tooltip for timeline charts
export const TimelineTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          {format(new Date(label), 'MMM dd, HH:mm:ss')}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span>Status:</span>
            <span className="font-medium">{data.operationalStatus}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>System:</span>
            <span className="font-medium">{data.systemStatus}</span>
          </div>
          {data.cycleTime && (
            <div className="flex justify-between gap-4">
              <span>Cycle Time:</span>
              <span className="font-mono">{data.cycleTime.toFixed(2)}s</span>
            </div>
          )}
        </div>
        {data.devId && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Machine: {data.devId}
          </div>
        )}
      </div>
    </div>
  );
};