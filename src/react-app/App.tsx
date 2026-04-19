import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mail, RefreshCw, Trash2, 
  ShieldCheck, Inbox, 
  Search, AlertTriangle, Activity
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
  const [copied, setCopied] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

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
        throw new Error(`Node Status: ${response.status}`);
      }
    } catch (err: any) {
      setConnectionStatus('offline');
      setConnectionError("Handshake gagal. Pastikan Cloudflare Worker mengizinkan domain ini (CORS).");
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

  const fetchMessages = useCallback(async () => {
    if (!email || email === '') return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const baseUrl = WORKER_URL.replace(/\/$/, "");
      const targetUrl = `${baseUrl}/messages?email=${encodeURIComponent(email)}&sig=${Date.now()}`;
      
      const response = await fetch(targetUrl, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error("Transmission Error");
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
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/30 grid place-items-center p-0 md:p-6 lg:p-12 overflow-hidden">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none text-center">
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/5 blur-[180px] rounded-full animate-pulse-slow"></div>
      </div>

      <div style={{ placeSelf: 'center' }} className="relative w-full h-full md:h-[92vh] max-w-[1550px] flex flex-col md:flex-row bg-[#080808]/95 backdrop-blur-3xl border border-white/5 rounded-none md:rounded-[4.5rem] shadow-2xl overflow-hidden">
        
        <aside className="w-full md:w-88 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/60">
          <div className="p-12 pb-8">
            <div className="flex items-center gap-6 mb-16">
              <div className="relative p-5 bg-gradient-to-br from-indigo-500 to-black rounded-[1.6rem] border border-white/10 shadow-lg">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-black text-white tracking-tighter italic leading-none">PRIVATEMAY</h1>
                <span className="text-[12px] text-zinc-800 font-bold tracking-[0.6em] uppercase mt-3 italic">Alpha Node</span>
              </div>
            </div>

            <div className="space-y-10">
              <div className="relative p-8 bg-[#0b0b0b] border border-white/10 rounded-[3rem] shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]'}`}></div>
                  <span className="text-[12px] text-zinc-600 font-black tracking-widest uppercase">
                    {connectionStatus === 'online' ? 'Tunnel Active' : 'Tunnel Dead'}
                  </span>
                </div>
                <div className="bg-black/60 p-4 rounded-2xl border border-white/5 mb-6 text-center italic">
                  <span className="text-sm font-mono text-indigo-300 font-black">{loading ? '...' : email}</span>
                </div>
                <button onClick={copyToClipboard} className="w-full py-5 bg-white/5 hover:bg-indigo-600/20 text-zinc-500 hover:text-indigo-300 rounded-[1.2rem] transition-all border border-white/5 text-xs font-black uppercase tracking-widest italic">
                  {copied ? 'Captured' : 'Copy Hash'}
                </button>
              </div>

              <button onClick={generateRandomEmail} className="w-full py-6 bg-white hover:bg-zinc-200 text-black rounded-[2.5rem] font-black text-[13px] tracking-[0.2em] uppercase active:scale-95 shadow-2xl italic">
                <RefreshCw className={`w-5 h-5 inline mr-3 ${loading ? 'animate-spin' : ''}`} />
                Rotate Node
              </button>
            </div>
          </div>

          <nav className="flex-grow px-8 mt-10 space-y-4">
            <div className="flex items-center justify-between px-10 py-6 bg-indigo-600/10 text-indigo-400 rounded-[2.2rem] font-black text-[13px] uppercase tracking-[0.3em] border border-indigo-500/30">
              <div className="flex items-center gap-6 italic"><Inbox className="w-6 h-6" /> Packets</div>
              <span className="bg-indigo-500 text-white px-4 py-1 rounded-2xl text-[12px]">{messages.length}</span>
            </div>
          </nav>

          <div className="p-12 mt-auto">
            <div className="p-8 bg-black/50 rounded-[3rem] border border-white/5 flex items-center gap-6 shadow-inner text-center">
              <div className="overflow-hidden w-full text-center">
                <p className="text-[12px] text-zinc-800 font-black tracking-widest uppercase">Protocol Integrity</p>
                <p className="text-[13px] text-zinc-600 font-mono uppercase font-black italic">{connectionStatus === 'online' ? '100% Solid' : 'Handshake Fail'}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="w-full md:w-[450px] lg:w-[500px] flex flex-col border-r border-white/5 bg-black/30 backdrop-blur-md">
          <div className="p-14 pb-12 border-b border-white/5">
            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase mb-12">Incoming</h2>
            {connectionError && (
              <div className="mb-10 p-8 bg-red-500/5 border border-red-500/20 rounded-[3rem] flex items-start gap-6 text-red-500 animate-in zoom-in shadow-lg">
                <AlertTriangle className="w-8 h-8 shrink-0 mt-1.5" />
                <div className="text-[13px] leading-relaxed">
                  <p className="font-black uppercase tracking-[0.3em] mb-2 leading-none italic">Security Block</p>
                  <p className="opacity-70 font-bold italic">Browser menolak data. Periksa CORS header pada node backend.</p>
                </div>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800" />
              <input type="text" placeholder="Scan identification..." className="w-full bg-black/60 border border-white/5 rounded-[2.5rem] py-5 pl-18 pr-8 text-xs focus:outline-none focus:border-indigo-500/60 font-black uppercase tracking-widest shadow-inner" />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-8 space-y-5 custom-scrollbar bg-zinc-950/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30 italic">
                <Mail className="w-14 h-14 text-zinc-800 mb-8" />
                <p className="text-[14px] font-black uppercase tracking-[0.6em] text-zinc-800 italic">Frequency Empty</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`relative p-8 rounded-[3.2rem] cursor-pointer transition-all duration-1000 border group shadow-3xl ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'hover:bg-white/5 border-transparent'}`}>
                  <div className="flex justify-between items-start mb-6 uppercase">
                    <div className="flex items-center gap-6">
                      <div className={`w-3.5 h-3.5 rounded-full ${selectedMessage?.id === msg.id ? 'bg-indigo-400' : 'bg-zinc-900'}`}></div>
                      <p className="text-[17px] font-black truncate">{msg.from.split('<')[0].trim()}</p>
                    </div>
                  </div>
                  <p className="text-base truncate font-bold text-zinc-900 group-hover:text-zinc-700 italic leading-none">{msg.subject || '(Unidentified)'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <main className="flex-grow flex flex-col bg-black/40 overflow-hidden relative italic">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <div className="p-16 md:p-20 border-b border-white/5 bg-zinc-950/80 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-14 text-left">
                  <div className="relative w-28 h-28 bg-gradient-to-br from-indigo-500 to-black rounded-[3.5rem] flex items-center justify-center font-black text-white text-6xl shadow-[0_0_60px_rgba(99,102,241,0.3)]">
                    {selectedMessage.from[0].toUpperCase()}
                  </div>
                  <div className="max-w-3xl">
                    <h3 className="text-5xl md:text-6xl font-black text-white uppercase mb-8 tracking-tighter leading-none">{selectedMessage.subject || '(No Data Stream)'}</h3>
                    <p className="text-indigo-400 font-bold font-mono px-7 py-3 bg-indigo-500/5 rounded-[1.5rem] border border-indigo-500/10 shadow-inner inline-block">{selectedMessage.from}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-10 bg-[#080808] hover:bg-red-500/5 border-2 border-white/5 rounded-[4rem] text-zinc-900 hover:text-red-500 transition-all duration-1000">
                  <Trash2 className="w-10 h-10" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-16 md:p-24 bg-black/90 shadow-inner">
                <div className="max-w-5xl mx-auto p-20 bg-[#080808] rounded-[6rem] border-2 border-white/5 shadow-2xl min-h-[500px]">
                  <p className="text-zinc-500 leading-[2.2] text-2xl font-medium tracking-tight">{selectedMessage.body}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-24 text-center animate-in fade-in duration-2000">
              <div className="w-80 h-80 bg-[#060606] border-2 border-white/5 rounded-[8rem] flex items-center justify-center mb-24 shadow-2xl">
                <Inbox className="w-32 h-32 text-zinc-950 opacity-40" />
              </div>
              <h3 className="text-7xl font-black text-[#111] mb-10 tracking-[0.5em] uppercase italic opacity-90 leading-none">
                 {connectionStatus === 'offline' ? 'BRIDGE DOWN' : 'HANDSHAKE'}
              </h3>
            </div>
          )}

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-24 px-28 py-8 bg-black/95 backdrop-blur-3xl rounded-[5rem] border-2 border-white/10 shadow-2xl uppercase font-black text-[14px] tracking-[0.6em] italic shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className={`flex items-center gap-6 ${connectionStatus === 'offline' ? 'text-red-900' : 'text-indigo-900'}`}>
               <Activity className="w-6 h-6" />
               Protocol Secured
            </div>
            <div className="w-px h-12 bg-zinc-950 opacity-50"></div>
            <div className="text-zinc-900 italic">Node Hash: {MY_DOMAIN}</div>
          </div>
        </main>
      </div>

      <style>{`
        body { background-color: #030303 !important; display: grid; place-items: center; min-height: 100vh; margin: 0; cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.01); border-radius: 100px; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.03; transform: scale(1); } 50% { opacity: 0.06; transform: scale(1.1); } }
        .animate-pulse-slow { animation: pulse-slow 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
