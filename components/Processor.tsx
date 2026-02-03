
import React, { useState, useRef } from 'react';
import { processLegalData } from '../services/geminiService';
import { LegalTask } from '../types';

interface ProcessorProps {
  onProcessed: (task: LegalTask) => void;
}

const Processor: React.FC<ProcessorProps> = ({ onProcessed }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [entryMode, setEntryMode] = useState<'ai' | 'manual'>('ai');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastResult, setLastResult] = useState<LegalTask | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please allow camera access for document scanning.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (entryMode === 'ai') {
      if (!input && !imagePreview) return;
      setIsProcessing(true);
      try {
        const result = await processLegalData(input || "Processing visual case data from scanned records...", imagePreview || undefined);
        const newTask: LegalTask = {
          id: `MTR-${Math.floor(1000 + Math.random() * 9000)}`,
          raw_input: input || "Automated Matter Ingestion",
          ...result,
          created_at: new Date().toISOString()
        };
        setLastResult(newTask);
      } catch (error) {
        console.error(error);
        alert("Data Extraction Failed.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      try {
        const parsed = JSON.parse(input);
        const suggestedFee = parsed.financials?.suggested_fee || 0;
        const taxAmount = suggestedFee * 0.1;
        const newTask: LegalTask = {
          id: `MTR-${Math.floor(1000 + Math.random() * 9000)}`,
          raw_input: "Manual Intake Entry",
          ...parsed,
          financials: {
            ...parsed.financials,
            tax_amount: taxAmount,
            total_inclusive: suggestedFee + taxAmount
          },
          created_at: new Date().toISOString()
        };
        setLastResult(newTask);
      } catch (e) {
        alert("Input Error: Case data must be formatted as valid JSON.");
      }
    }
  };

  const handleCommit = () => {
    if (lastResult) {
      onProcessed(lastResult);
      setLastResult(null);
      setInput('');
      setImagePreview(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-sm backdrop-blur-md">
        <div className="p-6 md:p-10 border-b border-slate-800 bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-600 border border-amber-700 flex items-center justify-center shadow-lg shrink-0">
               <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-amber-500 tracking-tighter leading-none">Document Extraction</h2>
              <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Practice Management Engine</p>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-xl md:rounded-2xl border border-slate-800 w-full md:w-auto">
            <button 
              onClick={() => { setEntryMode('ai'); setInput(''); setLastResult(null); }}
              className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${entryMode === 'ai' ? 'bg-amber-600 text-black shadow-md' : 'text-slate-500 hover:text-amber-400'}`}
            >
              Automated
            </button>
            <button 
              onClick={() => { setEntryMode('manual'); setInput(''); setLastResult(null); }}
              className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${entryMode === 'manual' ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm' : 'text-slate-500 hover:text-amber-400'}`}
            >
              Manual
            </button>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
          {entryMode === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Case Brief / Narrative</label>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Summarize the matter or activity..."
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-sm text-amber-100 outline-none focus:border-amber-600 transition-all min-h-[200px] md:min-h-[280px] leading-relaxed placeholder:text-slate-700 shadow-inner"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Evidence Records</label>
                <div className="relative h-[200px] md:h-[280px] bg-slate-950/30 border-2 border-dashed border-slate-800 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col items-center justify-center group transition-all hover:border-amber-900/50">
                  {isCameraActive ? (
                    <div className="absolute inset-0 z-10 bg-black">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4">
                        <button onClick={capturePhoto} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-2xl scale-100 active:scale-90 transition-transform">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-black"></div>
                        </button>
                        <button onClick={stopCamera} className="px-4 py-2 bg-rose-900/40 text-rose-500 border border-rose-900/50 text-[9px] md:text-[10px] font-black uppercase rounded-full">Cancel</button>
                      </div>
                    </div>
                  ) : imagePreview ? (
                    <div className="absolute inset-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                         <button onClick={() => setImagePreview(null)} className="p-4 bg-rose-600 text-white rounded-full shadow-xl">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="flex justify-center space-x-3">
                         <button onClick={startCamera} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 hover:text-amber-500 hover:border-amber-600 transition-all shadow-sm">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </button>
                         <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 hover:text-amber-500 hover:border-amber-600 transition-all shadow-sm">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4 4v12" /></svg>
                         </button>
                      </div>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">Scan or Upload File</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
            </div>
          )}

          <div className="pt-6 md:pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="hidden sm:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compliance Protocol Active</span>
              </div>
            </div>
            
            <button 
              onClick={handleProcess}
              disabled={isProcessing || (!input && !imagePreview)}
              className="w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-black rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-950/20 transition-all transform active:scale-95 flex items-center justify-center"
            >
              {isProcessing ? 'Processing Records...' : 'Process Case Records'}
            </button>
          </div>
        </div>
      </div>

      {lastResult && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-amber-900/20 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Proposed Matter Record
              </h3>
              <div className="space-y-4">
                <p className="text-sm font-bold text-amber-100 leading-tight">{lastResult.task_metadata.title}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-1">Client</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{lastResult.task_metadata.client_name || 'Individual'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-1">Case Number</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{lastResult.task_metadata.case_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-1">Trust Balance</p>
                    <p className="text-[10px] font-black text-emerald-400 font-mono">K{lastResult.financials.trust_balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-1">Counsel Assigned</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{lastResult.task_metadata.lawyer_assigned || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-end">
              <button 
                onClick={handleCommit}
                className="w-full py-4 md:py-5 bg-amber-600 hover:bg-amber-700 text-black rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center group"
              >
                Confirm & Create Matter
                <svg className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Processor;
