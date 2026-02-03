
import React, { useState, useMemo, useEffect } from 'react';
import { CalendarEvent, EventType, LegalTask } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: LegalTask[];
  onAddEvent: (event: CalendarEvent) => void;
  initialContext?: any;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, tasks, onAddEvent, initialContext }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedMatterId, setHighlightedMatterId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: EventType.COURT,
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    lawyer_assigned: 'Sarah West',
  });

  useEffect(() => {
    if (initialContext?.matterId) {
      setHighlightedMatterId(initialContext.matterId);
      setNewEvent(prev => ({ ...prev, matter_id: initialContext.matterId }));
      setIsModalOpen(true);
    }
  }, [initialContext]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const handleSubmit = () => {
    if (newEvent.title && newEvent.date) {
      onAddEvent({
        ...newEvent,
        id: `EVT-${Math.floor(Math.random() * 10000)}`,
      } as CalendarEvent);
      setIsModalOpen(false);
      setNewEvent({ type: EventType.COURT, date: new Date().toISOString().split('T')[0], time: '09:00', lawyer_assigned: 'Sarah West' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter">Court Calendar</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Seamless Rule of Law Compliance</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-950/20 transition-all"
        >
          Schedule Court/Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-4">
          {sortedEvents.length > 0 ? (
            sortedEvents.map(evt => {
              const isHighlighted = highlightedMatterId && evt.matter_id === highlightedMatterId;
              return (
                <div key={evt.id} className={`bg-slate-900 border rounded-[2rem] p-6 flex items-center group transition-all ${isHighlighted ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800 hover:border-amber-600'}`}>
                  <div className="w-20 text-center border-r border-slate-800 pr-6 mr-6">
                    <p className="text-[9px] font-black text-slate-500 uppercase">{new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-2xl font-black text-amber-500">{new Date(evt.date).getDate()}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        evt.type === EventType.COURT ? 'bg-amber-950 text-amber-500 border-amber-900' :
                        evt.type === EventType.FILING ? 'bg-rose-950 text-rose-500 border-rose-900' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {evt.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{evt.time}</span>
                    </div>
                    <h4 className="text-sm font-black text-amber-100 group-hover:text-amber-400 transition-colors">{evt.title}</h4>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Lawyer: {evt.lawyer_assigned} • {evt.matter_id || 'N/A'}</p>
                  </div>
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-amber-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] p-20 text-center shadow-inner">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No appearances scheduled</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-6">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {tasks.filter(t => t.task_metadata.deadline).slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-600 transition-all cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mr-4 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                  <div>
                    <p className="text-[10px] font-black text-amber-100 truncate">{t.task_metadata.title}</p>
                    <p className="text-[8px] text-rose-500 font-bold uppercase mt-1">{t.task_metadata.deadline}</p>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.task_metadata.deadline).length === 0 && (
                <p className="text-[9px] text-slate-700 text-center italic">No immediate deadlines detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
            <div>
              <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">New Operational Event</h3>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Seamless Synchronization Active</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Event Title</label>
                <input value={newEvent.title || ''} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none focus:border-amber-500 transition-colors" placeholder="Hearing for..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Type</label>
                  <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none">
                    {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Assign Counsel</label>
                  <input value={newEvent.lawyer_assigned || ''} onChange={e => setNewEvent({...newEvent, lawyer_assigned: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Date</label>
                    <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Time</label>
                    <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-100 outline-none" />
                 </div>
              </div>
              <button onClick={handleSubmit} className="w-full py-4 bg-amber-600 text-black font-black uppercase rounded-2xl shadow-xl mt-4 active:scale-95 transition-transform">Confirm to Calendar</button>
              <button onClick={() => { setIsModalOpen(false); setHighlightedMatterId(null); }} className="w-full py-4 text-slate-500 font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
