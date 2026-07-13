import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { inventoryData } from './MockData';

export function InventoryChart() {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
            itemStyle={{ fontSize: '14px', fontWeight: 500 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          
          <Bar name="Current Stock" dataKey="stock" fill="#818cf8" radius={[4, 4, 0, 0]} animationDuration={1000}>
             {
              inventoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.stock <= entry.alert_threshold ? '#ef4444' : '#6366f1'} />
              ))
            }
          </Bar>
          <Bar name="Reorder Point" dataKey="reorder" fill="#cbd5e1" radius={[4, 4, 0, 0]} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
