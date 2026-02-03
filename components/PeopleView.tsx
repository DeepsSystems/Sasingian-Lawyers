
import React, { useState } from 'react';

const PeopleView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'governance' | 'portal'>('directory');

  const metrics = [
    { label: 'Total Staff', value: '24', sub: '2 New this month', color: 'text-amber-100' },
    { label: 'Firm Utilization', value: '88%', sub: 'Avg across counsel', color: 'text-amber-500' },
    { label: 'Active Leave', value: '3', sub: '1 Returning tomorrow', color: 'text-rose-500' },
    { label: 'Governance', value: '98%', sub: 'Audit ready', color: 'text-emerald-500' },
  ];

  const staff = [
    { 
      id: 1, 
      name: 'Mr. Edward Sasingian', 
      role: 'Principal Partner', 
      specialty: 'Constitutional & Land Law', 
      billable: 98, 
      status: 'Active', 
      color: 'bg-amber-600' 
    },
    { 
      id: 2, 
      name: 'Mrs. Flora Matiabe Sasingian', 
      role: 'Managing Partner', 
      specialty: 'Commercial Litigation & Family Law', 
      billable: 95, 
      status: 'Active', 
      color: 'bg-amber-600' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter">People & Governance</h2>
          <div className="flex mt-6 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit shadow-sm">
            {[
              { id: 'directory', label: 'Directory' },
              { id: 'portal', label: 'Employee Portal' },
              { id: 'governance', label: 'HR Policies' }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-600 text-black shadow-md' : 'text-slate-500 hover:text-amber-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-3">
           <button className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-amber-600 transition-all">
             Audit Logs
           </button>
           <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
             Onboard Staff
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-sm">
            <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-widest">{m.sub}</p>
          </div>
        ))}
      </div>

      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4">
          {staff.map(member => (
            <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-amber-600 transition-all group shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg className="w-32 h-32 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-amber-900/30 flex items-center justify-center text-xl font-black text-amber-500 group-hover:bg-amber-600 group-hover:text-black transition-all">
                    {member.name.split(' ').filter(n => !n.includes('.')).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-amber-100 leading-tight group-hover:text-amber-400 transition-colors">{member.name}</h4>
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em] mt-1">{member.role}</p>
                    <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-widest">{member.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full">
                  <span className={`w-2 h-2 rounded-full ${member.color} shadow-[0_0_10px_currentColor] animate-pulse`}></span>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{member.status}</span>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-800/50">
                 <div>
                    <div className="flex justify-between text-[9px] font-black uppercase mb-1.5">
                      <span className="text-slate-500">Utilization Score</span>
                      <span className="text-amber-500 font-mono">{member.billable}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-amber-600" style={{ width: `${member.billable}%` }}></div>
                    </div>
                 </div>
                 <button className="w-full py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-[9px] font-black text-amber-500 hover:text-black hover:bg-amber-600 uppercase tracking-widest transition-all">View Matter Portfolio</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'portal' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom-4">
          <div className="px-8 py-5 border-b border-slate-800 bg-black/30 flex justify-between items-center">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Active Leave Requests</h3>
            <button className="text-[10px] font-black text-amber-700 hover:text-amber-400 uppercase tracking-widest">View Archives</button>
          </div>
          <div className="divide-y divide-slate-800">
            {[1, 2, 3].map(i => (
              <div key={i} className="px-8 py-5 flex items-center justify-between group hover:bg-amber-600/5 transition-colors">
                <div>
                  <p className="text-sm font-black text-amber-100">Case Officer #{i}04</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Annual Leave • 5 Days • Dec 2024</p>
                </div>
                <div className="flex items-center space-x-4">
                   <span className="px-3 py-1 rounded bg-amber-950/20 text-amber-600 border border-amber-900/40 text-[9px] font-black uppercase">Pending Review</span>
                   <button className="text-slate-500 hover:text-amber-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 shadow-xl backdrop-blur-sm animate-in zoom-in-95">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">Firm Policy Vault</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Sasingian Ethical Code', 'Compliance Protocol', 'Client Data Retention', 'Practice Manual v2.0'].map((doc, i) => (
              <div key={i} className="flex items-center p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-900 cursor-pointer group transition-all">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mr-6 group-hover:bg-amber-600 transition-colors">
                  <svg className="w-6 h-6 text-amber-900 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-amber-100">{doc}</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">PDF • Restricted Access</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleView;
