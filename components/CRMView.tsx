
import React, { useState } from 'react';
import { Client, LegalTask } from '../types';

interface CRMViewProps {
  clients: Client[];
  tasks: LegalTask[];
  onAddClient: (client: Client) => void;
}

const CRMView: React.FC<CRMViewProps> = ({ clients, tasks, onAddClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({ type: 'Individual' });

  const handleAdd = () => {
    if (newClient.name) {
      onAddClient({
        ...newClient,
        id: `CLT-${Math.floor(Math.random() * 10000)}`,
        created_at: new Date().toISOString(),
      } as Client);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter">Client Portfolio</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">CRM • Relationship Intelligence</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
          Add New Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => {
          const clientMatters = tasks.filter(t => t.task_metadata.client_name === client.name);
          return (
            <div key={client.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-amber-600 transition-all group shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">{client.type}</span>
                  <h4 className="text-xl font-black text-amber-100 group-hover:text-amber-400 transition-colors mt-1">{client.name}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Contact Info</p>
                  <p className="text-[11px] text-slate-400 mt-1">{client.email}</p>
                  <p className="text-[11px] text-slate-400">{client.phone}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-black text-amber-500">{clientMatters.length}</span>
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Active Matters</span>
                </div>
              </div>
              <button className="w-full py-3 bg-slate-950 border border-slate-800 text-[10px] font-black uppercase text-amber-600 rounded-xl hover:bg-amber-600 hover:text-black transition-all">View Matter History</button>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Client Registration</h3>
            <div className="space-y-4">
              <input value={newClient.name || ''} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none" placeholder="Name / Organization" />
              <select value={newClient.type} onChange={e => setNewClient({...newClient, type: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none">
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Government">Government</option>
              </select>
              <input value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none" placeholder="Email Address" />
              <input value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none" placeholder="Phone Number" />
              <button onClick={handleAdd} className="w-full py-4 bg-amber-600 text-black font-black uppercase rounded-2xl shadow-xl mt-4">Onboard Client</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-4 text-slate-500 font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMView;
