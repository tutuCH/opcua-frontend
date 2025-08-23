"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Button } from "src/components/ui/button"
import { Badge } from "src/components/ui/badge"
import { cn } from "src/lib/utils"
import { useDashboard } from "./DashboardContext"
import ViewModeSelector from "./ViewModeSelector"
import type { ProcessedDataPoint, Parameter, TimeRangeOption, Machine } from "src/types/dashboard"

interface LeftContextPanelProps {
  data?: ProcessedDataPoint[]
  className?: string
}

/**
 * Left context panel with machine selection, time controls, and navigation
 */
export default function LeftContextPanel({ 
  data = [], 
  className 
}: LeftContextPanelProps) {
  const {
    selectedMachine,
    setSelectedMachine,
    timeRange,
    setTimeRange,
    selectedParameter,
    setSelectedParameter,
    alerts
  } = useDashboard()

  // Extract machines from data
  const availableMachines = React.useMemo((): Machine[] => {
    const machines = [...new Set(data.map(d => d.devId))].filter(Boolean)
    return machines.sort().map(machine => {
      const machineData = data.filter(d => d.devId === machine)
      const latest = machineData[machineData.length - 1] || {}
      const machineAlerts = alerts.filter(a => a.machineId === machine)
      
      return {
        id: machine,
        name: machine,
        status: latest.systemStatus || 'unknown',
        lastUpdate: new Date(latest.timestamp || Date.now()),
        alertCount: machineAlerts.length
      }
    })
  }, [data, alerts])

  // Available parameters for analysis
  const availableParameters: Parameter[] = [
    { value: "ECYCT", label: "Cycle Time", unit: "s", icon: "⏱️" },
    { value: "EIPM", label: "Injection Pressure", unit: "bar", icon: "📊" },
    { value: "EISS", label: "Injection Speed", unit: "%", icon: "⚡" },
    { value: "EIVM", label: "Injection Volume", unit: "ml", icon: "💧" },
    { value: "totalTemperature", label: "Avg Temperature", unit: "°C", icon: "🌡️" },
    { value: "processEfficiency", label: "Process Efficiency", unit: "%", icon: "📈" }
  ]

  // Time range options
  const timeRangeOptions: TimeRangeOption[] = [
    { value: "1h", label: "Last Hour", icon: "🕐" },
    { value: "4h", label: "Last 4 Hours", icon: "🕓" },
    { value: "12h", label: "Last 12 Hours", icon: "🕕" },
    { value: "24h", label: "Last 24 Hours", icon: "📅" },
    { value: "7d", label: "Last 7 Days", icon: "📊" },
    { value: "30d", label: "Last 30 Days", icon: "📈" }
  ]

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'online': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'online': return 'Online'
      case 'warning': return 'Warning'
      case 'error': return 'Error'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className={cn("p-4 space-y-6 h-full overflow-y-auto", className)}>
      {/* View Mode Selector */}
      <ViewModeSelector />

      {/* Machine Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Machine Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* All Machines Option */}
          <Button
            variant={selectedMachine === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedMachine('all')}
            className="w-full justify-start h-auto p-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>All Machines</span>
              </div>
              <Badge variant="secondary">
                {availableMachines.length}
              </Badge>
            </div>
          </Button>

          {/* Individual Machines */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableMachines.map(machine => (
              <Button
                key={machine.id}
                variant={selectedMachine === machine.id ? 'default' : 'outline'}
                onClick={() => setSelectedMachine(machine.id)}
                className="w-full justify-start h-auto p-3"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      getStatusColor(machine.status)
                    )} />
                    <div className="text-left">
                      <div className="font-medium">{machine.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {getStatusLabel(machine.status)}
                      </div>
                    </div>
                  </div>
                  {machine.alertCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {machine.alertCount}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Time Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {timeRangeOptions.map(option => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'default' : 'outline'}
              onClick={() => setTimeRange(option.value)}
              className="w-full justify-start"
              size="sm"
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Parameter Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Analysis Parameter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableParameters.map(param => (
            <Button
              key={param.value}
              variant={selectedParameter === param.value ? 'default' : 'outline'}
              onClick={() => setSelectedParameter(param.value)}
              className="w-full justify-start h-auto p-3"
              size="sm"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>{param.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{param.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {param.unit}
                    </div>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">System Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Data Points:</span>
            <span className="font-medium">{data.length.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Machines:</span>
            <span className="font-medium">{availableMachines.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Alerts:</span>
            <span className={cn(
              "font-medium",
              alerts.length > 0 ? "text-red-600" : "text-green-600"
            )}>
              {alerts.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last Update:</span>
            <span className="font-medium">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}