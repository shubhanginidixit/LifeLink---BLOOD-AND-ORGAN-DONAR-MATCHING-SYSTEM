import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyTrendsChart = ({ data }) => {
  // Default data if none provided
  const chartData = data && data.length > 0 ? data : [
    { name: 'Jan', requests: 45 },
    { name: 'Feb', requests: 52 },
    { name: 'Mar', requests: 38 },
    { name: 'Apr', requests: 65 },
    { name: 'May', requests: 48 },
    { name: 'Jun', requests: 85 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel !rounded-lg p-3 !bg-[rgba(15,23,42,0.9)] !border-slate-700">
          <p className="text-slate-300 font-medium">{label}</p>
          <p className="text-info font-bold">{`${payload[0].value} Requests`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Monthly Trends</h3>
          <p className="text-xs text-slate-400">Donation requests over time</p>
        </div>
        <select className="bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] text-xs text-slate-300 rounded-lg px-2 py-1 outline-none">
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="requests" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRequests)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendsChart;
