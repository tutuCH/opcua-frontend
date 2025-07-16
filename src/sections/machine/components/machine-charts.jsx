"use client"

import * as React from "react"
import { 
  AreaChart, LineChart, BarChart, Area, Line, Bar, 
  CartesianGrid, XAxis, YAxis, ResponsiveContainer, 
  Legend, Tooltip, PieChart, Pie, Cell 
} from "recharts"
import { injectionMachine } from "src/_mock/injectionMachine"
import { format, parseISO } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "src/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"

// Process data for charts
const processData = (data) => {
  // Convert timestamps to Date objects and sort by time
  return data.map(entry => ({
    ...entry,
    formattedTime: format(new Date(entry.Timestamp), "MM/dd HH:mm"),
    Date: new Date(entry.Timestamp)
  })).sort((a, b) => a.Timestamp - b.Timestamp);
};

// Group data by machine ID
const groupByMachine = (data) => {
  const grouped = {};
  data.forEach(entry => {
    if (!grouped[entry.MachineID]) {
      grouped[entry.MachineID] = [];
    }
    grouped[entry.MachineID].push(entry);
  });
  return grouped;
};

// Count error types
const getErrorDistribution = (data) => {
  const errorCounts = {};
  data.forEach(entry => {
    const error = entry.ErrorCode === "None" ? "No Error" : entry.ErrorCode;
    if (!errorCounts[error]) {
      errorCounts[error] = 0;
    }
    errorCounts[error]++;
  });
  
  return Object.entries(errorCounts).map(([name, value]) => ({ name, value }));
};

// Calculate average metrics by machine
const getMachineAverages = (groupedData) => {
  const averages = [];
  Object.entries(groupedData).forEach(([machineId, entries]) => {
    if (entries.length === 0) return;
    
    const avgCycleTime = entries.reduce((sum, entry) => sum + entry["CycleTime(s)"], 0) / entries.length;
    const avgTemperature = entries.reduce((sum, entry) => sum + entry["Temperature(C)"], 0) / entries.length;
    const avgPressure = entries.reduce((sum, entry) => sum + entry["Pressure(bar)"], 0) / entries.length;
    const totalParts = entries.reduce((sum, entry) => sum + entry.PartCount, 0);
    
    averages.push({
      machineId,
      avgCycleTime: parseFloat(avgCycleTime.toFixed(2)),
      avgTemperature: parseFloat(avgTemperature.toFixed(2)),
      avgPressure: parseFloat(avgPressure.toFixed(2)),
      totalParts
    });
  });
  
  return averages;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function MachineCharts() {
  const [timeRange, setTimeRange] = React.useState("all");
  const [selectedMachine, setSelectedMachine] = React.useState("all");
  
  // Process and prepare chart data
  const processedData = processData(injectionMachine);
  const groupedByMachine = groupByMachine(processedData);
  const machineIds = Object.keys(groupedByMachine);
  const errorDistribution = getErrorDistribution(processedData);
  const machineAverages = getMachineAverages(groupedByMachine);
  
  // Filter data based on selections
  const getFilteredData = () => {
    let filtered = [...processedData];
    
    // Filter by machine if not "all"
    if (selectedMachine !== "all") {
      filtered = filtered.filter(entry => entry.MachineID === selectedMachine);
    }
    
    // Filter by time range
    if (timeRange !== "all") {
      const now = Math.max(...filtered.map(d => d.Timestamp));
      const msInHour = 3600000;
      let timeLimit;
      
      switch (timeRange) {
        case "1h":
          timeLimit = now - msInHour;
          break;
        case "12h":
          timeLimit = now - 12 * msInHour;
          break;
        case "24h":
          timeLimit = now - 24 * msInHour;
          break;
        default:
          timeLimit = 0;
      }
      
      filtered = filtered.filter(entry => entry.Timestamp >= timeLimit);
    }
    
    return filtered;
  };
  
  const filteredData = getFilteredData();
  
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center justify-end">
        <Select value={selectedMachine} onValueChange={setSelectedMachine}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Machine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Machines</SelectItem>
            {machineIds.map(id => (
              <SelectItem key={id} value={id}>{id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Data</SelectItem>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="12h">Last 12 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature & Pressure Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature & Pressure</CardTitle>
            <CardDescription>
              Trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedTime" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="Temperature(C)" 
                    stroke="#8884d8" 
                    name="Temperature (°C)"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="Pressure(bar)" 
                    stroke="#82ca9d" 
                    name="Pressure (bar)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Production Metrics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Production Metrics</CardTitle>
            <CardDescription>
              Part count and material usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedTime" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="PartCount" 
                    fill="#8884d8" 
                    name="Parts Produced"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="MaterialUsed(kg)" 
                    fill="#82ca9d" 
                    name="Material Used (kg)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Error Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
            <CardDescription>
              Types of errors encountered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {errorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} occurrences`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Machine Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Machine Performance</CardTitle>
            <CardDescription>
              Average metrics by machine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineAverages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="machineId" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgCycleTime" fill="#8884d8" name="Avg Cycle Time (s)" />
                  <Bar dataKey="totalParts" fill="#82ca9d" name="Total Parts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
