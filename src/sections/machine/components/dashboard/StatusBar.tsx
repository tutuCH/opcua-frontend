"use client"

import * as React from "react"
import { Card } from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { cn } from "src/lib/utils"
import { useDashboard } from "./DashboardContext"
import ViewModeSelector from "./ViewModeSelector"
import type { ProcessedDataPoint } from "src/types/dashboard"

interface StatusBarProps {
  data?: ProcessedDataPoint[]
  className?: string
  showMachineSelector?: boolean
  showViewMode?: boolean
}

interface Metrics {
  machineCount: number
  activeAlerts: number
  oee: number
  utilization: number
  availability: number
  performance: number
  quality: number
  lastUpdate: Date
}

/**
 * Status bar component showing machine health and KPIs at the top of dashboard
 */
export default function StatusBar({ 
  data = [], 
  className,
  showMachineSelector = true,
  showViewMode = true 
}: StatusBarProps) {
  const { 
    selectedMachine, 
    setSelectedMachine, 
    alerts, 
    timeRange,
    setTimeRange
  } = useDashboard()

  // Calculate aggregated metrics from data
  const metrics = React.useMemo((): Metrics | null => {
    if (!data.length) return null

    const latest = data[data.length - 1] || {}
    const machineCount = new Set(data.map(d => d.devId)).size
    const activeAlerts = alerts.filter(a => a.level === 'error' || a.level === 'critical').length
    
    // Mock calculations - replace with real data processing
    const oee = 78.5
    const utilization = 82.3
    const availability = 94.7
    const performance = 87.2
    const quality = 95.1

    return {
      machineCount,
      activeAlerts,
      oee,
      utilization,
      availability,
      performance,
      quality,
      lastUpdate: new Date(latest.timestamp || Date.now())
    }
  }, [data, alerts])

  // Available machines from data
  const availableMachines = React.useMemo(() => {
    const machines = [...new Set(data.map(d => d.devId))].filter(Boolean)
    return machines.sort()
  }, [data])

  const getStatusColor = (value: number, thresholds = { good: 85, warning: 70 }): string => {
    if (value >= thresholds.good) return "text-green-600"
    if (value >= thresholds.warning) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (value: number, thresholds = { good: 85, warning: 70 }): string => {
    if (value >= thresholds.good) return "bg-green-100 text-green-800"
    if (value >= thresholds.warning) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className={cn("p-4 space-y-4", className)}>
      {/* Top Controls Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Machine Selector */}
        {showMachineSelector && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-muted-foreground">
              Machine:
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="border border-border rounded-md px-3 py-1 text-sm bg-background"
            >
              <option value="all">All Machines ({availableMachines.length})</option>
              {availableMachines.map(machine => (
                <option key={machine} value={machine}>
                  {machine}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">
            Time Range:
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-border rounded-md px-3 py-1 text-sm bg-background"
          >
            <option value="1h">Last Hour</option>
            <option value="4h">Last 4 Hours</option>
            <option value="12h">Last 12 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        {/* View Mode Selector */}
        {showViewMode && (
          <div className="flex-1 flex justify-center">
            <ViewModeSelector compact />
          </div>
        )}

        {/* Last Update */}
        <div className="text-sm text-muted-foreground">
          Last update: {metrics?.lastUpdate.toLocaleTimeString() || '--'}
        </div>
      </div>

      {/* KPI Cards Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Machine Count */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Machines
                </p>
                <p className="text-2xl font-bold">{metrics.machineCount}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.172V5z" />
                </svg>
              </div>
            </div>
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                {selectedMachine === 'all' ? 'All Active' : selectedMachine}
              </Badge>
            </div>
          </Card>

          {/* OEE */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  OEE
                </p>
                <p className={cn("text-2xl font-bold", getStatusColor(metrics.oee))}>
                  {metrics.oee.toFixed(1)}%
                </p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                getStatusBadge(metrics.oee)
              )}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Utilization */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Utilization
                </p>
                <p className={cn("text-2xl font-bold", getStatusColor(metrics.utilization))}>
                  {metrics.utilization.toFixed(1)}%
                </p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                getStatusBadge(metrics.utilization)
              )}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Availability */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Availability
                </p>
                <p className={cn("text-2xl font-bold", getStatusColor(metrics.availability, { good: 90, warning: 80 }))}>
                  {metrics.availability.toFixed(1)}%
                </p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                getStatusBadge(metrics.availability, { good: 90, warning: 80 })
              )}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Performance */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Performance
                </p>
                <p className={cn("text-2xl font-bold", getStatusColor(metrics.performance))}>
                  {metrics.performance.toFixed(1)}%
                </p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                getStatusBadge(metrics.performance)
              )}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Active Alerts
                </p>
                <p className={cn(
                  "text-2xl font-bold",
                  metrics.activeAlerts > 0 ? "text-red-600" : "text-green-600"
                )}>
                  {metrics.activeAlerts}
                </p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                metrics.activeAlerts > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              )}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            {metrics.activeAlerts > 0 && (
              <div className="mt-1">
                <Badge variant="destructive" className="text-xs">
                  Needs Attention
                </Badge>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {metrics?.activeAlerts && metrics.activeAlerts > 0 && (
            <Button variant="destructive" size="sm">
              View Alerts ({metrics.activeAlerts})
            </Button>
          )}
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Auto-refresh: 30s</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}