export interface GanttJob {
  id: string;
  machine: string;
  name: string;
  product: string;
  start: number;
  duration: number;
  status: 'running' | 'planned' | 'blocked' | 'maintenance';
  plannedCycleTime: number | null;
  actualCycleTime: number | null;
  progress: number;
  operator: string;
  mold: string;
  material: string;
  constraints: string[];
  risk: 'low' | 'medium' | 'high';
}

// Define constants locally to avoid import issues
export const MACHINE_NAMES = ['M001', 'M002', 'M003', 'M004', 'M005', 'M006'] as const;

const OPERATORS = [
  'John Smith',
  'Maria Garcia', 
  'David Chen',
  'Sarah Wilson',
  'Mike Johnson',
  'Lisa Brown'
] as const;

export const generateGanttData = (): GanttJob[] => {
  const jobs: GanttJob[] = [];
  
  // Add safety check
  if (!MACHINE_NAMES || MACHINE_NAMES.length === 0) {
    console.warn('MACHINE_NAMES is not defined or empty');
    return jobs;
  }
  
  MACHINE_NAMES.forEach((machine, machineIndex) => {
    const startHour = machineIndex * 2;
    
    // Current job
    jobs.push({
      id: `job-${machineIndex}-1`,
      machine,
      name: `Job ${1000 + machineIndex * 10}`,
      product: `Product-${String.fromCharCode(65 + machineIndex)}`,
      start: startHour,
      duration: 4,
      status: 'running',
      plannedCycleTime: 12.5,
      actualCycleTime: 12.3,
      progress: 75,
      operator: OPERATORS[machineIndex] || 'Unknown Operator',
      mold: `M-2024-00${machineIndex + 1}`,
      material: `PP-${machineIndex + 1}00`,
      constraints: machineIndex === 2 ? ['mold-ready'] : machineIndex === 4 ? ['operator'] : [],
      risk: machineIndex === 3 ? 'high' : machineIndex === 1 ? 'medium' : 'low'
    });
    
    // Next job
    jobs.push({
      id: `job-${machineIndex}-2`,
      machine,
      name: `Job ${1010 + machineIndex * 10}`,
      product: `Product-${String.fromCharCode(66 + machineIndex)}`,
      start: startHour + 4,
      duration: 3,
      status: 'planned',
      plannedCycleTime: 11.0,
      actualCycleTime: null,
      progress: 0,
      operator: OPERATORS[machineIndex] || 'Unknown Operator',
      mold: `M-2024-00${machineIndex + 2}`,
      material: `ABS-${machineIndex + 1}00`,
      constraints: [],
      risk: 'low'
    });
    
    // Changeover
    if (machineIndex % 2 === 0) {
      jobs.push({
        id: `changeover-${machineIndex}`,
        machine,
        name: 'Mold Changeover',
        product: 'Changeover',
        start: startHour + 7,
        duration: 1,
        status: 'planned',
        plannedCycleTime: null,
        actualCycleTime: null,
        progress: 0,
        operator: 'Maintenance Team',
        mold: 'Changeover',
        material: 'N/A',
        constraints: ['mold-ready'],
        risk: 'medium'
      });
    }
  });
  
  return jobs;
};

export const formatTime = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};