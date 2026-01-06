import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  delay?: number;
}

export const KPICard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = 'default',
  delay = 0
}: KPICardProps) => {
  const variantStyles = {
    default: 'border-border hover:border-primary/50',
    success: 'border-status-running/30 hover:border-status-running/60',
    warning: 'border-status-warning/30 hover:border-status-warning/60',
    danger: 'border-status-fault/30 hover:border-status-fault/60',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-status-running/10 text-status-running',
    warning: 'bg-status-warning/10 text-status-warning',
    danger: 'bg-status-fault/10 text-status-fault',
  };

  return (
    <div 
      className={cn(
        'card-industrial transition-all duration-300 hover:scale-[1.02] animate-fade-in-up',
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' && 'text-status-running',
              trend === 'down' && 'text-status-fault',
              trend === 'neutral' && 'text-muted-foreground'
            )}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
