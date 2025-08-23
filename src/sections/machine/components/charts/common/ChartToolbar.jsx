"use client"

import * as React from "react"
import { Button } from "src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Badge } from "src/components/ui/badge"
import { TIME_RANGE_CONFIG } from "src/config/chartConfigs"

/**
 * Chart toolbar component for global chart controls
 */
export default function ChartToolbar({
  timeRange,
  onTimeRangeChange,
  selectedMachine,
  onMachineChange,
  availableMachines = [],
  selectedParameter,
  onParameterChange,
  availableParameters = [],
  showParameterSelector = true,
  showExport = false,
  onExport = null,
  showRefresh = true,
  onRefresh = null,
  compact = false
}) {
  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 bg-background border rounded-lg ${
      compact ? 'p-2 gap-2' : ''
    }`}>
      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-muted-foreground">
          Time Range:
        </label>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className={compact ? "w-32" : "w-40"}>
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_CONFIG.ranges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Machine Selector */}
      {availableMachines.length > 0 && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-muted-foreground">
            Machine:
          </label>
          <Select value={selectedMachine} onValueChange={onMachineChange}>
            <SelectTrigger className={compact ? "w-32" : "w-40"}>
              <SelectValue placeholder="Select machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {availableMachines.map(machine => (
                <SelectItem key={machine} value={machine}>
                  {machine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Parameter Selector */}
      {showParameterSelector && availableParameters.length > 0 && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-muted-foreground">
            Parameter:
          </label>
          <Select value={selectedParameter} onValueChange={onParameterChange}>
            <SelectTrigger className={compact ? "w-36" : "w-44"}>
              <SelectValue placeholder="Select parameter" />
            </SelectTrigger>
            <SelectContent>
              {availableParameters.map(param => (
                <SelectItem key={param.value} value={param.value}>
                  {param.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex items-center space-x-2 ml-auto">
        {selectedMachine !== 'all' && (
          <Badge variant="outline" className="text-xs">
            {selectedMachine}
          </Badge>
        )}
        
        <Badge variant="secondary" className="text-xs">
          {TIME_RANGE_CONFIG.ranges.find(r => r.value === timeRange)?.label || timeRange}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {showRefresh && (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={onRefresh}
            className="flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {!compact && <span>Refresh</span>}
          </Button>
        )}

        {showExport && (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={onExport}
            className="flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!compact && <span>Export</span>}
          </Button>
        )}
      </div>
    </div>
  );
}