import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

// Generate trend data
const generateTrendData = () => {
  const data = []
  const baseTime = new Date()
  baseTime.setHours(baseTime.getHours() - 24)
  
  for (let i = 0; i < 288; i++) { // 5-minute intervals for 24 hours
    const time = new Date(baseTime.getTime() + i * 5 * 60 * 1000)
    
    // Simulate injection pressure with trend and noise
    const basePressure = 150 + Math.sin(i / 50) * 10 + (i / 288) * 5 // Gradual increase trend
    const pressure = basePressure + (Math.random() - 0.5) * 8
    
    // Simulate temperature
    const baseTemp = 180 + Math.sin(i / 40) * 3
    const temperature = baseTemp + (Math.random() - 0.5) * 2
    
    // Simulate velocity
    const baseVel = 25 + Math.sin(i / 30) * 2
    const velocity = baseVel + (Math.random() - 0.5) * 1.5
    
    data.push({
      time: time.toISOString(),
      timeDisplay: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pressure: Number(pressure.toFixed(1)),
      temperature: Number(temperature.toFixed(1)),
      velocity: Number(velocity.toFixed(1)),
      deviation: Math.abs(pressure - 155), // Target pressure is 155
      mold: i < 96 ? 'M-001' : i < 192 ? 'M-002' : 'M-001'
    })
  }
  
  return data
}

const trendData = generateTrendData()

// Detect anomalies and trends
const pressureValues = trendData.map(d => d.pressure)
const pressureMean = pressureValues.reduce((a, b) => a + b, 0) / pressureValues.length
const pressureStdDev = Math.sqrt(pressureValues.reduce((sq, n) => sq + Math.pow(n - pressureMean, 2), 0) / pressureValues.length)

const anomalies = trendData.filter(d => Math.abs(d.pressure - pressureMean) > 2 * pressureStdDev)

export function TrendChart() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Primary Metric</Label>
              <Select defaultValue="pressure">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pressure">Injection Pressure</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="velocity">Injection Velocity</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Time Window</Label>
              <Select defaultValue="24h">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 Hour</SelectItem>
                  <SelectItem value="8h">Last 8 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="overlay-mold" />
              <Label htmlFor="overlay-mold">Overlay by Mold</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="show-targets" defaultChecked />
              <Label htmlFor="show-targets">Show Targets</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">{trendData[trendData.length - 1]?.pressure} bar</p>
                <p className="text-xs text-muted-foreground">Target: 155 bar</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trend Direction</p>
                <p className="text-2xl font-bold text-amber-600">Increasing</p>
                <p className="text-xs text-muted-foreground">+2.3 bar/hour</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold text-red-600">{anomalies.length}</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stability</p>
                <p className="text-2xl font-bold text-green-600">Good</p>
                <p className="text-xs text-muted-foreground">Cpk: 1.23</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Injection Pressure Trend - 24 Hour View</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">M-001 Active</Badge>
              <Button variant="outline" size="sm">Compare Windows</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="timeDisplay" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6b7280"
                  domain={[140, 170]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Pressure (bar)', angle: -90, position: 'insideLeft' }}
                />
                
                {/* Target and Control Lines */}
                <ReferenceLine y={155} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                <ReferenceLine y={165} stroke="#dc2626" strokeWidth={1} />
                <ReferenceLine y={145} stroke="#dc2626" strokeWidth={1} />
                
                {/* Data Line */}
                <Line 
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    const isAnomaly = anomalies.some(a => a.time === payload?.time)
                    if (isAnomaly) {
                      return <circle cx={cx} cy={cy} r={4} fill="#dc2626" stroke="white" strokeWidth={2} />
                    }
                    return null
                  }}
                />
                
                <Tooltip 
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number, name: string) => [
                    `${value} bar`,
                    'Injection Pressure'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f9fafb'
                  }}
                />
                
                {/* Brush for zooming */}
                <Brush dataKey="timeDisplay" height={30} stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Variance Strip */}
      <Card>
        <CardHeader>
          <CardTitle>Process Variance Analysis</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deviation from Target (155 bar)</span>
              <span className="text-sm text-muted-foreground">Higher deviation = More red</span>
            </div>
            
            <div className="h-8 w-full rounded-lg overflow-hidden flex">
              {trendData.map((point, index) => {
                const deviation = Math.abs(point.pressure - 155)
                const intensity = Math.min(deviation / 10, 1) // Normalize to 0-1
                const color = `rgb(${Math.floor(59 + intensity * 161)}, ${Math.floor(130 - intensity * 88)}, ${Math.floor(246 - intensity * 180)})`
                
                return (
                  <div
                    key={index}
                    className="flex-1 h-full"
                    style={{ backgroundColor: color }}
                    title={`${point.timeDisplay}: ${point.pressure} bar (deviation: ${deviation.toFixed(1)})`}
                  />
                )
              })}
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>24h ago</span>
              <span>12h ago</span>
              <span>Now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detected Events */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Events & Annotations</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium">Pressure Spike Detected</p>
                <p className="text-sm text-muted-foreground">08:23 - Peak: 168.2 bar (confidence: 94%)</p>
              </div>
              <Badge variant="destructive">Critical</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium">Upward Trend Started</p>
                <p className="text-sm text-muted-foreground">06:15 - Rate: +2.3 bar/hour (confidence: 87%)</p>
              </div>
              <Badge variant="outline">Warning</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium">Mold Change Event</p>
                <p className="text-sm text-muted-foreground">04:30 - Changed from M-001 to M-002</p>
              </div>
              <Badge variant="outline">Info</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}