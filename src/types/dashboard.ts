export interface OPCUADataPoint {
  devId: string
  topic: string
  sendTime: string
  sendStamp: number
  time: string
  timestamp: number
  Data: {
    ATST: number
    OPM: number
    STS: number
    T1: number
    T2: number
    T3: number
    T4: number
    T5: number
    T6: number
    T7: number
    ECYCT?: number
    EIPM?: number
    EISS?: number
    EIVM?: number
  }
  systemStatus?: string
  operationalStatus?: string
}

export interface ProcessedDataPoint extends OPCUADataPoint {
  formattedTime: string
  totalTemperature: number
  processEfficiency: number
}

export interface Alert {
  id: number
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'critical'
  type: string
  message: string
  machineId?: string
}

export interface Insight {
  id: number
  timestamp: Date
  title: string
  description: string
  type: string
}

export interface ChartSuggestion {
  id: number
  timestamp: Date
  chartType: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  context?: Record<string, any>
}

export interface UserPreferences {
  favoriteCharts: string[]
  customLayouts: Record<string, any>
  defaultTimeRange: string
  autoRefresh: boolean
  refreshInterval: number
}

export interface PanelVisibility {
  left: boolean
  right: boolean
  timeline: boolean
}

export interface CrossChartFilters {
  [key: string]: any
}

export interface Machine {
  id: string
  name: string
  status: string
  lastUpdate: Date
  alertCount: number
}

export interface Parameter {
  value: string
  label: string
  unit?: string
  icon?: string
}

export interface TimeRangeOption {
  value: string
  label: string
  icon?: string
}

export interface Metric {
  label: string
  value: string
  trend: number
  status: 'good' | 'warning' | 'error'
}

export interface ChartConfig {
  component: React.ComponentType<any>
  props: Record<string, any>
}

export interface ChartLayoutConfig {
  primary?: ChartConfig
  secondary?: ChartConfig[]
  tertiary?: ChartConfig[]
}

export interface LayoutPreset {
  leftPanelWidth: string
  rightPanelWidth: string
  statusBarHeight: string
  timelineHeight: string
}

export interface TimelineEvent {
  id: string
  timestamp: Date
  type: string
  title: string
  machine: string
  severity: 'info' | 'warning' | 'error'
}