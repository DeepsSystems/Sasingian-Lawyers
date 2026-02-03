
import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: any) => void;
  isLoggedIn: boolean;
  user: any;
  onLogin: (user: any) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  setActiveView, 
  isLoggedIn, 
  user, 
  onLogin, 
  onLogout 
}) => {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulateLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onLogin({ 
        name: 'Sarah Kila', 
        initials: 'SK', 
        role: 'Senior Counsel',
        avatar: null 
      });
      setIsAuthenticating(false);
      setIsLoginModalOpen(false);
    }, 1500);
  };

  const navSections = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Matters', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
        { id: 'intake', label: 'Matter File Upload', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> },
        { id: 'calendar', label: 'Calendar', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
        { id: 'cms', label: 'Lifecycle', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'crm', label: 'Clients', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
        { id: 'people', label: 'People & HR', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
        { id: 'financials', label: 'Finance', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0114 0z" /> },
        { id: 'reports', label: 'Reports', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-amber-50 overflow-hidden font-sans">
      <div className="hidden md:flex h-8 bg-black items-center justify-between px-6 shrink-0 z-[160] border-b border-slate-900">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
            <div className="w-4 h-4 bg-amber-600 rounded flex items-center justify-center">
              <span className="text-[10px] font-black text-black">S</span>
            </div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest group-hover:text-amber-300 transition-colors">Sasingian Lawyers</span>
          </div>
          <div className="h-4 w-px bg-slate-800 mx-2"></div>
          <div className="flex items-center space-x-3">
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] ${isLoggedIn ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
               {isLoggedIn ? `Authenticated: ${user.role}` : 'Restricted Mode'}
             </span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Matter Records: {isLoggedIn ? 3 : 0}</span>
          </div>
        </div>
      </div>

      <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center shrink-0 z-[150] backdrop-blur-md overflow-hidden">
        <div className="flex flex-1 items-center h-full px-4 overflow-x-auto scrollbar-hide">
          <nav className="flex items-center h-full space-x-1">
            {navSections.flatMap(section => section.items).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`h-16 flex items-center px-4 relative transition-all group shrink-0 ${
                  activeView === item.id 
                  ? 'text-amber-400 bg-amber-500/10' 
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
                }`}
              >
                <svg className={`w-4 h-4 mr-2 transition-colors ${activeView === item.id ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  {item.label}
                </span>
                
                {activeView === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden sm:flex items-center space-x-4 pr-6 shrink-0 h-full border-l border-slate-800/50 pl-6">
          <div 
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`flex items-center space-x-3 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
              isTimerRunning 
              ? 'bg-amber-950/30 border-amber-600/50' 
              : 'bg-slate-900 border-slate-800 hover:border-amber-900'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-amber-500 animate-ping' : 'bg-slate-700'}`}></div>
            <span className={`font-mono text-sm font-black ${isTimerRunning ? 'text-amber-400' : 'text-slate-400'}`}>{formatTime(timerSeconds)}</span>
          </div>

          <div className="h-8 w-px bg-slate-800 mx-2"></div>

          {isLoggedIn ? (
            <div className="flex items-center space-x-4 group">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-amber-100 uppercase tracking-tighter">{user.name}</span>
                  <button 
                    onClick={onLogout}
                    className="text-[8px] font-black text-slate-500 hover:text-rose-500 uppercase tracking-widest transition-colors"
                  >
                    Log Out
                  </button>
               </div>
               <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                 {user.initials}
               </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
            >
              Staff Portal
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      <footer className="h-10 bg-black border-t border-slate-900 px-4 flex items-center justify-between shrink-0 z-[140]">
        <div className="flex items-center space-x-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
          <div className="flex items-center">
            <span className={`w-1.5 h-1.5 rounded-full mr-2 shadow-[0_0_5px_rgba(217,119,6,0.8)] ${isLoggedIn ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
            <span>{isLoggedIn ? 'Secure Session' : 'Ready'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <span className="text-[9px] font-black text-slate-700 uppercase">Ping: 4.2ms</span>
           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest truncate">Professional Practice Environment</span>
        </div>
      </footer>

      {/* Login Modal - White Background Aesthetic */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in-95 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
                 <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">System Access</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Sasingian Lawyers</p>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest ml-1">Staff ID or Email</label>
                  <input 
                    disabled={isAuthenticating}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-amber-500 transition-all placeholder:text-slate-300" 
                    placeholder="sarah.kila@sasingian.law" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password"
                    disabled={isAuthenticating}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-amber-500 transition-all placeholder:text-slate-300" 
                    placeholder="••••••••••••" 
                  />
               </div>
               
               <button 
                 onClick={handleSimulateLogin}
                 disabled={isAuthenticating}
                 className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center justify-center ${
                   isAuthenticating ? 'bg-slate-200 text-slate-400' : 'bg-amber-500 hover:bg-amber-600 text-black'
                 }`}
               >
                 {isAuthenticating ? (
                   <span className="flex items-center">
                     <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Authenticating...
                   </span>
                 ) : 'Verify Identity'}
               </button>

               <button 
                 onClick={() => setIsLoginModalOpen(false)}
                 className="w-full py-3 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-slate-600 transition-colors"
               >
                 Go Back
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
