import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Filter,
  Search,
  BarChart3,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { getMachineDataService, MachineSPCData, WebSocketEventData } from '@/services/websocketService'
import { getFactoriesMachinesByUserId } from '@/api/machinesServices'
import { useWebSocket } from '@/hooks/useWebSocket'

interface SPCDataPoint {
  result: string
  table: number
  _start: string
  _stop: string
  _time: string
  _measurement: string
  application: string
  device_id: string
  topic: string
  cycle_number: number
  cycle_time: number
  injection_pressure_max: number
  injection_time: number
  injection_velocity_max: number
  plasticizing_pressure_max: number
  plasticizing_time: number
  switch_pack_position: number
  switch_pack_pressure: number
  switch_pack_time: number
  temp_1: number
  temp_2: number
  temp_3: number
  temp_4: number
  temp_5: number
  temp_6: number
  temp_7: number
  temp_8: number
  temp_9: number
  temp_10: number
}

interface ReportRow {
  date: string
  dateDisplay: string
  time: string
  machineId: string
  machineName: string
  cycleNumber: number
  cycleTime: number
  injectionPressureMax: number
  injectionTime: number
  injectionVelocityMax: number
  plasticizingPressureMax: number
  plasticizingTime: number
  switchPackPosition: number
  switchPackPressure: number
  switchPackTime: number
  avgTemp: number
}

export function ReportsView() {
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [reportData, setReportData] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [machines, setMachines] = useState<Array<{ machineId: number; machineName: string }>>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  // Helper function to transform SPC data to ReportRow
  const transformSPCToReportRow = useCallback((spcData: MachineSPCData, machineId: string, machineName: string): ReportRow => {
    const timestamp = new Date(spcData.time || spcData.sendTime || Date.now())
    const data = spcData.Data

    // Calculate average temperature from ET1-ET10
    const temps = [
      data.ET1, data.ET2, data.ET3, data.ET4, data.ET5,
      data.ET6, data.ET7, data.ET8, data.ET9, data.ET10
    ].filter(t => t && Number(t) > 0).map(t => Number(t))
    const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0

    return {
      date: timestamp.toISOString().split('T')[0],
      dateDisplay: timestamp.toLocaleDateString(),
      time: timestamp.toLocaleTimeString(),
      machineId,
      machineName,
      cycleNumber: Number(data.CYCN) || 0,
      cycleTime: Number(data.ECYCT) || 0,
      injectionPressureMax: Number(data.EIPM) || 0,
      injectionTime: Number(data.EIPT) || 0,
      injectionVelocityMax: Number(data.EIVM) || 0,
      plasticizingPressureMax: Number(data.EPLSPM) || 0,
      plasticizingTime: Number(data.EPLST) || 0,
      switchPackPosition: Number(data.ESIPP) || 0,
      switchPackPressure: Number(data.ESIPS) || 0,
      switchPackTime: Number(data.ESIPT) || 0,
      avgTemp: Number(avgTemp.toFixed(1))
    }
  }, [])

  // WebSocket subscription for real-time SPC updates
  const { isConnected } = useWebSocket({
    autoConnect: true,
    onSPCUpdate: useCallback((data: WebSocketEventData) => {
      // Find the machine this update belongs to
      const machine = machines.find(m => String(m.machineId) === String(data.deviceId))

      if (machine && data.data) {
        const spcData = data.data as MachineSPCData

        // Only add if it has valid cycle data
        if (spcData.Data && spcData.Data.CYCN) {
          const newRow = transformSPCToReportRow(spcData, String(machine.machineId), machine.machineName)

          setReportData(prev => {
            // Remove duplicate cycle numbers (keep newest)
            const filtered = prev.filter(row =>
              !(row.machineId === newRow.machineId && row.cycleNumber === newRow.cycleNumber)
            )
            // Prepend new data (newest first)
            return [newRow, ...filtered]
          })

          // Auto-scroll to page 1 to show latest data
          setCurrentPage(1)
        }
      }
    }, [machines, transformSPCToReportRow])
  })

  // Fetch machines on mount
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await getFactoriesMachinesByUserId()
        const allMachines: Array<{ machineId: number; machineName: string }> = []

        // The API returns an array of factories directly (not wrapped in a 'factories' property)
        const factories = Array.isArray(response) ? response : response.factories || []

        factories.forEach((factory: any) => {
          if (factory.machines && Array.isArray(factory.machines)) {
            factory.machines.forEach((m: any) => {
              allMachines.push({
                machineId: m.machineId,
                machineName: m.machineName
              })
            })
          }
        })
        setMachines(allMachines)
      } catch (err) {
        console.error('Error fetching machines:', err)
        setError('Failed to load machines')
      }
    }
    fetchMachines()
  }, [])

  // Fetch SPC data
  useEffect(() => {
    const fetchData = async () => {
      if (machines.length === 0) return

      setLoading(true)
      setError(null)

      try {
        const wsService = getMachineDataService()

        // Set auth token
        const token = localStorage.getItem('access_token')
        if (token) {
          wsService.setAuthToken(token)
        }

        // Determine time range based on period
        const timeRange = reportPeriod === 'daily' ? '-24h' :
                         reportPeriod === 'weekly' ? '-7d' :
                         '-30d'

        // Fetch data for all machines
        const allData: ReportRow[] = []

        for (const machine of machines) {
          try {
            const response = await wsService.getSPCHistory(String(machine.machineId), {
              timeRange,
              limit: 1000
            })

            if (response?.data && Array.isArray(response.data)) {
              const machineData: ReportRow[] = response.data.map((point: SPCDataPoint) => {
                const timestamp = new Date(point._time)
                const temps = [
                  point.temp_1, point.temp_2, point.temp_3, point.temp_4, point.temp_5,
                  point.temp_6, point.temp_7, point.temp_8, point.temp_9, point.temp_10
                ].filter(t => t > 0)
                const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0

                return {
                  date: timestamp.toISOString().split('T')[0],
                  dateDisplay: timestamp.toLocaleDateString(),
                  time: timestamp.toLocaleTimeString(),
                  machineId: String(machine.machineId),
                  machineName: machine.machineName,
                  cycleNumber: point.cycle_number,
                  cycleTime: point.cycle_time,
                  injectionPressureMax: point.injection_pressure_max,
                  injectionTime: point.injection_time,
                  injectionVelocityMax: point.injection_velocity_max,
                  plasticizingPressureMax: point.plasticizing_pressure_max,
                  plasticizingTime: point.plasticizing_time,
                  switchPackPosition: point.switch_pack_position,
                  switchPackPressure: point.switch_pack_pressure,
                  switchPackTime: point.switch_pack_time,
                  avgTemp: Number(avgTemp.toFixed(1))
                }
              })

              allData.push(...machineData)
            }
          } catch (err) {
            console.error(`Error fetching data for machine ${machine.machineId}:`, err)
          }
        }

        setReportData(allData)
      } catch (err) {
        console.error('Error fetching report data:', err)
        setError('Failed to load report data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [reportPeriod, machines])
  
  // Filter and sort data
  const filteredData = reportData
    .filter(row =>
      row.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(row.cycleNumber).includes(searchTerm)
    )
    .sort((a, b) => {
      const aVal = a[sortField as keyof typeof a]
      const bVal = b[sortField as keyof typeof b]
      const direction = sortDirection === 'asc' ? 1 : -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * direction
      }
      return ((aVal as number) - (bVal as number)) * direction
    })

  // Calculate totals and averages
  const totals = {
    totalCycles: filteredData.length,
    avgCycleTime: filteredData.length > 0 ? filteredData.reduce((sum, row) => sum + row.cycleTime, 0) / filteredData.length : 0,
    avgInjectionPressure: filteredData.length > 0 ? filteredData.reduce((sum, row) => sum + row.injectionPressureMax, 0) / filteredData.length : 0,
    avgInjectionVelocity: filteredData.length > 0 ? filteredData.reduce((sum, row) => sum + row.injectionVelocityMax, 0) / filteredData.length : 0,
    avgTemp: filteredData.length > 0 ? filteredData.reduce((sum, row) => sum + row.avgTemp, 0) / filteredData.length : 0,
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredData.length)
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to page 1 when filters/sort/period changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortField, sortDirection, reportPeriod])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Production Reports - SPC Data</CardTitle>
              <Badge
                variant={isConnected ? "default" : "secondary"}
                className={isConnected ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isConnected ? "● Live Updates" : "○ Historical Only"}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4">
            <Tabs value={reportPeriod} onValueChange={(value) => setReportPeriod(value as any)}>
              <TabsList>
                <TabsTrigger value="daily">Last 24 Hours</TabsTrigger>
                <TabsTrigger value="weekly">Last 7 Days</TabsTrigger>
                <TabsTrigger value="monthly">Last 30 Days</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search machines, cycle numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading production data...</p>
          </CardContent>
        </Card>
      )}

      {/* Summary KPIs */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Cycles</p>
                <p className="text-2xl font-bold">{totals.totalCycles.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{totals.avgCycleTime.toFixed(1)}s</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Avg Injection Pressure</p>
                <p className="text-2xl font-bold">{totals.avgInjectionPressure.toFixed(1)} bar</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Avg Injection Velocity</p>
                <p className="text-2xl font-bold">{totals.avgInjectionVelocity.toFixed(1)} mm/s</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">{totals.avgTemp.toFixed(1)}°C</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              SPC Production Data ({filteredData.length} cycles)
            </CardTitle>
          </CardHeader>

          <CardContent>
            {filteredData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No production data available for the selected period.
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('date')}
                        >
                          Date/Time {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('machineName')}
                        >
                          Machine {sortField === 'machineName' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('cycleNumber')}
                        >
                          Cycle # {sortField === 'cycleNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('cycleTime')}
                        >
                          Cycle Time (s) {sortField === 'cycleTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('injectionPressureMax')}
                        >
                          Inj. Press. (bar) {sortField === 'injectionPressureMax' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('injectionVelocityMax')}
                        >
                          Inj. Vel. (mm/s) {sortField === 'injectionVelocityMax' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('plasticizingPressureMax')}
                        >
                          Plast. Press. (bar) {sortField === 'plasticizingPressureMax' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('switchPackPressure')}
                        >
                          Switch Press. (bar) {sortField === 'switchPackPressure' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('avgTemp')}
                        >
                          Avg Temp (°C) {sortField === 'avgTemp' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((row) => (
                        <TableRow key={`${row.machineId}-${row.cycleNumber}-${row.date}-${row.time}`} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{row.dateDisplay}</div>
                              <div className="text-muted-foreground">{row.time}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{row.machineName}</TableCell>
                          <TableCell className="text-right">{row.cycleNumber}</TableCell>
                          <TableCell className="text-right">
                            <span className={row.cycleTime > 40 ? 'text-amber-600' : ''}>{row.cycleTime.toFixed(1)}</span>
                          </TableCell>
                          <TableCell className="text-right">{row.injectionPressureMax.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{row.injectionVelocityMax.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{row.plasticizingPressureMax.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{row.switchPackPressure.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{row.avgTemp.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredData.length > pageSize && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{endIndex} of {filteredData.length} cycles
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Footer */}
      {!loading && filteredData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cycles</p>
                <p className="text-lg font-bold">{filteredData.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Cycle Time</p>
                <p className="text-lg font-bold">{totals.avgCycleTime.toFixed(1)}s</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Injection Pressure</p>
                <p className="text-lg font-bold">{totals.avgInjectionPressure.toFixed(1)} bar</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Injection Velocity</p>
                <p className="text-lg font-bold">{totals.avgInjectionVelocity.toFixed(1)} mm/s</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
                <p className="text-lg font-bold">{totals.avgTemp.toFixed(1)}°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}