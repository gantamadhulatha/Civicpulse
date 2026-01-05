
import React from 'react';
import { CivicIssue, Priority } from '../types';

interface IssueCardProps {
  issue: CivicIssue;
  onDelete?: () => void;
  onEdit?: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onDelete, onEdit }) => {
  const getPriorityStyles = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'border-rose-200 bg-rose-50 text-rose-700 shadow-rose-100';
      case Priority.MEDIUM: return 'border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100';
      case Priority.LOW: return 'border-sky-200 bg-sky-50 text-sky-700 shadow-sky-100';
      default: return 'border-slate-200 bg-slate-50 text-slate-700 shadow-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full ring-1 ring-slate-900/5">
      {issue.image ? (
        <div className="h-48 overflow-hidden relative">
          <img 
            src={issue.image} 
            alt="Evidence" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute top-5 left-5">
             <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-lg ${getPriorityStyles(issue.priority)}`}>
              {issue.priority}
            </span>
          </div>
          {/* Action floating buttons */}
          <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-700 hover:bg-indigo-600 hover:text-white transition-all"
              title="Edit Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-700 hover:bg-rose-600 hover:text-white transition-all"
              title="Delete Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-between px-6 pt-6">
          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${getPriorityStyles(issue.priority)}`}>
            {issue.priority}
          </span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Edit Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button 
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Delete Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{issue.aiSummary}</h3>
        
        {/* Structured Address */}
        <div className="mb-4 flex items-start gap-2 text-slate-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <div className="text-xs font-bold leading-tight">
             <span>{issue.address.city}, {issue.address.district}</span>
             <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{issue.address.state} {issue.address.pinCode}</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 font-medium mb-6 flex-1 line-clamp-3 leading-relaxed">
          {issue.description}
        </p>
        
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {new Date(issue.timestamp).toLocaleDateString()}
            </div>
            
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
              issue.status === 'Resolved' ? 'text-emerald-600 bg-emerald-50' : 
              issue.status === 'In Progress' ? 'text-amber-600 bg-amber-50' : 
              'text-slate-500 bg-slate-50'
            }`}>
              {issue.status}
            </span>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-700 italic font-medium leading-snug">"{issue.aiReason}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
