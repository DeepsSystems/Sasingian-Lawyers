
import React, { useState, useMemo, useEffect } from 'react';
import { Expense, ExpenseCategory, LegalTask, Invoice, InvoiceStatus, InvoiceItem, TimeEntry, BillingType } from '../types';

interface FinanceViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  timeEntries: TimeEntry[];
  onAddTimeEntry: (entry: TimeEntry) => void;
  tasks: LegalTask[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoice: (id: string, status: InvoiceStatus) => void;
  initialContext?: any;
}

const FinanceView: React.FC<FinanceViewProps> = ({ 
  expenses, 
  onAddExpense, 
  timeEntries,
  onAddTimeEntry,
  tasks, 
  invoices, 
  onAddInvoice, 
  onUpdateInvoice,
  initialContext
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'expenses' | 'time' | 'invoicing' | 'contracts'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);

  // Drafting State
  const [draftingMatter, setDraftingMatter] = useState<any | null>(null);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<Set<string>>(new Set());
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [adjustedFee, setAdjustedFee] = useState<number>(0);

  const [newExp, setNewExp] = useState<Partial<Expense>>({
    category: ExpenseCategory.MISC,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    matter_id: '',
    is_reimbursable: true,
    is_invoiced: false
  });

  // Seamless Context Handling
  useEffect(() => {
    if (initialContext?.matterId) {
      setSearchTerm(initialContext.matterId);
      if (initialContext.tab) setActiveTab(initialContext.tab);
      else setActiveTab('accounts');
    }
  }, [initialContext]);

  const trustTotal = tasks.reduce((sum, task) => sum + (task.financials.trust_balance || 0), 0);
  
  const filteredTasksForAccounts = useMemo(() => {
    return tasks.filter(t => 
      t.task_metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.task_metadata.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const metrics = [
    { label: 'Total Revenue (YTD)', value: 'K1,245,000', sub: '+12% vs LY', color: 'text-amber-400' },
    { label: 'Trust Liability', value: `K${trustTotal.toLocaleString()}`, sub: 'Compliance Verified', color: 'text-amber-500' },
    { label: 'Firm Invoices', value: invoices.length.toString(), sub: `${invoices.filter(i => i.status === InvoiceStatus.PAID).length} Paid`, color: 'text-emerald-400' },
    { label: 'Firm Expenses (MTD)', value: `K${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}`, sub: 'Operating Budget', color: 'text-rose-400' },
  ];

  const govContracts = [
    { id: 'GC-2024-001', agency: 'Dept. of Lands & Physical Planning', title: 'Waigani Precinct Masterplan Review', total_value: 250000, paid: 125000, status: 'Active', color: 'bg-amber-500' },
    { id: 'GC-2024-004', agency: 'PNG Ports Corporation', title: 'Terminal Operator Agreement - Lae', total_value: 450000, paid: 380000, status: 'Final Stage', color: 'bg-emerald-500' },
    { id: 'GC-2023-012', agency: 'National Fisheries Authority', title: 'Regulatory Framework Inquest', total_value: 180000, paid: 45000, status: 'Delayed', color: 'bg-rose-500' },
  ];

  const uninvoicedMatters = useMemo(() => {
    return tasks.filter(t => !t.financials.is_invoiced).map(task => {
      const associatedExpenses = expenses.filter(e => e.matter_id === task.id && e.is_reimbursable && !e.is_invoiced);
      const associatedTime = timeEntries.filter(te => te.matter_id === task.id && !te.is_invoiced);
      const expenseTotal = associatedExpenses.reduce((s, e) => s + e.amount, 0);
      const timeTotal = associatedTime.reduce((s, te) => s + (te.hours * 350), 0);
      const subtotal = task.financials.suggested_fee + expenseTotal + timeTotal;
      const gst = subtotal * 0.1;
      return { 
        ...task, 
        pending_expenses: associatedExpenses, 
        pending_time: associatedTime, 
        subtotal,
        gst,
        totalWIP: subtotal + gst 
      };
    });
  }, [tasks, expenses, timeEntries]);

  const handleStartDraft = (matter: any) => {
    setDraftingMatter(matter);
    setAdjustedFee(matter.financials.suggested_fee);
    setSelectedTimeEntries(new Set(matter.pending_time.map((te: any) => te.id)));
    setSelectedExpenses(new Set(matter.pending_expenses.map((e: any) => e.id)));
  };

  const calculatedDraft = useMemo(() => {
    if (!draftingMatter) return { subtotal: 0, gst: 0, total: 0 };
    
    const selectedTimeAmount = draftingMatter.pending_time
      .filter((te: TimeEntry) => selectedTimeEntries.has(te.id))
      .reduce((sum: number, te: TimeEntry) => sum + (te.hours * 350), 0);
      
    const selectedExpenseAmount = draftingMatter.pending_expenses
      .filter((e: Expense) => selectedExpenses.has(e.id))
      .reduce((sum: number, e: Expense) => sum + e.amount, 0);
      
    const subtotal = adjustedFee + selectedTimeAmount + selectedExpenseAmount;
    const gst = subtotal * 0.1;
    return { subtotal, gst, total: subtotal + gst };
  }, [draftingMatter, selectedTimeEntries, selectedExpenses, adjustedFee]);

  const handleFinalizeInvoice = () => {
    if (!draftingMatter) return;
    
    const items: InvoiceItem[] = [
      { description: `Professional Services - ${draftingMatter.task_metadata.title}`, amount: adjustedFee, type: 'Professional Services' },
      ...draftingMatter.pending_time
        .filter((te: TimeEntry) => selectedTimeEntries.has(te.id))
        .map((te: TimeEntry) => ({ description: `${te.hours}h: ${te.description}`, amount: te.hours * 350, type: 'Professional Services' as const })),
      ...draftingMatter.pending_expenses
        .filter((e: Expense) => selectedExpenses.has(e.id))
        .map((e: Expense) => ({ description: e.description, amount: e.amount, type: 'Disbursement' as const }))
    ];

    const { subtotal, gst, total } = calculatedDraft;

    const newInvoice: Invoice = {
      id: `INV-${Math.floor(Math.random() * 100000)}`,
      matter_id: draftingMatter.id,
      client_name: draftingMatter.task_metadata.client_name || 'Valued Client',
      title: draftingMatter.task_metadata.title,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items,
      subtotal,
      tax: gst,
      total,
      status: InvoiceStatus.SENT
    };

    onAddInvoice(newInvoice);
    setDraftingMatter(null);
  };

  const handleAddExpSubmit = () => {
    if (newExp.amount && newExp.description) {
      onAddExpense({
        ...newExp,
        id: `EXP-${Math.floor(Math.random() * 10000)}`,
      } as Expense);
      setNewExp({ category: ExpenseCategory.MISC, amount: 0, description: '', date: new Date().toISOString().split('T')[0], matter_id: '', is_reimbursable: true, is_invoiced: false });
      setIsExpModalOpen(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter">Finance Terminal</h2>
          <div className="flex mt-6 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit shadow-sm overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'accounts', label: 'Accounts (Trust)' },
              { id: 'expenses', label: 'Expenses' },
              { id: 'time', label: 'Time Tracking' },
              { id: 'invoicing', label: 'Invoicing' },
              { id: 'contracts', label: 'Gov. Contracts' }
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
           <button className="px-6 py-3 bg-slate-900 border border-slate-800 text-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-amber-600 transition-all">Audit Logs</button>
           <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-950/40 transition-all">Quick Receipt</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] shadow-sm backdrop-blur-sm">
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-widest">{m.sub}</p>
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-left-4">
           <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 shadow-xl">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-8">Invoicing Velocity</h3>
              <div className="h-64 flex items-end justify-between space-x-4 px-4">
                 {[40, 70, 55, 90, 65, 80].map((h, i) => (
                   <div key={i} className="flex-1 bg-amber-600/10 border-t border-amber-600/30 rounded-t-xl group relative hover:bg-amber-600/30 transition-all" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[9px] font-mono text-amber-500 transition-opacity">K{h}k</div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-center text-center group hover:border-emerald-600/50 transition-all shadow-xl">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Firm Liquidity</p>
                <p className="text-5xl font-black text-emerald-500 font-mono">K412,400</p>
                <p className="text-[9px] text-slate-700 font-bold uppercase mt-6 tracking-widest">Available Operating Funds</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-8">
              <div>
                 <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Trust Ledger Management</h3>
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Client Trust Fund Liability Console</p>
              </div>
              <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Search Matter ID or Client..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[11px] font-bold text-amber-100 outline-none focus:border-amber-600 transition-all w-72 placeholder:text-slate-700"
                 />
              </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-950 border-b border-slate-800">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Matter Details</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Billing Type</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Liability</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Trust Balance</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800">
                    {filteredTasksForAccounts.map(task => (
                       <tr key={task.id} className="hover:bg-amber-600/5 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="text-[13px] font-black text-amber-100">{task.task_metadata.title}</span>
                                <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">{task.task_metadata.client_name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-[9px] font-black uppercase text-amber-500">
                                {task.financials.billing_type}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right text-[11px] font-mono text-slate-400">K{task.financials.tax_amount.toLocaleString()}</td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-amber-400 font-mono">K{task.financials.trust_balance.toLocaleString()}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <button className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-600 hover:text-black transition-all">Audit</button>
                          </td>
                       </tr>
                    ))}
                    {filteredTasksForAccounts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">No matching ledgers found</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'invoicing' && (
        <div className="space-y-10 animate-in slide-in-from-left-4">
           <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Drafting Terminal</h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Unbilled Work in Progress (WIP)</p>
                 <div className="space-y-4">
                    {uninvoicedMatters.map(m => (
                      <div key={m.id} className={`p-6 bg-slate-900 border rounded-3xl transition-all cursor-pointer ${draftingMatter?.id === m.id ? 'border-amber-600 bg-amber-600/5' : 'border-slate-800 hover:border-slate-700'}`} onClick={() => handleStartDraft(m)}>
                         <div className="flex justify-between items-start">
                            <div>
                               <h4 className="text-sm font-black text-amber-100">{m.task_metadata.title}</h4>
                               <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Ready to Invoice: K{m.totalWIP.toLocaleString()}</p>
                            </div>
                            <span className="text-[10px] font-mono text-amber-500">K{m.subtotal.toLocaleString()}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {draftingMatter && (
                <div className="bg-slate-900 border border-amber-600 rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
                   <h4 className="text-lg font-black text-amber-500 uppercase tracking-tighter">Finalizing INV-001</h4>
                   <div className="space-y-6">
                      <div className="flex justify-between border-b border-slate-800 pb-4">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Subtotal</span>
                         <span className="text-sm font-mono text-amber-100">K{calculatedDraft.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-4">
                         <span className="text-[10px] font-black text-slate-500 uppercase">GST (10%)</span>
                         <span className="text-sm font-mono text-amber-100">K{calculatedDraft.gst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-4">
                         <span className="text-sm font-black text-amber-500 uppercase">Total Invoice</span>
                         <span className="text-2xl font-black text-amber-100 font-mono">K{calculatedDraft.total.toLocaleString()}</span>
                      </div>
                      <button onClick={handleFinalizeInvoice} className="w-full py-5 bg-amber-600 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl mt-8">Generate & Send Invoice</button>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-6">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Firm Disbursements</h3>
              <button 
                onClick={() => setIsExpModalOpen(true)}
                className="px-6 py-3 bg-amber-600 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                Log New Expense
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {expenses.map(exp => (
                <div key={exp.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-amber-900 transition-all group shadow-sm">
                   <div className="flex justify-between mb-4">
                      <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">{exp.category}</span>
                      <span className="text-xl font-black text-amber-100 font-mono">K{exp.amount.toLocaleString()}</span>
                   </div>
                   <h4 className="text-xs font-black text-slate-300 leading-relaxed mb-6">{exp.description}</h4>
                   <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                      <span className="text-[9px] text-slate-600 font-bold uppercase">{exp.date}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${exp.is_invoiced ? 'bg-emerald-950 text-emerald-500' : 'bg-rose-950 text-rose-500'}`}>
                        {exp.is_invoiced ? 'Invoiced' : 'Pending'}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Adding more sub-views for full terminal functionality */}
      {activeTab === 'contracts' && (
        <div className="space-y-10 animate-in zoom-in-95">
           <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">State & Statutory Contracts</h3>
           <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="divide-y divide-slate-800">
                 {govContracts.map(contract => (
                   <div key={contract.id} className="p-10 flex flex-col xl:flex-row justify-between xl:items-center gap-8 hover:bg-amber-600/5 transition-colors">
                      <div className="flex items-center space-x-8">
                         <div className={`w-16 h-16 rounded-2xl ${contract.color} flex items-center justify-center text-black shadow-lg`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                         </div>
                         <div>
                            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">{contract.agency}</span>
                            <h4 className="text-xl font-black text-amber-100 mt-1">{contract.title}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Reference: {contract.id}</p>
                         </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                         <div className="text-right">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Contract Value</p>
                            <p className="text-xl font-black text-amber-500 font-mono">K{contract.total_value.toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Paid to Date</p>
                            <p className="text-xl font-black text-emerald-500 font-mono">K{contract.paid.toLocaleString()}</p>
                         </div>
                         <button className="px-8 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-amber-400 hover:text-black hover:bg-amber-600 transition-all">Drawdown History</button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {isExpModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Register Outlay</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Category</label>
                  <select value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none">
                    {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Amount (Kina)</label>
                  <input type="number" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Linked Matter</label>
                 <select value={newExp.matter_id} onChange={e => setNewExp({...newExp, matter_id: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none">
                   <option value="">Firm Internal</option>
                   {tasks.map(t => <option key={t.id} value={t.id}>{t.task_metadata.title}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Description</label>
                 <textarea value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none h-24" />
              </div>
              <button onClick={handleAddExpSubmit} className="w-full py-4 bg-amber-600 text-black font-black uppercase rounded-2xl shadow-xl mt-4">Post Transaction</button>
              <button onClick={() => setIsExpModalOpen(false)} className="w-full py-4 text-slate-500 font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
