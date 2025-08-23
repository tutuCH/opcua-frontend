"use client"

import * as React from "react"
import { cn } from "src/lib/utils"

/**
 * Enhanced chart legend component with interactive features
 */
export default function ChartLegend({
  items = [],
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  position = 'bottom', // 'top' | 'bottom' | 'left' | 'right'
  interactive = true,
  onToggle = null,
  className,
  compact = false
}) {
  const [hiddenItems, setHiddenItems] = React.useState(new Set());

  const handleItemClick = (dataKey) => {
    if (!interactive) return;

    const newHiddenItems = new Set(hiddenItems);
    if (newHiddenItems.has(dataKey)) {
      newHiddenItems.delete(dataKey);
    } else {
      newHiddenItems.add(dataKey);
    }
    setHiddenItems(newHiddenItems);
    
    if (onToggle) {
      onToggle(dataKey, !hiddenItems.has(dataKey));
    }
  };

  const isVertical = orientation === 'vertical';
  const itemSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={cn(
      "flex items-center gap-2",
      isVertical ? "flex-col items-start" : "flex-wrap justify-center",
      position === 'top' && "order-first",
      position === 'left' && "mr-4",
      position === 'right' && "ml-4",
      className
    )}>
      {items.map((item, index) => {
        const isHidden = hiddenItems.has(item.dataKey);
        
        return (
          <div
            key={item.dataKey || index}
            className={cn(
              "flex items-center gap-2 transition-opacity",
              interactive && "cursor-pointer hover:opacity-80",
              isHidden && "opacity-40",
              compact ? "py-1" : "py-1.5"
            )}
            onClick={() => handleItemClick(item.dataKey)}
          >
            {/* Legend Icon */}
            <div className="flex items-center">
              {item.type === 'line' ? (
                <svg 
                  width={compact ? "16" : "20"} 
                  height={compact ? "16" : "20"} 
                  viewBox="0 0 20 20"
                  className="flex-shrink-0"
                >
                  <line
                    x1="2"
                    y1="10"
                    x2="18"
                    y2="10"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeDasharray={item.dashed ? "3,3" : "none"}
                  />
                  {item.showMarker && (
                    <circle
                      cx="10"
                      cy="10"
                      r="2"
                      fill={item.color}
                    />
                  )}
                </svg>
              ) : item.type === 'area' ? (
                <svg 
                  width={compact ? "16" : "20"} 
                  height={compact ? "16" : "20"} 
                  viewBox="0 0 20 20"
                  className="flex-shrink-0"
                >
                  <path
                    d="M2 15 L6 10 L10 12 L14 8 L18 10 L18 18 L2 18 Z"
                    fill={item.color}
                    fillOpacity="0.3"
                    stroke={item.color}
                    strokeWidth="1"
                  />
                </svg>
              ) : (
                <div
                  className={cn(
                    "rounded-full flex-shrink-0",
                    compact ? "w-3 h-3" : "w-4 h-4"
                  )}
                  style={{ backgroundColor: item.color }}
                />
              )}
            </div>

            {/* Legend Label */}
            <span className={cn(
              "font-medium text-foreground transition-colors",
              itemSize,
              isHidden && "line-through"
            )}>
              {item.value || item.label}
            </span>

            {/* Unit */}
            {item.unit && (
              <span className={cn(
                "text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}>
                ({item.unit})
              </span>
            )}

            {/* Current Value */}
            {item.currentValue !== undefined && (
              <span className={cn(
                "font-mono font-medium text-primary",
                compact ? "text-xs" : "text-sm"
              )}>
                {typeof item.currentValue === 'number' 
                  ? item.currentValue.toFixed(item.precision || 1)
                  : item.currentValue
                }
              </span>
            )}

            {/* Status Indicator */}
            {item.status && (
              <div className={cn(
                "rounded-full",
                compact ? "w-2 h-2" : "w-2.5 h-2.5",
                item.status === 'good' && "bg-green-500",
                item.status === 'warning' && "bg-yellow-500",
                item.status === 'error' && "bg-red-500",
                item.status === 'neutral' && "bg-gray-400"
              )} />
            )}
          </div>
        );
      })}

      {/* Interactive Helper Text */}
      {interactive && items.length > 0 && !compact && (
        <div className="text-xs text-muted-foreground ml-2 opacity-60">
          Click to toggle
        </div>
      )}
    </div>
  );
}

// Helper function to generate legend items from chart data
export const generateLegendItems = (config, data = [], currentValues = {}) => {
  if (!config) return [];

  return Object.entries(config).map(([key, settings]) => ({
    dataKey: key,
    label: settings.label || key,
    color: settings.color,
    type: settings.type || 'line',
    unit: settings.unit,
    currentValue: currentValues[key],
    precision: settings.precision || 1,
    showMarker: settings.showMarker || false,
    dashed: settings.dashed || false
  }));
};

// Preset legend configurations
export const LEGEND_PRESETS = {
  temperature: {
    orientation: 'horizontal',
    position: 'bottom',
    interactive: true,
    compact: false
  },
  
  process: {
    orientation: 'vertical',
    position: 'right',
    interactive: true,
    compact: false
  },
  
  status: {
    orientation: 'horizontal',
    position: 'top',
    interactive: false,
    compact: true
  }
};