
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { CivicIssue, Priority } from '../types';

interface AnalyticsProps {
  issues: CivicIssue[];
}

const Analytics: React.FC<AnalyticsProps> = ({ issues }) => {
  // Data for Pie Chart
  const priorityData = [
    { name: 'High', value: issues.filter(i => i.priority === Priority.HIGH).length, color: '#EF4444' },
    { name: 'Medium', value: issues.filter(i => i.priority === Priority.MEDIUM).length, color: '#F59E0B' },
    { name: 'Low', value: issues.filter(i => i.priority === Priority.LOW).length, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  // Data for Timeline Chart (last 7 days simulation)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = issues.filter(issue => {
      const issueDate = new Date(issue.timestamp);
      return issueDate.toDateString() === d.toDateString();
    }).length;
    return { name: dateStr, reports: count };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Priority Distribution</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Reporting Trends (7 Days)</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="reports" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Reports" value={issues.length} color="indigo" />
        <StatCard title="Resolved" value={issues.filter(i => i.status === 'Resolved').length} color="green" />
        <StatCard title="Critical (High)" value={issues.filter(i => i.priority === Priority.HIGH).length} color="red" />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
  <div className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-${color}-500`}>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default Analytics;
