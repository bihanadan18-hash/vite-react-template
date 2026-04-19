import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Search, AlertTriangle, Activity,
  Copy, Check
} from 'lucide-react';

/**
 * KONFIGURASI SISTEM UTAMA
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

  // Fungsi Verifikasi Integritas Protokol (Handshake)
  const checkApiHealth = useCallback(async () => {
    try {
      const baseUrl = WORKER_URL.replace(/\/$/, ""); 
      const response = await fetch(baseUrl, { 
        method: 'GET', 
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit'
      });
      if (response.ok) {
        setConnectionStatus('online');
        setConnectionError(null);
      } else {
        throw new Error(`Node Response: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Kesalahan Diagnostik:", err);
      setConnectionStatus('offline');
      setConnectionError("Handshake Gagal: Koneksi ditolak oleh protokol keamanan browser atau server.");
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
      const targetUrl = `${baseUrl}/messages?email=${encodeURIComponent(email)}&_t=${Date.now()}`;
      
      const response = await fetch(targetUrl, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // Deteksi khusus jika limit Cloudflare KV tercapai
        if (errorText.includes("limit exceeded") || response.status === 500) {
          throw new Error("Batas Harian Tercapai (Kuota Cloudflare Habis)");
        }
        throw new Error(`Gagal Ambil Paket: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMessages(data);
        setConnectionStatus('online');
        setConnectionError(null);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Kegagalan Sinkronisasi:", err.message);
        // Tampilkan pesan error spesifik jika limit tercapai
        if (err.message.includes("Batas Harian")) {
          setConnectionStatus('offline');
          setConnectionError("Batas Akses Terlampaui: Server Cloudflare (KV) telah mencapai limit harian. Mohon tunggu beberapa saat atau gunakan akun Cloudflare lain.");
        } else if (manual) {
           setConnectionStatus('offline');
           setConnectionError(`Sinkronisasi Gagal: ${err.message}`);
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
    // Diperlambat menjadi 30 detik untuk menghemat operasi KV Cloudflare
    const interval = setInterval(() => fetchMessages(), 30000); 
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
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-0 md:p-8 lg:p-16 overflow-hidden">
      
      {/* Efek Pencahayaan Latar Belakang */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-15%] w-[70%] h-[70%] bg-indigo-600/5 blur-[180px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-600/5 blur-[180px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Kontainer Aplikasi Profesional */}
      <div 
        style={{ placeSelf: 'center' }} 
        className="relative w-full h-full md:h-[90vh] max-w-[1500px] flex flex-col md:flex-row bg-[#080808]/95 backdrop-blur-3xl border border-white/5 rounded-none md:rounded-[4rem] shadow-[0_60px_150px_rgba(0,0,0,1)] overflow-hidden transition-all duration-1000"
      >
        
        {/* PANEL 1: NAVIGASI (Otoritas Identitas) */}
        <aside className="w-full md:w-88 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/40">
          <div className="p-12 pb-8">
            <div className="flex items-center gap-5 mb-16 group cursor-default">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative p-5 bg-gradient-to-br from-zinc-800 to-black rounded-[1.4rem] border border-white/10 shadow-2xl transition-all duration-700 group-hover:scale-110">
                  <ShieldCheck className="w-10 h-10 text-indigo-500" />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <h1 className="text-3xl font-black text-white tracking-tighter italic leading-none uppercase">PrivateMail</h1>
                <span className="text-[11px] text-zinc-700 font-bold tracking-[0.5em] uppercase mt-3 italic">Alpha Node Secured</span>
              </div>
            </div>

            <div className="space-y-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-zinc-600/20 rounded-[2.8rem] blur-lg opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative p-8 bg-[#0d0d0d] border border-white/10 rounded-[3rem] shadow-inner text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]'}`}></div>
                    <span className="text-[12px] text-zinc-600 font-black tracking-widest uppercase italic">
                      {connectionStatus === 'online' ? 'Sinyal Terhubung' : 'Sinyal Terputus'}
                    </span>
                  </div>
                  <div className="bg-black/60 p-5 rounded-2xl border border-white/5 shadow-inner mb-6">
                     <span className="text-base font-mono text-indigo-300 truncate font-black tracking-tight block italic leading-none">
                        {loading ? 'Mengolah Hash...' : email}
                      </span>
                  </div>
                  <button 
                    onClick={copyToClipboard} 
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] active:scale-95"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-indigo-500" />}
                    {copied ? 'BERHASIL SALIN' : 'SALIN IDENTITAS'}
                  </button>
                </div>
              </div>

              <button 
                onClick={generateRandomEmail}
                disabled={loading}
                className="w-full py-6 bg-white hover:bg-zinc-200 text-black rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-5 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] uppercase italic tracking-widest"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Rotasi Identitas
              </button>
            </div>
          </div>

          <nav className="flex-grow px-8 mt-16 space-y-4 text-left">
            <div className="flex items-center justify-between px-10 py-6 bg-indigo-600/10 text-indigo-400 rounded-[2.2rem] font-black text-[13px] uppercase tracking-widest border border-indigo-600/20 cursor-pointer shadow-xl">
              <div className="flex items-center gap-6 italic">
                <Inbox className="w-6 h-6" /> Kotak Masuk
              </div>
              <span className="bg-indigo-500 text-white px-4 py-1 rounded-2xl text-[12px] font-black shadow-inner">{messages.length}</span>
            </div>
          </nav>

          <div className="p-12 mt-auto">
            <div className="p-8 bg-black/50 rounded-[3.2rem] border border-white/5 flex flex-col items-center gap-4 shadow-inner text-center">
              <Activity className="w-7 h-7 text-indigo-500/40" />
              <div className="overflow-hidden w-full">
                <p className="text-[12px] text-zinc-700 font-black uppercase tracking-widest mb-1">Integritas Protokol</p>
                <p className="text-[14px] text-zinc-400 font-mono uppercase font-black tracking-tighter italic leading-none truncate">
                  {connectionStatus === 'online' ? 'Terverifikasi' : 'Gagal Handshake'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL 2: TENGAH (Daftar Transmisi) */}
        <section className="w-full md:w-[450px] lg:w-[500px] flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md">
          <div className="p-14 pb-12 border-b border-white/5">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase drop-shadow-2xl">Transmisi</h2>
              <button 
                onClick={() => fetchMessages(true)} 
                className={`p-4 bg-[#0a0a0a] border border-white/10 hover:border-indigo-500/60 rounded-2xl transition-all shadow-3xl ${fetching ? 'text-indigo-400' : 'text-zinc-700 hover:text-white'}`}
              >
                <RefreshCw className={`w-6 h-6 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {connectionError && (
              <div className="mb-10 p-8 bg-red-500/10 border border-red-500/20 rounded-[3rem] flex items-start gap-6 text-red-500 animate-in zoom-in duration-1000 shadow-2xl backdrop-blur-xl">
                <AlertTriangle className="w-8 h-8 shrink-0 mt-1.5 shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
                <div className="text-[11px] leading-relaxed font-bold italic text-left">
                   {connectionError}
                </div>
              </div>
            )}

            <div className="relative group">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-800 group-focus-within:text-indigo-500 transition-all duration-500" />
              <input 
                type="text" 
                placeholder="Pindai transmisi..." 
                className="w-full bg-black/60 border border-white/5 rounded-[2.5rem] py-6 pl-18 pr-8 text-sm focus:outline-none focus:border-indigo-500/60 transition-all placeholder:text-zinc-900 font-black uppercase tracking-widest shadow-inner"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar bg-zinc-950/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30 italic">
                <div className="w-32 h-32 bg-[#0c0c0c] rounded-full flex items-center justify-center mb-12 border border-dashed border-zinc-800 shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                  <Mail className="w-16 h-16 text-zinc-800" />
                </div>
                <p className="text-[15px] font-black uppercase tracking-[0.6em] text-zinc-800 italic leading-none">Saluran Kosong</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`relative p-8 rounded-[3.5rem] cursor-pointer transition-all duration-1000 border group shadow-2xl ${selectedMessage?.id === msg.id ? 'bg-indigo-600/10 border-indigo-600/40 ring-1 ring-indigo-500/10' : 'hover:bg-white/5 border-transparent hover:border-white/5'}`}
                >
                  <div className="flex justify-between items-start mb-6 uppercase">
                    <div className="flex items-center gap-6 max-w-[80%] text-left">
                      <div className={`w-3.5 h-3.5 rounded-full ${selectedMessage?.id === msg.id ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,1)]' : 'bg-zinc-900'}`}></div>
                      <p className={`text-[17px] font-black truncate tracking-tighter ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-700'}`}>
                        {msg.from.split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-700 font-bold bg-black/40 px-2 py-1 rounded-lg italic">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-base truncate font-bold transition-colors duration-700 italic leading-none text-left ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-800'}`}>
                    {msg.subject || '(Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL 3: KANAN (Visualisasi Data) */}
        <main className="flex-grow flex flex-col bg-black/40 overflow-hidden relative italic">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-12 duration-1000 text-left">
              {/* Header Pembaca */}
              <div className="p-16 md:p-20 border-b border-white/5 bg-zinc-950/80 flex items-center justify-between backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-14 text-left">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 blur-[60px] opacity-40"></div>
                    <div className="relative w-28 h-28 bg-gradient-to-br from-indigo-500 to-black rounded-[3.5rem] flex items-center justify-center font-black text-white text-6xl shadow-[0_30px_80px_rgba(99,102,241,0.4)] border border-white/10 italic">
                      {selectedMessage.from[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="max-w-3xl text-left">
                    <h3 className="text-5xl md:text-6xl font-black text-white leading-none mb-8 tracking-tighter uppercase italic drop-shadow-2xl">
                      {selectedMessage.subject || '(Tanpa Subjek)'}
                    </h3>
                    <div className="flex items-center gap-8">
                      <span className="text-[13px] text-zinc-800 font-black uppercase tracking-[0.4em] italic">Origin:</span>
                      <span className="text-[15px] text-indigo-400 font-bold font-mono px-7 py-3 bg-indigo-500/5 rounded-[1.8rem] border border-indigo-500/10 shadow-inner">
                        {selectedMessage.from}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="p-12 bg-[#080808] hover:bg-red-500/5 border border-white/5 hover:border-red-500/50 rounded-[4.5rem] text-zinc-900 hover:text-red-500 transition-all duration-1000 shadow-3xl"
                >
                  <Trash2 className="w-10 h-10" />
                </button>
              </div>

              {/* Isi Pesan */}
              <div className="flex-grow overflow-y-auto p-16 md:p-24 custom-scrollbar bg-black/90 shadow-[inset_0_0_150px_rgba(0,0,0,1)] text-left">
                <div className="max-w-5xl mx-auto text-left">
                  <div className="relative p-20 bg-[#0a0a0a] rounded-[6rem] border border-white/5 min-h-[500px] shadow-2xl text-left border-2">
                    <div className="text-zinc-400 leading-[2.4] text-2xl whitespace-pre-wrap font-medium selection:bg-indigo-500/40 tracking-tight italic text-left">
                      {selectedMessage.body}
                    </div>
                  </div>
                  
                  <div className="mt-32 flex flex-col items-center opacity-10">
                    <div className="w-60 h-2 bg-zinc-950 rounded-full mb-16"></div>
                    <div className="flex items-center gap-8 px-20 py-8 bg-black border border-white/5 rounded-full text-[14px] text-zinc-800 font-black uppercase tracking-[0.8em] italic border-2 text-center justify-center">
                       <div className="w-4 h-4 bg-indigo-900 rounded-full animate-pulse shadow-[0_0_30px_rgba(67,56,202,1)]"></div>
                       Sistem Penghancuran Otomatis Teraktifkan
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-24 text-center animate-in fade-in duration-[2000ms]">
              <div className="relative mb-24 group text-center">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[150px] rounded-full group-hover:bg-indigo-500/10 transition duration-[3000ms]"></div>
                <div className="relative w-64 h-64 bg-[#080808] border-2 border-white/5 rounded-[6rem] flex items-center justify-center shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden mx-auto">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent"></div>
                   <Inbox className="w-32 h-32 text-zinc-950 opacity-30 group-hover:text-indigo-400 group-hover:opacity-100 transition-all duration-[2000ms]" />
                </div>
              </div>
              <h3 className="text-8xl font-black text-[#111] mb-10 tracking-[0.4em] uppercase leading-none italic opacity-95 shadow-sm">
                 {connectionStatus === 'offline' ? 'BRIDGE DOWN' : 'STANDBY'}
              </h3>
              <p className="text-[16px] max-w-md text-zinc-900 leading-relaxed font-black uppercase tracking-[0.6em] italic opacity-20 leading-[2.5] text-center mx-auto uppercase">
                {connectionStatus === 'offline' ? 'Node backend tidak merespons. Periksa koneksi terenkripsi Anda.' : 'Menunggu masuknya paket data terenkripsi.'}
              </p>
            </div>
          )}

          {/* HUD Status Footer */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-24 px-28 py-8 bg-black/95 backdrop-blur-3xl rounded-[5rem] border-2 border-white/10 shadow-[0_80px_150px_rgba(0,0,0,1)] italic">
            <div className={`flex items-center gap-8 text-[14px] font-black uppercase tracking-[0.6em] ${connectionStatus === 'offline' ? 'text-red-900' : 'text-indigo-900'} shadow-indigo-500/20 italic`}>
               <ShieldCheck className="w-8 h-8" />
               {connectionStatus === 'offline' ? 'Sistem Terblokir' : 'Akses Terenkripsi'}
            </div>
            <div className="w-px h-12 bg-zinc-950 opacity-50"></div>
            <div className="flex items-center gap-8 text-[14px] font-black uppercase tracking-[0.6em] text-zinc-900 italic">
               <Activity className="w-8 h-8 text-indigo-500/10" />
               Node: {MY_DOMAIN}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.01); border-radius: 100px; }
        
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
