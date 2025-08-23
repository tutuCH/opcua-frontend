"use client"

import * as React from "react"
import { DashboardProvider } from "./DashboardContext"
import MissionControlLayout, { useResponsiveLayout } from "./MissionControlLayout"
import StatusBar from "./StatusBar"
import ContextualChartRouter, { ChartFocusSelector } from "./ContextualChartRouter"
import LeftContextPanel from "./LeftContextPanel"
import RightInsightsPanel from "./RightInsightsPanel"
import TimelinePanel from "./TimelinePanel"

// Import data processing utilities
import { 
  processOPCUAData, 
  filterDataByTimeRange, 
  filterDataByMachine 
} from "src/utils/chartDataProcessors"

// Import sample data
import elinkSampleData from "src/_mock/elink_full_samples.json"
import type { ProcessedDataPoint } from "src/types/dashboard"

interface MissionControlDashboardProps {
  // Optional props for customization
  data?: any[]
  className?: string
}

/**
 * Main Mission Control Dashboard - Intelligent, contextual interface
 * for industrial machine monitoring and analysis
 */
function MissionControlDashboardCore({ data, className }: MissionControlDashboardProps) {
  const layoutConfig = useResponsiveLayout()
  
  // Process sample data or provided data
  const processedData = React.useMemo((): ProcessedDataPoint[] => {
    const sourceData = data || elinkSampleData
    return processOPCUAData(sourceData)
  }, [data])

  return (
    <div className={className}>
      <MissionControlLayout
        {...layoutConfig}
        statusBar={
          <StatusBar 
            data={processedData}
            showMachineSelector={true}
            showViewMode={true}
          />
        }
        leftPanel={
          <LeftContextPanel data={processedData} />
        }
        rightPanel={
          <RightInsightsPanel data={processedData} />
        }
        timelinePanel={
          <TimelinePanel data={processedData} />
        }
      >
        {/* Main Chart Display Area */}
        <div className="space-y-6">
          {/* Chart Focus Selector */}
          <ChartFocusSelector className="mb-4" />
          
          {/* Contextual Chart Router */}
          <ContextualChartRouter 
            data={processedData}
            className="w-full"
          />
        </div>
      </MissionControlLayout>
    </div>
  )
}

/**
 * Main export with context provider wrapper
 */
export default function MissionControlDashboard(props: MissionControlDashboardProps) {
  return (
    <DashboardProvider>
      <MissionControlDashboardCore {...props} />
    </DashboardProvider>
  )
}