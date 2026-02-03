
import React, { useMemo, useState, useEffect } from 'react';
import { LegalTask, TaskStage, TaskPriority, BillingType, TaskCategory } from '../types';

interface DashboardProps {
  tasks: LegalTask[];
  onUpdateTask: (id: string, updates: Partial<LegalTask>) => void;
  onAddTask: (task: LegalTask) => void;
  jumpToView: (view: string, context?: any) => void;
}

const FIRM_LAWYERS = ['Administrator', 'Sarah West', 'Henao Kila', 'Tau Geno', 'Jane Smith', 'Robert Case'];

const Dashboard: React.FC<DashboardProps> = ({ tasks, onUpdateTask, onAddTask, jumpToView }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<LegalTask | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [billingFilter, setBillingFilter] = useState<BillingType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'title' | 'priority' | 'deadline'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Drag and Drop UI State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<TaskStage | null>(null);

  // New Matter State
  const [newMatter, setNewMatter] = useState<Partial<LegalTask>>({
    task_metadata: {
      title: '',
      category: TaskCategory.LEGAL,
      priority: TaskPriority.MEDIUM,
      lawyer_assigned: 'Administrator',
    }
  });

  // Bulk Selection State
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId) || null, [tasks, selectedTaskId]);

  useEffect(() => {
    if (selectedTask) setEditTask(JSON.parse(JSON.stringify(selectedTask)));
  }, [selectedTask]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.task_metadata.title.toLowerCase().includes(term) || 
        t.task_metadata.client_name?.toLowerCase().includes(term) || 
        t.id.toLowerCase().includes(term)
      );
    }
    if (billingFilter !== 'All') result = result.filter(t => t.financials.billing_type === billingFilter);
    
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') comparison = a.task_metadata.title.localeCompare(b.task_metadata.title);
      else if (sortField === 'deadline') {
        const dA = a.task_metadata.deadline ? new Date(a.task_metadata.deadline).getTime() : 0;
        const dB = b.task_metadata.deadline ? new Date(b.task_metadata.deadline).getTime() : 0;
        comparison = dA - dB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [tasks, billingFilter, sortField, sortOrder, searchTerm]);

  // DRAG AND DROP HANDLERS
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: TaskStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) setDragOverStage(stage);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: TaskStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const taskId = e.dataTransfer.getData('taskId');
    const targetTask = tasks.find(t => t.id === taskId);
    
    if (targetTask && targetTask.workflow.stage !== newStage) {
      onUpdateTask(taskId, { 
        workflow: { ...targetTask.workflow, stage: newStage } 
      });

      // Automation Trigger: Moving to DONE prompts seamless flow
      if (newStage === TaskStage.DONE) {
        setTimeout(() => {
          if (confirm(`Matter "${targetTask.task_metadata.title}" completed. Would you like to finalize invoicing in the Finance Terminal?`)) {
             jumpToView('financials', { matterId: taskId, tab: 'invoicing' });
          }
        }, 300);
      }
    }
  };

  const toggleBulkSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(bulkSelectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBulkSelectedIds(next);
  };

  const handleBulkStageUpdate = (stage: TaskStage) => {
    bulkSelectedIds.forEach(id => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        onUpdateTask(id, { workflow: { ...task.workflow, stage } });
      }
    });
    setBulkSelectedIds(new Set());
  };

  const handleBulkLawyerUpdate = (lawyer: string) => {
    bulkSelectedIds.forEach(id => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        onUpdateTask(id, { task_metadata: { ...task.task_metadata, lawyer_assigned: lawyer } });
      }
    });
    setBulkSelectedIds(new Set());
  };

  const handleCreateMatter = () => {
    if (newMatter.task_metadata?.title) {
      const task: LegalTask = {
        id: `MTR-${Math.floor(1000 + Math.random() * 9000)}`,
        raw_input: "Manual Matter Entry",
        task_metadata: {
          ...newMatter.task_metadata as any,
          category: newMatter.task_metadata?.category || TaskCategory.LEGAL,
          priority: newMatter.task_metadata?.priority || TaskPriority.MEDIUM,
        },
        workflow: {
          stage: TaskStage.TODO,
          estimated_hours: 0,
          billable_hours: 0,
          is_billable: true
        },
        financials: {
          suggested_fee: 0,
          tax_amount: 0,
          total_inclusive: 0,
          billing_type: BillingType.FIXED,
          trust_balance: 0,
          is_invoiced: false
        },
        created_at: new Date().toISOString()
      };
      onAddTask(task);
      setIsAddModalOpen(false);
      setNewMatter({
        task_metadata: {
          title: '',
          category: TaskCategory.LEGAL,
          priority: TaskPriority.MEDIUM,
          lawyer_assigned: 'Administrator',
        }
      });
    }
  };

  const columns = [TaskStage.TODO, TaskStage.IN_PROGRESS, TaskStage.WAITING, TaskStage.DONE];

  const getPriorityStyles = (p: TaskPriority) => {
    if (p === TaskPriority.HIGH) return { accent: 'bg-amber-600', text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (p === TaskPriority.MEDIUM) return { accent: 'bg-slate-600', text: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' };
    return { accent: 'bg-slate-800', text: 'text-slate-500', bg: 'bg-slate-700/10', border: 'border-slate-700/30' };
  };

  return (
    <div className="space-y-6 pb-24 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter">Matter Operations</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Practice Management Dashboard</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          Register New Matter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Unbilled Time', value: 'K8,400', sub: '24.5 Hours', color: 'text-amber-400' },
          { label: 'Unbilled Disbursements', value: 'K1,200', sub: '4 Entries', color: 'text-amber-400' },
          { label: 'Pending Invoices', value: 'K15,000', sub: '3 Matters', color: 'text-emerald-400' },
          { label: 'Firm Status', value: 'Optimal', sub: 'Automated Practice Flow Active', color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-700 font-bold mt-1 uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8 overflow-x-auto">
        <input
          type="text"
          placeholder="Filter Matters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-6 text-[11px] font-black text-amber-100 uppercase tracking-widest focus:border-amber-600 outline-none flex-1 min-w-[300px]"
        />
        <div className="flex items-center space-x-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['All', ...Object.values(BillingType)].map((type) => (
            <button 
              key={type} 
              onClick={() => setBillingFilter(type as any)} 
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${billingFilter === type ? 'bg-amber-600 text-black' : 'text-slate-500 hover:text-amber-400'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
        {columns.map(stage => {
          const stageTasks = filteredTasks.filter(t => t.workflow.stage === stage);
          const isDragOver = dragOverStage === stage;
          
          return (
            <div 
              key={stage} 
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              className={`w-80 shrink-0 flex flex-col space-y-4 rounded-[2.5rem] p-3 transition-all duration-300 ease-out border-2 ${isDragOver ? 'bg-amber-600/10 border-amber-500 ring-4 ring-amber-500/20 scale-[1.02] shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'bg-transparent border-transparent'}`}
            >
              <div className="flex items-center justify-between px-2">
                <h3 className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isDragOver ? 'text-amber-400 translate-x-1' : 'text-amber-500'}`}>{stage}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-black transition-all ${isDragOver ? 'bg-amber-600 text-black scale-110' : 'bg-slate-800 text-amber-400'}`}>{stageTasks.length}</span>
              </div>
              
              <div className={`space-y-4 min-h-[600px] rounded-[2rem] p-2 border transition-all duration-300 ${isDragOver ? 'bg-slate-900/60 border-amber-600/30' : 'bg-slate-900/40 border-slate-800/50'}`}>
                {stageTasks.map(task => {
                  const style = getPriorityStyles(task.task_metadata.priority);
                  const isSelected = bulkSelectedIds.has(task.id);
                  const isBeingDragged = draggedTaskId === task.id;
                  
                  return (
                    <div 
                      key={task.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`group bg-slate-900 border-2 p-5 rounded-[1.5rem] cursor-grab active:cursor-grabbing transition-all duration-300 relative overflow-hidden ${isSelected ? 'border-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-800 hover:border-amber-600/50'} ${isBeingDragged ? 'opacity-20 scale-95 grayscale' : 'opacity-100 scale-100'}`}
                    >
                      <div className={`absolute top-0 left-0 bottom-0 w-1 ${style.accent}`} />
                      
                      {/* Operational Action Buttons */}
                      <div className="absolute top-4 right-4 flex space-x-2 z-20">
                         <button 
                          onClick={(e) => { e.stopPropagation(); jumpToView('financials', { matterId: task.id }); }}
                          className="w-8 h-8 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-center text-amber-500 hover:bg-amber-600 hover:text-black transition-all opacity-0 group-hover:opacity-100"
                          title="View Ledger"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>
                         </button>
                         <button 
                          onClick={(e) => toggleBulkSelection(task.id, e)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-600 opacity-100' : 'border-slate-700 bg-black/40 hover:border-amber-600 opacity-0 group-hover:opacity-100'}`}
                         >
                          {isSelected && <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                         </button>
                      </div>

                      <div className="flex justify-between items-start mb-3 pr-16">
                        <div className="flex flex-col truncate">
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-tight">{task.task_metadata.case_number || task.id}</span>
                          <h4 className="text-xs font-black text-amber-100 group-hover:text-amber-400 transition-colors mt-1 truncate">{task.task_metadata.title}</h4>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-0.5 rounded-md border ${style.bg} ${style.border}`}>
                             <span className={`text-[8px] font-black uppercase ${style.text}`}>{task.task_metadata.priority}</span>
                          </div>
                          {task.task_metadata.lawyer_assigned && (
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-md">
                              {task.task_metadata.lawyer_assigned}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{task.task_metadata.client_name || 'Individual Client'}</p>
                          <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Est. {task.workflow.estimated_hours}h • K{task.financials.suggested_fee.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {stageTasks.length === 0 && !isDragOver && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
                    <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p className="text-[9px] font-black uppercase tracking-widest">Stage Empty</p>
                  </div>
                )}
                {isDragOver && (
                  <div className="border-2 border-dashed border-amber-600/50 bg-amber-600/5 rounded-[1.5rem] h-24 flex items-center justify-center animate-pulse">
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Release to Reassign Stage</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Operations Toolbar */}
      {bulkSelectedIds.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 border-2 border-amber-600 p-4 md:p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-wrap items-center gap-6 backdrop-blur-xl">
            <div className="flex items-center space-x-4 border-r border-slate-800 pr-6 mr-2">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center font-black text-black">
                {bulkSelectedIds.size}
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Selected Matters</p>
                <button 
                  onClick={() => setBulkSelectedIds(new Set())}
                  className="text-[8px] text-slate-500 hover:text-rose-500 font-black uppercase tracking-widest transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Change Status</span>
                <div className="flex space-x-1 bg-black/40 p-1 rounded-xl border border-slate-800">
                  {columns.map(stage => (
                    <button 
                      key={stage}
                      onClick={() => handleBulkStageUpdate(stage)}
                      className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 hover:bg-amber-600 hover:text-black transition-all"
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Assign Counsel</span>
                <select 
                  onChange={(e) => handleBulkLawyerUpdate(e.target.value)}
                  className="bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-[9px] font-black text-amber-500 uppercase tracking-widest outline-none focus:border-amber-600"
                  defaultValue=""
                >
                  <option value="" disabled>Select Staff</option>
                  {FIRM_LAWYERS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={() => setBulkSelectedIds(new Set())}
              className="ml-4 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-500 hover:bg-rose-950/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Manual Registration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Matter Registration</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Matter Title</label>
                <input 
                  value={newMatter.task_metadata?.title || ''} 
                  onChange={e => setNewMatter({...newMatter, task_metadata: {...newMatter.task_metadata as any, title: e.target.value}})} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none focus:border-amber-500" 
                  placeholder="e.g. Probate of Estate of late..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={newMatter.task_metadata?.category} 
                    onChange={e => setNewMatter({...newMatter, task_metadata: {...newMatter.task_metadata as any, category: e.target.value as TaskCategory}})} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none"
                  >
                    {Object.values(TaskCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    value={newMatter.task_metadata?.priority} 
                    onChange={e => setNewMatter({...newMatter, task_metadata: {...newMatter.task_metadata as any, priority: e.target.value as TaskPriority}})} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none"
                  >
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Assigned Counsel</label>
                <select 
                  value={newMatter.task_metadata?.lawyer_assigned} 
                  onChange={e => setNewMatter({...newMatter, task_metadata: {...newMatter.task_metadata as any, lawyer_assigned: e.target.value}})} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none"
                >
                  {FIRM_LAWYERS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button 
                onClick={handleCreateMatter} 
                disabled={!newMatter.task_metadata?.title}
                className="w-full py-4 bg-amber-600 text-black font-black uppercase rounded-2xl shadow-xl mt-4 disabled:opacity-50"
              >
                Onboard Matter
              </button>
              <button onClick={() => setIsAddModalOpen(false)} className="w-full py-4 text-slate-500 font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedTaskId && editTask && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-amber-500 uppercase tracking-tighter">Matter Config</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Matter Reference: {editTask.id}</p>
              </div>
              <button onClick={() => setSelectedTaskId(null)} className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center border border-slate-700">
                 <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <button 
                  onClick={() => jumpToView('financials', { matterId: editTask.id })}
                  className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-600 transition-all group"
                >
                   <svg className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>
                   <span className="text-[9px] font-black text-slate-500 uppercase">Financial Ledger</span>
                </button>
                <button 
                  onClick={() => jumpToView('calendar', { matterId: editTask.id })}
                  className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-600 transition-all group"
                >
                   <svg className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <span className="text-[9px] font-black text-slate-500 uppercase">Key Deadlines</span>
                </button>
                <button 
                  onClick={() => jumpToView('cms', { matterId: editTask.id, tab: 'documents' })}
                  className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-600 transition-all group"
                >
                   <svg className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                   <span className="text-[9px] font-black text-slate-500 uppercase">Case Records</span>
                </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Matter Title</label>
                <input 
                  value={editTask.task_metadata.title}
                  onChange={e => setEditTask({...editTask, task_metadata: {...editTask.task_metadata, title: e.target.value}})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Client Name</label>
                <input 
                  value={editTask.task_metadata.client_name || ''}
                  onChange={e => setEditTask({...editTask, task_metadata: {...editTask.task_metadata, client_name: e.target.value}})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                  placeholder="Enter Client Name"
                />
              </div>

              {/* Operational Section */}
              <div className="pt-4 border-t border-slate-800">
                <label className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-4 block">Practice Operations</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Counsel Assigned</label>
                    <select 
                      value={editTask.task_metadata.lawyer_assigned || ''}
                      onChange={e => setEditTask({...editTask, task_metadata: {...editTask.task_metadata, lawyer_assigned: e.target.value}})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                    >
                      <option value="">Unassigned</option>
                      {FIRM_LAWYERS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Workflow Stage</label>
                    <select 
                      value={editTask.workflow.stage}
                      onChange={e => setEditTask({...editTask, workflow: {...editTask.workflow, stage: e.target.value as TaskStage}})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                    >
                      {columns.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Estimated Hours</label>
                    <input 
                      type="number"
                      value={editTask.workflow.estimated_hours}
                      onChange={e => setEditTask({...editTask, workflow: {...editTask.workflow, estimated_hours: Number(e.target.value)}})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Billable Hours</label>
                    <input 
                      type="number"
                      value={editTask.workflow.billable_hours}
                      onChange={e => setEditTask({...editTask, workflow: {...editTask.workflow, billable_hours: Number(e.target.value)}})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Financials Section */}
              <div className="pt-4 border-t border-slate-800">
                <label className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-4 block">Financial Ledger</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Professional Fee (Kina)</label>
                    <input 
                      type="number"
                      value={editTask.financials.suggested_fee}
                      onChange={e => setEditTask({...editTask, financials: {...editTask.financials, suggested_fee: Number(e.target.value)}})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Billing Type</label>
                    <select 
                      value={editTask.financials.billing_type}
                      onChange={e => setEditTask({...editTask, financials: {...editTask.financials, billing_type: e.target.value as BillingType}})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                    >
                      {Object.values(BillingType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Trust Balance (Kina)</label>
                    <input 
                      type="number"
                      value={editTask.financials.trust_balance}
                      onChange={e => setEditTask({...editTask, financials: {...editTask.financials, trust_balance: Number(e.target.value)}})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-amber-100 outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Invoicing Status</label>
                    <div className="flex items-center h-[58px] bg-slate-800 border border-slate-700 rounded-2xl px-6 transition-all justify-between">
                       <span className={`text-[10px] font-black uppercase tracking-widest mr-4 ${editTask.financials.is_invoiced ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {editTask.financials.is_invoiced ? 'Finalized' : 'Pending'}
                       </span>
                       <button 
                        onClick={() => setEditTask({...editTask, financials: {...editTask.financials, is_invoiced: !editTask.financials.is_invoiced}})}
                        className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${editTask.financials.is_invoiced ? 'bg-amber-600' : 'bg-slate-900 border border-slate-700'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${editTask.financials.is_invoiced ? 'left-7' : 'left-1'}`}></div>
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { onUpdateTask(editTask.id, editTask); setSelectedTaskId(null); }}
                className="w-full py-5 bg-amber-600 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:bg-amber-700 active:scale-95 mt-6"
              >
                Sync Matter Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
