import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { TrendingUp, Target } from 'lucide-react'

// Generate correlation data
const generateCorrelationData = () => {
  const data = []
  
  for (let i = 0; i < 200; i++) {
    const pressure = 150 + Math.random() * 20
    const temperature = 180 + pressure * 0.3 + Math.random() * 10 // Positive correlation
    const cycleTime = 15 - pressure * 0.05 + Math.random() * 2 // Negative correlation
    const quality = Math.max(0, 95 - Math.abs(pressure - 160) * 2 + Math.random() * 5)
    
    data.push({
      pressure: Number(pressure.toFixed(1)),
      temperature: Number(temperature.toFixed(1)),
      cycleTime: Number(cycleTime.toFixed(1)),
      quality: Number(quality.toFixed(1)),
      mold: i < 100 ? 'M-001' : 'M-002',
      machine: ['M001', 'M002', 'M003'][Math.floor(i / 67)],
      shift: ['Day', 'Evening', 'Night'][Math.floor(Math.random() * 3)]
    })
  }
  
  return data
}

const correlationData = generateCorrelationData()

// Calculate correlation coefficient
const calculateCorrelation = (x: number[], y: number[]) => {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  return correlation
}

const pressureValues = correlationData.map(d => d.pressure)
const temperatureValues = correlationData.map(d => d.temperature)
const pearsonR = calculateCorrelation(pressureValues, temperatureValues)

export function CorrelationChart() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Correlation Analysis</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">X-Axis Variable</label>
              <Select defaultValue="pressure">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pressure">Injection Pressure</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="cycleTime">Cycle Time</SelectItem>
                  <SelectItem value="quality">Quality Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Y-Axis Variable</label>
              <Select defaultValue="temperature">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pressure">Injection Pressure</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="cycleTime">Cycle Time</SelectItem>
                  <SelectItem value="quality">Quality Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Color By</label>
              <Select defaultValue="mold">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mold">Mold</SelectItem>
                  <SelectItem value="machine">Machine</SelectItem>
                  <SelectItem value="shift">Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Fit Type</label>
              <Select defaultValue="linear">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="loess">LOESS</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pearson R</p>
                <p className="text-2xl font-bold text-green-600">{pearsonR.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">Strong positive</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">R-Squared</p>
                <p className="text-2xl font-bold">{(pearsonR * pearsonR).toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">{((pearsonR * pearsonR) * 100).toFixed(1)}% variance</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sample Size</p>
                <p className="text-2xl font-bold">{correlationData.length}</p>
                <p className="text-xs text-muted-foreground">Data points</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Significance</p>
                <p className="text-2xl font-bold text-green-600">High</p>
                <p className="text-xs text-muted-foreground">p &lt; 0.001</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Scatter Plot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Injection Pressure vs Temperature</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Strong Correlation (r = {pearsonR.toFixed(3)})
              </Badge>
              <Button variant="outline" size="sm">Export Data</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={correlationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  type="number"
                  dataKey="pressure"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Injection Pressure (bar)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number"
                  dataKey="temperature"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                />
                
                {/* Quadrant lines */}
                <ReferenceLine x={160} stroke="#6b7280" strokeDasharray="2 2" opacity={0.5} />
                <ReferenceLine y={190} stroke="#6b7280" strokeDasharray="2 2" opacity={0.5} />
                
                {/* Data points colored by mold */}
                <Scatter 
                  dataKey="temperature"
                  fill={(entry: any) => entry.mold === 'M-001' ? '#3b82f6' : '#f59e0b'}
                />
                
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value}°C`,
                    'Temperature'
                  ]}
                  labelFormatter={(value: number) => `Pressure: ${value} bar`}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm">
                          <p className="font-medium">Data Point</p>
                          <p>Pressure: {data.pressure} bar</p>
                          <p>Temperature: {data.temperature}°C</p>
                          <p>Mold: {data.mold}</p>
                          <p>Machine: {data.machine}</p>
                          <p>Shift: {data.shift}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          {/* Quadrant Analysis */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="font-medium text-blue-900 dark:text-blue-100">High Pressure, High Temperature</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {correlationData.filter(d => d.pressure > 160 && d.temperature > 190).length} points
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="font-medium text-green-900 dark:text-green-100">Low Pressure, Low Temperature</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {correlationData.filter(d => d.pressure <= 160 && d.temperature <= 190).length} points
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <p className="font-medium text-amber-900 dark:text-amber-100">High Pressure, Low Temperature</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {correlationData.filter(d => d.pressure > 160 && d.temperature <= 190).length} points
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="font-medium text-red-900 dark:text-red-100">Low Pressure, High Temperature</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {correlationData.filter(d => d.pressure <= 160 && d.temperature > 190).length} points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regression Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Slope:</span>
                <span className="text-sm">0.324</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Intercept:</span>
                <span className="text-sm">139.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Standard Error:</span>
                <span className="text-sm">2.14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Confidence:</span>
                <span className="text-sm">95%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Outlier Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Total Outliers:</span>
                <Badge variant="outline">8</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Points beyond 2σ from regression line
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Outlier Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}