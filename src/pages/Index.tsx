import { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { TimeMetricsCard } from '@/components/dashboard/TimeMetricsCard';
import { FilterBar, FilterType } from '@/components/dashboard/FilterBar';
import { ProductionChart } from '@/components/dashboard/ProductionChart';
import { RejectsChart } from '@/components/dashboard/RejectsChart';
import { EfficiencyChart } from '@/components/dashboard/EfficiencyChart';
import { StatusPieChart } from '@/components/dashboard/StatusPieChart';
import { LiveIndicator } from '@/components/dashboard/LiveIndicator';
import { 
  getMachineData, 
  getProductionHistory, 
  getTimeDistribution,
  Machine,
  ProductionDataPoint,
  TimeDistribution
} from '@/lib/mockData';
import { 
  Package, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge, 
  Target,
  Sun,
  Moon,
  LayoutGrid
} from 'lucide-react';

const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState('machine-1');
  const [activeFilter, setActiveFilter] = useState<FilterType>('shift');
  const [machineData, setMachineData] = useState<Machine | null>(null);
  const [productionHistory, setProductionHistory] = useState<ProductionDataPoint[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // --- THEME STATE MANAGEMENT ---
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Initialize theme based on preference or default to dark
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };
  // ------------------------------

  // Fetch data on machine change and interval
  useEffect(() => {
    if (!selectedMachine) return;
  
    const fetchData = async () => {
      try {
        const data = await getMachineData(selectedMachine);
        
        setMachineData(data);
  
        // ⛔ still mock for now (intentional)
        const history = await getProductionHistory(selectedMachine);
        console.log('PRODUCTION HISTORY:', history);

        setProductionHistory(history);

        // setTimeDistribution(getTimeDistribution(data));
        const distribution = await getTimeDistribution(selectedMachine);
        console.log('DISTRIBUTION FROM DB:', distribution);
        setTimeDistribution(distribution);

        setLastUpdate(new Date());
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
  
    fetchData(); // initial load
    const interval = setInterval(fetchData, 5000); // refresh every 5s
  
    return () => clearInterval(interval);
  }, [selectedMachine]);
  

  if (!machineData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
             <div className="h-12 w-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
        </div>
        <div className="text-muted-foreground font-medium animate-pulse">Syncing Machine Data...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'}`}>
      
      {/* Background Decorative Elements for aesthetic depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent dark:from-blue-900/10"></div>
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
      </div>

      <div className="relative z-10">
        <Header 
          selectedMachine={selectedMachine}
          machineStatus={machineData.status}
          machineName={machineData.name}
          onMachineChange={setSelectedMachine}
        />

        <main className="container px-4 md:px-6 py-8 space-y-8 max-w-[1600px] mx-auto">
          
          {/* Controls Bar: Filter, Theme, Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            
            <div className="flex items-center gap-4 ml-auto md:ml-0">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700">
                <LiveIndicator />
                <span className="text-xs text-muted-foreground font-mono">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-zinc-700"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              title="Total Produced"
              value={machineData.metrics.totalProduced}
              unit="pcs"
              icon={Package}
              trend="up"
              trendValue="+12% vs last shift"
              delay={0}
            />
            <KPICard
              title="Rejected"
              value={machineData.metrics.totalRejects}
              unit="pcs"
              icon={XCircle}
              variant="danger"
              delay={50}
            />
            <KPICard
              title="Accepted"
              value={machineData.metrics.acceptedPieces}
              unit="pcs"
              icon={CheckCircle2}
              variant="success"
              delay={100}
            />
            <KPICard
              title="PPM Rejection"
              value={machineData.metrics.ppmRejection.toLocaleString()}
              icon={AlertTriangle}
              variant={machineData.metrics.ppmRejection > 50000 ? 'warning' : 'default'}
              delay={150}
            />
            <KPICard
              title="Efficiency"
              value={machineData.metrics.efficiency.toFixed(1)}
              unit="%"
              icon={Gauge}
              variant={machineData.metrics.efficiency >= 85 ? 'success' : machineData.metrics.efficiency >= 70 ? 'warning' : 'danger'}
              delay={200}
            />
            <KPICard
              title="OEE"
              value={machineData.metrics.oee.toFixed(1)}
              unit="%"
              icon={Target}
              variant={machineData.metrics.oee >= 80 ? 'success' : machineData.metrics.oee >= 65 ? 'warning' : 'danger'}
              delay={250}
            />
          </div>

          {/* Time Metrics - Full Width */}
          <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800">
             <TimeMetricsCard 
                onTime={machineData.timeMetrics.onTime}
                offTime={machineData.timeMetrics.offTime}
                idleTime={machineData.timeMetrics.idleTime}
                faultTime={machineData.timeMetrics.faultTime}
                shiftStart={machineData.timeMetrics.shiftStart}
                shiftEnd={machineData.timeMetrics.shiftEnd}
             />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <div className="bg-white dark:bg-zinc-900/50 p-1 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
               <ProductionChart data={productionHistory} />
            </div>
            <div className="bg-white dark:bg-zinc-900/50 p-1 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
               <RejectsChart data={productionHistory} />
            </div>
            <div className="bg-white dark:bg-zinc-900/50 p-1 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
               <EfficiencyChart data={productionHistory} />
            </div>
            <div className="bg-white dark:bg-zinc-900/50 p-1 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
               <StatusPieChart data={timeDistribution} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;