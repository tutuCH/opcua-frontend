"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { cn } from "src/lib/utils"
import { useDashboard, CHART_FOCUS } from "./DashboardContext"
import type { ProcessedDataPoint, Metric } from "src/types/dashboard"

interface RightInsightsPanelProps {
  data?: ProcessedDataPoint[]
  className?: string
}

/**
 * Right insights panel showing related metrics, suggestions, and contextual information
 */
export default function RightInsightsPanel({ 
  data = [], 
  className 
}: RightInsightsPanelProps) {
  const {
    chartFocus,
    alerts,
    insights,
    chartSuggestions,
    navigateToChart,
    dismissSuggestion,
    dismissAlert
  } = useDashboard()

  // Calculate related metrics based on current context
  const relatedMetrics = React.useMemo((): Metric[] => {
    if (!data.length) return []

    const latest = data[data.length - 1] || {}
    const previousPeriod = data.slice(-100, -1) // Last 100 points before latest
    
    // Calculate trends
    const calculateTrend = (current: number, previous: number[]): number => {
      if (!previous.length) return 0
      const prevAvg = previous.reduce((sum, item) => sum + (item || 0), 0) / previous.length
      return ((current - prevAvg) / prevAvg) * 100
    }

    // Context-specific metrics
    switch (chartFocus) {
      case CHART_FOCUS.TEMPERATURE:
        return [
          {
            label: 'Avg Temperature',
            value: `${((latest.Data.T1 + latest.Data.T2 + latest.Data.T3 + latest.Data.T4 + latest.Data.T5) / 5 || 0).toFixed(1)}°C`,
            trend: calculateTrend(latest.Data.T1 || 0, previousPeriod.map(d => d.Data.T1 || 0)),
            status: 'good'
          },
          {
            label: 'Max Temperature',
            value: `${Math.max(latest.Data.T1, latest.Data.T2, latest.Data.T3, latest.Data.T4, latest.Data.T5) || 0}°C`,
            trend: 0,
            status: 'warning'
          },
          {
            label: 'Temperature Range',
            value: `${(Math.max(latest.Data.T1, latest.Data.T2, latest.Data.T3, latest.Data.T4, latest.Data.T5) - Math.min(latest.Data.T1, latest.Data.T2, latest.Data.T3, latest.Data.T4, latest.Data.T5)) || 0}°C`,
            trend: 0,
            status: 'good'
          }
        ]

      case CHART_FOCUS.PROCESS:
        return [
          {
            label: 'Cycle Time',
            value: `${(latest.Data.ECYCT || 0).toFixed(2)}s`,
            trend: calculateTrend(latest.Data.ECYCT || 0, previousPeriod.map(d => d.Data.ECYCT || 0)),
            status: 'good'
          },
          {
            label: 'Injection Pressure',
            value: `${(latest.Data.EIPM || 0).toFixed(1)} bar`,
            trend: calculateTrend(latest.Data.EIPM || 0, previousPeriod.map(d => d.Data.EIPM || 0)),
            status: 'good'
          },
          {
            label: 'Injection Speed',
            value: `${(latest.Data.EISS || 0).toFixed(1)}%`,
            trend: calculateTrend(latest.Data.EISS || 0, previousPeriod.map(d => d.Data.EISS || 0)),
            status: 'warning'
          }
        ]

      default:
        return [
          {
            label: 'Overall Status',
            value: 'Online',
            trend: 0,
            status: 'good'
          },
          {
            label: 'Data Quality',
            value: '98.5%',
            trend: 0.2,
            status: 'good'
          },
          {
            label: 'Update Rate',
            value: '30s',
            trend: 0,
            status: 'good'
          }
        ]
    }
  }, [data, chartFocus])

  const getTrendIcon = (trend: number): string => {
    if (trend > 1) return '📈'
    if (trend < -1) return '📉'
    return '➡️'
  }

  const getTrendColor = (trend: number): string => {
    if (trend > 1) return 'text-green-600'
    if (trend < -1) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn("p-4 space-y-6 h-full overflow-y-auto", className)}>
      {/* Related Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Related Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {relatedMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="text-sm font-medium">{metric.label}</div>
                <div className="text-lg font-bold">{metric.value}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
                {metric.trend !== 0 && (
                  <div className={cn("text-xs flex items-center gap-1", getTrendColor(metric.trend))}>
                    <span>{getTrendIcon(metric.trend)}</span>
                    <span>{Math.abs(metric.trend).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chart Suggestions */}
      {chartSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Smart Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chartSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{suggestion.reason}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      View {suggestion.chartType} chart
                    </div>
                  </div>
                  <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                    {suggestion.priority}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigateToChart(suggestion.chartType as any, suggestion.context)}
                    className="flex-1"
                  >
                    View Chart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dismissSuggestion(suggestion.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{alert.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                      {alert.machineId && ` • ${alert.machineId}`}
                    </div>
                  </div>
                  <Badge variant={
                    alert.level === 'critical' ? 'destructive' :
                    alert.level === 'error' ? 'destructive' :
                    alert.level === 'warning' ? 'secondary' : 'outline'
                  }>
                    {alert.level}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dismissAlert(alert.id)}
                  className="w-full"
                >
                  Acknowledge
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Data Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completeness</span>
              <span className="font-medium">98.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Timeliness</span>
              <span className="font-medium">96.2%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '96.2%' }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Accuracy</span>
              <span className="font-medium">99.1%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.1%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}