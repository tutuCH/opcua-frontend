import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Scatter,
  ScatterChart
} from 'recharts'
import { AlertTriangle, TrendingUp, TrendingDown, Target } from 'lucide-react'

// Mock quality data for 24 hours
const generateQualityData = () => {
  const data = []
  const baseTime = new Date()
  baseTime.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 288; i++) { // 5-minute intervals for 24 hours
    const time = new Date(baseTime.getTime() + i * 5 * 60 * 1000)
    const hour = time.getHours()
    
    // Simulate shift patterns and process variations
    let baseValue = 2.5
    if (hour >= 6 && hour < 14) baseValue = 2.3 // Day shift - better control
    else if (hour >= 14 && hour < 22) baseValue = 2.4 // Evening shift
    else baseValue = 2.6 // Night shift - slightly higher variation
    
    const dimension = baseValue + Math.sin(i / 20) * 0.2 + (Math.random() - 0.5) * 0.3
    const rejectRate = Math.max(0, (dimension - 2.5) * 2 + Math.random() * 0.5)
    const temperature = 180 + Math.sin(i / 30) * 5 + (Math.random() - 0.5) * 2
    
    data.push({
      time: time.toISOString(),
      timeDisplay: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dimension: Number(dimension.toFixed(3)),
      rejectRate: Number(rejectRate.toFixed(2)),
      temperature: Number(temperature.toFixed(1)),
      withinSpec: dimension >= 2.0 && dimension <= 3.0,
      condition: hour < 6 || hour >= 22 ? 'Night Shift' : hour < 14 ? 'Day Shift' : 'Evening Shift',
      mold: 'M-2024-001'
    })
  }
  
  return data
}

const qualityData = generateQualityData()

// Calculate SPC statistics
const dimensions = qualityData.map(d => d.dimension)
const mean = dimensions.reduce((a, b) => a + b, 0) / dimensions.length
const stdDev = Math.sqrt(dimensions.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / dimensions.length)

const spcLimits = {
  target: 2.5,
  upperSpec: 3.0,
  lowerSpec: 2.0,
  ucl: mean + 3 * stdDev,
  lcl: mean - 3 * stdDev,
  upl: mean + 2 * stdDev,
  lpl: mean - 2 * stdDev,
  uwl: mean + stdDev,
  lwl: mean - stdDev
}

const violationCount = qualityData.filter(d => !d.withinSpec).length
const violationPercent = ((violationCount / qualityData.length) * 100).toFixed(1)

export function QualityView() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quality Metrics - 24 Hour View</CardTitle>
            <div className="flex items-center gap-4">
              <Select defaultValue="dimension">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dimension">Dimension (mm)</SelectItem>
                  <SelectItem value="rejectRate">Reject Rate (%)</SelectItem>
                  <SelectItem value="temperature">Temperature (°C)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="5min">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1min">1 min</SelectItem>
                  <SelectItem value="5min">5 min</SelectItem>
                  <SelectItem value="15min">15 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch id="spc-bands" defaultChecked />
              <Label htmlFor="spc-bands">SPC Bands</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="outliers" defaultChecked />
              <Label htmlFor="outliers">Show Outliers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="smoothing" />
              <Label htmlFor="smoothing">Median Smoothing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="regime-markers" defaultChecked />
              <Label htmlFor="regime-markers">Regime Markers</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">{qualityData[qualityData.length - 1]?.dimension} mm</p>
                <p className="text-xs text-muted-foreground">Target: {spcLimits.target} mm</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spec Violations</p>
                <p className="text-2xl font-bold text-red-600">{violationCount}</p>
                <p className="text-xs text-muted-foreground">{violationPercent}% of readings</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Process Capability</p>
                <p className="text-2xl font-bold text-green-600">1.42</p>
                <p className="text-xs text-muted-foreground">Cpk index</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trend</p>
                <p className="text-2xl font-bold text-amber-600">Stable</p>
                <p className="text-xs text-muted-foreground">Last 4 hours</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-amber-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Quality Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dimension Quality Trend</CardTitle>
            {violationCount > 0 && (
              <Badge variant="destructive">
                {violationPercent}% violations
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="timeDisplay" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6b7280"
                  domain={[1.5, 3.5]}
                  tick={{ fontSize: 12 }}
                />
                
                {/* SPC Bands */}
                <ReferenceArea 
                  y1={spcLimits.lowerSpec} 
                  y2={spcLimits.upperSpec} 
                  fill="#10b981" 
                  fillOpacity={0.1} 
                  stroke="none"
                />
                <ReferenceArea 
                  y1={spcLimits.lwl} 
                  y2={spcLimits.uwl} 
                  fill="#3b82f6" 
                  fillOpacity={0.08} 
                  stroke="none"
                />
                <ReferenceArea 
                  y1={spcLimits.lpl} 
                  y2={spcLimits.upl} 
                  fill="#f59e0b" 
                  fillOpacity={0.08} 
                  stroke="none"
                />
                
                {/* Control Lines */}
                <ReferenceLine y={spcLimits.target} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                <ReferenceLine y={spcLimits.upperSpec} stroke="#dc2626" strokeWidth={1} />
                <ReferenceLine y={spcLimits.lowerSpec} stroke="#dc2626" strokeWidth={1} />
                <ReferenceLine y={spcLimits.ucl} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
                <ReferenceLine y={spcLimits.lcl} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
                
                {/* Data Line */}
                <Line 
                  type="monotone" 
                  dataKey="dimension" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    if (!payload?.withinSpec) {
                      return <circle cx={cx} cy={cy} r={3} fill="#dc2626" stroke="white" strokeWidth={1} />
                    }
                    return null
                  }}
                />
                
                <Tooltip 
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number, name: string) => [
                    `${value} mm`,
                    'Dimension'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f9fafb'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-600"></div>
              <span>Target ({spcLimits.target})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-600"></div>
              <span>Spec Limits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-amber-600 opacity-60" style={{ borderStyle: 'dashed' }}></div>
              <span>±3σ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              <span>Out of Spec</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regime Markers */}
      <Card>
        <CardHeader>
          <CardTitle>Process Changes & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="w-1 h-8 bg-blue-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Day Shift Started</p>
                <p className="text-sm text-muted-foreground">06:00 - Operator: John Smith</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="w-1 h-8 bg-amber-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Evening Shift Started</p>
                <p className="text-sm text-muted-foreground">14:00 - Operator: Maria Garcia</p>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="w-1 h-8 bg-purple-600 rounded"></div>
              <div className="flex-1">
                <p className="font-medium">Night Shift Started</p>
                <p className="text-sm text-muted-foreground">22:00 - Operator: David Chen</p>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}