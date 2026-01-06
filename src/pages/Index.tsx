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
  Target 
} from 'lucide-react';

const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState('machine-1');
  const [activeFilter, setActiveFilter] = useState<FilterType>('shift');
  const [machineData, setMachineData] = useState<Machine | null>(null);
  const [productionHistory, setProductionHistory] = useState<ProductionDataPoint[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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
        setTimeDistribution(await getTimeDistribution(selectedMachine));
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedMachine={selectedMachine}
        machineStatus={machineData.status}
        machineName={machineData.name}
        onMachineChange={setSelectedMachine}
      />

      <main className="container px-4 md:px-6 py-6 space-y-6">
        {/* Filter and Live Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <div className="flex items-center gap-4">
            <LiveIndicator />
            <span className="text-xs text-muted-foreground font-mono">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* KPI Cards */}
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

        {/* Time Metrics */}
        <TimeMetricsCard 
          onTime={machineData.timeMetrics.onTime}
          offTime={machineData.timeMetrics.offTime}
          idleTime={machineData.timeMetrics.idleTime}
          faultTime={machineData.timeMetrics.faultTime}
          shiftStart={machineData.timeMetrics.shiftStart}
          shiftEnd={machineData.timeMetrics.shiftEnd}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductionChart data={productionHistory} />
          <RejectsChart data={productionHistory} />
          <EfficiencyChart data={productionHistory} />
          <StatusPieChart data={timeDistribution} />
        </div>
      </main>
    </div>
  );
};

export default Index;
