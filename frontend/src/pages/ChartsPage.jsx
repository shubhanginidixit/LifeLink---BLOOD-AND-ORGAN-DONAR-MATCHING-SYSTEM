import React from 'react';
import BloodGroupChart from '../components/BloodGroupChart';
import MonthlyTrendsChart from '../components/MonthlyTrendsChart';
import OrganSummary from '../components/OrganSummary';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const ChartsPage = () => {
  const statusData = [
    { name: 'Fulfilled', value: 450, color: '#22C55E' },
    { name: 'Matched', value: 120, color: '#3B82F6' },
    { name: 'Pending', value: 85, color: '#F59E0B' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel !rounded-lg p-3 !bg-[rgba(15,23,42,0.9)] !border-slate-700">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="font-bold" style={{ color: payload[0].payload.color }}>{`${payload[0].value} Requests`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10 animate-fade-in">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white">System Analytics</h2>
        <p className="text-slate-400 text-sm">Comprehensive view of donation and request metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="h-full">
          <BloodGroupChart />
        </div>
        <div className="h-full">
          <MonthlyTrendsChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[350px]">
        <div className="h-full">
          <OrganSummary />
        </div>
        
        <div className="glass-panel p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Request Status Breakdown</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsPage;
