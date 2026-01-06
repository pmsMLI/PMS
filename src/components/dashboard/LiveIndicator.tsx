import { Radio } from 'lucide-react';

export const LiveIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-running/10 border border-status-running/30">
      <Radio className="h-4 w-4 text-status-running animate-pulse" />
      <span className="text-sm font-medium text-status-running">LIVE</span>
    </div>
  );
};
