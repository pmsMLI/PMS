import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProductionDataPoint } from '@/lib/mockData';
import { AlertCircle } from 'lucide-react';

interface RejectsChartProps {
  data: ProductionDataPoint[];
}

export const RejectsChart = ({ data }: RejectsChartProps) => {
  return (
    <div className="card-industrial h-[320px] animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-status-fault" />
        <h3 className="font-semibold">Reject Analysis</h3>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 12%)', 
              border: '1px solid hsl(200, 18%, 26%)',
              borderRadius: '8px',
              color: 'white'
            }}
            labelStyle={{ color: 'hsl(200, 15%, 73%)' }}
            cursor={{ fill: 'hsl(200, 18%, 26%)', opacity: 0.3 }}
          />
          <Bar 
            dataKey="rejects" 
            fill="hsl(0, 65%, 51%)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
