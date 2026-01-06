import { supabase } from './supabase';

export type MachineStatus = 'running' | 'idle' | 'off' | 'fault';

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  metrics: {
    totalProduced: number;
    totalRejects: number;
    acceptedPieces: number;
    ppmRejection: number;
    efficiency: number;
    oee: number;
  };
  timeMetrics: {
    onTime: number;
    offTime: number;
    idleTime: number;
    faultTime: number;
    shiftStart: string;
    shiftEnd: string;
  };
}

export interface ProductionDataPoint {
  time: string;
  hour: number;
  produced: number;
  rejects: number;
  efficiency: number;
}

export interface TimeDistribution {
  name: string;
  value: number;
  color: string;
}

const generateProductionData = (baseProduction: number, baseReject: number): ProductionDataPoint[] => {
  const data: ProductionDataPoint[] = [];
  const currentHour = new Date().getHours();
  
  for (let i = 0; i < 8; i++) {
    const hour = (currentHour - 7 + i + 24) % 24;
    const variance = 0.8 + Math.random() * 0.4;
    const produced = Math.floor(baseProduction * variance);
    const rejects = Math.floor(baseReject * (0.5 + Math.random()));
    const efficiency = Math.min(98, Math.max(75, 85 + (Math.random() - 0.5) * 20));
    
    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour,
      produced,
      rejects,
      efficiency: Math.round(efficiency * 10) / 10,
    });
  }
  
  return data;
};

const machines: Record<string, Machine> = {
  'machine-1': {
    id: 'machine-1',
    name: 'CNC Machine 01',
    status: 'running',
    metrics: {
      totalProduced: 4582,
      totalRejects: 47,
      acceptedPieces: 4535,
      ppmRejection: 10256,
      efficiency: 92.3,
      oee: 87.5,
    },
    timeMetrics: {
      onTime: 6.5,
      offTime: 0.5,
      idleTime: 0.75,
      faultTime: 0.25,
      shiftStart: '06:00',
      shiftEnd: '14:00',
    },
  },
  'machine-2': {
    id: 'machine-2',
    name: 'Assembly Line 02',
    status: 'idle',
    metrics: {
      totalProduced: 2847,
      totalRejects: 89,
      acceptedPieces: 2758,
      ppmRejection: 31259,
      efficiency: 78.4,
      oee: 72.1,
    },
    timeMetrics: {
      onTime: 5.2,
      offTime: 1.0,
      idleTime: 1.5,
      faultTime: 0.3,
      shiftStart: '06:00',
      shiftEnd: '14:00',
    },
  },
  'machine-3': {
    id: 'machine-3',
    name: 'Packaging Unit 03',
    status: 'fault',
    metrics: {
      totalProduced: 1205,
      totalRejects: 156,
      acceptedPieces: 1049,
      ppmRejection: 129461,
      efficiency: 45.2,
      oee: 38.7,
    },
    timeMetrics: {
      onTime: 3.0,
      offTime: 2.5,
      idleTime: 1.0,
      faultTime: 1.5,
      shiftStart: '06:00',
      shiftEnd: '14:00',
    },
  },
};


export const getMachineList = async () => {
  const { data, error } = await supabase
    .from('machines')
    .select('id, name, status')
    .order('id');

  if (error) {
    console.error('getMachineList error:', error);
    throw error;
  }

  return data;
};


// export const getMachineData = (machineId: string): Machine => {
//   const machine = machines[machineId] || machines['machine-1'];
  
//   // Add some random variance to simulate real-time updates
//   const variance = () => (Math.random() - 0.5) * 0.02;
  
//   return {
//     ...machine,
//     metrics: {
//       ...machine.metrics,
//       totalProduced: machine.metrics.totalProduced + Math.floor(Math.random() * 5),
//       totalRejects: machine.metrics.totalRejects + (Math.random() > 0.9 ? 1 : 0),
//       efficiency: Math.min(100, Math.max(0, machine.metrics.efficiency + variance() * 10)),
//       oee: Math.min(100, Math.max(0, machine.metrics.oee + variance() * 10)),
//     },
//   };
// };


export const getMachineData = async (machineId: string): Promise<Machine> => {
  const { data, error } = await supabase
    .from('machines')
    .select(`
      id,
      name,
      status,
      total_produced,
      total_rejects,
      accepted_pieces,
      ppm_rejection,
      efficiency,
      oee,
      on_time,
      off_time,
      idle_time,
      fault_time,
      shift_start,
      shift_end
    `)
    .eq('id', machineId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    status: data.status,
    metrics: {
      totalProduced: data.total_produced,
      totalRejects: data.total_rejects,
      acceptedPieces: data.accepted_pieces,
      ppmRejection: data.ppm_rejection,
      efficiency: data.efficiency,
      oee: data.oee,
    },
    timeMetrics: {
      onTime: data.on_time,
      offTime: data.off_time,
      idleTime: data.idle_time,
      faultTime: data.fault_time,
      shiftStart: data.shift_start,
      shiftEnd: data.shift_end,
    },
  };
};




// export const getProductionHistory = (machineId: string): ProductionDataPoint[] => {
//   const baseProduction = machineId === 'machine-1' ? 580 : machineId === 'machine-2' ? 360 : 150;
//   const baseReject = machineId === 'machine-1' ? 6 : machineId === 'machine-2' ? 11 : 20;
  
//   return generateProductionData(baseProduction, baseReject);
// };


export const getProductionHistory = async (
  machineId: string
): Promise<ProductionDataPoint[]> => {
  const { data, error } = await supabase
    .from('production_history')
    .select(`
      hour,
      time_label,
      produced,
      rejects,
      efficiency
    `)
    .eq('machine_id', machineId)
    .order('hour', { ascending: true });

  if (error) {
    console.error('getProductionHistory error:', error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    hour: row.hour,
    time: row.time_label,   // 🔥 THIS IS THE KEY FIX
    produced: row.produced,
    rejects: row.rejects,
    efficiency: row.efficiency,
  }));
};






// export const getTimeDistribution = (machine: Machine): TimeDistribution[] => {
//   const total = machine.timeMetrics.onTime + machine.timeMetrics.offTime + 
//                 machine.timeMetrics.idleTime + machine.timeMetrics.faultTime;
  
//   return [
//     { name: 'Running', value: Math.round((machine.timeMetrics.onTime / total) * 100), color: 'hsl(var(--status-running))' },
//     { name: 'Off', value: Math.round((machine.timeMetrics.offTime / total) * 100), color: 'hsl(var(--status-offline))' },
//     { name: 'Idle', value: Math.round((machine.timeMetrics.idleTime / total) * 100), color: 'hsl(var(--status-warning))' },
//     { name: 'Fault', value: Math.round((machine.timeMetrics.faultTime / total) * 100), color: 'hsl(var(--status-fault))' },
//   ];
// };


export const getTimeDistribution = async (
  machineId: string
): Promise<TimeDistribution[]> => {
  const { data, error } = await supabase
    .from('machine_time_distribution')
    .select('name, value')
    .eq('machine_id', machineId);

  if (error) {
    console.error('getTimeDistribution error:', error);
    throw error;
  }

  return data.map((row) => ({
    name: row.name,
    value: row.value,
    color: getColorForStatus(row.name),
  }));
};

// helper stays frontend-only
const getColorForStatus = (name: string) => {
  switch (name) {
    case 'Running':
      return 'hsl(var(--status-running))';
    case 'Idle':
      return 'hsl(var(--status-warning))';
    case 'Off':
      return 'hsl(var(--status-offline))';
    case 'Fault':
      return 'hsl(var(--status-fault))';
    default:
      return '#999';
  }
};



export const getStatusColor = (status: MachineStatus): string => {
  const colors: Record<MachineStatus, string> = {
    running: 'bg-status-running',
    idle: 'bg-status-warning',
    off: 'bg-status-offline',
    fault: 'bg-status-fault',
  };
  return colors[status];
};

export const getStatusGlow = (status: MachineStatus): string => {
  const glows: Record<MachineStatus, string> = {
    running: 'glow-green',
    idle: 'glow-yellow',
    off: '',
    fault: 'glow-red',
  };
  return glows[status];
};

export const getStatusLabel = (status: MachineStatus): string => {
  const labels: Record<MachineStatus, string> = {
    running: 'Running',
    idle: 'Idle',
    off: 'Offline',
    fault: 'Fault',
  };
  return labels[status];
};

