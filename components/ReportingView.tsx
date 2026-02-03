
import React from 'react';
import { LegalTask, Invoice, Expense, TimeEntry } from '../types';

interface ReportingViewProps {
  tasks: LegalTask[];
  invoices: Invoice[];
  expenses: Expense[];
  timeEntries: TimeEntry[];
}

const ReportingView: React.FC<ReportingViewProps> = ({ tasks, invoices, expenses, timeEntries }) => {
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const realizationRate = 92; // Mock

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter">Executive Insights</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Partner-Level Business Intelligence</p>
        </div>
        <button className="px-6 py-3 bg-slate-900 border border-slate-800 text-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Export BI PDF</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Firm Realization', value: `${realizationRate}%`, color: 'text-emerald-400' },
          { label: 'Total Invoiced', value: `K${totalBilled.toLocaleString()}`, color: 'text-amber-400' },
          { label: 'WIP Liability', value: `K${tasks.reduce((s, t) => s + t.financials.suggested_fee, 0).toLocaleString()}`, color: 'text-rose-400' },
          { label: 'Profitability Index', value: '1.4x', color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-sm">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] p-10 h-80 flex flex-col justify-between">
          <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest">Revenue by Matter Category</h3>
          <div className="flex items-end justify-between h-40 space-x-6 px-4">
            {[45, 80, 55, 30].map((h, i) => (
              <div key={i} className="flex-1 bg-amber-600/20 hover:bg-amber-600 rounded-t-xl transition-all relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">{h}%</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 text-[9px] font-black text-slate-700 uppercase">
            <span>Corporate</span><span>Litigation</span><span>Property</span><span>Admin</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] p-10">
          <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-8">Lawyer Productivity (Hours)</h3>
          <div className="space-y-6">
            {['Sarah West', 'Henao Kila', 'Tau Geno'].map((name, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                  <span>{name}</span>
                  <span>{120 - (i * 15)}h / Mo</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${80 - (i * 10)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingView;
