import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BloodGroupChart = ({ data }) => {
  // Format data if needed, or use defaults
  const chartData = data && data.length > 0 ? data : [
    { name: 'A+', count: 120 },
    { name: 'O+', count: 150 },
    { name: 'B+', count: 90 },
    { name: 'AB+', count: 40 },
    { name: 'A-', count: 30 },
    { name: 'O-', count: 50 },
    { name: 'B-', count: 20 },
    { name: 'AB-', count: 10 },
  ];

  // Vibrant gradient colors for the bars
  const colors = ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel !rounded-lg p-3 !bg-[rgba(15,23,42,0.9)] !border-slate-700">
          <p className="text-white font-medium">{`${payload[0].payload.name} Blood`}</p>
          <p className="text-primary font-bold">{`${payload[0].value} Donors`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Blood Group Distribution</h3>
        <button className="text-xs text-primary hover:text-rose-400 bg-[rgba(225,29,72,0.1)] px-3 py-1 rounded-full transition-colors">
          View All
        </button>
      </div>
      
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BloodGroupChart;
