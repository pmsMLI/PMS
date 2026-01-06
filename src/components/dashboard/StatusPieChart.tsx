import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TimeDistribution } from '@/lib/mockData';
import { PieChartIcon } from 'lucide-react';




interface StatusPieChartProps {
  data: TimeDistribution[];
}

const COLORS = [
  'hsl(123, 46%, 34%)',  // Running - green
  'hsl(0, 0%, 62%)',     // Off - gray
  'hsl(45, 100%, 51%)',  // Idle - yellow
  'hsl(0, 65%, 51%)',    // Fault - red
];

export const StatusPieChart = ({ data }: StatusPieChartProps) => {
  return (
    <div className="card-industrial h-[320px] animate-fade-in-up" style={{ animationDelay: '600ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Status Distribution</h3>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="hsl(0, 0%, 12%)"
            strokeWidth={2}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 12%)', 
              border: '1px solid hsl(200, 18%, 26%)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`${value}%`, '']}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={10}
            formatter={(value) => <span style={{ color: 'hsl(200, 15%, 73%)', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
