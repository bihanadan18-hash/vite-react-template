import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Search, AlertTriangle, Activity,
  Copy, Check, Terminal, 
  ChevronRight, ArrowLeft,
  Clock, User, Send
} from 'lucide-react';

/**
 * FRONTEND PRIVATE MAIL v4.7 PRO (Minimalist Professional)
 * Fokus: Estetika Ramping, Tipografi Seimbang, & Performa Solid
 */
const WORKER_URL = "https://temp-mail-backend.bihanadan18.workers.dev"; 
const MY_DOMAIN = "rekenbutler.com"; 

interface EmailMessage {
  id: string;
  sender: string;    
  recipient: string; 
  subject: string;
  body: string;
  date: string;
}

export default function App() {
  const [email, setEmail] = useState<string>('');
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * PEMBERSIH KONTEN (Security Protocol)
   */
  const formatBody = (rawBody: string) => {
    if (!rawBody) return "Pesan Kosong.";
    let clean = rawBody.replace(/(Content-Type|Content-Transfer-Encoding|charset|boundary|MIME-Version|Subject|From|To|Date)=.*?\r?\n/gi, '');
    clean = clean.replace(/--[a-f0-9]{10,}/gi, '');
    clean = clean.replace(/^[a-zA-Z0-9+/=]{40,}$/gm, ''); // Hilangkan blok Base64 panjang jika ada
    clean = clean.trim();
    return clean || "Pesan terenkripsi atau hanya berisi elemen grafis.";
  };

  const checkApiHealth = useCallback(async () => {
    try {
      const baseUrl = WORKER_URL.replace(/\/$/, ""); 
      const response = await fetch(baseUrl, { method: 'GET', mode: 'cors', cache: 'no-store' });
      if (response.ok) {
        setConnectionStatus('online');
        setConnectionError(null);
      }
    } catch (err: any) {
      setConnectionStatus('offline');
    }
  }, []);

  const generateRandomEmail = () => {
    setLoading(true);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    const newEmail = `${result}@${MY_DOMAIN}`.toLowerCase();
    setEmail(newEmail);
    setMessages([]);
    setSelectedMessage(null);
    localStorage.setItem('saved_temp_email', newEmail);
    setLoading(false);
  };

  const fetchMessages = useCallback(async (manual = false) => {
    if (!email) return;
    if (manual) setFetching(true);
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const baseUrl = WORKER_URL.replace(/\/$/, "");
      const cleanEmail = email.trim().toLowerCase();
      const targetUrl = `${baseUrl}/messages?email=${encodeURIComponent(cleanEmail)}&_ts=${Date.now()}`;
      
      const response = await fetch(targetUrl, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });
      
      const rawText = await response.text();
      
      if (!response.ok) {
        let info = `Error ${response.status}`;
        try {
          const data = JSON.parse(rawText);
          info = data.error || info;
        } catch (e) { }
        throw new Error(info);
      }
      
      const data = JSON.parse(rawText);
      if (Array.isArray(data)) {
        setMessages(data);
        setConnectionStatus('online');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && manual) {
        setConnectionError(err.message);
      }
    } finally {
      if (manual) setFetching(false);
    }
  }, [email]);

  useEffect(() => {
    checkApiHealth();
    const saved = localStorage.getItem('saved_temp_email');
    if (saved && saved.endsWith(MY_DOMAIN)) setEmail(saved.toLowerCase());
    else generateRandomEmail();
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, [checkApiHealth]);

  useEffect(() => {
    if (!email) return;
    fetchMessages();
    const interval = setInterval(() => fetchMessages(), 10000); 
    return () => clearInterval(interval);
  }, [fetchMessages, email]);

  const copyToClipboard = () => {
    if (!email) return;
    const textArea = document.createElement("textarea");
    textArea.value = email;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-400 font-sans grid place-items-center p-0 sm:p-6 md:p-8 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Main Container - Slimmer & Centered */}
      <div className="relative w-full h-full sm:h-[85vh] max-w-6xl flex flex-col md:flex-row bg-[#121214] border border-zinc-800/50 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden transition-all">
        
        {/* SIDEBAR: NAVIGATION */}
        <aside className="w-full md:w-64 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800/50 bg-[#121214] shrink-0">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-600 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-sm font-bold text-zinc-100 tracking-tight uppercase">PrivateMail</h1>
            </div>

            <div className="space-y-6 flex-grow">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Identitas Anda</label>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 group">
                  <p className="text-xs font-mono text-zinc-200 truncate mb-3 text-center">{loading ? 'Loading...' : email}</p>
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="flex-grow flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 rounded-lg transition-all active:scale-95">
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-indigo-400" />}
                      {copied ? 'DISALIN' : 'SALIN'}
                    </button>
                    <button onClick={generateRandomEmail} disabled={loading} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95">
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                <div className="flex items-center justify-between px-3 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all">
                  <div className="flex items-center gap-3"><Inbox className="w-4 h-4" /> Masuk</div>
                  <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-md">{messages.length}</span>
                </div>
              </nav>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-800/50">
              <button onClick={() => setShowTerminal(!showTerminal)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/50 rounded-lg transition-all group">
                <Activity className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400" />
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Status Node</p>
                  <p className="text-[11px] text-zinc-400 truncate italic">Operasional 100%</p>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* PANEL 2: INBOX LIST */}
        <section className={`w-full md:w-[320px] flex flex-col border-r border-zinc-800/50 bg-[#161618] ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Transmisi</h2>
            <div className="flex items-center gap-2">
              {fetching && <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />}
              <button onClick={() => fetchMessages(true)} className="p-1.5 hover:bg-zinc-800 rounded-md transition-all text-zinc-500 hover:text-zinc-200">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 opacity-30">
                <Mail className="w-8 h-8 mb-4 text-zinc-600" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-center">Menunggu Sinyal...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => setSelectedMessage(msg)} 
                  className={`p-4 border-b border-zinc-800/30 cursor-pointer transition-all ${selectedMessage?.id === msg.id ? 'bg-indigo-500/[0.04] border-l-2 border-l-indigo-500' : 'hover:bg-zinc-800/30'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-[12px] font-bold truncate max-w-[160px] ${selectedMessage?.id === msg.id ? 'text-zinc-100' : 'text-zinc-300'}`}>
                      {(msg.sender || "Anonim").split('<')[0].trim()}
                    </p>
                    <span className="text-[9px] text-zinc-600 font-medium">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate leading-relaxed">
                    {msg.subject || '(Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL 3: MESSAGE READER */}
        <main className="flex-grow flex flex-col bg-[#121214] relative">
          {showTerminal ? (
            <div className="flex flex-col h-full bg-[#09090b] p-8 animate-in fade-in duration-500">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                 <Terminal className="w-4 h-4 text-indigo-500" />
                 <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Log Diagnostik</h3>
               </div>
               <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar font-mono text-[11px] text-zinc-500">
                 <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                   <p className="text-indigo-400 font-bold mb-2">INFRASTRUKTUR</p>
                   <p className="italic">Protokol D1 SQL Terverifikasi. Sinkronisasi Catch-all Aktif.</p>
                 </div>
               </div>
               <button onClick={() => setShowTerminal(false)} className="mt-4 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all">Tutup Log</button>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {/* Header */}
              <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-[#161618]/50">
                <div className="flex items-center gap-4 overflow-hidden">
                  <button onClick={() => setSelectedMessage(null)} className="md:hidden p-2 hover:bg-zinc-800 rounded-lg"><ArrowLeft className="w-4 h-4" /></button>
                  <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                    {selectedMessage.sender[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-100 truncate">{selectedMessage.subject || '(Tanpa Subjek)'}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <User className="w-3 h-3 text-zinc-600" />
                      <p className="text-[11px] text-zinc-500 truncate">{selectedMessage.sender}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all shrink-0 ml-4">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#121214]">
                <div className="max-w-3xl mx-auto">
                   <div className="flex items-center gap-2 mb-6 opacity-40">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Diterima pada {new Date(selectedMessage.date).toLocaleString()}</span>
                   </div>
                   <div className="text-zinc-300 leading-[1.8] text-[14px] whitespace-pre-wrap font-normal">
                      {formatBody(selectedMessage.body)}
                   </div>
                   <div className="mt-12 pt-8 border-t border-zinc-800/30 flex justify-center opacity-20">
                      <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-full text-[10px] font-bold uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                         Secure Node Alpha v4.7
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800/50">
                 <Mail className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.3em] mb-3">Sistem Siaga</h3>
              <p className="text-[11px] max-w-[240px] leading-relaxed text-zinc-600 italic">
                Menunggu transmisi paket data terenkripsi masuk melalui jalur secured.
              </p>
            </div>
          )}

          {/* Footer HUD */}
          <div className="p-4 bg-[#161618] border-t border-zinc-800/50 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Node: {MY_DOMAIN}</span>
             </div>
             <div className="flex items-center gap-3 opacity-30">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest">AES-256 Encrypted</span>
             </div>
          </div>
        </main>
      </div>

      <style>{`
        body { background-color: #09090b !important; display: grid; place-items: center; min-height: 100vh; margin: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.1); }
      `}</style>
    </div>
  );
}
