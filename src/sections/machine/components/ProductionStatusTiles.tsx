import React from 'react';
import { SummaryKPIs } from './SummaryKPIs';
import { MachineCard } from './MachineCard';
import { machines, generateSparklineData } from './machineData';

export function ProductionStatusTiles() {
  const sparklineData = generateSparklineData();
  
  const summaryStats = {
    totalMachines: machines.length,
    running: machines.filter(m => m.status === 'Running').length,
    alarms: machines.filter(m => m.status === 'Alarm').length,
    avgUtilization: Math.round(machines.reduce((sum, m) => sum + m.utilization, 0) / machines.length)
  };

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <SummaryKPIs summaryStats={summaryStats} />

      {/* Machine Tiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            sparklineData={sparklineData}
          />
        ))}
      </div>
    </div>
  );
}