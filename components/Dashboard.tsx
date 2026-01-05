
import React, { useState } from 'react';
import { CivicIssue, Priority } from '../types';
import IssueCard from './IssueCard';

interface DashboardProps {
  issues: CivicIssue[];
  onUpdateStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (issue: CivicIssue) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ issues, onUpdateStatus, onDelete, onEdit }) => {
  const [filter, setFilter] = useState<Priority | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredIssues = filter === 'All' 
    ? issues 
    : issues.filter(issue => issue.priority === filter);

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'bg-rose-500';
      case Priority.MEDIUM: return 'bg-amber-500';
      case Priority.LOW: return 'bg-sky-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Management Console</h2>
          <p className="text-slate-500 font-medium">Monitoring {filteredIssues.length} active civic reports</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {['All', Priority.HIGH, Priority.MEDIUM, Priority.LOW].map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p as any)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filter === p 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
          {filteredIssues.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-inner">
              <h3 className="text-xl font-bold text-slate-800">Queue is Clear</h3>
              <p className="text-slate-500 mt-2 font-medium">No pending civic reports found for this filter.</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                onDelete={() => onDelete(issue.id)}
                onEdit={() => onEdit(issue)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">ID / Priority</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Location Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Issue Summary</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-8 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">#{issue.id.slice(0,6)}</p>
                        <p className={`text-xs font-bold ${issue.priority === Priority.HIGH ? 'text-rose-600' : 'text-slate-700'}`}>
                          {issue.priority}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-slate-800">{issue.address.city}, {issue.address.district}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{issue.address.state} - {issue.address.pinCode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{issue.aiSummary}</p>
                    <p className="text-xs text-slate-500 italic line-clamp-1">"{issue.aiReason}"</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                    {new Date(issue.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => onEdit(issue)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => onDelete(issue.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(issue.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm transition-all hover:scale-105 active:scale-95 ${
                        issue.status === 'Resolved' ? 'bg-emerald-500 text-white' : 
                        issue.status === 'In Progress' ? 'bg-amber-400 text-amber-900' : 
                        'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      >
                        {issue.status}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
