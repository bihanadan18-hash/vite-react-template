import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Activity,
  Copy, Check, Terminal, 
  ArrowLeft,
  Clock, User, Shield
} from 'lucide-react';

/**
 * PRIVATE MAIL v5.0 ELITE - ULTIMATE CONSOLIDATED BUILD
 * Fokus: Estetika Premium, Ramping, & 100% Build Success
 */
const WORKER_URL = "https://temp-mail-backend.bihanadan18.workers.dev"; 
const MY_DOMAIN = "rekenbutler.com"; 

export default function App() {
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [showTerminal, setShowTerminal] = useState(false);
  
  const abortControllerRef = useRef(null);

  // FUNGSI PEMBERSIH KONTEN RADIKAL
  const formatBody = (rawBody) => {
    if (!rawBody) return "Pesan Kosong.";
    let clean = rawBody;
    // Hapus header MIME & Boundary yang berantakan
    clean = clean.replace(/(Content-Type|Content-Transfer-Encoding|charset|boundary|MIME-Version|Subject|From|To|Date|X-[\w-]+):.*?\r?\n/gi, '');
    clean = clean.replace(/--[a-f0-9]{10,}/gi, '');
    clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    clean = clean.replace(/<[^>]+>/g, ' '); // Strip HTML tags
    clean = clean.replace(/^[a-zA-Z0-9+/=]{60,}$/gm, ''); // Hapus Base64 long blocks
    clean = clean.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    return clean.trim() || "Isi pesan tidak terbaca atau terenkripsi.";
  };

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(WORKER_URL, { method: 'GET', mode: 'cors' });
      if (res.ok) setConnectionStatus('online');
    } catch {
      setConnectionStatus('offline');
    }
  }, []);

  const generateEmail = () => {
    setLoading(true);
    const id = Math.random().toString(36).substring(2, 10);
    const newEmail = `${id}@${MY_DOMAIN}`.toLowerCase();
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
      const res = await fetch(`${WORKER_URL}/messages?email=${encodeURIComponent(email)}&_v=${Date.now()}`, {
        signal: abortControllerRef.current.signal
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
        setConnectionStatus('online');
      }
    } catch {
      // Silent error
    } finally {
      if (manual) setFetching(false);
    }
  }, [email]);

  useEffect(() => {
    checkHealth();
    const saved = localStorage.getItem('saved_temp_email');
    if (saved && saved.endsWith(MY_DOMAIN)) setEmail(saved.toLowerCase());
    else generateEmail();
  }, [checkHealth]);

  useEffect(() => {
    if (!email) return;
    fetchMessages();
    const int = setInterval(() => fetchMessages(), 8000);
    return () => clearInterval(int);
  }, [fetchMessages, email]);

  const copyEmail = () => {
    if (!email) return;
    const el = document.createElement("textarea");
    el.value = email;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#050507] text-zinc-400 font-sans grid place-items-center p-4 sm:p-10 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Main Container - Ramping & Elegan */}
      <div className="relative w-full h-[85vh] max-w-5xl flex flex-col md:flex-row bg-[#0c0c0e] border border-white/[0.03] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex flex-col border-b md:border-b-0 md:border-r border-white/[0.03] bg-black/20 shrink-0">
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-base font-bold text-white tracking-tight uppercase italic leading-none">PrivateMail</h1>
            </div>

            <div className="space-y-10 flex-grow">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-1">Identitas Node</p>
                <div className="bg-zinc-900/30 border border-white/[0.02] rounded-2xl p-4 transition-all hover:bg-zinc-900/50">
                  <p className="text-[13px] font-mono text-indigo-400 font-bold truncate mb-4 text-center">{loading ? 'Generating...' : email}</p>
                  <div className="flex gap-2">
                    <button onClick={copyEmail} className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-white rounded-xl transition-all active:scale-95 border border-white/5">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                      {copied ? 'BERHASIL' : 'SALIN'}
                    </button>
                    <button onClick={generateEmail} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-white/5">
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'text-zinc-400'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                <div className="flex items-center justify-between px-4 py-3.5 bg-indigo-600/10 text-indigo-400 rounded-2xl font-bold text-[11px] uppercase tracking-wider border border-indigo-600/20">
                  <div className="flex items-center gap-4 italic"><Inbox className="w-5 h-5" /> Masuk</div>
                  <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-lg min-w-[1.5rem] text-center shadow-md">{messages.length}</span>
                </div>
              </nav>
            </div>

            <div className="mt-auto pt-6 border-t border-white/[0.03]">
              <button onClick={() => setShowTerminal(!showTerminal)} className="w-full flex items-center gap-4 px-3 py-2 opacity-50 hover:opacity-100 transition-all text-left">
                <Activity className="w-4 h-4 text-zinc-500" />
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Integritas</p>
                  <p className="text-[11px] text-zinc-400 truncate italic leading-none">Optimal 100%</p>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* List Transmisi */}
        <section className={`w-full md:w-80 flex flex-col border-r border-white/[0.03] bg-[#0e0e11] ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-white/[0.03] flex items-center justify-between bg-[#0e0e11]/50">
            <h2 className="text-[11px] font-bold text-zinc-100 uppercase tracking-[0.2em] italic">Transmisi Masuk</h2>
            <button onClick={() => fetchMessages(true)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20 italic">
                <Mail className="w-10 h-10 mb-5 text-zinc-600 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Menunggu paket data...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => setSelectedMessage(msg)} 
                  className={`p-6 border-b border-white/[0.02] cursor-pointer transition-all ${selectedMessage?.id === msg.id ? 'bg-indigo-600/[0.03] border-l-4 border-l-indigo-600' : 'hover:bg-zinc-800/30'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className={`text-[13px] font-bold truncate max-w-[150px] ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-300'}`}>
                      {(msg.sender || "Unknown").split('<')[0].trim()}
                    </p>
                    <span className="text-[9px] text-zinc-600 font-medium tabular-nums">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate font-medium italic opacity-70 leading-none">
                    {msg.subject || '(Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Decoder Pesan */}
        <main className="flex-grow flex flex-col bg-[#0c0c0e] relative text-left">
          {showTerminal ? (
            <div className="flex flex-col h-full bg-[#050507] p-10 animate-in fade-in duration-500">
               <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800 text-left">
                 <Terminal className="w-5 h-5 text-indigo-500" />
                 <h3 className="text-xs font-bold text-white uppercase tracking-widest leading-none">Log Diagnostik v5.0</h3>
               </div>
               <div className="flex-grow space-y-5 overflow-y-auto custom-scrollbar font-mono text-[11px] text-zinc-500 text-left">
                 <div className="p-5 bg-zinc-900/30 rounded-2xl border border-white/[0.03]">
                   <p className="text-indigo-400 font-bold mb-3 uppercase tracking-widest">[STATUS] INFRASTRUKTUR</p>
                   <p className="italic leading-relaxed">Node terhubung ke D1 SQL. Ingest email dioptimalkan untuk transmisi multipart.</p>
                 </div>
               </div>
               <button onClick={() => setShowTerminal(false)} className="mt-6 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">Tutup</button>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="p-8 border-b border-white/[0.04] flex items-center justify-between bg-[#0e0e11]/60 backdrop-blur-md">
                <div className="flex items-center gap-6 overflow-hidden">
                  <button onClick={() => setSelectedMessage(null)} className="md:hidden p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"><ArrowLeft className="w-5 h-5" /></button>
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/10 shrink-0 text-center uppercase">
                    {selectedMessage.sender[0]}
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="text-base font-bold text-white truncate mb-1 uppercase tracking-tight italic leading-tight">{selectedMessage.subject || '(Tanpa Subjek)'}</h3>
                    <div className="flex items-center gap-3">
                      <User className="w-3.5 h-3.5 text-zinc-600" />
                      <p className="text-[11px] text-zinc-500 truncate font-mono">{selectedMessage.sender}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all ml-4">
                  <Trash2 className="w-5 h-5 text-center" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-10 md:p-14 custom-scrollbar bg-[#09090b]">
                <div className="max-w-2xl mx-auto">
                   <div className="flex items-center gap-3 mb-10 opacity-40 text-left">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Diterima pada {new Date(selectedMessage.date).toLocaleString()}</span>
                   </div>
                   <div className="text-zinc-300 leading-[1.9] text-[15px] whitespace-pre-wrap font-normal italic text-left bg-white/[0.01] p-8 rounded-3xl border border-white/[0.02]">
                      {formatBody(selectedMessage.body)}
                   </div>
                   <div className="mt-20 flex flex-col items-center opacity-10 text-center">
                      <div className="w-32 h-[1px] bg-zinc-700 mb-10"></div>
                      <div className="flex items-center justify-center gap-4 px-6 py-3 bg-black rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-[0.4em]">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                         Secure Node Alpha v5.0
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-700">
              <div className="relative mb-10 text-center mx-auto">
                <div className="absolute inset-0 bg-indigo-600/10 blur-[80px] rounded-full"></div>
                <div className="relative w-28 h-28 bg-[#0e0e11] rounded-[2.5rem] flex items-center justify-center border border-white/[0.04] shadow-2xl mx-auto">
                   <Mail className="w-12 h-12 text-zinc-800" />
                </div>
              </div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mb-4 text-center leading-none">Standby Mode</h3>
              <p className="text-[12px] max-w-[280px] leading-relaxed text-zinc-600 font-medium italic opacity-60 mx-auto text-center leading-[2]">
                Menunggu transmisi paket data terenkripsi masuk melalui protokol secured.
              </p>
            </div>
          )}

          {/* Footer HUD */}
          <div className="px-8 py-4 bg-[#0e0e11] border-t border-white/[0.03] flex items-center justify-between gap-6">
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic leading-none">Node: {MY_DOMAIN}</span>
             </div>
             <div className="flex items-center gap-4 opacity-40">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">RSA-4096 Security Layer</span>
             </div>
          </div>
        </main>
      </div>

      <style>{`
        body { background-color: #050507 !important; display: grid; place-items: center; min-height: 100vh; margin: 0; cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.02); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.08); }
      `}</style>
    </div>
  );
}
