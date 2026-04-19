import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, Copy, Check, 
  ShieldCheck, Inbox, Send, Star, 
  ChevronRight, Zap, Shield, Search, Lock, AlertTriangle, Activity
} from 'lucide-react';

/**
 * KONFIGURASI FINAL:
 * URL dan Domain sudah disesuaikan dengan milik Anda.
 */
const WORKER_URL = "https://temp-mail-backend.bihanadan18.workers.dev"; 
const MY_DOMAIN = "mail.rekenbutler.com"; 

interface EmailMessage {
  id: string;
  from: string;
  to: string;
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
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fungsi untuk mengecek status API dan menangkap kendala CORS
  const checkApiHealth = useCallback(async () => {
    try {
      const baseUrl = WORKER_URL.endsWith('/') ? WORKER_URL.slice(0, -1) : WORKER_URL;
      
      const response = await fetch(baseUrl, { 
        method: 'GET', 
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        setConnectionStatus('online');
        setConnectionError(null);
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Health Check Failed:", err);
      setConnectionStatus('offline');
      setConnectionError("API aktif, tetapi koneksi ditolak oleh kebijakan keamanan (CORS).");
    }
  }, []);

  const generateRandomEmail = () => {
    setLoading(true);
    setConnectionError(null);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newEmail = `${result}@${MY_DOMAIN}`;
    setEmail(newEmail);
    setMessages([]);
    setSelectedMessage(null);
    localStorage.setItem('saved_temp_email', newEmail);
    setLoading(false);
  };

  const fetchMessages = useCallback(async (showLoading = false) => {
    if (!email || email === '') return;
    if (showLoading) setFetching(true);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const baseUrl = WORKER_URL.endsWith('/') ? WORKER_URL.slice(0, -1) : WORKER_URL;
      const targetUrl = `${baseUrl}/messages?email=${encodeURIComponent(email)}`;
      
      const response = await fetch(targetUrl, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
        credentials: 'omit'
      });
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
      
      setConnectionStatus('online');
      setConnectionError(null); 
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Fetch Messages Error:", err);
        setConnectionStatus('offline');
        setConnectionError("Gagal mengambil data dari tunnel terenkripsi.");
      }
    } finally {
      if (showLoading) setFetching(false);
    }
  }, [email]);

  useEffect(() => {
    checkApiHealth();
    const saved = localStorage.getItem('saved_temp_email');
    if (saved && saved.endsWith(MY_DOMAIN)) {
      setEmail(saved);
    } else {
      generateRandomEmail();
    }
    
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [checkApiHealth]);

  useEffect(() => {
    if (!email) return;
    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(false), 12000);
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
      console.error('Gagal menyalin:', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
      
      {/* Background Glow Dinamis */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Glass Application Container */}
      <div 
        style={{ placeSelf: 'center' }}
        className="relative w-full h-full md:h-[88vh] max-w-[1450px] flex flex-col md:flex-row bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/5 rounded-none md:rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        
        {/* PANEL 1: SIDEBAR */}
        <aside className="w-full md:w-72 lg:w-80 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/40">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-4 mb-12 group cursor-default">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/50 blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-[1.2rem] shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-white tracking-tighter italic leading-none">PRIVATEMAY</h1>
                <span className="text-[10px] text-zinc-600 font-bold tracking-[0.4em] uppercase mt-1.5">Alpha Protocol</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative p-6 bg-zinc-900/40 border border-white/5 rounded-3xl backdrop-blur-xl shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}></div>
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">
                        {connectionStatus === 'online' ? 'Tunnel Active' : 'Tunnel Failed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-sm font-mono text-indigo-300 truncate font-bold tracking-tight">
                      {loading ? 'Decrypting...' : email}
                    </span>
                    <button 
                      onClick={copyToClipboard} 
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                      {copied ? 'Copied' : 'Copy ID'}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={generateRandomEmail}
                disabled={loading}
                className="w-full py-4.5 bg-white hover:bg-zinc-200 text-black rounded-[1.5rem] font-black text-[11px] tracking-[0.1em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                ROTATE IDENTITY
              </button>
            </div>
          </div>

          <nav className="flex-grow px-5 mt-10 space-y-2">
            <div className="flex items-center justify-between px-6 py-4.5 bg-indigo-500/10 text-indigo-400 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-indigo-500/20 cursor-pointer shadow-[0_10px_30px_rgba(99,102,241,0.15)]">
              <div className="flex items-center gap-5 italic">
                <Inbox className="w-5 h-5" /> Incoming
              </div>
              <span className="bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg text-[10px] shadow-lg">{messages.length}</span>
            </div>
            {['Archive', 'Starred', 'Destroyed'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 px-6 py-4.5 text-zinc-700 rounded-2xl font-bold text-[11px] uppercase tracking-widest cursor-not-allowed opacity-30 transition-all hover:bg-white/5">
                {idx === 0 ? <Send className="w-5 h-5" /> : idx === 1 ? <Star className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                {item}
              </div>
            ))}
          </nav>

          <div className="p-8">
            <div className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-center gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                 <Activity className="w-4 h-4 text-indigo-400/60" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-0.5">Uptime</p>
                <p className="text-[11px] text-zinc-400 font-mono truncate uppercase">{connectionStatus === 'online' ? '99.9% Stable' : 'Interrupted'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL 2: MIDDLE */}
        <section className="w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-white/5 bg-black/10">
          <div className="p-10 pb-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-white tracking-tighter italic">INBOX</h2>
              <button 
                onClick={() => fetchMessages(true)} 
                className={`p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/40 rounded-2xl transition-all shadow-xl ${fetching ? 'text-indigo-400' : 'text-zinc-600 hover:text-white'}`}
              >
                <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {connectionError && (
              <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start gap-4 text-red-400 animate-in zoom-in duration-500 shadow-[0_15px_30px_rgba(239,68,68,0.15)]">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <p className="font-black uppercase tracking-widest mb-1.5 leading-none">Security Alert</p>
                  <p className="opacity-80 font-medium italic">Koneksi ditolak oleh browser. Periksa konfigurasi CORS pada Cloudflare Worker Anda.</p>
                </div>
              </div>
            )}

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-indigo-500 transition-all" />
              <input 
                type="text" 
                placeholder="Scan encrypted packets..." 
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-xs focus:outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800 font-medium"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-5 space-y-3 custom-scrollbar bg-zinc-950/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                <div className="w-24 h-24 bg-zinc-900/30 rounded-full flex items-center justify-center mb-8 border border-dashed border-zinc-800 shadow-inner">
                  <Mail className="w-10 h-10 text-zinc-700" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Listening for Data</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`relative p-6 rounded-[2rem] cursor-pointer transition-all duration-700 border group shadow-lg ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'hover:bg-white/5 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4 max-w-[75%]">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedMessage?.id === msg.id ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]' : 'bg-zinc-800'}`}></div>
                      <p className={`text-[13px] font-black truncate tracking-tight ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {msg.from.split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[9px] text-zinc-700 font-black bg-black/60 px-2.5 py-1.5 rounded-xl border border-white/5 uppercase tracking-tighter">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate font-semibold transition-colors duration-500 ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {msg.subject || '(Protocol: Empty Subject)'}
                  </p>
                  <div className="mt-5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-1000 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[8px] font-black text-indigo-500/50 uppercase tracking-[0.2em] italic flex items-center gap-2">
                      <Lock className="w-3 h-3" /> SECURE TUNNEL L4
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-800" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL 3: RIGHT */}
        <main className="flex-grow flex flex-col bg-black/20 overflow-hidden relative">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Header Reader */}
              <div className="p-10 md:p-12 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-30"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-900 rounded-[2.2rem] flex items-center justify-center font-black text-white text-4xl shadow-2xl border border-white/10 italic">
                      {selectedMessage.from[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="max-w-xl">
                    <h3 className="text-3xl md:text-4xl font-black text-white leading-none mb-4 tracking-tighter uppercase italic">
                      {selectedMessage.subject || '(No Subject)'}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em] italic">Source:</span>
                      <span className="text-[12px] text-indigo-400 font-bold font-mono px-4 py-1.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                        {selectedMessage.from}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-6 bg-zinc-950/80 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-[2.8rem] text-zinc-600 hover:text-red-400 transition-all duration-700 shadow-3xl group"
                  >
                    <Trash2 className="w-7 h-7 transform group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-grow overflow-y-auto p-10 md:p-16 custom-scrollbar bg-black/60 shadow-inner">
                <div className="max-w-3xl mx-auto">
                  <div className="relative p-14 bg-[#0d0d0d] rounded-[4rem] border border-white/5 min-h-[450px] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 p-12 flex gap-4 opacity-5">
                       <Shield className="w-8 h-8" />
                    </div>
                    <div className="text-zinc-300 leading-[2.1] text-xl whitespace-pre-wrap font-medium selection:bg-indigo-500/40 tracking-tight">
                      {selectedMessage.body}
                    </div>
                  </div>
                  
                  <div className="mt-20 flex flex-col items-center opacity-20">
                    <div className="w-32 h-1 bg-zinc-900 rounded-full mb-12"></div>
                    <div className="flex items-center gap-5 px-12 py-5 bg-black border border-white/5 rounded-full text-[11px] text-zinc-600 font-black uppercase tracking-[0.5em] italic">
                       <div className="w-2.5 h-2.5 bg-indigo-700 rounded-full animate-pulse shadow-[0_0_15px_rgba(67,56,202,1)]"></div>
                       PROTOCOL: SELF-DESTRUCT INITIATED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-1000">
              <div className="relative mb-14 group">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full group-hover:bg-indigo-500/20 transition duration-1500"></div>
                <div className="relative w-48 h-48 bg-zinc-950 border border-white/10 rounded-[4.5rem] flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden transform group-hover:scale-105 transition-transform duration-1000">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent"></div>
                   <Inbox className="w-20 h-20 text-zinc-900 transition-all duration-1000 group-hover:text-indigo-400 group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-zinc-900 mb-6 tracking-[0.3em] uppercase leading-none italic opacity-80">
                 {connectionStatus === 'offline' ? 'Bridge Offline' : 'Standby'}
              </h3>
              <p className="text-[12px] max-w-sm text-zinc-800 leading-relaxed font-black uppercase tracking-[0.5em] italic opacity-40">
                {connectionStatus === 'offline' ? 'System handshake failed. Security firewall active.' : 'Awaiting incoming secure data packets.'}
              </p>
              
              <div className="mt-24 flex gap-3 items-end opacity-5">
                {[...Array(35)].map((_, i) => (
                  <div key={i} className="h-10 w-2 bg-zinc-600 rounded-full animate-wave" style={{ height: `${Math.random() * 60 + 15}px`, animationDelay: `${i * 0.12}s` }}></div>
                ))}
              </div>
            </div>
          )}

          {/* Persistent Tech Footer */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 px-16 py-5 bg-black/80 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
            <div className={`flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] ${connectionStatus === 'offline' ? 'text-red-600' : 'text-indigo-500'} shadow-indigo-500/20 italic`}>
               <ShieldCheck className="w-5 h-5" />
               {connectionStatus === 'offline' ? 'Secure Node Down' : 'Secure Bridge L4'}
            </div>
            <div className="w-px h-6 bg-zinc-800/60"></div>
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-800 italic group cursor-default">
               <Zap className="w-5 h-5 text-indigo-500/20 group-hover:text-indigo-500/80 transition-colors" />
               RELAY: {MY_DOMAIN.toUpperCase()}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.015); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.04); }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.08); opacity: 0.1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 12s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: scaleY(1); opacity: 0.3; }
          50% { transform: scaleY(2.2); opacity: 0.8; }
        }
        .animate-wave {
          animation: wave 2.5s ease-in-out infinite;
        }

        body {
          background-color: #030303 !important;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
