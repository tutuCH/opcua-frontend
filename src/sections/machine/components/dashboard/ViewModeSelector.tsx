"use client"

import * as React from "react"
import { Button } from "src/components/ui/button"
import { Badge } from "src/components/ui/badge"
import { cn } from "src/lib/utils"
import { useDashboard, VIEW_MODES, type ViewMode } from "./DashboardContext"

interface ViewModeSelectorProps {
  compact?: boolean
  className?: string
}

interface ViewModeConfig {
  label: string
  icon: string
  description: string
  color: string
  shortLabel: string
}

/**
 * View mode selector for switching between different dashboard contexts
 */
export default function ViewModeSelector({ compact = false, className }: ViewModeSelectorProps) {
  const { viewMode, setViewMode, alerts, chartSuggestions } = useDashboard()

  const viewModeConfig: Record<ViewMode, ViewModeConfig> = {
    [VIEW_MODES.HEALTH_CHECK]: {
      label: 'Health Check',
      icon: 'shield-check',
      description: 'Overall system status and KPIs',
      color: 'text-green-600',
      shortLabel: 'Health'
    },
    [VIEW_MODES.LIVE_MONITORING]: {
      label: 'Live Monitoring', 
      icon: 'activity',
      description: 'Real-time operational data',
      color: 'text-blue-600',
      shortLabel: 'Live'
    },
    [VIEW_MODES.ANALYSIS]: {
      label: 'Analysis',
      icon: 'trending-up',
      description: 'Deep dive analysis and trends',
      color: 'text-purple-600', 
      shortLabel: 'Analysis'
    },
    [VIEW_MODES.HISTORICAL]: {
      label: 'Historical',
      icon: 'clock',
      description: 'Historical patterns and reports',
      color: 'text-orange-600',
      shortLabel: 'History'
    }
  }

  const getIcon = (iconName: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      'shield-check': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'activity': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      'trending-up': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'clock': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return icons[iconName] || null
  }

  // Calculate notification counts for each mode
  const getNotificationCount = (mode: ViewMode): number => {
    switch (mode) {
      case VIEW_MODES.HEALTH_CHECK:
        return alerts.filter(a => a.level === 'critical' || a.level === 'error').length
      case VIEW_MODES.LIVE_MONITORING:
        return alerts.filter(a => a.type === 'realtime').length
      case VIEW_MODES.ANALYSIS:
        return chartSuggestions.filter(s => s.priority === 'high').length
      case VIEW_MODES.HISTORICAL:
        return 0
      default:
        return 0
    }
  }

  if (compact) {
    return (
      <div className={cn("flex rounded-lg bg-muted p-1", className)}>
        {Object.entries(VIEW_MODES).map(([key, mode]) => {
          const config = viewModeConfig[mode]
          const notificationCount = getNotificationCount(mode)
          const isActive = viewMode === mode

          return (
            <Button
              key={mode}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className={cn(
                "relative flex items-center gap-2 transition-all",
                isActive && "shadow-sm"
              )}
            >
              <div className={cn("flex items-center", config.color)}>
                {getIcon(config.icon)}
              </div>
              <span className="hidden sm:inline">{config.shortLabel}</span>
              
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground mb-3">View Mode</div>
      
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(VIEW_MODES).map(([key, mode]) => {
          const config = viewModeConfig[mode]
          const notificationCount = getNotificationCount(mode)
          const isActive = viewMode === mode

          return (
            <Button
              key={mode}
              variant={isActive ? "default" : "outline"}
              onClick={() => setViewMode(mode)}
              className={cn(
                "h-auto p-4 justify-start relative group",
                isActive && "ring-2 ring-ring ring-offset-2"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
                  {getIcon(config.icon)}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {config.description}
                  </div>
                </div>

                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </div>
            </Button>
          )
        })}
      </div>

      {/* Active Mode Info */}
      {viewMode && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className={viewModeConfig[viewMode].color}>
              {getIcon(viewModeConfig[viewMode].icon)}
            </div>
            <span className="font-medium text-sm">
              {viewModeConfig[viewMode].label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {viewModeConfig[viewMode].description}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Quick mode toggle buttons for mobile/compact interfaces
 */
export function QuickModeToggle({ className }: { className?: string }) {
  const { viewMode, setViewMode } = useDashboard()

  const quickModes = [
    { mode: VIEW_MODES.HEALTH_CHECK, icon: '🛡️', label: 'Health' },
    { mode: VIEW_MODES.LIVE_MONITORING, icon: '📊', label: 'Live' },
    { mode: VIEW_MODES.ANALYSIS, icon: '🔍', label: 'Analysis' },
    { mode: VIEW_MODES.HISTORICAL, icon: '📈', label: 'History' }
  ]

  return (
    <div className={cn("flex gap-1", className)}>
      {quickModes.map(({ mode, icon, label }) => (
        <Button
          key={mode}
          variant={viewMode === mode ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode(mode)}
          className="flex flex-col h-auto py-2 px-3"
        >
          <span className="text-lg">{icon}</span>
          <span className="text-xs mt-1">{label}</span>
        </Button>
      ))}
    </div>
  )
}