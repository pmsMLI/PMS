import { Clock, Play, Pause, Power, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeMetric {
  label: string;
  value: number;
  icon: typeof Clock;
  color: string;
}

interface TimeMetricsCardProps {
  onTime: number;
  offTime: number;
  idleTime: number;
  faultTime: number;
  shiftStart: string;
  shiftEnd: string;
}

export const TimeMetricsCard = ({ onTime, offTime, idleTime, faultTime, shiftStart, shiftEnd }: TimeMetricsCardProps) => {
  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const metrics: TimeMetric[] = [
    { label: 'Running', value: onTime, icon: Play, color: 'text-status-running' },
    { label: 'Off', value: offTime, icon: Power, color: 'text-status-offline' },
    { label: 'Idle', value: idleTime, icon: Pause, color: 'text-status-warning' },
    { label: 'Fault', value: faultTime, icon: AlertTriangle, color: 'text-status-fault' },
  ];

  const totalTime = onTime + offTime + idleTime + faultTime;

  return (
    <div className="card-industrial animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Time Metrics</h3>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Shift: {shiftStart} - {shiftEnd}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-muted">
        <div 
          className="bg-status-running transition-all duration-500" 
          style={{ width: `${(onTime / totalTime) * 100}%` }}
        />
        <div 
          className="bg-status-offline transition-all duration-500" 
          style={{ width: `${(offTime / totalTime) * 100}%` }}
        />
        <div 
          className="bg-status-warning transition-all duration-500" 
          style={{ width: `${(idleTime / totalTime) * 100}%` }}
        />
        <div 
          className="bg-status-fault transition-all duration-500" 
          style={{ width: `${(faultTime / totalTime) * 100}%` }}
        />
      </div>

      {/* Time Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <metric.icon className={cn('h-4 w-4', metric.color)} />
            <div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="font-mono font-semibold text-sm">{formatTime(metric.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
