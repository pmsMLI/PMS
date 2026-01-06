import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterType = 'today' | 'shift' | 'week' | 'custom';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FilterBar = ({ activeFilter, onFilterChange }: FilterBarProps) => {
  const filters: { id: FilterType; label: string; icon: typeof Calendar }[] = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'shift', label: 'Current Shift', icon: Clock },
    { id: 'week', label: 'Last 7 Days', icon: Calendar },
    { id: 'custom', label: 'Custom', icon: Calendar },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-muted/50 border border-border w-fit">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            activeFilter === filter.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <filter.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{filter.label}</span>
        </button>
      ))}
    </div>
  );
};
