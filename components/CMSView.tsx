
import React, { useState, useEffect } from 'react';
import { LegalTask } from '../types';

interface CMSViewProps {
  tasks: LegalTask[];
  initialContext?: any;
}

type CMSTab = 
  | 'intake' 
  | 'documents' 
  | 'workflow' 
  | 'collaboration' 
  | 'analytics' 
  | 'archiving';

const CMSView: React.FC<CMSViewProps> = ({ tasks, initialContext }) => {
  const [activeTab, setActiveTab] = useState<CMSTab>('intake');
  const [automationRules, setAutomationRules] = useState([
    { id: 1, title: 'Deadline Alert', trigger: 'Date < 7 days', action: 'Team Notification', enabled: true },
    { id: 2, title: 'Trust Guard', trigger: 'Balance < K1k', action: 'Draft Top-up', enabled: true },
    { id: 3, title: 'Onboarding', trigger: 'Status = Signed', action: 'Provision Vault', enabled: false },
  ]);

  useEffect(() => {
    if (initialContext?.tab) {
      setActiveTab(initialContext.tab as CMSTab);
    }
  }, [initialContext]);

  const toggleRule = (id: number) => {
    setAutomationRules(rules => rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const tabs: { id: CMSTab; label: string; icon: React.ReactNode }[] = [
    { id: 'intake', label: 'Intake & Conflict', icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
    { id: 'documents', label: 'File & Docs', icon: <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
    { id: 'workflow', label: 'Automation Hub', icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" /> },
    { id: 'collaboration', label: 'Collaboration', icon: <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /> },
    { id: 'analytics', label: 'Analytics', icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { id: 'archiving', label: 'Closure', icon: <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
  ];

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-amber-500 uppercase tracking-tighter">Matter Lifecycle</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Seamless Practice Intelligence Hub</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto scrollbar-hide w-full xl:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 md:px-6 py-2.5 md:py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-amber-600 text-black shadow-lg shadow-amber-950/20' 
                : 'text-slate-500 hover:text-amber-400'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {tab.icon}
              </svg>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl md:rounded-[3rem] min-h-[500px] backdrop-blur-md p-6 md:p-10 relative overflow-hidden shadow-2xl">
        {activeTab === 'intake' && (
          <div className="space-y-6 md:space-y-10 animate-in slide-in-from-left-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-lg md:text-xl font-black text-amber-500 uppercase tracking-tighter">Conflict Screening</h3>
              <button className="w-full md:w-auto px-6 py-3 bg-amber-600 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">New Screening</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Recent Clearances</p>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-black text-amber-100 truncate">Kumul Petroleum Holdings</span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase">Screened • 2h ago</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-500 border border-emerald-900 text-[8px] font-black uppercase tracking-widest shrink-0">Cleared</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-slate-900 border border-amber-900/30 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <h4 className="text-sm font-black text-amber-100 uppercase tracking-widest mb-2">System Conflict Search</h4>
                 <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-bold">Search all Sasingian databases and legacy court records.</p>
                 <div className="mt-8 w-full max-w-sm">
                   <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-amber-50 outline-none focus:border-amber-600 transition-all text-center" placeholder="Enter Party Name..." />
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-lg md:text-xl font-black text-amber-500 uppercase tracking-tighter">Vault Explorer</h3>
              <div className="flex w-full md:w-auto space-x-3">
                <button className="flex-1 md:flex-none px-4 md:px-5 py-3 bg-slate-800 text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700">Scan OCR</button>
                <button className="flex-1 md:flex-none px-4 md:px-5 py-3 bg-amber-600 text-black rounded-xl text-[9px] font-black uppercase tracking-widest">Upload</button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl md:rounded-[2rem] overflow-x-auto">
               <div className="min-w-[600px]">
                 <div className="grid grid-cols-4 gap-px bg-slate-800 border-b border-slate-800">
                    {['Name', 'Associated Matter', 'Modified', 'Size'].map(h => (
                      <div key={h} className="bg-slate-950 px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</div>
                    ))}
                 </div>
                 <div className="divide-y divide-slate-800">
                    {tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="grid grid-cols-4 items-center hover:bg-amber-600/5 transition-colors group cursor-pointer">
                        <div className="px-6 py-4 flex items-center">
                          <svg className="w-4 h-4 mr-3 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          <span className="text-[10px] font-black text-amber-100 group-hover:text-amber-500 transition-colors truncate">Affidavit_{task.id}.pdf</span>
                        </div>
                        <div className="px-6 py-4 text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">{task.task_metadata.title}</div>
                        <div className="px-6 py-4 text-[9px] text-slate-700 font-mono">05-22 14:02</div>
                        <div className="px-6 py-4 text-[9px] text-slate-700 font-mono text-right md:text-left">2.4 MB</div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-black text-amber-500 uppercase tracking-tighter">Automation Orchestrator</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Cross-Module Seamless Triggers</p>
              </div>
              <span className="text-[8px] md:text-[10px] bg-emerald-950 text-emerald-500 px-3 py-1 rounded-full font-black border border-emerald-900 uppercase">{automationRules.filter(r => r.enabled).length} Rules Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {automationRules.map((rule) => (
                 <div key={rule.id} className={`bg-slate-950 border p-6 md:p-8 rounded-2xl md:rounded-[2rem] transition-all group relative overflow-hidden ${rule.enabled ? 'border-amber-600/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800 opacity-60 grayscale'}`}>
                   <div className="flex justify-between items-start mb-6">
                      <h4 className="text-xs md:text-sm font-black text-amber-100">{rule.title}</h4>
                      <button 
                        onClick={() => toggleRule(rule.id)}
                        className={`w-10 h-5 rounded-full transition-all relative ${rule.enabled ? 'bg-amber-600' : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${rule.enabled ? 'left-6' : 'left-1'}`}></div>
                      </button>
                   </div>
                   <div className="space-y-4">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Trigger condition</span>
                        <div className="px-3 py-2 bg-slate-900 rounded-lg text-[9px] md:text-[10px] font-mono text-amber-500 truncate">{rule.trigger}</div>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Cross-Module Action</span>
                        <div className="px-3 py-2 bg-slate-900 rounded-lg text-[9px] md:text-[10px] font-mono text-emerald-500 truncate">{rule.action}</div>
                     </div>
                   </div>
                 </div>
               ))}

               <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-amber-600/50 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-600 group-hover:text-amber-500 transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Construct Logic Rule</span>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'collaboration' && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 h-full">
            <h3 className="text-lg md:text-xl font-black text-amber-500 uppercase tracking-tighter">Communication</h3>
            
            <div className="flex flex-col md:flex-row h-[500px] border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden bg-slate-950">
               <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-black/20 overflow-y-auto shrink-0 max-h-48 md:max-h-none">
                  {tasks.map(t => (
                    <div key={t.id} className="p-4 border-b border-slate-900 hover:bg-amber-600/10 cursor-pointer transition-colors border-l-2 border-l-transparent hover:border-l-amber-500">
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-tighter truncate">{t.task_metadata.title}</p>
                      <p className="text-[8px] text-slate-600 font-bold mt-1">3 New Messages</p>
                    </div>
                  ))}
               </div>
               <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-900 border border-amber-900/20 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                  <h4 className="text-xs md:text-sm font-black text-amber-100 uppercase tracking-widest">Select Thread</h4>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Secure matter feeds.</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
            <h3 className="text-lg md:text-xl font-black text-amber-500 uppercase tracking-tighter">Performance</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl md:rounded-[2rem] p-6 md:p-8 h-80 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] md:text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Matter Velocity Index</h4>
                    <p className="text-[8px] md:text-[10px] text-slate-600 font-bold uppercase">Cycle Time (Intake to Closure)</p>
                  </div>
                  <div className="h-40 flex items-end justify-between space-x-1.5 md:space-x-2">
                    {[20, 40, 30, 60, 80, 50, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-amber-600/20 hover:bg-amber-600 rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
               </div>
               
               <div className="bg-slate-950 border border-slate-800 rounded-2xl md:rounded-[2rem] p-6 md:p-8 flex flex-col justify-center items-center shadow-lg">
                  <div className="text-center">
                    <p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Realization</p>
                    <p className="text-4xl md:text-5xl font-black text-amber-100 font-mono">92%</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-4 tracking-widest leading-relaxed">Billable vs Invoiced</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'archiving' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-lg md:text-xl font-black text-amber-500 uppercase tracking-tighter">Cold Storage</h3>
              <p className="text-[9px] md:text-[10px] text-slate-600 font-bold uppercase tracking-widest">Regulatory Retention: 7 Years</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10">
              <div className="space-y-6 md:space-y-8">
                {tasks.filter(t => t.workflow.stage === 'Done').length > 0 ? (
                  tasks.filter(t => t.workflow.stage === 'Done').map(t => (
                    <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-900 transition-colors group gap-4">
                       <div className="flex items-center space-x-4 md:space-x-6">
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-950 border border-emerald-900/30 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                         </div>
                         <div className="overflow-hidden">
                           <h4 className="text-xs md:text-sm font-black text-amber-100 group-hover:text-amber-400 transition-colors truncate">{t.task_metadata.title}</h4>
                           <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 truncate">Trust Cleared • Ready for Archive</p>
                         </div>
                       </div>
                       <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-rose-900/30 border border-slate-700 hover:border-rose-900/50 text-amber-500 hover:text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Archive Case</button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase tracking-[0.4em]">No matters ready for cold storage</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Decorative background element hidden on mobile for cleaner UI */}
        <div className="absolute bottom-0 right-0 p-10 opacity-5 pointer-events-none hidden md:block">
          <svg className="w-64 h-64 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CMSView;
