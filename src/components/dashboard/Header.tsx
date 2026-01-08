import { Activity, LogOut, Boxes } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { MachineSelector } from './MachineSelector';
import { StatusBadge } from './StatusBadge';
import { MachineStatus } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  selectedMachine: string;
  machineStatus: MachineStatus;
  machineName: string;
  onMachineChange: (machineId: string) => void;
}

export const Header = ({
  selectedMachine,
  machineStatus,
  machineName,
  onMachineChange,
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* LEFT BRAND */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 glow-blue">
              <img
                src="/fi.jpg"
                alt="PMS Logo"
                className="h-6 w-6 object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold tracking-tight">PMS</h1>
              <p className="text-xs text-muted-foreground">
                Plant Monitoring System
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* MACHINE SELECT */}
          <MachineSelector
            selectedMachine={selectedMachine}
            onMachineChange={onMachineChange}
          />

          {/* MACHINE STATUS */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <span className="text-sm text-muted-foreground">
              {machineName}
            </span>
            <StatusBadge status={machineStatus} />
          </div>

          {/* INVENTORY NAV */}
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            title="Inventory Manager"
          >
            <Boxes className="h-5 w-5 text-muted-foreground" />
            <span className="hidden md:inline text-sm">Inventory</span>
          </button>

          {/* LOGOUT */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/login');
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
