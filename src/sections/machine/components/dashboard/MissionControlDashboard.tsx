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
import type { ProcessedDataPoint } from "src/types/dashboard"
import { useWebSocketContext } from "@/contexts/WebSocketContext"
import type { WebSocketEventData, MachineRealtimeData, MachineSPCData } from "@/services/websocketService"
import { useDashboard } from "./DashboardContext"

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
  const { selectedMachine } = useDashboard()

  // Maintain a rolling buffer of raw entries built from WebSocket events
  type RawEntry = {
    devId: string
    topic: string
    sendTime: string
    sendStamp: number
    time: string
    timestamp: number
    Data: Record<string, any>
  }

  const [rawEntries, setRawEntries] = React.useState<RawEntry[]>([])

  // Convert WebSocket context data to raw entries format
  React.useEffect(() => {
    const newEntries: RawEntry[] = []

    // Process realtime data
    realtimeData.forEach((evt) => {
      const payload = evt.data as MachineRealtimeData
      if (payload?.Data) {
        newEntries.push({
          devId: evt.deviceId || payload.devId,
          topic: payload.topic || "realtime",
          sendTime: payload.sendTime,
          sendStamp: payload.sendStamp,
          time: payload.time,
          timestamp: typeof payload.timestamp === "number" ? payload.timestamp : Date.now(),
          Data: { ...payload.Data }
        })
      }
    })

    // Process SPC data
    spcData.forEach((evt) => {
      const payload = evt.data as MachineSPCData
      if (payload?.Data) {
        newEntries.push({
          devId: evt.deviceId || payload.devId,
          topic: payload.topic || "spc",
          sendTime: payload.sendTime,
          sendStamp: payload.sendStamp,
          time: payload.time,
          timestamp: typeof payload.timestamp === "number" ? payload.timestamp : Date.now(),
          Data: { ...payload.Data }
        })
      }
    })

    // Sort by timestamp and keep last 1000 points
    newEntries.sort((a, b) => a.timestamp - b.timestamp)
    setRawEntries(newEntries.slice(-1000))
  }, [realtimeData, spcData, realtimeUpdateCount, spcUpdateCount])

  // WebSocket integration: use centralized context
  const {
    isConnected,
    subscribeToMachine,
    unsubscribeFromMachine,
    realtimeData,
    spcData,
    realtimeUpdateCount,
    spcUpdateCount
  } = useWebSocketContext()

  // Manage subscription based on selected machine
  React.useEffect(() => {
    if (!isConnected) return
    if (selectedMachine && selectedMachine !== 'all') {
      subscribeToMachine(selectedMachine)
      return () => {
        unsubscribeFromMachine(selectedMachine)
      }
    }
    return
  }, [isConnected, selectedMachine, subscribeToMachine, unsubscribeFromMachine])
  
  // Process sample data or provided data
  const processedData = React.useMemo((): ProcessedDataPoint[] => {
    // Prefer external data prop if provided; otherwise use live WebSocket buffer
    const sourceData = (data as any[] | undefined) || rawEntries
    return processOPCUAData(sourceData)
  }, [data, rawEntries])

  // Optionally filter by selected machine when not "all"
  const displayData = React.useMemo(() => {
    if (!processedData.length) return processedData
    return selectedMachine && selectedMachine !== 'all'
      ? filterDataByMachine(processedData, selectedMachine)
      : processedData
  }, [processedData, selectedMachine])

  return (
    <div className={className}>
      <MissionControlLayout
        {...layoutConfig}
        statusBar={
          <StatusBar 
            data={displayData}
            showMachineSelector={true}
            showViewMode={true}
          />
        }
        leftPanel={
          <LeftContextPanel data={displayData} />
        }
        rightPanel={
          <RightInsightsPanel data={displayData} />
        }
        timelinePanel={
          <TimelinePanel data={displayData} />
        }
      >
        {/* Main Chart Display Area */}
        <div className="space-y-6">
          {/* Chart Focus Selector */}
          <ChartFocusSelector className="mb-4" />
          
          {/* Contextual Chart Router */}
          <ContextualChartRouter 
            data={displayData}
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
