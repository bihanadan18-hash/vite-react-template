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
 * FRONTEND PRIVATE MAIL v4.8.4 ELITE (BUILD STABLE)
 * Fokus: Estetika Ramping, Tipografi Profesional, & Pembersihan Konten
 * Perbaikan: Penghapusan total variabel tak terpakai untuk kelulusan build TS Cloudflare
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
  const [showTerminal, setShowTerminal] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * PEMBERSIH KONTEN (Elite Sanitizer)
   * Menghilangkan jejak MIME, HTML Tags, dan Header Teknis
   */
  const formatBody = (rawBody: string) => {
    if (!rawBody) return "Pesan Kosong.";
    
    const isHtml = /<[a-z][\s\S]*>/i.test(rawBody);
    let clean = rawBody;
    
    if (isHtml) {
      clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      clean = clean.replace(/<[^>]+>/g, ' ');
    }

    clean = clean.replace(/(Content-Type|Content-Transfer-Encoding|charset|boundary|MIME-Version|Subject|From|To|Date|X-[\w-]+):.*?\r?\n/gi, '');
    clean = clean.replace(/--[a-f0-9]{10,}/gi, '');
    clean = clean.replace(/^[a-zA-Z0-9+/=]{60,}$/gm, ''); 
    
    clean = clean.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    clean = clean.trim();

    return clean || "Pesan terenkripsi atau hanya berisi elemen grafis.";
  };

  const checkApiHealth = useCallback(async () => {
    try {
      const baseUrl = WORKER_URL.replace(/\/$/, ""); 
      const response = await fetch(baseUrl, { method: 'GET', mode: 'cors', cache: 'no-store' });
      if (response.ok) {
        setConnectionStatus('online');
      }
    } catch (err: unknown) {
      setConnectionStatus('offline');
    }
  }, []);

  const generateRandomEmail = () => {
    setLoading(true);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
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
      const targetUrl = `${baseUrl}/messages?email=${encodeURIComponent(cleanEmail)}&_ref=${Date.now()}`;
      
      const response = await fetch(targetUrl, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });
      
      const rawText = await response.text();
      
      if (!response.ok) {
        throw new Error(rawText || `Error ${response.status}`);
      }
      
      const data = JSON.parse(rawText);
      if (Array.isArray(data)) {
        setMessages(data);
        setConnectionStatus('online');
      }
    } catch (err: unknown) {
        // Error handling silent untuk auto-sync agar tidak mengganggu UI
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
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin alamat");
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-zinc-400 font-sans grid place-items-center p-4 sm:p-6 md:p-8 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Main App Shell - Slimmer & Balanced */}
      <div className="relative w-full h-[88vh] max-w-5xl flex flex-col md:flex-row bg-[#111114] border border-white/[0.04] rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500">
        
        {/* NAVIGATION BAR: Minimalist Side */}
        <aside className="w-full md:w-60 flex flex-col border-b md:border-b-0 md:border-r border-white/[0.04] bg-[#111114] shrink-0 text-left">
          <div className="p-6 flex flex-col h-full text-left">
            <div className="flex items-center gap-3 mb-10 text-left">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20 text-left">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-sm font-bold text-zinc-100 tracking-tight uppercase italic text-left leading-none">PrivateMail</h1>
            </div>

            <div className="space-y-8 flex-grow text-left">
              <div className="space-y-4 text-left">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-1 text-left">Identitas Aktif</p>
                <div className="bg-zinc-900/40 border border-white/[0.03] rounded-xl p-4 group transition-all hover:bg-zinc-900/60">
                  <div className="text-center">
                    <p className="text-[13px] font-mono text-indigo-400 font-bold truncate mb-4 text-center">{loading ? 'Processing...' : email}</p>
                    <div className="flex gap-2 justify-center">
                      <button onClick={copyToClipboard} className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 rounded-lg transition-all active:scale-95 border border-white/[0.02]">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                        {copied ? 'BERHASIL' : 'SALIN'}
                      </button>
                      <button onClick={generateRandomEmail} disabled={loading} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95 border border-white/[0.02]">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'text-zinc-500'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="space-y-2 text-left">
                <div className="flex items-center justify-between px-3 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-bold text-[11px] uppercase tracking-wide border border-indigo-600/20 shadow-sm shadow-indigo-600/5 text-left">
                  <div className="flex items-center gap-3 text-left"><Inbox className="w-4 h-4 text-left" /> Masuk</div>
                  <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-md min-w-[1.5rem] text-center shadow-inner">{messages.length}</span>
                </div>
              </nav>
            </div>

            <div className="mt-auto pt-6 border-t border-white/[0.04] text-left">
              <button onClick={() => setShowTerminal(!showTerminal)} className="w-full flex items-center gap-3 px-3 py-2 opacity-60 hover:opacity-100 transition-all text-left">
                <Activity className="w-4 h-4 text-zinc-500 text-left" />
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter text-left">Integritas</p>
                  <p className="text-[11px] text-zinc-400 truncate italic leading-none text-left">Operasional 100%</p>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* TRANSMISSION LIST: Central Stream */}
        <section className={`w-full md:w-80 flex flex-col border-r border-white/[0.04] bg-[#141417] text-left ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-white/[0.04] flex items-center justify-between bg-[#141417]">
            <h2 className="text-[11px] font-bold text-zinc-100 uppercase tracking-[0.2em] italic text-left leading-none">Transmisi Masuk</h2>
            <div className="flex items-center gap-2">
              {fetching && <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />}
              <button onClick={() => fetchMessages(true)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 hover:text-zinc-200 border border-transparent hover:border-white/[0.04]">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar text-left">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-20 italic">
                <Mail className="w-10 h-10 mb-5 text-zinc-600 text-center" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-center">Menunggu paket data terenkripsi...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => setSelectedMessage(msg)} 
                  className={`p-5 border-b border-white/[0.02] cursor-pointer transition-all ${selectedMessage?.id === msg.id ? 'bg-indigo-600/[0.03] border-l-4 border-l-indigo-600' : 'hover:bg-zinc-800/30'} text-left`}
                >
                  <div className="flex justify-between items-start mb-1.5 text-left">
                    <p className={`text-[13px] font-bold truncate max-w-[140px] text-left ${selectedMessage?.id === msg.id ? 'text-zinc-100' : 'text-zinc-300'}`}>
                      {(msg.sender || "Unknown").split('<')[0].trim()}
                    </p>
                    <span className="text-[9px] text-zinc-600 font-medium tabular-nums text-right">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate font-medium italic opacity-70 text-left">
                    {msg.subject || '(Protokol: Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* DATA DECODER: Main Viewer */}
        <main className="flex-grow flex flex-col bg-[#111114] relative text-left">
          {showTerminal ? (
            <div className="flex flex-col h-full bg-[#09090b] p-8 animate-in fade-in duration-500 text-left">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800 text-left">
                 <Terminal className="w-4 h-4 text-indigo-500" />
                 <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest text-left">Log Diagnostik</h3>
               </div>
               <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar font-mono text-[11px] text-zinc-500 text-left">
                 <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-left">
                   <p className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-left">[OK] INFRASTRUKTUR</p>
                   <p className="italic text-left">Protokol D1 SQL Terverifikasi. Sinkronisasi Catch-all Aktif.</p>
                 </div>
               </div>
               <button onClick={() => setShowTerminal(false)} className="mt-4 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all">Tutup Log</button>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300 text-left">
              {/* Header */}
              <div className="p-6 border-b border-white/[0.04] flex items-center justify-between bg-[#141417]/60 backdrop-blur-md text-left">
                <div className="flex items-center gap-5 overflow-hidden text-left">
                  <button onClick={() => setSelectedMessage(null)} className="md:hidden p-2 hover:bg-zinc-800 rounded-lg mr-2"><ArrowLeft className="w-4 h-4 text-zinc-400" /></button>
                  <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/10 shrink-0">
                    {selectedMessage.sender[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="text-[15px] font-bold text-zinc-100 truncate mb-1 uppercase tracking-tight italic text-left">{selectedMessage.subject || '(Tanpa Subjek)'}</h3>
                    <div className="flex items-center gap-2 text-left">
                      <User className="w-3 h-3 text-zinc-600" />
                      <p className="text-[11px] text-zinc-500 truncate font-mono text-left">{selectedMessage.sender}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0 text-left">
                  <button onClick={() => setSelectedMessage(null)} className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all border border-transparent hover:border-red-400/20">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#0d0d0f] text-left">
                <div className="max-w-2xl mx-auto text-left">
                   <div className="flex items-center gap-3 mb-8 opacity-40 text-left">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-left">Paket diterima pada {new Date(selectedMessage.date).toLocaleString()}</span>
                   </div>
                   <div className="text-zinc-300 leading-[1.8] text-[15px] whitespace-pre-wrap font-medium tracking-normal italic text-left bg-zinc-900/20 p-8 rounded-3xl border border-white/[0.02]">
                      {formatBody(selectedMessage.body)}
                   </div>
                   <div className="mt-16 flex flex-col items-center opacity-10 text-center mx-auto">
                      <div className="w-32 h-[1px] bg-zinc-700 mb-8 text-center mx-auto"></div>
                      <div className="flex items-center justify-center gap-3 px-5 py-2.5 bg-black rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-[0.4em]">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                         Secure Terminal Pro
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500 text-center">
              <div className="relative mb-8 text-center mx-auto">
                <div className="absolute inset-0 bg-indigo-600/10 blur-[60px] rounded-full"></div>
                <div className="relative w-24 h-24 bg-zinc-900/80 rounded-[2.5rem] flex items-center justify-center border border-white/[0.04] shadow-2xl mx-auto">
                   <Mail className="w-10 h-10 text-zinc-700" />
                </div>
              </div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mb-4 text-center leading-none">Node Standby</h3>
              <p className="text-[12px] max-w-[280px] leading-relaxed text-zinc-600 font-medium italic opacity-60 mx-auto text-center leading-[2]">
                Menunggu transmisi paket data terenkripsi masuk melalui protokol secured.
              </p>
            </div>
          )}

          {/* SYSTEM HUD FOOTER: Slim Line */}
          <div className="px-6 py-3.5 bg-[#141417] border-t border-white/[0.04] flex items-center justify-between gap-4 text-left">
             <div className="flex items-center gap-3 text-left">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic text-left">Node: {MY_DOMAIN}</span>
             </div>
             <div className="flex items-center gap-3 opacity-40 text-left">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-left">RSA-4096 Secure Connection</span>
             </div>
          </div>
        </main>
      </div>

      <style>{`
        body { background-color: #0a0a0c !important; display: grid; place-items: center; min-height: 100vh; margin: 0; cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.08); }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.8; } }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
