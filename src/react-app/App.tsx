import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Search, AlertTriangle, Activity,
  Copy, Check, Clock, Lock
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

  // Fungsi diagnostik koneksi
  const checkApiHealth = useCallback(async () => {
    try {
      const baseUrl = WORKER_URL.replace(/\/$/, ""); 
      const response = await fetch(baseUrl, { 
        method: 'GET', 
        mode: 'cors',
        cache: 'no-store'
      });
      if (response.ok) {
        setConnectionStatus('online');
        setConnectionError(null);
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Gagal Diagnosa:", err);
      setConnectionStatus('offline');
      setConnectionError("Gagal terhubung ke server. Periksa pengaturan keamanan (CORS).");
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
      const baseUrl = WORKER_URL.replace(/\/$/, "");
      const targetUrl = `${baseUrl}/messages?email=${encodeURIComponent(email)}&ts=${Date.now()}`;
      
      const response = await fetch(targetUrl, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error("Gagal Ambil Data");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMessages(data);
        setConnectionStatus('online');
        setConnectionError(null);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setConnectionStatus('offline');
      }
    } finally {
      setFetching(false);
    }
  }, [email]);

  useEffect(() => {
    checkApiHealth();
    const saved = localStorage.getItem('saved_temp_email');
    if (saved && saved.endsWith(MY_DOMAIN)) setEmail(saved);
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
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-0 md:p-8 overflow-hidden">
      
      {/* Efek Cahaya Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[160px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-600/5 blur-[160px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Kontainer Aplikasi Utama */}
      <div 
        style={{ placeSelf: 'center' }} 
        className="relative w-full h-full md:h-[88vh] max-w-[1450px] flex flex-col md:flex-row bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/5 rounded-none md:rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        
        {/* PANEL 1: SIDEBAR (Pusat Komando) */}
        <aside className="w-full md:w-80 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/40">
          <div className="p-10 pb-6">
            <div className="flex items-center gap-5 mb-14 group cursor-default">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative p-4 bg-gradient-to-br from-zinc-800 to-black rounded-[1.2rem] border border-white/10 shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-indigo-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-white tracking-tighter italic leading-none uppercase">PrivateMail</h1>
                <span className="text-[10px] text-zinc-600 font-bold tracking-[0.4em] uppercase mt-2">Protokol Alpha</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-zinc-500/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative p-7 bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] shadow-inner">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'}`}></div>
                      <span className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">
                        {connectionStatus === 'online' ? 'Node Aktif' : 'Node Terputus'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-sm font-mono text-indigo-300 truncate font-black tracking-tight leading-none bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                      {loading ? 'Mengenkripsi...' : email}
                    </span>
                    <button 
                      onClick={copyToClipboard} 
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Berhasil Salin' : 'Salin Alamat'}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={generateRandomEmail}
                disabled={loading}
                className="w-full py-5 bg-white hover:bg-zinc-200 text-black rounded-[1.8rem] font-black text-xs flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl uppercase italic tracking-widest"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Ganti Identitas
              </button>
            </div>
          </div>

          <nav className="flex-grow px-6 mt-10 space-y-2">
            <div className="flex items-center justify-between px-8 py-5 bg-indigo-500/10 text-indigo-400 rounded-3xl font-black text-[11px] uppercase tracking-widest border border-indigo-500/20 cursor-pointer shadow-lg shadow-indigo-500/5">
              <div className="flex items-center gap-5 italic">
                <Inbox className="w-5 h-5" /> Kotak Masuk
              </div>
              <span className="bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg text-[10px]">{messages.length}</span>
            </div>
            {['Arsip', 'Berbintang', 'Dihancurkan'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 px-8 py-5 text-zinc-700 rounded-3xl font-bold text-[11px] uppercase tracking-widest cursor-not-allowed opacity-30 transition-all hover:bg-white/5">
                <Lock className="w-5 h-5" /> {item}
              </div>
            ))}
          </nav>

          <div className="p-10 mt-auto">
            <div className="p-6 bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center gap-5 shadow-inner">
              <div className="p-3 bg-indigo-500/5 rounded-2xl">
                 <Activity className="w-5 h-5 text-indigo-500/40" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] text-zinc-700 font-black uppercase tracking-widest mb-1">Status Server</p>
                <p className="text-[12px] text-zinc-500 font-mono truncate uppercase font-bold tracking-tighter italic">{connectionStatus === 'online' ? 'Akses Stabil' : 'Akses Ditolak'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL 2: MIDDLE (Daftar Transmisi) */}
        <section className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md">
          <div className="p-12 pb-10 border-b border-white/5">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Masuk</h2>
              <button 
                onClick={() => fetchMessages(true)} 
                className={`p-3 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/40 rounded-2xl transition-all ${fetching ? 'text-indigo-500' : 'text-zinc-600 hover:text-white'}`}
              >
                <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {connectionError && (
              <div className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-start gap-4 text-red-400 animate-in zoom-in">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-bold italic">
                   Koneksi ditolak browser. Periksa pengaturan CORS pada node backend.
                </div>
              </div>
            )}

            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-indigo-500 transition-all" />
              <input 
                type="text" 
                placeholder="Cari transmisi data..." 
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4.5 pl-14 pr-6 text-xs focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-zinc-800 font-bold uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-14 text-center opacity-30 italic">
                <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-8 border border-dashed border-zinc-800">
                  <Mail className="w-10 h-10 text-zinc-700" />
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-700">Mencari Sinyal...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`relative p-8 rounded-[2.8rem] cursor-pointer transition-all duration-700 border group shadow-lg ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'hover:bg-white/5 border-transparent hover:border-white/5'}`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-5 max-w-[80%]">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedMessage?.id === msg.id ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.5)]' : 'bg-zinc-800'}`}></div>
                      <p className={`text-[15px] font-black truncate tracking-tight uppercase ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-600'}`}>
                        {msg.from.split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-700 font-bold bg-black/40 px-2 py-1 rounded-lg italic">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-[13px] truncate font-bold transition-colors ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-700'} italic`}>
                    {msg.subject || '(Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL 3: RIGHT (Pembaca Transmisi) */}
        <main className="flex-grow flex flex-col bg-black/30 overflow-hidden relative italic">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="p-12 md:p-16 border-b border-white/5 bg-zinc-950/60 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 blur-[40px] opacity-30"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-black rounded-[2.5rem] flex items-center justify-center font-black text-white text-5xl shadow-2xl border border-white/10 italic">
                      {selectedMessage.from[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="max-w-2xl text-left">
                    <h3 className="text-4xl md:text-5xl font-black text-white leading-none mb-6 tracking-tighter uppercase italic drop-shadow-2xl leading-none">
                      {selectedMessage.subject || '(Tanpa Subjek)'}
                    </h3>
                    <div className="flex items-center gap-5">
                      <span className="text-[11px] text-zinc-700 font-black uppercase tracking-widest italic">Asal:</span>
                      <span className="text-[13px] text-indigo-400 font-bold font-mono px-5 py-2 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 shadow-inner">
                        {selectedMessage.from}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-8 bg-[#0a0a0a] hover:bg-red-500/5 border-2 border-white/5 hover:border-red-500/40 rounded-[3.5rem] text-zinc-800 hover:text-red-500 transition-all duration-1000"
                  >
                    <Trash2 className="w-8 h-8" />
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-12 md:p-20 custom-scrollbar bg-black/80 shadow-inner">
                <div className="max-w-4xl mx-auto">
                  <div className="relative p-16 bg-[#0a0a0a] rounded-[4.5rem] border-2 border-white/5 min-h-[500px] shadow-2xl text-left">
                    <div className="text-zinc-400 leading-[2.2] text-xl whitespace-pre-wrap font-medium selection:bg-indigo-500/40 tracking-tight italic">
                      {selectedMessage.body}
                    </div>
                  </div>
                  
                  <div className="mt-20 flex flex-col items-center opacity-20">
                    <div className="w-40 h-1.5 bg-zinc-900 rounded-full mb-12"></div>
                    <div className="flex items-center gap-6 px-16 py-6 bg-black border border-white/5 rounded-full text-[12px] text-zinc-700 font-black uppercase tracking-[0.5em] italic">
                       <div className="w-3 h-3 bg-indigo-800 rounded-full animate-pulse shadow-[0_0_20px_rgba(67,56,202,1)]"></div>
                       Siklus Penghancuran Otomatis Aktif
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-24 text-center animate-in fade-in duration-[2000ms]">
              <div className="relative mb-20 group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[150px] rounded-full group-hover:bg-indigo-500/10 transition duration-[3000ms]"></div>
                <div className="relative w-64 h-64 bg-[#080808] border-2 border-white/5 rounded-[6rem] flex items-center justify-center shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent"></div>
                   <Inbox className="w-24 h-24 text-zinc-950 opacity-40 group-hover:text-indigo-400 group-hover:opacity-100 transition-all duration-[2000ms]" />
                </div>
              </div>
              <h3 className="text-6xl font-black text-[#111] mb-8 tracking-[0.4em] uppercase leading-none italic opacity-90 drop-shadow-sm">
                 {connectionStatus === 'offline' ? 'BRIDGE DOWN' : 'STANDBY'}
              </h3>
              <p className="text-[13px] max-w-sm text-zinc-900 leading-relaxed font-black uppercase tracking-[0.6em] italic opacity-20 leading-[2.5]">
                {connectionStatus === 'offline' ? 'Kegagalan dekripsi. Node tidak dapat dijangkau.' : 'Menunggu transmisi data terenkripsi masuk.'}
              </p>
            </div>
          )}

          {/* HUD Status Sistem Bawah */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-16 px-20 py-6 bg-black/95 backdrop-blur-3xl rounded-[4rem] border-2 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)]">
            <div className={`flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.4em] ${connectionStatus === 'offline' ? 'text-red-900' : 'text-indigo-900'} shadow-indigo-500/20 italic`}>
               <ShieldCheck className="w-6 h-6" />
               Akses Terlindungi
            </div>
            <div className="w-px h-10 bg-zinc-900"></div>
            <div className="flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.4em] text-zinc-900 italic">
               <Activity className="w-6 h-6 text-indigo-500/10" />
               Node: {MY_DOMAIN}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.01); border-radius: 50px; }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.05); opacity: 0.1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }

        body {
          background-color: #030303 !important;
          display: grid;
          place-items: center;
          min-height: 100vh;
          margin: 0;
          overflow: hidden;
          cursor: crosshair;
        }
      `}</style>
    </div>
  );
}
