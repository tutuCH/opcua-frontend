"use client"

import * as React from "react"
import { TIMELINE_CHART_CONFIG, CHART_COLORS } from "src/config/chartConfigs"
import { processTimelineData } from "src/utils/chartDataProcessors"
import ChartContainer from "../common/ChartContainer"
import ChartLegend from "../common/ChartLegend"
import { TimelineTooltip } from "../common/ChartTooltip"

/**
 * Multi-lane timeline chart for operational status visualization
 * Shows operation mode and system status across time with Gantt-style lanes
 */
export default function TimelineChart({
  data = [],
  timeRange = '24h',
  selectedMachine = 'all',
  height,
  compact = false,
  showOperationLane = true,
  showSystemLane = true,
  laneHeight = 40
}) {
  const processedData = React.useMemo(() => processTimelineData(data, {
      timeRange,
      selectedMachine
    }), [data, timeRange, selectedMachine]);

  const chartHeight = height || TIMELINE_CHART_CONFIG.height;
  const { lanes } = TIMELINE_CHART_CONFIG;

  // Filter lanes based on props
  const visibleLanes = React.useMemo(() => lanes.filter(lane => {
      if (lane.key === 'operation') return showOperationLane;
      if (lane.key === 'system') return showSystemLane;
      return true;
    }), [lanes, showOperationLane, showSystemLane]);

  // Generate legend items from lane configurations
  const legendItems = React.useMemo(() => {
    const items = [];
    
    visibleLanes.forEach(lane => {
      Object.entries(lane.colors).forEach(([status, color]) => {
        items.push({
          dataKey: `${lane.key}_${status.toLowerCase()}`,
          label: `${lane.label}: ${status}`,
          color,
          type: 'bar'
        });
      });
    });

    return items;
  }, [visibleLanes]);

  // Calculate total chart height including all lanes
  const totalChartHeight = visibleLanes.length * (laneHeight + 10) + 60;

  // Create timeline segments for rendering
  const timelineSegments = React.useMemo(() => {
    if (!processedData.length) return [];

    const segments = [];
    const currentSegments = {};

    processedData.forEach((dataPoint, index) => {
      visibleLanes.forEach(lane => {
        const statusKey = lane.key === 'operation' ? 'operationalStatus' : 'systemStatus';
        const status = dataPoint[statusKey];
        const laneId = lane.key;

        if (currentSegments[laneId]?.status !== status) {
          // End previous segment
          if (currentSegments[laneId]) {
            currentSegments[laneId].endTime = dataPoint.timestamp;
            currentSegments[laneId].duration = 
              currentSegments[laneId].endTime - currentSegments[laneId].startTime;
            segments.push({ ...currentSegments[laneId] });
          }

          // Start new segment
          currentSegments[laneId] = {
            lane: laneId,
            status,
            startTime: dataPoint.timestamp,
            startIndex: index,
            color: lane.colors[status] || CHART_COLORS.status.offline,
            devId: dataPoint.devId
          };
        }
      });
    });

    // Close remaining segments
    Object.values(currentSegments).forEach(segment => {
      if (segment && processedData.length > 0) {
        segment.endTime = processedData[processedData.length - 1].timestamp;
        segment.duration = segment.endTime - segment.startTime;
        segments.push(segment);
      }
    });

    return segments;
  }, [processedData, visibleLanes]);

  // Custom timeline renderer
  const renderTimeline = () => {
    if (!processedData.length) return null;

    const startTime = processedData[0].timestamp;
    const endTime = processedData[processedData.length - 1].timestamp;
    const totalDuration = endTime - startTime;

    return (
      <div className="relative w-full" style={{ height: totalChartHeight }}>
        {/* Time axis */}
        <div className="absolute top-0 left-0 right-0 h-6 border-b border-border">
          <div className="flex justify-between text-xs text-muted-foreground px-2 py-1">
            <span>{new Date(startTime).toLocaleTimeString()}</span>
            <span>Timeline ({timeRange})</span>
            <span>{new Date(endTime).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Lanes */}
        {visibleLanes.map((lane, laneIndex) => {
          const laneY = 30 + (laneIndex * (laneHeight + 10));
          const laneSegments = timelineSegments.filter(seg => seg.lane === lane.key);

          return (
            <div key={lane.key} className="absolute" style={{ 
              top: laneY, 
              left: 0, 
              right: 0, 
              height: laneHeight 
            }}>
              {/* Lane Label */}
              <div className="absolute -left-2 top-0 bottom-0 w-20 flex items-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {lane.label}
                </span>
              </div>

              {/* Lane Background */}
              <div className="ml-24 h-full bg-muted/30 rounded border border-border relative">
                {/* Timeline Segments */}
                {laneSegments.map((segment, segIndex) => {
                  const leftPercent = ((segment.startTime - startTime) / totalDuration) * 100;
                  const widthPercent = (segment.duration / totalDuration) * 100;

                  return (
                    <div
                      key={segIndex}
                      className="absolute top-1 bottom-1 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 0.5)}%`,
                        backgroundColor: segment.color
                      }}
                      title={`${segment.status} (${Math.round(segment.duration / 60000)}min)`}
                    >
                      {/* Status label if segment is wide enough */}
                      {widthPercent > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white truncate px-1">
                            {segment.status}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate status duration summaries
  const statusSummary = React.useMemo(() => {
    if (!timelineSegments.length) return {};

    const summary = {};
    
    timelineSegments.forEach(segment => {
      const key = `${segment.lane}_${segment.status}`;
      if (!summary[key]) {
        summary[key] = {
          lane: segment.lane,
          status: segment.status,
          totalDuration: 0,
          count: 0,
          color: segment.color
        };
      }
      summary[key].totalDuration += segment.duration;
      summary[key].count += 1;
    });

    return summary;
  }, [timelineSegments]);

  return (
    <ChartContainer
      title="Operation Timeline"
      description="Multi-lane view of machine operational and system status over time"
      height={totalChartHeight + (compact ? 60 : 120)}
      loading={!processedData.length && data.length === 0}
      compact={compact}
    >
      <div className="space-y-4">
        {/* Legend */}
        <ChartLegend
          items={legendItems}
          orientation="horizontal"
          position="top"
          compact={compact}
        />

        {/* Timeline Chart */}
        <div className="relative">
          {renderTimeline()}
        </div>

        {/* Status Duration Summary */}
        {!compact && Object.keys(statusSummary).length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <div className="text-sm font-medium">Status Duration Summary</div>
            
            {visibleLanes.map(lane => {
              const laneStatuses = Object.values(statusSummary)
                .filter(item => item.lane === lane.key)
                .sort((a, b) => b.totalDuration - a.totalDuration);

              if (!laneStatuses.length) return null;

              const totalLaneDuration = laneStatuses.reduce((sum, item) => sum + item.totalDuration, 0);

              return (
                <div key={lane.key} className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase">
                    {lane.label}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {laneStatuses.map(item => (
                      <div key={`${item.lane}_${item.status}`} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs font-medium">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono">
                            {Math.round(item.totalDuration / 60000)}min
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((item.totalDuration / totalLaneDuration) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChartContainer>
  );
}