import { format, parseISO, subHours, subDays } from "date-fns";

/**
 * OPC-UA Data Processing Utilities for Machine Charts
 * Transforms real OPC-UA data into chart-ready formats
 */

// Process raw OPC-UA data from elink_full_samples.json format
export const processOPCUAData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  
  return rawData.map(entry => {
    // Handle both old nested format and new flattened format
    const data = entry.Data || entry;
    const processData = entry.ProcessData || data;
    const tempData = entry.TemperatureData || data;
    const techData = entry.TechData || data;
    
    return {
      ...entry,
      formattedTime: format(new Date(entry.timestamp), "MM/dd HH:mm"),
      date: new Date(entry.timestamp),
      // Extract and flatten nested data for easier chart access
      ...processData,
      ...tempData,
      ...techData,
      // Add computed fields
      totalTemperature: calculateAverageTemperature(tempData),
      processEfficiency: calculateProcessEfficiency(processData),
      operationalStatus: mapOperationalStatus(tempData?.OPM),
      systemStatus: mapSystemStatus(tempData?.STS)
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
};

// Calculate average temperature across all zones
const calculateAverageTemperature = (tempData) => {
  if (!tempData) return 0;
  
  const tempKeys = Object.keys(tempData).filter(key => key.startsWith('T') && key !== 'TS1');
  const temperatures = tempKeys.map(key => tempData[key]).filter(temp => temp > 0);
  
  return temperatures.length > 0 
    ? parseFloat((temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length).toFixed(1))
    : 0;
};

// Calculate process efficiency based on cycle time and expected metrics
const calculateProcessEfficiency = (processData) => {
  if (!processData || !processData.ECYCT) return 0;
  
  // Ideal cycle time range: 20-30 seconds for injection molding
  const idealCycleTime = 25;
  const actualCycleTime = processData.ECYCT;
  
  // Efficiency calculation: closer to ideal = higher efficiency
  const efficiency = Math.max(0, Math.min(100, 
    100 - Math.abs((actualCycleTime - idealCycleTime) / idealCycleTime) * 100
  ));
  
  return parseFloat(efficiency.toFixed(1));
};

// Map operational mode codes to readable status
const mapOperationalStatus = (opm) => {
  const statusMap = {
    [-1]: 'Stopped',
    0: 'Manual',
    1: 'Auto',
    2: 'Setup',
    3: 'Setup', // fallback
    4: 'Setup'  // fallback
  };
  return statusMap[opm] || 'Unknown';
};

// Map system status codes to readable status
const mapSystemStatus = (sts) => {
  const statusMap = {
    0: 'Offline',
    1: 'Online',
    2: 'Error',
    3: 'Warning'
  };
  return statusMap[sts] || 'Unknown';
};

// Filter data by time range
export const filterDataByTimeRange = (data, timeRange) => {
  if (!data.length || timeRange === 'all') return data;
  
  const now = new Date();
  let cutoffTime;
  
  switch (timeRange) {
    case '1h':
      cutoffTime = subHours(now, 1);
      break;
    case '4h':
      cutoffTime = subHours(now, 4);
      break;
    case '12h':
      cutoffTime = subHours(now, 12);
      break;
    case '24h':
      cutoffTime = subHours(now, 24);
      break;
    case '7d':
      cutoffTime = subDays(now, 7);
      break;
    default:
      return data;
  }
  
  return data.filter(entry => entry.date >= cutoffTime);
};

// Filter data by machine ID
export const filterDataByMachine = (data, machineId) => {
  if (!machineId || machineId === 'all') return data;
  return data.filter(entry => entry.devId === machineId);
};

// Get unique machine IDs from dataset
export const getUniqueMachineIds = (data) => {
  const machines = [...new Set(data.map(entry => entry.devId))];
  return machines.sort();
};

// Process temperature zone data for multi-zone temperature charts
export const processTemperatureZoneData = (data) => data.map(entry => {
    const result = {
      timestamp: entry.timestamp,
      formattedTime: entry.formattedTime,
      date: entry.date,
      devId: entry.devId
    };
    
    // Add all temperature zones (T1-T10)
    for (let i = 1; i <= 10; i++) {
      const tempKey = `T${i}`;
      result[tempKey] = entry[tempKey] || 0;
    }
    
    // Add oil temperature if available
    result.OT = entry.OT || 0;
    
    return result;
  });

// Process data for process parameters (injection, pressure, cycle time)
export const processParameterData = (data) => data.map(entry => ({
    timestamp: entry.timestamp,
    formattedTime: entry.formattedTime,
    date: entry.date,
    devId: entry.devId,
    // Cycle Time
    cycleTime: entry.ECYCT || 0,
    // Injection Parameters
    injectionSpeed: entry.EISS || 0,
    injectionVolume: entry.EIVM || 0,
    injectionPressure: entry.EIPM || 0,
    injectionPosition: entry.ESIPT || 0,
    injectionPressurePeak: entry.ESIPP || 0,
    injectionSpeed2: entry.ESIPS || 0,
    // Ejection Parameters
    ejectionPosition: entry.EIPT || 0,
    ejectionSpeed: entry.EIPSE || 0,
    // Plasticizing Parameters
    plastSpeed: entry.EPLST || 0,
    plastSpeedEnd: entry.EPLSSE || 0,
    plastPressureMax: entry.EPLSPM || 0,
    // Temperature sensors
    extruderTemp1: entry.ET1 || 0,
    extruderTemp2: entry.ET2 || 0,
    // Process efficiency
    efficiency: entry.processEfficiency || 0
  }));

// Calculate OEE (Overall Equipment Effectiveness) metrics
export const calculateOEEMetrics = (data, timeWindow = '24h') => {
  // Ensure data is an array
  if (!Array.isArray(data) || data.length === 0) {
    return { oee: 0, availability: 0, performance: 0, quality: 0 };
  }
  
  const filteredData = filterDataByTimeRange(data, timeWindow);
  
  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    return { oee: 0, availability: 0, performance: 0, quality: 0 };
  }
  
  // Availability: percentage of time machine was available
  const totalEntries = filteredData.length;
  const availableEntries = filteredData.filter(entry => 
    entry.systemStatus === 'Online' || entry.systemStatus === 'Warning'
  ).length;
  const availability = (availableEntries / totalEntries) * 100;
  
  // Performance: actual vs ideal cycle time
  const avgCycleTime = filteredData.reduce((sum, entry) => sum + (entry.ECYCT || 0), 0) / totalEntries;
  const idealCycleTime = 25; // seconds
  const performance = Math.min(100, (idealCycleTime / avgCycleTime) * 100);
  
  // Quality: assume 95% quality rate (would need defect data)
  const quality = 95;
  
  // OEE calculation
  const oee = (availability * performance * quality) / 10000;
  
  return {
    oee: parseFloat(oee.toFixed(1)),
    availability: parseFloat(availability.toFixed(1)),
    performance: parseFloat(performance.toFixed(1)),
    quality: parseFloat(quality.toFixed(1))
  };
};

// Process data for trend analysis with statistical calculations
export const processTrendData = (data, parameter = 'ECYCT') => {
  const values = data.map(entry => entry[parameter] || 0).filter(val => val > 0);
  
  if (values.length === 0) return data.map(entry => ({ ...entry, trend: 0, upperLimit: 0, lowerLimit: 0 }));
  
  // Calculate moving average and control limits
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + (val - mean)**2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Statistical Process Control limits (3-sigma)
  const upperControlLimit = mean + (3 * stdDev);
  const lowerControlLimit = Math.max(0, mean - (3 * stdDev));
  
  return data.map((entry, index) => {
    // Calculate moving average for trend line (window of 5)
    const windowSize = 5;
    const start = Math.max(0, index - windowSize + 1);
    const windowData = data.slice(start, index + 1);
    const movingAvg = windowData.reduce((sum, item) => sum + (item[parameter] || 0), 0) / windowData.length;
    
    return {
      ...entry,
      value: entry[parameter] || 0,
      trend: parseFloat(movingAvg.toFixed(2)),
      upperLimit: parseFloat(upperControlLimit.toFixed(2)),
      lowerLimit: parseFloat(lowerControlLimit.toFixed(2)),
      mean: parseFloat(mean.toFixed(2))
    };
  });
};

// Process data for correlation analysis between two parameters
export const processCorrelationData = (data, paramX = 'ECYCT', paramY = 'EIPM') => data
    .filter(entry => entry[paramX] && entry[paramY]) // Filter out entries with missing data
    .map(entry => ({
      timestamp: entry.timestamp,
      formattedTime: entry.formattedTime,
      devId: entry.devId,
      x: entry[paramX],
      y: entry[paramY],
      efficiency: entry.processEfficiency || 0,
      status: entry.systemStatus
    }));

// Calculate utilization metrics for machine performance
export const calculateUtilizationMetrics = (data, timeWindow = '24h') => {
  // Ensure data is an array
  if (!Array.isArray(data) || data.length === 0) {
    return { utilization: 0, totalCycles: 0, avgCycleTime: 0 };
  }
  
  const filteredData = filterDataByTimeRange(data, timeWindow);
  
  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    return { utilization: 0, totalCycles: 0, avgCycleTime: 0 };
  }
  
  const totalEntries = filteredData.length;
  const runningEntries = filteredData.filter(entry => 
    entry.operationalStatus === 'Auto' && entry.systemStatus === 'Online'
  ).length;
  
  const utilization = (runningEntries / totalEntries) * 100;
  const totalCycles = filteredData.reduce((sum, entry) => sum + (entry.CYCN || 0), 0);
  const avgCycleTime = filteredData.reduce((sum, entry) => sum + (entry.ECYCT || 0), 0) / totalEntries;
  
  return {
    utilization: parseFloat(utilization.toFixed(1)),
    totalCycles,
    avgCycleTime: parseFloat(avgCycleTime.toFixed(1))
  };
};

// Process downtime data for analysis
export const processDowntimeData = (data) => {
  const downtimeEvents = [];
  let currentDowntime = null;
  
  data.forEach((entry, index) => {
    const isDown = entry.systemStatus === 'Error' || entry.systemStatus === 'Offline';
    const prevEntry = index > 0 ? data[index - 1] : null;
    const wasDown = prevEntry && (prevEntry.systemStatus === 'Error' || prevEntry.systemStatus === 'Offline');
    
    if (isDown && !wasDown) {
      // Start of downtime
      currentDowntime = {
        startTime: entry.timestamp,
        startFormatted: entry.formattedTime,
        devId: entry.devId,
        reason: entry.systemStatus
      };
    } else if (!isDown && wasDown && currentDowntime) {
      // End of downtime
      currentDowntime.endTime = entry.timestamp;
      currentDowntime.endFormatted = entry.formattedTime;
      currentDowntime.duration = (entry.timestamp - currentDowntime.startTime) / (1000 * 60); // minutes
      downtimeEvents.push(currentDowntime);
      currentDowntime = null;
    }
  });
  
  return downtimeEvents;
};

// Group data by time intervals for aggregation
export const groupDataByInterval = (data, interval = 'hour') => {
  const grouped = {};
  
  data.forEach(entry => {
    let key;
    const date = entry.date;
    
    switch (interval) {
      case 'minute':
        key = format(date, 'yyyy-MM-dd HH:mm');
        break;
      case 'hour':
        key = format(date, 'yyyy-MM-dd HH:00');
        break;
      case 'day':
        key = format(date, 'yyyy-MM-dd');
        break;
      default:
        key = format(date, 'yyyy-MM-dd HH:00');
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry);
  });
  
  return grouped;
};

// Calculate summary statistics for a dataset
export const calculateSummaryStats = (data, parameter) => {
  const values = data.map(entry => entry[parameter] || 0).filter(val => val > 0);
  
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const variance = values.reduce((sum, val) => sum + (val - mean)**2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2))
  };
};

// Process production data for production metrics charts
export const processProductionData = (data) => data.map(entry => ({
  timestamp: entry.timestamp,
  formattedTime: entry.formattedTime,
  date: entry.date,
  devId: entry.devId,
  // Production metrics
  cycleCount: entry.CYCN || 0,
  cycleTime: entry.ECYCT || 0,
  efficiency: entry.processEfficiency || 0,
  // Quality indicators
  injectionPressure: entry.EIPM || 0,
  injectionSpeed: entry.EISS || 0,
  temperature: entry.totalTemperature || 0,
  // Operational status
  operationalStatus: entry.operationalStatus || 'Unknown',
  systemStatus: entry.systemStatus || 'Unknown',
  // Calculated metrics
  throughput: entry.CYCN ? Math.round((entry.CYCN / (entry.ECYCT || 1)) * 3600) : 0, // parts per hour
  uptime: entry.systemStatus === 'Online' ? 100 : 0
}));

// Process temperature data for temperature charts
export const processTemperatureData = (data) => processTemperatureZoneData(data);

// Process OEE data (alias for production data)
export const processOEEData = (data) => processProductionData(data);

// Process utilization data
export const processUtilizationData = (data) => data.map(entry => ({
  timestamp: entry.timestamp,
  formattedTime: entry.formattedTime,
  date: entry.date,
  devId: entry.devId,
  utilization: entry.operationalStatus === 'Auto' ? 100 : 0,
  efficiency: entry.processEfficiency || 0,
  cycleTime: entry.ECYCT || 0,
  status: entry.systemStatus || 'Unknown'
}));

// Process timeline data
export const processTimelineData = (data) => data.map(entry => ({
  timestamp: entry.timestamp,
  formattedTime: entry.formattedTime,
  date: entry.date,
  devId: entry.devId,
  event: entry.systemStatus || 'Unknown',
  status: entry.operationalStatus || 'Unknown',
  details: {
    cycleTime: entry.ECYCT || 0,
    temperature: entry.totalTemperature || 0,
    efficiency: entry.processEfficiency || 0
  }
}));

// Calculate linear regression for correlation analysis
export const calculateLinearRegression = (data, xKey = 'x', yKey = 'y') => {
  if (!data.length) return { slope: 0, intercept: 0, r2: 0 };
  
  const n = data.length;
  const xValues = data.map(d => d[xKey] || 0);
  const yValues = data.map(d => d[yKey] || 0);
  
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = data.reduce((sum, d) => sum + (d[xKey] || 0) * (d[yKey] || 0), 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumYY = yValues.reduce((sum, y) => sum + y * y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = yValues.reduce((sum, y, i) => {
    const predicted = slope * xValues[i] + intercept;
    return sum + (y - predicted) ** 2;
  }, 0);
  const ssTot = yValues.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);
  
  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    r2: parseFloat(Math.max(0, r2).toFixed(4))
  };
};

// Calculate Pareto data for downtime analysis
export const calculateParetoData = (downtimeData) => {
  if (!Array.isArray(downtimeData) || downtimeData.length === 0) {
    return [];
  }
  
  const reasonCounts = {};
  downtimeData.forEach(event => {
    const reason = event.reason || event.category || 'Unknown';
    const duration = event.duration || 1; // Default to 1 minute if no duration
    reasonCounts[reason] = (reasonCounts[reason] || 0) + duration;
  });
  
  const sortedReasons = Object.entries(reasonCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([reason, duration]) => ({ 
      reason, 
      duration, 
      category: reason,
      count: 1 // Default count for each category
    }));
  
  const totalDuration = sortedReasons.reduce((sum, item) => sum + item.duration, 0);
  let cumulativePercent = 0;
  
  return sortedReasons.map(item => {
    const percent = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0;
    cumulativePercent += percent;
    return {
      ...item,
      percent: parseFloat(percent.toFixed(1)),
      cumulativePercent: parseFloat(cumulativePercent.toFixed(1))
    };
  });
};

// Calculate control limits for SPC charts
export const calculateControlLimits = (data, parameter) => {
  const values = data.map(entry => entry[parameter] || 0).filter(val => val > 0);
  
  if (values.length === 0) {
    return { mean: 0, ucl: 0, lcl: 0, usl: 0, lsl: 0 };
  }
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean: parseFloat(mean.toFixed(2)),
    ucl: parseFloat((mean + 3 * stdDev).toFixed(2)),    // Upper Control Limit
    lcl: parseFloat(Math.max(0, mean - 3 * stdDev).toFixed(2)), // Lower Control Limit
    usl: parseFloat((mean + 2 * stdDev).toFixed(2)),    // Upper Spec Limit
    lsl: parseFloat(Math.max(0, mean - 2 * stdDev).toFixed(2))  // Lower Spec Limit
  };
};

// Calculate moving average
export const calculateMovingAverage = (data, parameter, windowSize = 5) => {
  return data.map((entry, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = data.slice(start, index + 1);
    const average = window.reduce((sum, item) => sum + (item[parameter] || 0), 0) / window.length;
    
    return {
      ...entry,
      movingAverage: parseFloat(average.toFixed(2))
    };
  });
};