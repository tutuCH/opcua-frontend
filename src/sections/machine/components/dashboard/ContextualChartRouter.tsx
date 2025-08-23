"use client"

import * as React from "react"
import { useDashboard, VIEW_MODES, CHART_FOCUS, type ViewMode, type ChartFocus } from "./DashboardContext"
import type { ProcessedDataPoint } from "src/types/dashboard"

// Import chart components (keeping as any for now to avoid circular dependencies)
const TemperatureChart = React.lazy(() => import("../charts/realtime/TemperatureChart"))
const ProcessParametersChart = React.lazy(() => import("../charts/realtime/ProcessParametersChart"))
const ProductionMetricsChart = React.lazy(() => import("../charts/realtime/ProductionMetricsChart"))
const TrendAnalysisChart = React.lazy(() => import("../charts/analysis/TrendAnalysisChart"))
const CorrelationChart = React.lazy(() => import("../charts/analysis/CorrelationChart"))
const OEEChart = React.lazy(() => import("../charts/analysis/OEEChart"))
const UtilizationChart = React.lazy(() => import("../charts/analysis/UtilizationChart"))
const DowntimeChart = React.lazy(() => import("../charts/analysis/DowntimeChart"))
const TimelineChart = React.lazy(() => import("../charts/timeline/TimelineChart"))

interface ContextualChartRouterProps {
  data?: ProcessedDataPoint[]
  className?: string
  height?: number
  compact?: boolean
}

interface ChartFocusSelectorProps {
  className?: string
}

/**
 * Contextual chart router that intelligently selects and displays charts
 * based on current dashboard context and user selections
 */
export default function ContextualChartRouter({ 
  data = [], 
  className,
  height,
  compact = false 
}: ContextualChartRouterProps) {
  const {
    viewMode,
    chartFocus,
    selectedMachine,
    timeRange,
    selectedParameter,
    crossChartFilters
  } = useDashboard()

  // Simplified chart rendering for now
  const renderChart = () => {
    const commonProps = {
      data,
      timeRange,
      selectedMachine,
      selectedParameter,
      height: height || 400,
      compact
    }

    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
        <div className="space-y-6">
          {viewMode === VIEW_MODES.HEALTH_CHECK && (
            <ProductionMetricsChart {...commonProps} />
          )}
          
          {viewMode === VIEW_MODES.LIVE_MONITORING && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TemperatureChart {...commonProps} />
                <ProcessParametersChart {...commonProps} />
              </div>
              <ProductionMetricsChart {...commonProps} />
            </>
          )}
          
          {viewMode === VIEW_MODES.ANALYSIS && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendAnalysisChart {...commonProps} parameter={selectedParameter} />
                <CorrelationChart {...commonProps} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OEEChart {...commonProps} />
                <UtilizationChart {...commonProps} />
              </div>
              <DowntimeChart {...commonProps} />
            </>
          )}
          
          {viewMode === VIEW_MODES.HISTORICAL && (
            <TimelineChart {...commonProps} />
          )}
        </div>
      </React.Suspense>
    )
  }

  return (
    <div className={className}>
      {renderChart()}
    </div>
  )
}

/**
 * Chart focus selector for changing the primary chart focus
 */
export function ChartFocusSelector({ className }: ChartFocusSelectorProps) {
  const { chartFocus, setChartFocus, viewMode } = useDashboard()

  // Available chart focuses based on current view mode
  const availableFocuses = React.useMemo(() => {
    const focuses: Record<ViewMode, Array<{ value: ChartFocus; label: string; icon: string }>> = {
      [VIEW_MODES.HEALTH_CHECK]: [
        { value: CHART_FOCUS.OVERVIEW, label: 'System Overview', icon: '🎛️' }
      ],
      [VIEW_MODES.LIVE_MONITORING]: [
        { value: CHART_FOCUS.OVERVIEW, label: 'Live Overview', icon: '📊' },
        { value: CHART_FOCUS.TEMPERATURE, label: 'Temperature', icon: '🌡️' },
        { value: CHART_FOCUS.PROCESS, label: 'Process', icon: '⚙️' },
        { value: CHART_FOCUS.PRODUCTION, label: 'Production', icon: '🏭' }
      ],
      [VIEW_MODES.ANALYSIS]: [
        { value: CHART_FOCUS.OVERVIEW, label: 'Analysis Overview', icon: '🔍' },
        { value: CHART_FOCUS.TREND, label: 'Trend Analysis', icon: '📈' },
        { value: CHART_FOCUS.CORRELATION, label: 'Correlation', icon: '🔗' },
        { value: CHART_FOCUS.OEE, label: 'OEE Analysis', icon: '📊' },
        { value: CHART_FOCUS.UTILIZATION, label: 'Utilization', icon: '⚡' },
        { value: CHART_FOCUS.DOWNTIME, label: 'Downtime', icon: '⏸️' }
      ],
      [VIEW_MODES.HISTORICAL]: [
        { value: CHART_FOCUS.OVERVIEW, label: 'Historical Overview', icon: '📅' },
        { value: CHART_FOCUS.TIMELINE, label: 'Timeline View', icon: '📊' }
      ]
    }

    return focuses[viewMode] || []
  }, [viewMode])

  if (availableFocuses.length <= 1) {
    return null // No need to show selector if only one option
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {availableFocuses.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setChartFocus(value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              chartFocus === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}