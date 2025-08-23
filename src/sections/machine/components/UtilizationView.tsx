import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react'

const utilizationData = [
  { name: 'Running', value: 65, color: '#0ea5a4' },
  { name: 'Idle', value: 20, color: '#64748b' },
  { name: 'Alarm', value: 8, color: '#dc2626' },
  { name: 'Maintenance', value: 7, color: '#f59e0b' }
]

const comparisonData = [
  { period: 'This Week', running: 65, idle: 20, alarm: 8, maintenance: 7 },
  { period: 'Last Week', running: 72, idle: 18, alarm: 5, maintenance: 5 },
  { period: 'This Month', running: 68, idle: 19, alarm: 7, maintenance: 6 },
  { period: 'Last Month', running: 70, idle: 17, alarm: 8, maintenance: 5 }
]

const machineUtilization = [
  { machine: 'M001', utilization: 87, target: 85, status: 'above' },
  { machine: 'M002', utilization: 65, target: 85, status: 'below' },
  { machine: 'M003', utilization: 45, target: 85, status: 'critical' },
  { machine: 'M004', utilization: 0, target: 85, status: 'maintenance' },
  { machine: 'M005', utilization: 92, target: 85, status: 'above' },
  { machine: 'M006', utilization: 78, target: 85, status: 'below' }
]

export function UtilizationView() {
  const totalUtilization = utilizationData.find(d => d.name === 'Running')?.value || 0
  const lastWeekUtilization = comparisonData.find(d => d.period === 'Last Week')?.running || 0
  const utilizationDelta = totalUtilization - lastWeekUtilization

  return (
    <div className="space-y-6">
      {/* Main Utilization KPI */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Equipment Utilization - Selected Window</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Last 24 Hours</Badge>
              <Button variant="outline" size="sm">Compare to Last Week</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main KPI */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="text-6xl font-bold text-primary">{totalUtilization}%</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">vs last week:</span>
                  <div className={`flex items-center gap-1 ${utilizationDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {utilizationDelta >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">{Math.abs(utilizationDelta)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Time breakdown */}
              <div className="mt-6 space-y-2">
                <h4 className="font-medium">Time Breakdown (24h)</h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-teal-600">15h 36m</div>
                    <div className="text-muted-foreground">Running</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-slate-600">4h 48m</div>
                    <div className="text-muted-foreground">Idle</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">1h 55m</div>
                    <div className="text-muted-foreground">Alarm</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-amber-600">1h 41m</div>
                    <div className="text-muted-foreground">Maintenance</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={utilizationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {utilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalUtilization}%</div>
                    <div className="text-sm text-muted-foreground">Overall</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Utilization Trends</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="period" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f9fafb'
                  }}
                />
                <Bar dataKey="running" stackId="a" fill="#0ea5a4" name="Running" />
                <Bar dataKey="idle" stackId="a" fill="#64748b" name="Idle" />
                <Bar dataKey="alarm" stackId="a" fill="#dc2626" name="Alarm" />
                <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Machine-wise Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Machine Performance</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {machineUtilization.map((machine) => (
              <div key={machine.machine} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16">
                  <span className="font-medium">{machine.machine}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Utilization</span>
                    <span className="text-sm font-medium">{machine.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-primary" 
                      style={{ width: `${machine.utilization}%` }}
                    />
                  </div>
                </div>
                
                <div className="w-20 text-center">
                  <div className="text-sm text-muted-foreground">Target</div>
                  <div className="text-sm font-medium">{machine.target}%</div>
                </div>
                
                <div className="w-24">
                  <Badge 
                    variant={
                      machine.status === 'above' ? 'default' :
                      machine.status === 'below' ? 'secondary' :
                      machine.status === 'critical' ? 'destructive' :
                      'outline'
                    }
                  >
                    {machine.status === 'above' ? 'Above Target' :
                     machine.status === 'below' ? 'Below Target' :
                     machine.status === 'critical' ? 'Critical' :
                     'Maintenance'}
                  </Badge>
                </div>
                
                <div className="w-16 text-center">
                  {machine.utilization > machine.target ? (
                    <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                  ) : machine.utilization === 0 ? (
                    <Clock className="h-5 w-5 text-muted-foreground mx-auto" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utilization Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">M005</div>
              <div className="text-sm text-muted-foreground">92% utilization</div>
              <div className="mt-2">
                <Badge variant="default">+7% vs target</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">M003</div>
              <div className="text-sm text-muted-foreground">45% utilization</div>
              <div className="mt-2">
                <Badge variant="destructive">-40% vs target</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg Downtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">35%</div>
              <div className="text-sm text-muted-foreground">Non-productive time</div>
              <div className="mt-2">
                <Badge variant="outline">8h 24m total</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">Address M003 Critical Utilization</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Machine M003 is operating at only 45% utilization. Investigate recurring alarms and schedule maintenance.
                </p>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-amber-600 mt-2"></div>
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">Optimize Idle Time</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Average idle time is 20%. Consider implementing automated material feeding or operator scheduling optimization.
                </p>
              </div>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">Replicate M005 Success</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  M005 is exceeding targets. Document and apply best practices to other machines.
                </p>
              </div>
              <Button variant="outline" size="sm">Copy Setup</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}