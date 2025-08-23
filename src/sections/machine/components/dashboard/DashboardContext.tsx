"use client"

import * as React from "react"
import type { 
  Alert, 
  Insight, 
  ChartSuggestion, 
  UserPreferences, 
  PanelVisibility, 
  CrossChartFilters 
} from "src/types/dashboard"

/**
 * Dashboard context for managing global state across Mission Control interface
 */

// Dashboard View Modes
export const VIEW_MODES = {
  HEALTH_CHECK: 'health_check',
  LIVE_MONITORING: 'live_monitoring', 
  ANALYSIS: 'analysis',
  HISTORICAL: 'historical'
} as const

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES]

// Chart Focus Types
export const CHART_FOCUS = {
  OVERVIEW: 'overview',
  TEMPERATURE: 'temperature',
  PROCESS: 'process',
  PRODUCTION: 'production',
  TREND: 'trend',
  CORRELATION: 'correlation',
  OEE: 'oee',
  UTILIZATION: 'utilization',
  DOWNTIME: 'downtime',
  TIMELINE: 'timeline'
} as const

export type ChartFocus = typeof CHART_FOCUS[keyof typeof CHART_FOCUS]

// Alert Levels
export const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning', 
  ERROR: 'error',
  CRITICAL: 'critical'
} as const

export type AlertLevel = typeof ALERT_LEVELS[keyof typeof ALERT_LEVELS]

interface DashboardContextType {
  // State
  viewMode: ViewMode
  chartFocus: ChartFocus
  selectedMachine: string
  timeRange: string
  selectedParameter: string
  isFullscreen: boolean
  timelineExpanded: boolean
  panelVisibility: PanelVisibility
  alerts: Alert[]
  insights: Insight[]
  chartSuggestions: ChartSuggestion[]
  crossChartFilters: CrossChartFilters
  userPreferences: UserPreferences

  // Actions
  setViewMode: (mode: ViewMode) => void
  setChartFocus: (focus: ChartFocus) => void
  setSelectedMachine: (machine: string) => void
  setTimeRange: (range: string) => void
  setSelectedParameter: (parameter: string) => void
  setIsFullscreen: (fullscreen: boolean) => void
  setTimelineExpanded: (expanded: boolean) => void
  setPanelVisibility: (visibility: PanelVisibility) => void
  setUserPreferences: (preferences: UserPreferences) => void

  // Smart functions
  navigateToChart: (chartType: ChartFocus, context?: Record<string, any>) => void
  suggestChart: (suggestion: Omit<ChartSuggestion, 'id' | 'timestamp'>) => void
  dismissSuggestion: (suggestionId: number) => void
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void
  dismissAlert: (alertId: number) => void
  addInsight: (insight: Omit<Insight, 'id' | 'timestamp'>) => void
  updateCrossChartFilter: (filterType: string, filterValue: any) => void
  clearCrossChartFilters: () => void

  // Constants
  VIEW_MODES: typeof VIEW_MODES
  CHART_FOCUS: typeof CHART_FOCUS
  ALERT_LEVELS: typeof ALERT_LEVELS
}

const DashboardContext = React.createContext<DashboardContextType | null>(null)

interface DashboardProviderProps {
  children: React.ReactNode
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  // Core dashboard state
  const [viewMode, setViewMode] = React.useState<ViewMode>(VIEW_MODES.HEALTH_CHECK)
  const [chartFocus, setChartFocus] = React.useState<ChartFocus>(CHART_FOCUS.OVERVIEW)
  const [selectedMachine, setSelectedMachine] = React.useState<string>('all')
  const [timeRange, setTimeRange] = React.useState<string>('24h')
  const [selectedParameter, setSelectedParameter] = React.useState<string>('ECYCT')

  // UI state
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false)
  const [timelineExpanded, setTimelineExpanded] = React.useState<boolean>(false)
  const [panelVisibility, setPanelVisibility] = React.useState<PanelVisibility>({
    left: true,
    right: true,
    timeline: true
  })

  // Data and insights state
  const [alerts, setAlerts] = React.useState<Alert[]>([])
  const [insights, setInsights] = React.useState<Insight[]>([])
  const [chartSuggestions, setChartSuggestions] = React.useState<ChartSuggestion[]>([])
  const [crossChartFilters, setCrossChartFilters] = React.useState<CrossChartFilters>({})

  // User preferences
  const [userPreferences, setUserPreferences] = React.useState<UserPreferences>({
    favoriteCharts: [],
    customLayouts: {},
    defaultTimeRange: '24h',
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Smart navigation functions
  const navigateToChart = React.useCallback((chartType: ChartFocus, context: Record<string, any> = {}) => {
    setChartFocus(chartType)
    
    // Auto-switch view mode based on chart type
    switch (chartType) {
      case CHART_FOCUS.TEMPERATURE:
      case CHART_FOCUS.PROCESS:
      case CHART_FOCUS.PRODUCTION:
        setViewMode(VIEW_MODES.LIVE_MONITORING)
        break
      case CHART_FOCUS.TREND:
      case CHART_FOCUS.CORRELATION:
      case CHART_FOCUS.OEE:
      case CHART_FOCUS.UTILIZATION:
      case CHART_FOCUS.DOWNTIME:
        setViewMode(VIEW_MODES.ANALYSIS)
        break
      case CHART_FOCUS.TIMELINE:
        setViewMode(VIEW_MODES.HISTORICAL)
        break
      default:
        setViewMode(VIEW_MODES.HEALTH_CHECK)
    }

    // Apply any contextual parameters
    if (context.machine) setSelectedMachine(context.machine)
    if (context.timeRange) setTimeRange(context.timeRange)
    if (context.parameter) setSelectedParameter(context.parameter)
  }, [])

  const suggestChart = React.useCallback((suggestion: Omit<ChartSuggestion, 'id' | 'timestamp'>) => {
    setChartSuggestions(prev => {
      // Avoid duplicate suggestions
      const exists = prev.some(s => s.chartType === suggestion.chartType && s.reason === suggestion.reason)
      if (exists) return prev
      
      return [...prev, {
        id: Date.now(),
        timestamp: new Date(),
        ...suggestion
      }].slice(0, 3) // Keep only 3 most recent suggestions
    })
  }, [])

  const dismissSuggestion = React.useCallback((suggestionId: number) => {
    setChartSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }, [])

  const addAlert = React.useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    setAlerts(prev => {
      const newAlert: Alert = {
        id: Date.now(),
        timestamp: new Date(),
        ...alert
      }
      return [newAlert, ...prev].slice(0, 10) // Keep only 10 most recent alerts
    })
  }, [])

  const dismissAlert = React.useCallback((alertId: number) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }, [])

  const addInsight = React.useCallback((insight: Omit<Insight, 'id' | 'timestamp'>) => {
    setInsights(prev => {
      const newInsight: Insight = {
        id: Date.now(),
        timestamp: new Date(),
        ...insight
      }
      return [newInsight, ...prev].slice(0, 5) // Keep only 5 most recent insights
    })
  }, [])

  const updateCrossChartFilter = React.useCallback((filterType: string, filterValue: any) => {
    setCrossChartFilters(prev => ({
      ...prev,
      [filterType]: filterValue
    }))
  }, [])

  const clearCrossChartFilters = React.useCallback(() => {
    setCrossChartFilters({})
  }, [])

  // Auto-suggestions based on state changes
  React.useEffect(() => {
    // Example: If temperature alerts exist, suggest temperature chart
    const tempAlerts = alerts.filter(a => a.type === 'temperature' && a.level !== 'info')
    if (tempAlerts.length > 0 && chartFocus !== CHART_FOCUS.TEMPERATURE) {
      suggestChart({
        chartType: CHART_FOCUS.TEMPERATURE,
        reason: `${tempAlerts.length} temperature alert(s) detected`,
        priority: 'high',
        context: { parameter: 'temperature' }
      })
    }
  }, [alerts, chartFocus, suggestChart])

  React.useEffect(() => {
    // Auto-suggest analysis charts when issues are detected
    const criticalAlerts = alerts.filter(a => a.level === 'critical')
    if (criticalAlerts.length > 0 && viewMode === VIEW_MODES.HEALTH_CHECK) {
      suggestChart({
        chartType: CHART_FOCUS.DOWNTIME,
        reason: 'Critical alerts detected - analyze downtime patterns',
        priority: 'high'
      })
    }
  }, [alerts, viewMode, suggestChart])

  const value: DashboardContextType = {
    // State
    viewMode,
    chartFocus,
    selectedMachine,
    timeRange,
    selectedParameter,
    isFullscreen,
    timelineExpanded,
    panelVisibility,
    alerts,
    insights,
    chartSuggestions,
    crossChartFilters,
    userPreferences,

    // Actions
    setViewMode,
    setChartFocus,
    setSelectedMachine,
    setTimeRange,
    setSelectedParameter,
    setIsFullscreen,
    setTimelineExpanded,
    setPanelVisibility,
    setUserPreferences,

    // Smart functions
    navigateToChart,
    suggestChart,
    dismissSuggestion,
    addAlert,
    dismissAlert,
    addInsight,
    updateCrossChartFilter,
    clearCrossChartFilters,

    // Constants
    VIEW_MODES,
    CHART_FOCUS,
    ALERT_LEVELS
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardContextType {
  const context = React.useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

export default DashboardContext