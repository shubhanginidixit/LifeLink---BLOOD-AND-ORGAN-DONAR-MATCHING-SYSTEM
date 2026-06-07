import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const RequestsTable = ({ requests }) => {
  // Default data if none provided
  const data = requests && requests.length > 0 ? requests : [
    { id: 'REQ-001', hospital: 'City General Hospital', type: 'Blood (O+)', urgency: 'Critical', status: 'Pending', date: '2 mins ago' },
    { id: 'REQ-002', hospital: 'Mercy Medical Center', type: 'Kidney', urgency: 'High', status: 'Matched', date: '1 hour ago' },
    { id: 'REQ-003', hospital: 'St. Jude Hospital', type: 'Blood (A-)', urgency: 'Medium', status: 'Fulfilled', date: '5 hours ago' },
    { id: 'REQ-004', hospital: 'Westside Clinic', type: 'Blood (AB+)', urgency: 'Low', status: 'Pending', date: '1 day ago' },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return 'bg-[rgba(245,158,11,0.15)] text-warning border border-[rgba(245,158,11,0.3)]';
      case 'Matched': return 'bg-[rgba(59,130,246,0.15)] text-info border border-[rgba(59,130,246,0.3)]';
      case 'Fulfilled': return 'bg-[rgba(34,197,94,0.15)] text-success border border-[rgba(34,197,94,0.3)]';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  const getUrgencyColor = (urgency) => {
    if (urgency === 'Critical') return 'text-primary flex items-center gap-1 before:content-[""] before:w-2 before:h-2 before:bg-primary before:rounded-full before:animate-pulse';
    if (urgency === 'High') return 'text-orange-400';
    if (urgency === 'Medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="glass-panel p-6 overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Requests</h3>
        <button className="text-xs text-slate-300 hover:text-white transition-colors">
          View All
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.05)]">
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Hospital</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Urgency</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((req, i) => (
              <tr key={i} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                <td className="py-4 text-slate-200 font-medium">{req.hospital}</td>
                <td className="py-4 text-slate-300">{req.type}</td>
                <td className={`py-4 ${getUrgencyColor(req.urgency)}`}>{req.urgency}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="py-4 text-slate-400 text-xs">{req.date}</td>
                <td className="py-4 text-right">
                  <button className="p-1 rounded text-slate-500 hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsTable;
