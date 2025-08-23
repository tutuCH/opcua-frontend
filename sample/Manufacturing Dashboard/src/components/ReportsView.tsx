import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Calendar, 
  Download, 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

// Mock report data
const generateReportData = (period: 'daily' | 'weekly' | 'monthly') => {
  const data = []
  const count = period === 'daily' ? 30 : period === 'weekly' ? 12 : 6
  
  for (let i = 0; i < count; i++) {
    const date = new Date()
    if (period === 'daily') {
      date.setDate(date.getDate() - i)
    } else if (period === 'weekly') {
      date.setDate(date.getDate() - i * 7)
    } else {
      date.setMonth(date.getMonth() - i)
    }
    
    const baseShots = period === 'daily' ? 800 + Math.random() * 400 : 
                     period === 'weekly' ? 5000 + Math.random() * 2000 : 
                     20000 + Math.random() * 8000
    
    const machines = ['M001', 'M002', 'M003', 'M004', 'M005', 'M006']
    const molds = ['M-2024-001', 'M-2024-002', 'M-2024-003', 'M-2024-004', 'M-2024-005']
    const conditions = ['High Speed', 'Standard', 'Optimized', 'Low Speed']
    
    machines.forEach(machine => {
      const shots = Math.floor(baseShots + (Math.random() - 0.5) * 200)
      const defects = Math.floor(shots * (0.01 + Math.random() * 0.03))
      const defectRate = ((defects / shots) * 100)
      const utilization = 70 + Math.random() * 25
      const oee = utilization * (0.8 + Math.random() * 0.15)
      const downtime = Math.floor((24 * 60 * (100 - utilization)) / 100)
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateDisplay: date.toLocaleDateString(),
        machine,
        mold: molds[Math.floor(Math.random() * molds.length)],
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        shots,
        defects,
        defectRate: Number(defectRate.toFixed(2)),
        utilization: Number(utilization.toFixed(1)),
        oee: Number(oee.toFixed(1)),
        downtime: downtime,
        sparklineData: Array.from({ length: 7 }, () => ({
          value: defectRate + (Math.random() - 0.5) * 2
        }))
      })
    })
  }
  
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function ReportsView() {
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  
  const reportData = generateReportData(reportPeriod)
  
  // Filter and sort data
  const filteredData = reportData
    .filter(row => 
      row.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.mold.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.condition.toLowerCase().includes(searchTerm.toLowerCase())
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
    shots: filteredData.reduce((sum, row) => sum + row.shots, 0),
    defects: filteredData.reduce((sum, row) => sum + row.defects, 0),
    avgDefectRate: filteredData.reduce((sum, row) => sum + row.defectRate, 0) / filteredData.length,
    avgUtilization: filteredData.reduce((sum, row) => sum + row.utilization, 0) / filteredData.length,
    avgOee: filteredData.reduce((sum, row) => sum + row.oee, 0) / filteredData.length,
    totalDowntime: filteredData.reduce((sum, row) => sum + row.downtime, 0)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Reports</CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
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
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search machines, molds, conditions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Shots</p>
              <p className="text-2xl font-bold">{totals.shots.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Defects</p>
              <p className="text-2xl font-bold text-red-600">{totals.defects.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Avg Defect Rate</p>
              <p className="text-2xl font-bold">{totals.avgDefectRate.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
              <p className="text-2xl font-bold">{totals.avgUtilization.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Avg OEE</p>
              <p className="text-2xl font-bold">{totals.avgOee.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Report Data
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('machine')}
                  >
                    Machine {sortField === 'machine' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Mold</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('shots')}
                  >
                    Shots {sortField === 'shots' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('defects')}
                  >
                    Defects {sortField === 'defects' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('defectRate')}
                  >
                    Defect Rate {sortField === 'defectRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('utilization')}
                  >
                    Utilization {sortField === 'utilization' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('oee')}
                  >
                    OEE {sortField === 'oee' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('downtime')}
                  >
                    Downtime {sortField === 'downtime' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 20).map((row, index) => (
                  <TableRow key={`${row.machine}-${row.date}`} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>{row.dateDisplay}</TableCell>
                    <TableCell className="font-medium">{row.machine}</TableCell>
                    <TableCell>{row.mold}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.condition}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{row.shots.toLocaleString()}</span>
                        <div className="w-12 h-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ value: row.shots }]}>
                              <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{row.defects}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span 
                          className={row.defectRate > 3 ? 'text-red-600' : row.defectRate > 2 ? 'text-amber-600' : ''}
                        >
                          {row.defectRate}%
                        </span>
                        <div className="w-12 h-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={row.sparklineData}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={row.defectRate > 3 ? "#dc2626" : "#3b82f6"} 
                                strokeWidth={1}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={row.utilization < 70 ? 'text-amber-600' : ''}>{row.utilization}%</span>
                        <Progress value={row.utilization} className="w-12 h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{row.oee}%</TableCell>
                    <TableCell className="text-right">{Math.floor(row.downtime / 60)}h {row.downtime % 60}m</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredData.length > 20 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm">Previous</Button>
              <span className="text-sm text-muted-foreground">
                Showing 1-20 of {filteredData.length} entries
              </span>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
              <p className="text-lg font-bold">{filteredData.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Shots</p>
              <p className="text-lg font-bold">{totals.shots.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Defect Rate</p>
              <p className="text-lg font-bold">{totals.avgDefectRate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
              <p className="text-lg font-bold">{totals.avgUtilization.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Downtime</p>
              <p className="text-lg font-bold">{Math.floor(totals.totalDowntime / 60)}h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}