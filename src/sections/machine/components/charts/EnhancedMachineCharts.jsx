"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"

// Import chart components
import { 
  processOPCUAData, 
  filterDataByTimeRange, 
  filterDataByMachine,
  getUniqueMachineIds 
} from 'src/utils/chartDataProcessors'
import elinkSampleData from 'src/_mock/elink_full_samples.json'
import ChartToolbar from './common/ChartToolbar'
import TemperatureChart from './realtime/TemperatureChart'
import ProcessParametersChart from './realtime/ProcessParametersChart'
import ProductionMetricsChart from './realtime/ProductionMetricsChart'
import TrendAnalysisChart from './analysis/TrendAnalysisChart'
import CorrelationChart from './analysis/CorrelationChart'
import OEEChart from './analysis/OEEChart'
import TimelineChart from './timeline/TimelineChart'
import UtilizationChart from './analysis/UtilizationChart'
import DowntimeChart from './analysis/DowntimeChart'

// Import data processing utilities

// Import sample data

export default function EnhancedMachineCharts() {
  // State management
  const [timeRange, setTimeRange] = useState("24h")
  const [selectedMachine, setSelectedMachine] = useState("all")
  const [selectedParameter, setSelectedParameter] = useState("ECYCT")
  const [activeTab, setActiveTab] = useState("realtime")

  // Process and filter data
  const processedData = useMemo(() => {
    const processed = processOPCUAData(elinkSampleData)
    let filtered = filterDataByTimeRange(processed, timeRange)
    filtered = filterDataByMachine(filtered, selectedMachine)
    return filtered
  }, [timeRange, selectedMachine])

  // Get available machines
  const availableMachines = useMemo(() => getUniqueMachineIds(processOPCUAData(elinkSampleData)), [])

  // Available parameters for analysis
  const availableParameters = [
    { value: "ECYCT", label: "Cycle Time" },
    { value: "EIPM", label: "Injection Pressure" },
    { value: "EISS", label: "Injection Speed" },
    { value: "EIVM", label: "Injection Volume" },
    { value: "totalTemperature", label: "Average Temperature" },
    { value: "processEfficiency", label: "Process Efficiency" }
  ]

  return (
    <div className="space-y-6">
      {/* Global Chart Toolbar */}
      <ChartToolbar
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        selectedMachine={selectedMachine}
        onMachineChange={setSelectedMachine}
        availableMachines={availableMachines}
        selectedParameter={selectedParameter}
        onParameterChange={setSelectedParameter}
        availableParameters={availableParameters}
      />

      {/* Chart Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TemperatureChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
            <ProcessParametersChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
              selectedParameter={selectedParameter}
            />
          </div>
          <div className="grid grid-cols-1">
            <ProductionMetricsChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendAnalysisChart 
              data={processedData}
              parameter={selectedParameter}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
            <CorrelationChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OEEChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
            <UtilizationChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
          </div>
          <div className="grid grid-cols-1">
            <DowntimeChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="grid grid-cols-1">
            <TimelineChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Current period summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data Points</span>
                    <span className="font-medium">{processedData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Range</span>
                    <span className="font-medium">{timeRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Machine</span>
                    <span className="font-medium">{selectedMachine === 'all' ? 'All Machines' : selectedMachine}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mini Temperature Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Temperature Overview</CardTitle>
                <CardDescription>Temperature zones T1-T10</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <TemperatureChart 
                  data={processedData}
                  timeRange={timeRange}
                  selectedMachine={selectedMachine}
                  compact
                />
              </CardContent>
            </Card>

            {/* Mini OEE Chart */}
            <Card>
              <CardHeader>
                <CardTitle>OEE Overview</CardTitle>
                <CardDescription>Overall Equipment Effectiveness</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <OEEChart 
                  data={processedData}
                  timeRange={timeRange}
                  selectedMachine={selectedMachine}
                  compact
                />
              </CardContent>
            </Card>
          </div>

          {/* Full-width charts */}
          <div className="grid grid-cols-1 gap-6">
            <ProcessParametersChart 
              data={processedData}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
              selectedParameter={selectedParameter}
            />
            <TrendAnalysisChart 
              data={processedData}
              parameter={selectedParameter}
              timeRange={timeRange}
              selectedMachine={selectedMachine}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}