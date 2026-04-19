import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Search, AlertTriangle, Activity,
  Copy, Check
} from 'lucide-react';

/**
 * KONFIGURASI SISTEM UTAMA
 * Versi 3.0 - Dioptimalkan untuk Cloudflare D1 SQL
 */
const WORKER_URL = "https://temp-mail-backend.bihanadan18.workers.dev"; 
const MY_DOMAIN = "mail.rekenbutler.com"; 

interface EmailMessage {
  id: string;
  sender: string;    // Mengikuti kolom 'sender' di database D1
  recipient: string; // Mengikuti kolom 'recipient' di database D1
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

  // Verifikasi Integritas Jaringan (Handshake)
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
      }
    } catch (err: any) {
      setConnectionStatus('offline');
      setConnectionError("Gagal Handshake: Protokol keamanan atau CORS memutus koneksi.");
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

  const fetchMessages = useCallback(async (manual = false) => {
    if (!email || email === '') return;
    if (manual) setFetching(true);
    
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
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
        setConnectionStatus('online');
        setConnectionError(null);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Sinkronisasi Gagal:", err.message);
        if (manual) {
           setConnectionStatus('offline');
           setConnectionError(`Gagal Sinkronisasi: ${err.message}`);
        }
      }
    } finally {
      if (manual) setFetching(false);
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
    const interval = setInterval(() => fetchMessages(), 15000); 
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
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans grid place-items-center p-0 md:p-10 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Efek Visual Latar Belakang */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/5 blur-[180px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] bg-purple-600/5 blur-[180px] rounded-full animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Kontainer Utama Dashboard */}
      <div 
        style={{ placeSelf: 'center' }} 
        className="relative w-full h-full md:h-[90vh] max-w-[1550px] flex flex-col md:flex-row bg-[#080808]/95 backdrop-blur-3xl border border-white/5 rounded-none md:rounded-[4.5rem] shadow-[0_60px_150px_rgba(0,0,0,1)] overflow-hidden transition-all duration-700"
      >
        
        {/* PANEL 1: NAVIGASI (Modul Identitas) */}
        <aside className="w-full md:w-88 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/50">
          <div className="p-12 pb-8">
            <div className="flex items-center gap-6 mb-16 group cursor-default">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 blur-3xl opacity-0 group-hover:opacity-100 transition duration-1500"></div>
                <div className="relative p-5 bg-gradient-to-br from-indigo-500 via-indigo-900 to-black rounded-[1.6rem] shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-700">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <h1 className="text-3xl font-black text-white tracking-tighter italic leading-none uppercase">PrivateMail</h1>
                <span className="text-[12px] text-zinc-700 font-bold tracking-[0.5em] uppercase mt-3 italic">Node Alpha v3.0</span>
              </div>
            </div>

            <div className="space-y-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative p-8 bg-[#0b0b0b] border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]'}`}></div>
                      <span className="text-[12px] text-zinc-600 uppercase font-black tracking-[0.3em]">
                        {connectionStatus === 'online' ? 'Protokol Aktif' : 'Protokol Mati'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <div className="bg-black/60 p-5 rounded-2xl border border-white/5 shadow-inner">
                       <span className="text-base font-mono text-indigo-300 truncate font-black tracking-tight block text-center italic leading-none">
                        {loading ? 'Mengolah Hash...' : email}
                      </span>
                    </div>
                    <button 
                      onClick={copyToClipboard} 
                      className="w-full py-5 bg-white/5 hover:bg-indigo-600/20 hover:text-indigo-300 text-zinc-500 rounded-[1.2rem] transition-all border border-white/5 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] active:scale-95"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-indigo-500" />}
                      {copied ? 'BERHASIL DISALIN' : 'SALIN IDENTITAS'}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={generateRandomEmail}
                disabled={loading}
                className="w-full py-6 bg-white hover:bg-zinc-200 text-black rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-5 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.15)] italic uppercase"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Ganti Identitas
              </button>
            </div>
          </div>

          <nav className="flex-grow px-8 mt-16 space-y-4">
            <div className="flex items-center justify-between px-10 py-6 bg-indigo-600/10 text-indigo-400 rounded-[2.2rem] font-black text-[13px] uppercase tracking-widest border border-indigo-600/20 cursor-pointer shadow-xl">
              <div className="flex items-center gap-6 italic text-left">
                <Inbox className="w-6 h-6" /> Kotak Masuk
              </div>
              <span className="bg-indigo-500 text-white px-4 py-1 rounded-2xl text-[12px] font-black shadow-inner">{messages.length}</span>
            </div>
          </nav>

          <div className="p-12 mt-auto">
            <div className="p-8 bg-black/50 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4 shadow-inner text-center">
              <Activity className="w-7 h-7 text-indigo-500/40" />
              <div className="overflow-hidden w-full">
                <p className="text-[12px] text-zinc-800 font-black uppercase tracking-[0.4em] mb-2">Integritas Node</p>
                <p className="text-[13px] text-zinc-600 font-mono uppercase font-black tracking-widest italic leading-none truncate">
                   {connectionStatus === 'online' ? 'Optimal 100%' : 'Gagal Handshake'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL 2: TENGAH (Daftar Transmisi) */}
        <section className="w-full md:w-[450px] lg:w-[520px] flex flex-col border-r border-white/5 bg-black/30 backdrop-blur-md">
          <div className="p-14 pb-12 border-b border-white/5">
            <div className="flex items-center justify-between mb-14">
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase drop-shadow-2xl">Transmisi</h2>
              <button 
                onClick={() => fetchMessages(true)} 
                className={`p-4 bg-[#0a0a0a] border border-white/10 hover:border-indigo-500/60 rounded-2xl transition-all shadow-3xl ${fetching ? 'text-indigo-500' : 'text-zinc-700 hover:text-white'}`}
              >
                <RefreshCw className={`w-6 h-6 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {connectionError && (
              <div className="mb-10 p-8 bg-red-500/5 border border-red-500/20 rounded-[3rem] flex items-start gap-6 text-red-500 animate-in zoom-in duration-1000 shadow-[0_30px_60px_rgba(239,68,68,0.25)] backdrop-blur-xl">
                <AlertTriangle className="w-8 h-8 shrink-0 mt-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                <div className="text-[13px] leading-[1.8] text-left">
                  <p className="font-black uppercase tracking-[0.3em] mb-3 leading-none italic text-red-400 underline">Peringatan Keamanan</p>
                  <p className="opacity-70 font-bold italic">{connectionError}</p>
                </div>
              </div>
            )}

            <div className="relative group">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-800 group-focus-within:text-indigo-500 transition-all duration-500" />
              <input 
                type="text" 
                placeholder="Pindai transmisi data..." 
                className="w-full bg-black/60 border border-white/5 rounded-[2.2rem] py-5 pl-18 pr-8 text-xs focus:outline-none focus:border-indigo-500/60 focus:ring-[15px] focus:ring-indigo-500/5 transition-all placeholder:text-zinc-900 font-black uppercase tracking-[0.2em] shadow-inner"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-8 space-y-5 custom-scrollbar bg-zinc-950/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30 italic">
                <div className="w-32 h-32 bg-[#0c0c0c] rounded-full flex items-center justify-center mb-12 border border-dashed border-zinc-800 shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                  <Mail className="w-14 h-14 text-zinc-800" />
                </div>
                <p className="text-[14px] font-black uppercase tracking-[0.6em] text-zinc-800 italic leading-none">Saluran Kosong</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`relative p-8 rounded-[3.2rem] cursor-pointer transition-all duration-1000 border group shadow-3xl ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/50 ring-2 ring-indigo-500/10' : 'hover:bg-white/5 border-transparent hover:border-white/5'}`}
                >
                  <div className="flex justify-between items-start mb-6 uppercase">
                    <div className="flex items-center gap-6 max-w-[80%] text-left">
                      <div className={`w-3.5 h-3.5 rounded-full ${selectedMessage?.id === msg.id ? 'bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,1)]' : 'bg-zinc-900'}`}></div>
                      <p className={`text-[17px] font-black truncate tracking-tight uppercase ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-700'}`}>
                        {(msg.sender || "Unknown").split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[11px] text-zinc-800 font-black bg-black/90 px-4 py-2 rounded-2xl border border-white/5 uppercase tracking-tighter italic shadow-2xl">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-base truncate font-bold transition-colors duration-700 italic leading-none text-left ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-800'}`}>
                    {msg.subject || '(Protokol: Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL 3: KANAN (Dekripsi Aliran Data) */}
        <main className="flex-grow flex flex-col bg-black/40 overflow-hidden relative italic">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-16 duration-[1500ms] text-left">
              {/* Header Reader */}
              <div className="p-16 md:p-20 border-b border-white/5 bg-zinc-950/80 flex items-center justify-between backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-14 text-left">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 blur-[60px] opacity-40"></div>
                    <div className="relative w-28 h-28 bg-gradient-to-br from-indigo-500 via-indigo-950 to-black rounded-[3.5rem] flex items-center justify-center font-black text-white text-6xl shadow-[0_30px_80px_rgba(99,102,241,0.4)] border border-white/10 italic transform hover:scale-110 transition-transform duration-1000 cursor-default">
                      {(selectedMessage.sender || "?")[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="max-w-3xl text-left">
                    <h3 className="text-5xl md:text-6xl font-black text-white leading-tight mb-8 tracking-tighter uppercase italic drop-shadow-2xl leading-none">
                      {selectedMessage.subject || '(Protokol: Tanpa Data)'}
                    </h3>
                    <div className="flex items-center gap-7">
                      <span className="text-[13px] text-zinc-800 font-black uppercase tracking-[0.6em] italic">Asal:</span>
                      <span className="text-[15px] text-indigo-400 font-bold font-mono px-7 py-3 bg-indigo-500/5 rounded-[1.5rem] border border-indigo-500/10 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                        {selectedMessage.sender}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-10 bg-[#080808] hover:bg-red-500/5 border border-white/5 hover:border-red-500/50 rounded-[4rem] text-zinc-900 hover:text-red-500 transition-all duration-1500 shadow-3xl group border-2"
                  >
                    <Trash2 className="w-10 h-10 transform group-hover:rotate-[20deg] group-hover:scale-125 transition-all duration-700" />
                  </button>
                </div>
              </div>

              {/* Data Stream Body */}
              <div className="flex-grow overflow-y-auto p-16 md:p-24 custom-scrollbar bg-black/90 shadow-[inset_0_0_150px_rgba(0,0,0,1)] text-left">
                <div className="max-w-5xl mx-auto text-left">
                  <div className="relative p-20 bg-[#080808] rounded-[6rem] border border-white/5 min-h-[600px] shadow-[inset_0_0_120px_rgba(0,0,0,0.8)] border-2 text-left">
                    <div className="text-zinc-500 leading-[2.4] text-2xl whitespace-pre-wrap font-medium selection:bg-indigo-500/60 tracking-tight italic drop-shadow-sm text-left">
                      {selectedMessage.body}
                    </div>
                  </div>
                  
                  <div className="mt-32 flex flex-col items-center opacity-10">
                    <div className="w-60 h-2 bg-zinc-950 rounded-full mb-16"></div>
                    <div className="flex items-center gap-8 px-20 py-8 bg-black border border-white/5 rounded-full text-[14px] text-zinc-800 font-black uppercase tracking-[0.8em] italic border-2">
                       <div className="w-4 h-4 bg-indigo-900 rounded-full animate-pulse shadow-[0_0_30px_rgba(67,56,202,1)]"></div>
                       Siklus Penghancuran Otomatis Teraktifkan
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-24 text-center animate-in fade-in duration-[3000ms]">
              <div className="relative mb-24 group text-center">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[200px] rounded-full group-hover:bg-indigo-500/10 transition duration-[5000ms]"></div>
                <div className="relative w-80 h-80 bg-[#060606] border border-white/5 rounded-[8rem] flex items-center justify-center shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden transform group-hover:scale-[1.05] transition-transform duration-[3000ms] border-2 mx-auto">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent"></div>
                   <Inbox className="w-32 h-32 text-zinc-950 transition-all duration-[3000ms] group-hover:text-indigo-950 group-hover:drop-shadow-[0_0_50px_rgba(99,102,241,0.4)] opacity-30" />
                </div>
              </div>
              <h3 className="text-8xl font-black text-[#111] mb-10 tracking-[0.5em] uppercase leading-none italic opacity-95 drop-shadow-2xl">
                 {connectionStatus === 'offline' ? 'BRIDGE DOWN' : 'SIAGA'}
              </h3>
              <p className="text-[16px] max-w-lg text-zinc-900 leading-relaxed font-black uppercase tracking-[0.8em] italic opacity-20 leading-[2.5] text-center mx-auto uppercase">
                {connectionStatus === 'offline' ? 'Kegagalan Handshake: Node terputus atau API limit tercapai.' : 'Menunggu transmisi paket data terenkripsi masuk.'}
              </p>
            </div>
          )}

          {/* Persistent System Footer (HUD) */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-24 px-28 py-8 bg-black/95 backdrop-blur-3xl rounded-[5rem] border border-white/10 shadow-[0_80px_150px_rgba(0,0,0,1)] border-2 italic font-black uppercase text-[14px] tracking-[0.6em]">
            <div className={`${connectionStatus === 'offline' ? 'text-red-900' : 'text-indigo-900'} shadow-indigo-500/20 flex items-center gap-6`}>
               <ShieldCheck className="w-8 h-8" />
               Akses Terenkripsi
            </div>
            <div className="w-px h-12 bg-zinc-950"></div>
            <div className="text-zinc-900 italic">Node: {MY_DOMAIN}</div>
          </div>
        </main>
      </div>

      <style>{`
        body { background-color: #030303 !important; display: grid; place-items: center; min-height: 100vh; margin: 0; cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.01); border-radius: 100px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.02); }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.1); opacity: 0.1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 15s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: scaleY(1); opacity: 0.1; }
          50% { transform: scaleY(3); opacity: 1; }
        }
        .animate-wave {
          animation: wave 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
