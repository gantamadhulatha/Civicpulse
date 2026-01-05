
import React, { useState, useEffect } from 'react';
import { User, CivicIssue } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import ReportModal from './components/ReportModal';
import MapView from './components/MapView';
import Analytics from './components/Analytics';
import { ToastContainer, toast } from 'react-toastify';

export type ViewType = 'dashboard' | 'map' | 'analytics' | 'community' | 'notifications' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [issues, setIssues] = useState<CivicIssue[]>(() => {
    const saved = localStorage.getItem('cp_issues');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<CivicIssue | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('cp_issues', JSON.stringify(issues));
  }, [issues]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cp_user', JSON.stringify(userData));
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cp_user');
  };

  const saveIssue = (issue: CivicIssue) => {
    const exists = issues.find(i => i.id === issue.id);
    if (exists) {
      setIssues(prev => prev.map(i => i.id === issue.id ? issue : i));
      toast.success("Report updated successfully!");
    } else {
      setIssues(prev => [issue, ...prev]);
      toast.success("Issue submitted! Your report has been dispatched to officials.");
    }
    closeModal();
  };

  const deleteIssue = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this report?")) {
      setIssues(prev => prev.filter(i => i.id !== id));
      toast.error("Report deleted.");
    }
  };

  const openEditModal = (issue: CivicIssue) => {
    setEditingIssue(issue);
    setIsReportModalOpen(true);
  };

  const closeModal = () => {
    setIsReportModalOpen(false);
    setEditingIssue(undefined);
  };

  const updateIssueStatus = (id: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        const nextStatus: Record<string, CivicIssue['status']> = {
          'Pending': 'In Progress',
          'In Progress': 'Resolved',
          'Resolved': 'Pending'
        };
        return { ...issue, status: nextStatus[issue.status] };
      }
      return issue;
    }));
    toast.info("Status updated successfully");
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            issues={issues} 
            onUpdateStatus={updateIssueStatus} 
            onDelete={deleteIssue}
            onEdit={openEditModal}
          />
        );
      case 'map':
        return (
          <div className="flex-1 h-full p-4 md:p-8">
            <div className="bg-white rounded-2xl h-full shadow-sm border border-gray-100 overflow-hidden">
               <MapView issues={issues} />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Analytics issues={issues} />
          </div>
        );
      default:
        return <div className="p-8 text-center text-gray-500">View coming soon</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} onLogout={handleLogout} activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="md:hidden w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">CP</div>
            <h1 className="text-xl font-bold text-slate-900 capitalize">{activeView}</h1>
          </div>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Report Issue</span>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </div>
      </main>

      {isReportModalOpen && (
        <ReportModal 
          onClose={closeModal} 
          onSubmit={saveIssue}
          initialData={editingIssue}
        />
      )}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;
