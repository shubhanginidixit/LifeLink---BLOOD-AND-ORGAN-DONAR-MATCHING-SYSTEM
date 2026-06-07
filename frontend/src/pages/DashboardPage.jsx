import React from 'react';
import KPICard from '../components/KPICard';
import BloodGroupChart from '../components/BloodGroupChart';
import MonthlyTrendsChart from '../components/MonthlyTrendsChart';
import RequestsTable from '../components/RequestsTable';
import NearbyDonors from '../components/NearbyDonors';
import OrganSummary from '../components/OrganSummary';
import EmergencyPanel from '../components/EmergencyPanel';
import NotificationFeed from '../components/NotificationFeed';

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10 animate-fade-in">
      
      {/* Top Row: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Donors" value="1248" iconName="Users" />
        <KPICard title="Active Requests" value="34" iconName="Activity" />
        <KPICard title="Successful Matches" value="892" iconName="Heart" />
        <KPICard title="Registered Hospitals" value="156" iconName="Building" />
      </div>

      {/* Middle Row: Charts & Emergency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[350px]">
        <div className="lg:col-span-5 h-full">
          <BloodGroupChart />
        </div>
        <div className="lg:col-span-4 h-full">
          <MonthlyTrendsChart />
        </div>
        <div className="lg:col-span-3 h-full">
          <EmergencyPanel />
        </div>
      </div>

      {/* Bottom Row: Tables & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
        <div className="lg:col-span-8 h-full flex flex-col gap-6">
          <div className="h-[250px]">
            <NearbyDonors />
          </div>
          <div className="flex-1 min-h-[300px]">
            <RequestsTable />
          </div>
        </div>
        
        <div className="lg:col-span-4 h-full flex flex-col gap-6">
          <div className="h-[200px]">
            <OrganSummary />
          </div>
          <div className="flex-1 min-h-[350px]">
            <NotificationFeed />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DashboardPage;
