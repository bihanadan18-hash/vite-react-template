import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Search, AlertTriangle, Activity,
  Copy, Check, Terminal
} from 'lucide-react';

/**
 * FRONTEND PRIVATE MAIL v4.5 PRO
 * SOLUSI: Menggunakan Root Domain untuk Catch-all (Tanpa mengganggu Blog)
 */
const WORKER_URL = "https://temp-mail-backend.bihanadan18.workers.dev"; 
const MY_DOMAIN = "rekenbutler.com"; // WAJIB ROOT AGAR CATCH-ALL AKTIF

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
      setConnectionError("Handshake Gagal: Node tidak merespons protokol keamanan.");
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
          if (rawText.includes("limit")) info = "Kuota Habis";
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
           setConnectionError(err.message === "DB not bound" ? "Konfigurasi Database D1 belum aktif." : err.message);
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
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans grid place-items-center p-4 md:p-10 overflow-hidden selection:bg-indigo-500/30 text-left">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-25%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/5 blur-[160px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-25%] right-[-10%] w-[70%] h-[70%] bg-purple-600/5 blur-[160px] rounded-full animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div style={{ placeSelf: 'center' }} className="relative w-full h-[90vh] max-w-[1550px] flex flex-col md:flex-row bg-[#080808]/95 backdrop-blur-3xl border border-white/5 rounded-[3rem] md:rounded-[4rem] shadow-[0_60px_150px_rgba(0,0,0,1)] overflow-hidden transition-all duration-1000 text-left">
        
        <aside className="w-full md:w-88 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/40 p-10 text-left">
          <div className="flex items-center gap-5 mb-16 text-left">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-black rounded-2xl border border-white/10 shadow-2xl shrink-0 text-left">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none text-left">PrivateMail</h1>
              <span className="text-[11px] text-zinc-700 font-bold tracking-[0.4em] uppercase mt-2 text-left italic leading-none">v4.5 Root Catch-all</span>
            </div>
          </div>

          <div className="space-y-10 flex-grow text-left">
            <div className="p-8 bg-[#0c0c0c] border border-white/5 rounded-[3rem] shadow-inner text-center">
              <div className="flex items-center justify-center gap-3 mb-6 text-center">
                <div className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                <span className="text-[12px] text-zinc-600 font-black uppercase tracking-widest italic leading-none text-center">
                  {connectionStatus === 'online' ? 'Sistem Aktif' : 'Terputus'}
                </span>
              </div>
              <div className="bg-black/60 p-5 rounded-2xl border border-white/5 mb-6 overflow-hidden shadow-inner text-center">
                 <p className="text-base font-mono text-indigo-300 truncate font-black tracking-tight text-center">{loading ? '...' : email}</p>
              </div>
              <button onClick={copyToClipboard} className="w-full py-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-indigo-500" />}
                {copied ? 'BERHASIL' : 'SALIN IDENTITAS'}
              </button>
            </div>

            <button onClick={generateRandomEmail} disabled={loading} className="w-full py-6 bg-white hover:bg-zinc-200 text-black rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-4 transition-all shadow-2xl uppercase italic tracking-widest active:scale-95">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Ganti Identitas
            </button>

            <nav className="mt-12 text-left">
              <div className="flex items-center justify-between px-10 py-6 bg-indigo-600/10 text-indigo-400 rounded-[2.5rem] font-black text-[13px] uppercase tracking-widest border border-indigo-600/20 shadow-xl text-left">
                <div className="flex items-center gap-6 italic text-left"><Inbox className="w-6 h-6" /> Masuk</div>
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-2xl text-[12px]">{messages.length}</span>
              </div>
            </nav>
          </div>

          <div className="mt-auto pt-10 text-left">
            <button onClick={() => setShowTerminal(!showTerminal)} className="w-full p-8 bg-black/50 rounded-[3.2rem] border border-white/5 flex flex-col items-center gap-4 shadow-inner text-center transition-all hover:bg-white/5">
              {showTerminal ? <Terminal className="w-8 h-8 text-indigo-500" /> : <Activity className="w-8 h-8 text-zinc-800" />}
              <div className="overflow-hidden w-full text-center">
                <p className="text-[12px] text-zinc-700 font-black uppercase tracking-widest mb-1 text-center">Diagnostik Node</p>
                <p className="text-[14px] text-zinc-400 font-mono font-bold italic truncate text-center leading-none text-center">
                   {connectionStatus === 'online' ? 'Optimal 100%' : 'Gagal Handshake'}
                </p>
              </div>
            </button>
          </div>
        </aside>

        <section className="w-full md:w-[450px] lg:w-[500px] flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md text-left">
          <div className="p-14 pb-12 border-b border-white/5 text-left">
            <div className="flex items-center justify-between mb-12 text-left">
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase text-left">Transmisi</h2>
              <button onClick={() => fetchMessages(true)} className={`p-4 bg-zinc-900 border border-white/5 hover:border-indigo-500/40 rounded-2xl transition-all ${fetching ? 'text-indigo-500' : 'text-zinc-600 hover:text-white'}`}>
                <RefreshCw className={`w-6 h-6 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {connectionError && (
              <div className="mb-10 p-8 bg-red-500/5 border border-red-500/20 rounded-[3rem] flex items-start gap-6 text-red-500 animate-in fade-in text-left">
                <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />
                <p className="text-[13px] font-bold italic leading-relaxed text-left">{connectionError}</p>
              </div>
            )}

            <div className="relative group text-left">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-800 group-focus-within:text-indigo-500 transition-all duration-500" />
              <input type="text" placeholder="Cari paket data..." className="w-full bg-black/60 border border-white/5 rounded-[2.2rem] py-5 pl-18 pr-8 text-sm focus:outline-none focus:border-indigo-500/40 font-bold uppercase tracking-widest shadow-inner transition-all text-left" />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-8 space-y-5 custom-scrollbar bg-zinc-950/20 text-left">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 opacity-20 italic text-center">
                <Mail className="w-16 h-16 text-zinc-800 mb-8 mx-auto" />
                <p className="text-[14px] font-black uppercase tracking-[0.5em] leading-none text-center">Menunggu Sinyal...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`relative p-8 rounded-[3.5rem] cursor-pointer transition-all duration-700 border group ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/40 shadow-2xl' : 'hover:bg-white/5 border-transparent'} text-left`}>
                  <div className="flex justify-between items-start mb-4 text-left">
                    <div className="flex items-center gap-5 max-w-[75%] text-left">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${selectedMessage?.id === msg.id ? 'bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]' : 'bg-zinc-800'}`}></div>
                      <p className={`text-base font-black truncate uppercase tracking-tight text-left ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-600'}`}>
                        {(msg.sender || "Anonim").split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[11px] text-zinc-800 font-black italic">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm truncate font-bold italic transition-colors text-left ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-800 group-hover:text-zinc-600'}`}>
                    {msg.subject || '(Tanpa Subjek)'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <main className="flex-grow flex flex-col bg-black/40 overflow-hidden relative text-left italic">
          {showTerminal ? (
            <div className="flex flex-col h-full bg-[#050505] p-20 animate-in slide-in-from-right-12 duration-1000 text-left">
               <div className="flex items-center gap-8 mb-16 border-b border-indigo-500/20 pb-10 text-left">
                 <Terminal className="w-12 h-12 text-indigo-500" />
                 <h3 className="text-5xl font-black text-white uppercase italic text-left">Pusat Diagnostik</h3>
               </div>
               <div className="flex-grow space-y-8 overflow-y-auto custom-scrollbar font-mono text-sm text-zinc-500 leading-relaxed text-left">
                 <div className="p-8 bg-zinc-950 rounded-3xl border border-white/5 text-left">
                   <p className="text-indigo-400 font-black mb-4 uppercase tracking-widest text-left">[1] SOLUSI TANPA SUBDOMAIN:</p>
                   <p className="text-left italic">Karena Cloudflare tidak mendukung Catch-all di subdomain, kita harus menggunakan <b>@{MY_DOMAIN}</b>.</p>
                 </div>
                 <div className="p-8 bg-zinc-950 rounded-3xl border border-white/5 text-left">
                   <p className="text-indigo-400 font-black mb-4 uppercase tracking-widest text-left">[2] VERIFIKASI ROUTING:</p>
                   <p className="text-left italic">Pastikan di menu <b>Email Routing</b>, "Catch-all" mengarah ke Worker dan berstatus <b>Active</b> untuk domain utama.</p>
                 </div>
               </div>
               <button onClick={() => setShowTerminal(false)} className="mt-10 px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Selesai</button>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in duration-1000 text-left">
              <div className="p-16 lg:p-24 border-b border-white/5 bg-zinc-950/60 flex items-center justify-between backdrop-blur-3xl shadow-2xl text-left">
                <div className="flex items-center gap-12 text-left">
                  <div className="relative w-28 h-28 bg-gradient-to-br from-indigo-500 to-black rounded-[3rem] flex items-center justify-center font-black text-white text-6xl shadow-2xl border border-white/10 shrink-0">
                    {(selectedMessage.sender || "?")[0].toUpperCase()}
                  </div>
                  <div className="max-w-4xl text-left">
                    <h3 className="text-5xl lg:text-6xl font-black text-white mb-8 uppercase italic tracking-tighter leading-tight drop-shadow-2xl text-left">
                      {selectedMessage.subject || '(Tanpa Subjek)'}
                    </h3>
                    <div className="flex items-center gap-8 flex-wrap text-left">
                      <span className="text-[13px] text-zinc-700 font-black uppercase tracking-widest text-left">Asal:</span>
                      <span className="text-[16px] text-indigo-400 font-mono font-bold px-7 py-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 shadow-inner">
                        {selectedMessage.sender}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-12 bg-zinc-900/50 hover:bg-red-500/5 border border-white/5 hover:border-red-500/40 rounded-full text-zinc-800 hover:text-red-500 transition-all active:scale-95 shadow-3xl">
                  <Trash2 className="w-12 h-12" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-16 lg:p-32 custom-scrollbar bg-black/80 shadow-[inset_0_0_150px_rgba(0,0,0,1)] text-left">
                <div className="max-w-5xl mx-auto text-left">
                  <div className="relative p-20 bg-[#0a0a0a] rounded-[6rem] border-2 border-white/5 shadow-2xl min-h-[550px] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] text-left">
                    <div className="text-zinc-500 leading-[2.6] text-2xl whitespace-pre-wrap font-medium tracking-tight text-left italic">
                      {selectedMessage.body}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-24 text-center animate-in fade-in duration-2000 text-center">
              <div className="relative mb-24 group mx-auto text-center">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[200px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-3000"></div>
                <div className="relative w-80 h-80 bg-[#080808] border-2 border-white/5 rounded-[8rem] flex items-center justify-center shadow-2xl overflow-hidden transform group-hover:scale-[1.05] transition-transform duration-1500 mx-auto">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent"></div>
                   <Inbox className="w-32 h-32 text-zinc-950 opacity-40 group-hover:text-indigo-400 group-hover:opacity-100 transition-all duration-2000" />
                </div>
              </div>
              <h3 className="text-8xl font-black text-[#131313] mb-10 tracking-[0.5em] uppercase leading-none italic opacity-95 text-center">SIAGA</h3>
              <p className="text-[16px] max-w-lg text-zinc-900 leading-relaxed font-black uppercase tracking-[0.6em] italic opacity-20 mx-auto text-center leading-[2.5]">
                Menunggu Paket Data Terenkripsi Masuk Melalui Protokol Secured.
              </p>
            </div>
          )}

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-24 px-32 py-8 bg-black/95 backdrop-blur-3xl rounded-[5rem] border-2 border-white/10 shadow-[0_80px_150px_rgba(0,0,0,1)] italic font-black uppercase text-[14px] tracking-[0.6em]">
            <div className={`flex items-center gap-8 ${connectionStatus === 'offline' ? 'text-red-950 shadow-red-500/10' : 'text-indigo-950'}`}>
               <ShieldCheck className="w-8 h-8" /> Akses Terenkripsi
            </div>
            <div className="w-px h-12 bg-zinc-950 opacity-50"></div>
            <div className="text-zinc-900 italic">Node: {MY_DOMAIN}</div>
          </div>
        </main>
      </div>

      <style>{`
        body { background-color: #030303 !important; display: grid; place-items: center; min-height: 100vh; margin: 0; cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.01); border-radius: 100px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.08); }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.05; } 50% { transform: scale(1.1); opacity: 0.1; } }
        .animate-pulse-slow { animation: pulse-slow 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
