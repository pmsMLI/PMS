import { MachineStatus, getStatusColor, getStatusGlow, getStatusLabel } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: MachineStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = ({ status, showLabel = true, size = 'md' }: StatusBadgeProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          getStatusColor(status),
          getStatusGlow(status)
        )}
      />
      {showLabel && (
        <span className={cn(
          'text-sm font-medium capitalize',
          status === 'running' && 'text-status-running',
          status === 'idle' && 'text-status-warning',
          status === 'off' && 'text-status-offline',
          status === 'fault' && 'text-status-fault'
        )}>
          {getStatusLabel(status)}
        </span>
      )}
    </div>
  );
};
