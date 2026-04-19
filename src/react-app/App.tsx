import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Search, AlertTriangle, Activity,
  Copy, Check, Terminal, ExternalLink,
  ChevronRight, ArrowLeft
} from 'lucide-react';

/**
 * FRONTEND PRIVATE MAIL v4.6 PRO (Visual Excellence)
 * Fokus: Tampilan Ramping, Profesional, & Pembersihan Konten
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
   * FUNGSI PEMBERSIH KONTEN (Anti-MIME/Raw Data)
   * Menghilangkan header teknis dan boundary agar isi email bersih
   */
  const formatBody = (rawBody: string) => {
    if (!rawBody) return "Pesan Kosong.";
    
    // 1. Hilangkan header MIME jika bocor ke database
    let clean = rawBody.replace(/(Content-Type|Content-Transfer-Encoding|charset|boundary)=.*?\r?\n/gi, '');
    
    // 2. Hilangkan boundary markers (garis-garis acak seperti --000000000...)
    clean = clean.replace(/--[a-f0-9]{10,}/gi, '');
    
    // 3. Bersihkan spasi berlebih
    clean = clean.trim();

    return clean || "Pesan Terenkripsi atau Tanpa Konten Teks.";
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
      setConnectionError("Gagal Handshake: Protokol keamanan memblokir akses node.");
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
      const targetUrl = `${baseUrl}/messages?email=${encodeURIComponent(cleanEmail)}&_v=${Date.now()}`;
      
      const response = await fetch(targetUrl, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });
      
      const rawText = await response.text();
      
      if (!response.ok) {
        let info = `HTTP ${response.status}`;
        try {
          const data = JSON.parse(rawText);
          info = data.error || info;
        } catch (e) {
          if (rawText.includes("limit")) info = "Kuota API Cloudflare Habis";
        }
        throw new Error(info);
      }
      
      const data = JSON.parse(rawText);
      if (Array.isArray(data)) {
        setMessages(data);
        setConnectionStatus('online');
        setConnectionError(null);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (manual) {
           setConnectionStatus('offline');
           setConnectionError(err.message === "DB not bound" ? "Kesalahan: Database D1 belum terhubung." : err.message);
        }
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
    <div className="min-h-screen w-full bg-[#050505] text-zinc-400 font-sans grid place-items-center p-0 md:p-6 lg:p-10 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full h-full md:h-[92vh] max-w-[1440px] flex flex-col md:flex-row bg-[#0a0a0a] border border-white/[0.03] rounded-none md:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000">
        
        {/* SIDEBAR: IDENTITAS */}
        <aside className="w-full md:w-72 lg:w-80 flex flex-col border-b md:border-b-0 md:border-r border-white/[0.03] bg-black/40 p-8 lg:p-10 text-left shrink-0">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-xl border border-white/10 shadow-lg shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-lg font-black text-white tracking-tight uppercase leading-none italic">PrivateMail</h1>
              <span className="text-[9px] text-zinc-600 font-bold tracking-[0.3em] uppercase mt-1.5 italic">v4.6 Pro Node</span>
            </div>
          </div>

          <div className="space-y-8 flex-grow">
            <div className="p-6 bg-zinc-900/30 border border-white/[0.03] rounded-3xl shadow-inner group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest italic">Sistem Aktif</span>
                </div>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-4 overflow-hidden text-center group-hover:border-indigo-500/30 transition-colors">
                 <p className="text-xs font-mono text-indigo-300 truncate font-bold">{loading ? '...' : email}</p>
              </div>
              <button onClick={copyToClipboard} className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest active:scale-95">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
                {copied ? 'Berhasil' : 'Salin Alamat'}
              </button>
            </div>

            <button onClick={generateRandomEmail} disabled={loading} className="w-full py-4.5 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg uppercase tracking-widest italic">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Ganti Identitas
            </button>

            <nav className="mt-12">
              <div className="flex items-center justify-between px-6 py-4 bg-indigo-500/5 text-indigo-400 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-indigo-500/10 transition-all cursor-default">
                <div className="flex items-center gap-4 italic"><Inbox className="w-5 h-5" /> Masuk</div>
                <span className="bg-indigo-500 text-white px-2 py-0.5 rounded-lg text-[9px]">{messages.length}</span>
              </div>
            </nav>
          </div>

          <div className="mt-auto pt-10">
            <button onClick={() => setShowTerminal(!showTerminal)} className="w-full p-6 bg-zinc-900/20 rounded-[2rem] border border-white/[0.03] flex flex-col items-center gap-3 text-center transition-all hover:bg-white/5 hover:border-white/10">
              <Activity className="w-6 h-6 text-zinc-800" />
              <div className="overflow-hidden w-full text-center">
                <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest mb-1">Status Node</p>
                <p className="text-[12px] text-zinc-500 font-mono font-bold italic truncate">Operasional 100%</p>
              </div>
            </button>
          </div>
        </aside>

        {/* PANEL 2: TRANSMISI (Inbox List) */}
        <section className={`w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-white/[0.03] bg-black/20 backdrop-blur-md transition-all ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-8 lg:p-10 border-b border-white/[0.03] text-left">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Transmisi</h2>
              <div className="flex items-center gap-3">
                {fetching && <span className="text-[8px] font-black text-indigo-500 animate-pulse uppercase tracking-widest">Scanning...</span>}
                <button onClick={() => fetchMessages(true)} className={`p-2.5 bg-zinc-900 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all ${fetching ? 'text-indigo-500' : 'text-zinc-600'}`}>
                  <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="relative text-left">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700" />
              <input type="text" placeholder="Pindai data..." className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-5 text-[11px] focus:outline-none focus:border-indigo-500/30 font-bold uppercase tracking-widest transition-all placeholder:text-zinc-800" />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 lg:p-6 space-y-2 custom-scrollbar bg-zinc-950/10">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-10 opacity-20 italic">
                <Mail className="w-10 h-10 text-zinc-800 mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center">Menunggu Sinyal...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => setSelectedMessage(msg)} 
                  className={`relative p-5 rounded-[1.8rem] cursor-pointer transition-all duration-300 border group ${selectedMessage?.id === msg.id ? 'bg-indigo-500/[0.07] border-indigo-500/30' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-3 max-w-[75%] text-left">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedMessage?.id === msg.id ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)]' : 'bg-zinc-800'}`}></div>
                      <p className={`text-[13px] font-bold truncate uppercase tracking-tight ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-500'}`}>
                        {(msg.sender || "Unknown").split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[9px] text-zinc-700 font-black italic">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate font-semibold italic transition-colors text-left ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                    {msg.subject || '(Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL 3: READER (Message Viewer) */}
        <main className="flex-grow flex flex-col bg-black/60 overflow-hidden relative text-left italic">
          {showTerminal ? (
            <div className="flex flex-col h-full bg-[#050505] p-10 lg:p-16 animate-in slide-in-from-right-8 duration-700 text-left">
               <div className="flex items-center gap-6 mb-12 border-b border-indigo-500/20 pb-8 text-left">
                 <Terminal className="w-8 h-8 text-indigo-500" />
                 <h3 className="text-3xl font-black text-white uppercase italic text-left leading-none">Terminal Sistem</h3>
               </div>
               <div className="flex-grow space-y-6 overflow-y-auto custom-scrollbar font-mono text-xs text-zinc-500 leading-relaxed text-left">
                 <div className="p-6 bg-zinc-900/30 rounded-2xl border border-white/5 text-left">
                   <p className="text-indigo-400 font-black mb-3 uppercase tracking-widest">[OK] INFRASTRUKTUR:</p>
                   <p className="text-left italic">Database D1 aktif. Catch-all domain root berfungsi sempurna.</p>
                 </div>
                 <div className="p-6 bg-zinc-900/30 rounded-2xl border border-white/5 text-left">
                   <p className="text-indigo-400 font-black mb-3 uppercase tracking-widest">[OK] PROTOKOL PEMBERSIH:</p>
                   <p className="text-left italic">Pembersih MIME v4.6 aktif untuk menghapus header teknis email otomatis.</p>
                 </div>
               </div>
               <button onClick={() => setShowTerminal(false)} className="mt-8 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all text-[11px]">Keluar Terminal</button>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in duration-500 text-left">
              {/* Message Header */}
              <div className="p-10 lg:p-14 border-b border-white/[0.03] bg-zinc-950/40 flex items-center justify-between backdrop-blur-3xl shadow-xl">
                <div className="flex items-center gap-8 text-left">
                  <button onClick={() => setSelectedMessage(null)} className="lg:hidden p-3 bg-zinc-900 rounded-full mr-2"><ArrowLeft className="w-5 h-5 text-zinc-400" /></button>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-900 rounded-[1.8rem] flex items-center justify-center font-black text-white text-3xl shadow-xl border border-white/10 shrink-0">
                    {(selectedMessage.sender || "?")[0].toUpperCase()}
                  </div>
                  <div className="max-w-xl md:max-w-2xl lg:max-w-3xl">
                    <h3 className="text-2xl lg:text-3xl font-black text-white mb-3 uppercase italic tracking-tight leading-tight">
                      {selectedMessage.subject || '(Tanpa Subjek)'}
                    </h3>
                    <div className="flex items-center gap-4 flex-wrap text-left">
                      <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Origin Node:</span>
                      <span className="text-[12px] text-indigo-400 font-mono font-bold px-4 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-inner">
                        {selectedMessage.sender}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-8 bg-zinc-900/30 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-full text-zinc-800 hover:text-red-500 transition-all active:scale-95 shrink-0 ml-4">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              {/* Message Body Content */}
              <div className="flex-grow overflow-y-auto p-10 lg:p-20 custom-scrollbar bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
                <div className="max-w-4xl mx-auto">
                  <div className="relative p-12 lg:p-16 bg-[#080808] rounded-[3.5rem] border border-white/[0.03] shadow-2xl min-h-[400px]">
                    <div className="text-zinc-400 leading-[2.2] text-lg font-medium tracking-normal text-left whitespace-pre-wrap italic">
                      {formatBody(selectedMessage.body)}
                    </div>
                  </div>
                  
                  <div className="mt-20 flex flex-col items-center opacity-10">
                    <div className="w-40 h-1 bg-zinc-900 rounded-full mb-10"></div>
                    <div className="flex items-center gap-6 px-12 py-5 bg-black border border-white/5 rounded-full text-[11px] text-zinc-700 font-black uppercase tracking-[0.4em]">
                       <div className="w-2.5 h-2.5 bg-indigo-950 rounded-full animate-pulse"></div>
                       Hancurkan Setelah Selesai
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 lg:p-24 text-center animate-in fade-in duration-1000">
              <div className="relative mb-16 group mx-auto">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-3000"></div>
                <div className="relative w-56 h-56 lg:w-64 lg:h-64 bg-[#080808] border border-white/[0.02] rounded-[5rem] flex items-center justify-center shadow-2xl overflow-hidden transform group-hover:scale-105 transition-transform duration-2000 mx-auto">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent"></div>
                   <Inbox className="w-20 h-20 lg:w-24 lg:h-24 text-zinc-950 opacity-40 group-hover:text-indigo-400 group-hover:opacity-100 transition-all duration-1000" />
                </div>
              </div>
              <h3 className="text-6xl font-black text-[#151515] mb-6 tracking-[0.4em] uppercase leading-none italic opacity-95 text-center">SIAGA</h3>
              <p className="text-[14px] max-w-sm text-zinc-900 leading-relaxed font-black uppercase tracking-[0.5em] italic opacity-20 mx-auto text-center leading-[2.5]">
                Menunggu transmisi paket data terenkripsi masuk melalui protokol secured.
              </p>
            </div>
          )}

          {/* SYSTEM HUD FOOTER */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-16 px-20 py-5 bg-black/95 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,1)] italic font-black uppercase text-[11px] tracking-[0.4em]">
            <div className={`flex items-center gap-6 ${connectionStatus === 'offline' ? 'text-red-950 shadow-red-500/10' : 'text-indigo-950'}`}>
               <ShieldCheck className="w-6 h-6" /> Akses Terenkripsi
            </div>
            <div className="w-px h-8 bg-zinc-900 opacity-50"></div>
            <div className="text-zinc-900 italic leading-none">Node: {MY_DOMAIN}</div>
          </div>
        </main>
      </div>

      <style>{`
        body { background-color: #050505 !important; display: grid; place-items: center; min-height: 100vh; margin: 0; cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.01); border-radius: 100px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.05); }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.05; } 50% { transform: scale(1.05); opacity: 0.08; } }
        .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
