
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CMSView from './components/CMSView';
import FinanceView from './components/FinanceView';
import PeopleView from './components/PeopleView';
import CalendarView from './components/CalendarView';
import CRMView from './components/CRMView';
import ReportingView from './components/ReportingView';
import Processor from './components/Processor';
import { LegalTask, Expense, TimeEntry, Invoice, InvoiceStatus, CalendarEvent, Client } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [viewContext, setViewContext] = useState<any>(null);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // State management
  const [tasks, setTasks] = useState<LegalTask[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const saved = {
      tasks: localStorage.getItem('sasingian_tasks'),
      expenses: localStorage.getItem('sasingian_expenses'),
      time: localStorage.getItem('sasingian_time'),
      invoices: localStorage.getItem('sasingian_invoices'),
      events: localStorage.getItem('sasingian_events'),
      clients: localStorage.getItem('sasingian_clients'),
      auth: localStorage.getItem('sasingian_auth'),
    };

    if (saved.tasks) setTasks(JSON.parse(saved.tasks));
    if (saved.expenses) setExpenses(JSON.parse(saved.expenses));
    if (saved.time) setTimeEntries(JSON.parse(saved.time));
    if (saved.invoices) setInvoices(JSON.parse(saved.invoices));
    if (saved.events) setEvents(JSON.parse(saved.events));
    if (saved.clients) setClients(JSON.parse(saved.clients));
    if (saved.auth) {
      const authData = JSON.parse(saved.auth);
      setIsLoggedIn(authData.isLoggedIn);
      setUser(authData.user);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sasingian_tasks', JSON.stringify(tasks));
    localStorage.setItem('sasingian_expenses', JSON.stringify(expenses));
    localStorage.setItem('sasingian_time', JSON.stringify(timeEntries));
    localStorage.setItem('sasingian_invoices', JSON.stringify(invoices));
    localStorage.setItem('sasingian_events', JSON.stringify(events));
    localStorage.setItem('sasingian_clients', JSON.stringify(clients));
    localStorage.setItem('sasingian_auth', JSON.stringify({ isLoggedIn, user }));
  }, [tasks, expenses, timeEntries, invoices, events, clients, isLoggedIn, user]);

  const handleUpdateTask = useCallback((id: string, updates: Partial<LegalTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const handleAddTask = useCallback((task: LegalTask) => {
    setTasks(prev => [task, ...prev]);
  }, []);

  const jumpToView = (view: string, context?: any) => {
    setActiveView(view);
    setViewContext(context);
    setTimeout(() => setViewContext(null), 100);
  };

  const handleLogin = (userData: any) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const renderView = () => {
    if (!isLoggedIn && activeView !== 'dashboard' && activeView !== 'intake') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-amber-600 flex items-center justify-center">
             <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h2 className="text-2xl font-black text-amber-500 uppercase tracking-tighter">Terminal Restricted</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-xs leading-relaxed">Please log in to access advanced firm orchestrations.</p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard': 
        return <Dashboard 
          tasks={tasks} 
          onUpdateTask={handleUpdateTask} 
          onAddTask={handleAddTask} 
          jumpToView={jumpToView}
        />;
      case 'intake':
        return <Processor onProcessed={(task) => { handleAddTask(task); setActiveView('dashboard'); }} />;
      case 'calendar': 
        return <CalendarView 
          events={events} 
          tasks={tasks} 
          onAddEvent={(e) => setEvents([e, ...events])} 
          initialContext={viewContext}
        />;
      case 'cms': 
        return <CMSView 
          tasks={tasks} 
          initialContext={viewContext}
        />;
      case 'crm': 
        return <CRMView 
          clients={clients} 
          tasks={tasks} 
          onAddClient={(c) => setClients([c, ...clients])} 
        />;
      case 'financials': 
        return (
          <FinanceView 
            expenses={expenses} onAddExpense={(e) => setExpenses([e, ...expenses])}
            timeEntries={timeEntries} onAddTimeEntry={(t) => setTimeEntries([t, ...timeEntries])}
            tasks={tasks} invoices={invoices}
            onAddInvoice={(i) => setInvoices([i, ...invoices])}
            onUpdateInvoice={(id, status) => setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))}
            initialContext={viewContext}
          />
        );
      case 'reports': 
        return <ReportingView tasks={tasks} invoices={invoices} expenses={expenses} timeEntries={timeEntries} />;
      case 'people': 
        return <PeopleView />;
      default: 
        return <Dashboard tasks={tasks} onUpdateTask={handleUpdateTask} onAddTask={handleAddTask} jumpToView={jumpToView} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView} 
      isLoggedIn={isLoggedIn} 
      user={user} 
      onLogin={handleLogin} 
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
