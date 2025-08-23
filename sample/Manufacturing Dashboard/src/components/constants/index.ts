export const STATUS_COLORS = {
  Running: 'bg-teal-600',
  Idle: 'bg-slate-500',
  Alarm: 'bg-red-600',
  Maintenance: 'bg-amber-500'
} as const

export const GANTT_STATUS_COLORS = {
  running: 'bg-teal-600 border-teal-700',
  planned: 'bg-blue-600 border-blue-700',
  blocked: 'bg-red-600 border-red-700',
  maintenance: 'bg-amber-600 border-amber-700'
} as const

export const RISK_COLORS = {
  low: 'from-green-500 to-green-600',
  medium: 'from-amber-500 to-amber-600',
  high: 'from-red-500 to-red-600'
} as const

export const ALARM_COLORS = {
  Low: 'text-green-600',
  Medium: 'text-amber-600',
  High: 'text-red-600'
} as const

export const MACHINE_NAMES = ['M001', 'M002', 'M003', 'M004', 'M005', 'M006'] as const

export const OPERATORS = [
  'John Smith',
  'Maria Garcia', 
  'David Chen',
  'Sarah Wilson',
  'Mike Johnson',
  'Lisa Brown'
] as const

export const TIME_RANGES = {
  LIVE: 'live',
  FIFTEEN_MIN: '15m',
  ONE_HOUR: '1h',
  TWENTY_FOUR_HOUR: '24h'
} as const