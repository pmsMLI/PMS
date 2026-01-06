import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ProductionDataPoint } from '@/lib/mockData';
import { TrendingUp } from 'lucide-react';

interface ProductionChartProps {
  data: ProductionDataPoint[];
}

export const ProductionChart = ({ data }: ProductionChartProps) => {
  return (
    <div className="card-industrial h-[320px] animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Production Output</h3>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(207, 90%, 61%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(207, 90%, 61%)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          />
          <Area
            type="monotone"
            dataKey="produced"
            stroke="hsl(207, 90%, 61%)"
            strokeWidth={2}
            fill="url(#productionGradient)"
            dot={{ fill: 'hsl(207, 90%, 61%)', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(207, 90%, 61%)', stroke: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
