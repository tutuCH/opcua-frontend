"use client"

import * as React from "react"
import { cn } from "src/lib/utils"
import type { LayoutPreset } from "src/types/dashboard"

interface MissionControlLayoutProps {
  children?: React.ReactNode
  statusBar?: React.ReactNode
  leftPanel?: React.ReactNode
  rightPanel?: React.ReactNode
  timelinePanel?: React.ReactNode
  className?: string
  leftPanelWidth?: string
  rightPanelWidth?: string
  statusBarHeight?: string
  timelineHeight?: string
  timelineExpanded?: boolean
  expandedTimelineHeight?: string
}

/**
 * Mission Control layout system for industrial dashboard
 * Provides responsive grid layout with contextual panels
 */
export default function MissionControlLayout({
  children,
  statusBar,
  leftPanel,
  rightPanel,
  timelinePanel,
  className,
  leftPanelWidth = "w-64", // 256px
  rightPanelWidth = "w-64", // 256px
  statusBarHeight = "h-32", // 128px
  timelineHeight = "h-24", // 96px
  timelineExpanded = false,
  expandedTimelineHeight = "h-64", // 256px
}: MissionControlLayoutProps) {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = React.useState<boolean>(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = React.useState<boolean>(false)
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  // Responsive behavior
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Auto-collapse panels on mobile
      if (mobile) {
        setIsLeftPanelCollapsed(true)
        setIsRightPanelCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentTimelineHeight = timelineExpanded ? expandedTimelineHeight : timelineHeight

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background overflow-hidden",
      className
    )}>
      {/* Status Bar - Always visible at top */}
      {statusBar && (
        <div className={cn(
          "flex-none border-b border-border bg-card",
          statusBarHeight
        )}>
          {statusBar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Context Panel */}
        {leftPanel && (
          <div className={cn(
            "flex-none border-r border-border bg-card transition-all duration-300 ease-in-out",
            isLeftPanelCollapsed ? "w-12" : leftPanelWidth,
            isMobile && "absolute z-30 h-full shadow-lg"
          )}>
            <div className="h-full flex flex-col">
              {/* Panel Toggle Button */}
              <div className="flex-none p-2 border-b border-border">
                <button
                  onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                  className="w-8 h-8 rounded-md hover:bg-muted transition-colors flex items-center justify-center"
                  aria-label={isLeftPanelCollapsed ? "Expand left panel" : "Collapse left panel"}
                >
                  <svg 
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isLeftPanelCollapsed ? "rotate-180" : ""
                    )} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className={cn(
                "flex-1 overflow-hidden transition-opacity duration-200",
                isLeftPanelCollapsed ? "opacity-0" : "opacity-100"
              )}>
                {!isLeftPanelCollapsed && leftPanel}
              </div>
            </div>
          </div>
        )}

        {/* Main Visualization Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Primary Chart Display */}
          <div className="flex-1 p-4 overflow-auto">
            {children}
          </div>
        </div>

        {/* Right Insights Panel */}
        {rightPanel && (
          <div className={cn(
            "flex-none border-l border-border bg-card transition-all duration-300 ease-in-out",
            isRightPanelCollapsed ? "w-12" : rightPanelWidth,
            isMobile && "absolute right-0 z-30 h-full shadow-lg"
          )}>
            <div className="h-full flex flex-col">
              {/* Panel Toggle Button */}
              <div className="flex-none p-2 border-b border-border">
                <button
                  onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                  className="w-8 h-8 rounded-md hover:bg-muted transition-colors flex items-center justify-center ml-auto"
                  aria-label={isRightPanelCollapsed ? "Expand right panel" : "Collapse right panel"}
                >
                  <svg 
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isRightPanelCollapsed ? "" : "rotate-180"
                    )} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className={cn(
                "flex-1 overflow-hidden transition-opacity duration-200",
                isRightPanelCollapsed ? "opacity-0" : "opacity-100"
              )}>
                {!isRightPanelCollapsed && rightPanel}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Timeline Panel */}
      {timelinePanel && (
        <div className={cn(
          "flex-none border-t border-border bg-card transition-all duration-300 ease-in-out",
          currentTimelineHeight
        )}>
          {timelinePanel}
        </div>
      )}

      {/* Mobile Panel Overlay */}
      {isMobile && (!isLeftPanelCollapsed || !isRightPanelCollapsed) && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => {
            setIsLeftPanelCollapsed(true)
            setIsRightPanelCollapsed(true)
          }}
        />
      )}
    </div>
  )
}

/**
 * Layout preset configurations for different screen sizes
 */
export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  mobile: {
    leftPanelWidth: "w-80",
    rightPanelWidth: "w-80", 
    statusBarHeight: "h-20",
    timelineHeight: "h-16"
  },
  
  tablet: {
    leftPanelWidth: "w-64",
    rightPanelWidth: "w-64",
    statusBarHeight: "h-28", 
    timelineHeight: "h-20"
  },
  
  desktop: {
    leftPanelWidth: "w-64",
    rightPanelWidth: "w-72",
    statusBarHeight: "h-32",
    timelineHeight: "h-24"
  },
  
  ultrawide: {
    leftPanelWidth: "w-80",
    rightPanelWidth: "w-80",
    statusBarHeight: "h-36",
    timelineHeight: "h-28"
  }
}

/**
 * Hook for responsive layout configuration
 */
export function useResponsiveLayout(): LayoutPreset {
  const [layoutConfig, setLayoutConfig] = React.useState<LayoutPreset>(LAYOUT_PRESETS.desktop)

  React.useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setLayoutConfig(LAYOUT_PRESETS.mobile)
      } else if (width < 1024) {
        setLayoutConfig(LAYOUT_PRESETS.tablet)
      } else if (width < 1920) {
        setLayoutConfig(LAYOUT_PRESETS.desktop)
      } else {
        setLayoutConfig(LAYOUT_PRESETS.ultrawide)
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  return layoutConfig
}