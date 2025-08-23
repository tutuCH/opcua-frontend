import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { AlertTriangle, Clock, Wrench, Activity, Zap } from 'lucide-react'

// Generate timeline data for 24 hours
const generateTimelineData = () => {
  const data = []
  const baseTime = new Date()
  baseTime.setHours(0, 0, 0, 0)
  
  // Operation states
  const states = []
  let currentState = 'Running'
  let stateStart = 0
  
  for (let i = 0; i <= 288; i++) { // 5-minute intervals
    if (Math.random() < 0.02) { // State change probability
      states.push({
        state: currentState,
        start: stateStart,
        end: i,
        duration: i - stateStart
      })
      currentState = ['Running', 'Idle', 'Alarm', 'Maintenance'][Math.floor(Math.random() * 4)]
      stateStart = i
    }
  }
  
  // Alarms
  const alarms = []
  for (let i = 0; i < 8; i++) {
    const time = Math.floor(Math.random() * 288)
    alarms.push({
      time,
      type: ['Temperature', 'Pressure', 'Safety', 'Quality'][Math.floor(Math.random() * 4)],
      severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      message: 'System alert detected'
    })
  }
  
  // Condition changes
  const conditionChanges = [
    { time: 72, condition: 'High Speed Cycle', user: 'John Smith' },
    { time: 144, condition: 'Standard Cycle', user: 'Maria Garcia' },
    { time: 216, condition: 'Night Mode', user: 'David Chen' }
  ]
  
  // Downtime events
  const downtimes = [
    { start: 45, end: 52, reason: 'Mold Change', category: 'Planned' },
    { start: 123, end: 128, reason: 'Material Loading', category: 'Planned' },
    { start: 189, end: 195, reason: 'Hydraulic Issue', category: 'Unplanned' },
    { start: 234, end: 241, reason: 'Quality Check', category: 'Planned' }
  ]
  
  return { states, alarms, conditionChanges, downtimes }
}

const timelineData = generateTimelineData()

const stateColors = {
  Running: 'bg-teal-600',
  Idle: 'bg-slate-500',
  Alarm: 'bg-red-600',
  Maintenance: 'bg-amber-500'
}

const alarmColors = {
  Low: 'text-green-600',
  Medium: 'text-amber-600',
  High: 'text-red-600'
}

export function TimelineView() {
  const formatTime = (interval: number) => {
    const minutes = interval * 5
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Summary Timeline - 24 Hour Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Jump to Now</Button>
                <Button variant="outline" size="sm">Export Timeline</Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-600 rounded"></div>
                <span>Running</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-500 rounded"></div>
                <span>Idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span>Alarm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Lanes */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Time Scale */}
              <div className="relative">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
                <div className="h-1 bg-muted rounded-full relative">
                  <div className="absolute top-0 left-0 w-1 h-1 bg-primary rounded-full"></div>
                  <div className="absolute top-0 left-1/4 w-1 h-1 bg-primary rounded-full"></div>
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full"></div>
                  <div className="absolute top-0 left-3/4 w-1 h-1 bg-primary rounded-full"></div>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-primary rounded-full"></div>
                </div>
              </div>

              {/* Operation State Lane */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Operation State</span>
                </div>
                <div className="h-8 bg-muted rounded-lg relative overflow-hidden">
                  {/* Render state blocks */}
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 bg-teal-600 opacity-80"></div>
                    <div className="w-8 bg-slate-500 opacity-80"></div>
                    <div className="flex-1 bg-teal-600 opacity-80"></div>
                    <div className="w-12 bg-red-600 opacity-80"></div>
                    <div className="flex-1 bg-teal-600 opacity-80"></div>
                    <div className="w-16 bg-amber-500 opacity-80"></div>
                    <div className="flex-1 bg-teal-600 opacity-80"></div>
                  </div>
                  
                  {/* State labels */}
                  <div className="absolute inset-0 flex items-center justify-start pl-2 text-xs text-white font-medium">
                    Running
                  </div>
                </div>
              </div>

              {/* Alarms Lane */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Alarms</span>
                  <Badge variant="destructive" className="text-xs">
                    {timelineData.alarms.length} active
                  </Badge>
                </div>
                <div className="h-8 bg-muted rounded-lg relative">
                  {timelineData.alarms.map((alarm, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-1 w-2 h-6 rounded-sm ${
                            alarm.severity === 'High' ? 'bg-red-600' :
                            alarm.severity === 'Medium' ? 'bg-amber-600' : 'bg-green-600'
                          }`}
                          style={{ left: `${(alarm.time / 288) * 100}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{alarm.type} Alarm</p>
                          <p>Time: {formatTime(alarm.time)}</p>
                          <p>Severity: {alarm.severity}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Condition Changes Lane */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Condition Changes</span>
                </div>
                <div className="h-8 bg-muted rounded-lg relative">
                  {timelineData.conditionChanges.map((change, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute top-0 w-0.5 h-8 bg-blue-600"
                          style={{ left: `${(change.time / 288) * 100}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{change.condition}</p>
                          <p>Time: {formatTime(change.time)}</p>
                          <p>User: {change.user}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Downtime Lane */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4" />
                  <span className="text-sm font-medium">Downtime Events</span>
                </div>
                <div className="h-8 bg-muted rounded-lg relative">
                  {timelineData.downtimes.map((downtime, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-1 h-6 rounded-sm ${
                            downtime.category === 'Planned' ? 'bg-blue-600' : 'bg-red-600'
                          }`}
                          style={{ 
                            left: `${(downtime.start / 288) * 100}%`,
                            width: `${((downtime.end - downtime.start) / 288) * 100}%`
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{downtime.reason}</p>
                          <p>Category: {downtime.category}</p>
                          <p>Duration: {(downtime.end - downtime.start) * 5}min</p>
                          <p>Start: {formatTime(downtime.start)}</p>
                          <p>End: {formatTime(downtime.end)}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Quality KPI Mini-line */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <span className="text-sm font-medium">Quality Rate</span>
                  <Badge variant="outline" className="text-xs">97.8% avg</Badge>
                </div>
                <div className="h-8 bg-muted rounded-lg relative overflow-hidden">
                  {/* Simple quality trend visualization */}
                  <svg className="absolute inset-0 w-full h-full">
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      points="0,20 50,15 100,18 150,12 200,16 250,14 300,20 350,18 400,16"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini-map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">24-Hour Mini-Map</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="h-16 bg-muted rounded-lg relative overflow-hidden">
              {/* Compressed timeline view */}
              <div className="absolute inset-0 opacity-60">
                <div className="h-full flex">
                  <div className="flex-1 bg-teal-600"></div>
                  <div className="w-2 bg-slate-500"></div>
                  <div className="flex-1 bg-teal-600"></div>
                  <div className="w-3 bg-red-600"></div>
                  <div className="flex-1 bg-teal-600"></div>
                  <div className="w-4 bg-amber-500"></div>
                  <div className="flex-1 bg-teal-600"></div>
                </div>
              </div>
              
              {/* Current view indicator */}
              <div className="absolute top-0 left-1/4 w-1/2 h-full border-2 border-blue-600 bg-blue-600 bg-opacity-10 rounded">
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>00:00</span>
              <span>Current View: 06:00 - 18:00</span>
              <span>24:00</span>
            </div>
          </CardContent>
        </Card>

        {/* Event Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Running Time</p>
                <p className="text-2xl font-bold text-teal-600">18.2h</p>
                <p className="text-xs text-muted-foreground">75.8% of day</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Alarms</p>
                <p className="text-2xl font-bold text-red-600">{timelineData.alarms.length}</p>
                <p className="text-xs text-muted-foreground">
                  {timelineData.alarms.filter(a => a.severity === 'High').length} critical
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Downtime Events</p>
                <p className="text-2xl font-bold text-amber-600">{timelineData.downtimes.length}</p>
                <p className="text-xs text-muted-foreground">
                  {timelineData.downtimes.filter(d => d.category === 'Planned').length} planned
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Condition Changes</p>
                <p className="text-2xl font-bold text-blue-600">{timelineData.conditionChanges.length}</p>
                <p className="text-xs text-muted-foreground">Process adjustments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}