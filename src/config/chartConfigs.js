/**
 * Chart Configuration System
 * Centralized configurations for consistent chart styling and behavior
 */

// Industrial Color Palette
export const CHART_COLORS = {
  // Primary colors for main data series
  primary: {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    indigo: '#6366F1',
    pink: '#EC4899'
  },
  
  // Temperature zone colors (T1-T10)
  temperature: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ],
  
  // Status colors for operational states
  status: {
    online: '#10B981',
    offline: '#6B7280',
    error: '#EF4444',
    warning: '#F59E0B',
    auto: '#3B82F6',
    manual: '#8B5CF6',
    setup: '#F59E0B',
    stopped: '#EF4444'
  },
  
  // Quality metrics
  quality: {
    good: '#10B981',
    acceptable: '#F59E0B',
    poor: '#EF4444',
    excellent: '#059669'
  },
  
  // Gradients for area charts
  gradients: {
    blue: 'linear-gradient(180deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.05) 100%)',
    green: 'linear-gradient(180deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.05) 100%)',
    orange: 'linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.05) 100%)',
    red: 'linear-gradient(180deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.05) 100%)'
  }
};

// Chart Theme Configurations
export const CHART_THEMES = {
  default: {
    backgroundColor: '#FFFFFF',
    textColor: '#374151',
    gridColor: '#E5E7EB',
    borderColor: '#D1D5DB',
    fontSize: {
      small: 12,
      medium: 14,
      large: 16
    }
  },
  
  dark: {
    backgroundColor: '#1F2937',
    textColor: '#F3F4F6',
    gridColor: '#374151',
    borderColor: '#4B5563',
    fontSize: {
      small: 12,
      medium: 14,
      large: 16
    }
  }
};

// Common Chart Configurations
export const CHART_CONFIGS = {
  // Default margins for all charts
  margins: {
    top: 20,
    right: 30,
    bottom: 60,
    left: 60
  },
  
  // Compact margins for smaller charts
  compactMargins: {
    top: 10,
    right: 20,
    bottom: 30,
    left: 40
  },
  
  // Animation settings
  animation: {
    duration: 300,
    easing: 'ease-in-out'
  },
  
  // Grid settings
  grid: {
    strokeDasharray: '3 3',
    stroke: CHART_THEMES.default.gridColor,
    strokeWidth: 1
  },
  
  // Axis settings
  axis: {
    tick: {
      fontSize: 12,
      fill: CHART_THEMES.default.textColor
    },
    label: {
      fontSize: 14,
      fill: CHART_THEMES.default.textColor,
      fontWeight: 500
    }
  },
  
  // Legend settings
  legend: {
    iconType: 'circle',
    fontSize: 12,
    align: 'center',
    verticalAlign: 'bottom',
    height: 36
  },
  
  // Tooltip settings
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '12px',
    fontSize: 12,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }
};

// Temperature Zone Chart Configuration
export const TEMPERATURE_CHART_CONFIG = {
  height: 400,
  colors: CHART_COLORS.temperature,
  yAxisLabel: 'Temperature (°C)',
  temperatureRange: {
    min: 0,
    max: 300,
    ideal: { min: 180, max: 250 }
  },
  zones: [
    { name: 'T1', label: 'Zone 1' },
    { name: 'T2', label: 'Zone 2' },
    { name: 'T3', label: 'Zone 3' },
    { name: 'T4', label: 'Zone 4' },
    { name: 'T5', label: 'Zone 5' },
    { name: 'T6', label: 'Zone 6' },
    { name: 'T7', label: 'Zone 7' },
    { name: 'T8', label: 'Zone 8' },
    { name: 'T9', label: 'Zone 9' },
    { name: 'T10', label: 'Zone 10' }
  ]
};

// Process Parameters Chart Configuration
export const PROCESS_CHART_CONFIG = {
  height: 400,
  parameters: [
    {
      key: 'cycleTime',
      label: 'Cycle Time (s)',
      color: CHART_COLORS.primary.blue,
      yAxisId: 'left',
      type: 'line'
    },
    {
      key: 'injectionPressure',
      label: 'Injection Pressure (bar)',
      color: CHART_COLORS.primary.green,
      yAxisId: 'right',
      type: 'line'
    },
    {
      key: 'injectionSpeed',
      label: 'Injection Speed',
      color: CHART_COLORS.primary.orange,
      yAxisId: 'left',
      type: 'area'
    }
  ]
};

// OEE Chart Configuration
export const OEE_CHART_CONFIG = {
  height: 300,
  colors: {
    oee: CHART_COLORS.primary.blue,
    availability: CHART_COLORS.primary.green,
    performance: CHART_COLORS.primary.orange,
    quality: CHART_COLORS.primary.purple
  },
  thresholds: {
    excellent: 85,
    good: 70,
    acceptable: 50
  }
};

// Trend Analysis Chart Configuration
export const TREND_CHART_CONFIG = {
  height: 400,
  colors: {
    data: CHART_COLORS.primary.blue,
    trend: CHART_COLORS.primary.green,
    upperLimit: CHART_COLORS.primary.red,
    lowerLimit: CHART_COLORS.primary.red,
    mean: CHART_COLORS.primary.orange
  },
  controlLimits: {
    sigma: 3, // 3-sigma control limits
    showLimits: true,
    showMean: true
  }
};

// Correlation Chart Configuration
export const CORRELATION_CHART_CONFIG = {
  height: 400,
  colors: {
    points: CHART_COLORS.primary.blue,
    regression: CHART_COLORS.primary.red,
    confidence: CHART_COLORS.primary.orange
  },
  pointSize: 4,
  showRegression: true,
  showConfidence: false
};

// Timeline Chart Configuration
export const TIMELINE_CHART_CONFIG = {
  height: 200,
  lanes: [
    {
      key: 'operation',
      label: 'Operation',
      height: 30,
      colors: {
        'Auto': CHART_COLORS.status.auto,
        'Manual': CHART_COLORS.status.manual,
        'Setup': CHART_COLORS.status.setup,
        'Stopped': CHART_COLORS.status.stopped
      }
    },
    {
      key: 'system',
      label: 'System Status',
      height: 30,
      colors: {
        'Online': CHART_COLORS.status.online,
        'Offline': CHART_COLORS.status.offline,
        'Error': CHART_COLORS.status.error,
        'Warning': CHART_COLORS.status.warning
      }
    }
  ]
};

// Utilization Chart Configuration
export const UTILIZATION_CHART_CONFIG = {
  height: 300,
  colors: {
    utilization: CHART_COLORS.primary.green,
    target: CHART_COLORS.primary.orange,
    background: CHART_COLORS.primary.blue
  },
  targets: {
    utilization: 80, // Target utilization percentage
    availability: 90 // Target availability percentage
  }
};

// Downtime Analysis Chart Configuration
export const DOWNTIME_CHART_CONFIG = {
  height: 350,
  colors: CHART_COLORS.primary,
  paretoLine: CHART_COLORS.primary.red,
  categories: [
    'Equipment Failure',
    'Material Shortage',
    'Quality Issues',
    'Setup/Changeover',
    'Maintenance',
    'Other'
  ]
};

// Responsive breakpoints for charts
export const RESPONSIVE_CONFIG = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  },
  
  // Chart heights by screen size
  heights: {
    mobile: {
      default: 250,
      compact: 200,
      large: 300
    },
    tablet: {
      default: 350,
      compact: 250,
      large: 400
    },
    desktop: {
      default: 400,
      compact: 300,
      large: 500
    }
  },
  
  // Grid configurations by screen size
  grid: {
    mobile: { cols: 1 },
    tablet: { cols: 2 },
    desktop: { cols: 3 }
  }
};

// Export configurations
export const EXPORT_CONFIG = {
  formats: ['PNG', 'SVG', 'PDF'],
  dimensions: {
    small: { width: 800, height: 600 },
    medium: { width: 1200, height: 800 },
    large: { width: 1600, height: 1200 }
  },
  quality: {
    low: 0.5,
    medium: 0.8,
    high: 1.0
  }
};

// Time range configurations
export const TIME_RANGE_CONFIG = {
  ranges: [
    { value: '1h', label: 'Last Hour', minutes: 60 },
    { value: '4h', label: 'Last 4 Hours', minutes: 240 },
    { value: '12h', label: 'Last 12 Hours', minutes: 720 },
    { value: '24h', label: 'Last 24 Hours', minutes: 1440 },
    { value: '7d', label: 'Last 7 Days', minutes: 10080 },
    { value: 'all', label: 'All Data', minutes: null }
  ],
  
  // Update intervals for real-time data
  updateIntervals: {
    realtime: 5000,   // 5 seconds
    frequent: 30000,  // 30 seconds
    normal: 60000,    // 1 minute
    slow: 300000      // 5 minutes
  }
};

// Parameter configurations for different chart types
export const PARAMETER_CONFIG = {
  temperature: {
    min: 0,
    max: 300,
    unit: '°C',
    precision: 1,
    alarms: { high: 280, low: 150 }
  },
  
  pressure: {
    min: 0,
    max: 2000,
    unit: 'bar',
    precision: 1,
    alarms: { high: 1800, low: 100 }
  },
  
  cycleTime: {
    min: 0,
    max: 60,
    unit: 's',
    precision: 2,
    ideal: { min: 20, max: 30 }
  },
  
  efficiency: {
    min: 0,
    max: 100,
    unit: '%',
    precision: 1,
    targets: { excellent: 90, good: 80, poor: 60 }
  }
};

// Helper function to get responsive chart height
export const getChartHeight = (chartType = 'default', screenSize = 'desktop') => RESPONSIVE_CONFIG.heights[screenSize]?.[chartType] || 
         RESPONSIVE_CONFIG.heights.desktop.default;

// Helper function to get chart colors based on theme
export const getChartColors = (theme = 'default') => ({
    ...CHART_COLORS,
    text: CHART_THEMES[theme].textColor,
    background: CHART_THEMES[theme].backgroundColor,
    grid: CHART_THEMES[theme].gridColor,
    border: CHART_THEMES[theme].borderColor
  });