import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Calendar, Clock, AlertTriangle, CheckCircle, Wrench, User } from 'lucide-react'
import { generateGanttData, formatTime, MACHINE_NAMES } from './utils/ganttData'

// Define status colors locally to avoid import issues
const GANTT_STATUS_COLORS = {
  running: 'bg-teal-600 border-teal-700',
  planned: 'bg-blue-600 border-blue-700',
  blocked: 'bg-red-600 border-red-700',
  maintenance: 'bg-amber-600 border-amber-700'
} as const

const RISK_COLORS = {
  low: 'from-green-500 to-green-600',
  medium: 'from-amber-500 to-amber-600',
  high: 'from-red-500 to-red-600'
} as const

const ganttJobs = generateGanttData()

const GanttJobBlock = ({ job, hourWidth }: { job: any, hourWidth: number }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`absolute h-8 rounded border-2 ${GANTT_STATUS_COLORS[job.status]} 
            ${job.status === 'running' ? 'animate-pulse' : ''}`}
          style={{
            left: `${job.start * hourWidth}px`,
            width: `${job.duration * hourWidth}px`,
            background: `linear-gradient(to right, ${RISK_COLORS[job.risk]})`
          }}
        >
          <div className="p-1 text-xs text-white font-medium truncate">
            {job.name}
          </div>
          {job.progress > 0 && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-50 rounded-b"
              style={{ width: `${job.progress}%` }}
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-1">
          <p className="font-medium">{job.name}</p>
          <p>Product: {job.product}</p>
          <p>Start: {formatTime(job.start)}</p>
          <p>Duration: {job.duration}h</p>
          <p>Operator: {job.operator}</p>
          <p>Progress: {job.progress}%</p>
          {job.constraints.length > 0 && (
            <p>Constraints: {job.constraints.join(', ')}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export function GanttView() {
  const hourWidth = 40
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Equipment Gantt Chart</CardTitle>
              <div className="flex items-center gap-3">
                <Select defaultValue="1d">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8h">8 Hours</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  What-if Mode
                </Button>
                <Button variant="outline" size="sm">Export Schedule</Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-600 rounded border border-teal-700"></div>
                <span>Running</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded border border-blue-700"></div>
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded border border-red-700"></div>
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-600 rounded border border-amber-700"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gantt Chart */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div style={{ minWidth: `${32 * 8 + 24 * hourWidth}px` }}>
                {/* Time Scale Header */}
                <div className="flex border-b bg-muted/50">
                  <div className="w-32 p-3 border-r font-medium bg-background">Machine</div>
                  <div className="flex">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-r text-center text-xs p-2 bg-background"
                        style={{ width: `${hourWidth}px` }}
                      >
                        {formatTime(hour)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Machine Rows */}
                {MACHINE_NAMES.map((machine) => (
                  <div key={machine} className="flex border-b hover:bg-muted/50">
                    <div className="w-32 p-3 border-r font-medium bg-background flex items-center">
                      <div>
                        <div className="font-medium">{machine}</div>
                        <div className="text-xs text-muted-foreground">Line 1</div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-12" style={{ width: `${24 * hourWidth}px` }}>
                      {/* Time grid */}
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="absolute top-0 bottom-0 border-r border-muted"
                          style={{ left: `${hour * hourWidth}px` }}
                        />
                      ))}
                      
                      {/* Jobs for this machine */}
                      {ganttJobs
                        .filter((job) => job.machine === machine)
                        .map((job) => (
                          <GanttJobBlock key={job.id} job={job} hourWidth={hourWidth} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold text-teal-600">
                  {ganttJobs.filter(j => j.status === 'running').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Planned Jobs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ganttJobs.filter(j => j.status === 'planned').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {ganttJobs.filter(j => j.risk === 'high').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Constraints</p>
                <p className="text-2xl font-bold text-amber-600">
                  {ganttJobs.filter(j => j.constraints.length > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}