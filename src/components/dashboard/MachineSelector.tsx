import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getMachineList, getStatusColor } from '@/lib/mockData';

interface Machine {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'off' | 'fault';
}

interface MachineSelectorProps {
  selectedMachine: string;
  onMachineChange: (machineId: string) => void;
}

export const MachineSelector = ({
  selectedMachine,
  onMachineChange,
}: MachineSelectorProps) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getMachineList()
      .then((data) => {
        if (mounted) {
          setMachines(data ?? []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load machines', err);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Select value={selectedMachine} onValueChange={onMachineChange}>
      <SelectTrigger className="w-[200px] bg-muted border-border">
        <SelectValue placeholder={loading ? 'Loading…' : 'Select machine'} />
      </SelectTrigger>

      <SelectContent className="bg-card border-border">
        {machines.map((machine) => (
          <SelectItem
            key={machine.id}
            value={machine.id}
            className="focus:bg-muted"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(
                  machine.status
                )}`}
              />
              {machine.name}
            </div>
          </SelectItem>
        ))}

        {!loading && machines.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No machines found
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
