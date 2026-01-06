import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ProductionDataPoint } from '@/lib/mockData';
import { Gauge } from 'lucide-react';

interface EfficiencyChartProps {
  data: ProductionDataPoint[];
}

export const EfficiencyChart = ({ data }: EfficiencyChartProps) => {
  return (
    <div className="card-industrial h-[320px] animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="h-5 w-5 text-status-running" />
        <h3 className="font-semibold">Efficiency Trend</h3>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 18%, 26%)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(200, 15%, 73%)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(200, 15%, 73%)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[60, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 12%)', 
              border: '1px solid hsl(200, 18%, 26%)',
              borderRadius: '8px',
              color: 'white'
            }}
            labelStyle={{ color: 'hsl(200, 15%, 73%)' }}
            formatter={(value: number) => [`${value}%`, 'Efficiency']}
          />
          <ReferenceLine 
            y={85} 
            stroke="hsl(0, 74%, 55%)" 
            strokeDasharray="5 5" 
            label={{ value: 'Target', fill: 'hsl(0, 74%, 55%)', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="hsl(123, 46%, 34%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(123, 46%, 34%)', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(123, 46%, 34%)', stroke: 'white', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
