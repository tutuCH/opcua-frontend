"use client"

import * as React from "react"
import { Button } from "src/components/ui/button"
import { Badge } from "src/components/ui/badge"
import { cn } from "src/lib/utils"
import { useDashboard } from "./DashboardContext"
import type { ProcessedDataPoint, TimelineEvent } from "src/types/dashboard"

// Lazy load the timeline chart
const TimelineChart = React.lazy(() => import("../charts/timeline/TimelineChart"))

interface TimelinePanelProps {
  data?: ProcessedDataPoint[]
  className?: string
}

/**
 * Bottom timeline panel showing historical context and events
 */
export default function TimelinePanel({ 
  data = [], 
  className 
}: TimelinePanelProps) {
  const {
    timelineExpanded,
    setTimelineExpanded,
    selectedMachine,
    timeRange,
    updateCrossChartFilter
  } = useDashboard()

  // Process timeline events
  const timelineEvents = React.useMemo((): TimelineEvent[] => {
    if (!data.length) return []

    // Extract significant events from data
    const events: TimelineEvent[] = []
    let previousStatus: string | null = null

    data.forEach((point, index) => {
      // Safely get timestamp
      const timestamp = new Date(point.timestamp || Date.now())
      
      // Get system status from Data.STS if available (flattened structure)
      const currentStatus = point.Data?.STS !== undefined 
        ? (point.Data.STS === 1 ? 'Online' : 
           point.Data.STS === 2 ? 'Warning' : 'Error')
        : point.systemStatus || 'Unknown'
      
      // Status changes
      if (currentStatus !== previousStatus && previousStatus !== null) {
        events.push({
          id: `status-${index}`,
          timestamp,
          type: 'status_change',
          title: `Status changed to ${currentStatus}`,
          machine: point.devId || 'Unknown',
          severity: currentStatus === 'Error' ? 'error' : 'info'
        })
      }
      
      // Temperature alerts - check Data structure (flattened)
      const tempData = point.Data || {}
      const t1 = tempData.T1 || 0
      const t2 = tempData.T2 || 0
      
      if (t1 > 280 || t2 > 280) {
        events.push({
          id: `temp-${index}`,
          timestamp,
          type: 'temperature_alert',
          title: `High temperature detected (T1: ${t1}°C, T2: ${t2}°C)`,
          machine: point.devId || 'Unknown',
          severity: 'warning'
        })
      }

      // Process parameter alerts - check Data structure (flattened)
      const processData = point.Data || {}
      if (processData.ECYCT && processData.ECYCT > 35) {
        events.push({
          id: `cycle-${index}`,
          timestamp,
          type: 'process_alert',
          title: `Long cycle time detected (${processData.ECYCT}s)`,
          machine: point.devId || 'Unknown',
          severity: 'warning'
        })
      }

      previousStatus = currentStatus
    })

    return events.slice(-20) // Keep only recent events
  }, [data])

  // Filter events based on selected machine
  const filteredEvents = React.useMemo(() => {
    if (selectedMachine === 'all') return timelineEvents
    return timelineEvents.filter(event => event.machine === selectedMachine)
  }, [timelineEvents, selectedMachine])

  const handleTimeRangeSelect = (startTime: Date, endTime: Date) => {
    updateCrossChartFilter('timeRange', { start: startTime, end: endTime })
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityBadge = (severity: string): "destructive" | "secondary" | "outline" => {
    switch (severity) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className={cn("border-t border-border bg-card", className)}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium">Timeline</h3>
          <Badge variant="outline">
            {filteredEvents.length} events
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimelineExpanded(!timelineExpanded)}
          >
            {timelineExpanded ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Collapse
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Expand
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-4">
        {timelineExpanded ? (
          /* Expanded Timeline with Chart */
          <div className="space-y-4">
            {/* Full Timeline Chart */}
            <div className="h-64">
              <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading timeline...</div>}>
                <TimelineChart
                  data={data}
                  timeRange={timeRange}
                  selectedMachine={selectedMachine}
                  height={256}
                />
              </React.Suspense>
            </div>

            {/* Event List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Events</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {filteredEvents.length > 0 ? (
                  filteredEvents.slice(0, 10).map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className={cn("w-2 h-2 rounded-full", getSeverityColor(event.severity))} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleTimeString()} • {event.machine}
                        </div>
                      </div>
                      <Badge variant={getSeverityBadge(event.severity)} className="text-xs">
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No events in selected time range
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Compact Timeline */
          <div className="space-y-3">
            {/* Mini Timeline Chart */}
            <div className="h-16">
              <React.Suspense fallback={<div className="flex items-center justify-center h-16">Loading...</div>}>
                <TimelineChart
                  data={data}
                  timeRange={timeRange}
                  selectedMachine={selectedMachine}
                  height={64}
                  compact={true}
                />
              </React.Suspense>
            </div>

            {/* Compact Event Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Last {timeRange}
                </div>
                {filteredEvents.length > 0 && (
                  <div className="flex items-center gap-2">
                    {filteredEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="flex items-center gap-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full", getSeverityColor(event.severity))} />
                        <span className="text-xs text-muted-foreground truncate max-w-24">
                          {event.title}
                        </span>
                      </div>
                    ))}
                    {filteredEvents.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{filteredEvents.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  Auto-refresh: 30s
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}