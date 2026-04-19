import { useState, useEffect, useCallback } from 'react';
import { 
  Mail, RefreshCw, Trash2, Eye, Copy, Check, 
  ShieldCheck, Globe, Inbox, Send, Star, 
  AlertCircle, ChevronRight, Zap, Shield, Search
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

  const generateRandomEmail = () => {
    setLoading(true);
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
    try {
      const baseUrl = WORKER_URL.endsWith('/') ? WORKER_URL.slice(0, -1) : WORKER_URL;
      const response = await fetch(`${baseUrl}/messages?email=${email}`);
      if (!response.ok) throw new Error("Gagal terhubung ke API");
      const data = await response.json();
      setMessages(data as EmailMessage[]);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setFetching(false);
    }
  }, [email]);

  useEffect(() => {
    const saved = localStorage.getItem('saved_temp_email');
    if (saved && saved.endsWith(MY_DOMAIN)) {
      setEmail(saved);
    } else {
      generateRandomEmail();
    }
  }, []);

  useEffect(() => {
    if (!email) return;
    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(false), 8000);
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
    <div className="min-h-screen w-full bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-0 md:p-4 lg:p-6">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Main Container - Elevated Glass Card */}
      <div className="relative w-full h-full md:h-[90vh] max-w-[1600px] flex flex-col md:flex-row bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* 1. LEFT SIDEBAR - Identity & Identity Dashboard */}
        <aside className="w-full md:w-72 lg:w-80 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/20">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-md opacity-50"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tighter italic">PRIVATE<span className="text-indigo-500">MAIL</span></h1>
                <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Security Layer 4</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative p-5 bg-zinc-950/80 border border-white/10 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-indigo-500" /> Aktif
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-mono text-indigo-300 truncate font-semibold leading-none">
                      {loading ? 'Generating...' : email}
                    </span>
                    <button onClick={copyToClipboard} className="shrink-0 p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={generateRandomEmail}
                disabled={loading}
                className="group w-full relative py-4 px-6 bg-white text-black rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>BUAT ALAMAT BARU</span>
              </button>
            </div>
          </div>

          <nav className="flex-grow px-4 space-y-1">
            <div className="flex items-center justify-between px-5 py-3.5 bg-white/5 text-white rounded-2xl font-bold cursor-pointer transition-all border border-white/5">
              <div className="flex items-center gap-4">
                <Inbox className="w-5 h-5 text-indigo-400" /> 
                <span className="text-sm">Inbox</span>
              </div>
              <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-black">
                {messages.length}
              </span>
            </div>
            {['Terkirim', 'Berbintang', 'Sampah'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 text-zinc-500 rounded-2xl font-bold cursor-not-allowed opacity-40 transition-all text-sm">
                {idx === 0 ? <Send className="w-5 h-5" /> : idx === 1 ? <Star className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                {item}
              </div>
            ))}
          </nav>

          <div className="p-8 mt-auto">
            <div className="flex items-center gap-3 p-4 bg-zinc-950/40 rounded-2xl border border-white/5">
              <Globe className="w-4 h-4 text-indigo-500/50" />
              <div className="overflow-hidden">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Connected Node</p>
                <p className="text-[11px] text-zinc-400 font-mono truncate">{MY_DOMAIN}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* 2. MIDDLE PANE - List View */}
        <section className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-white/5 bg-black/10">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Messages</h2>
              <button 
                onClick={() => fetchMessages(true)} 
                className={`p-2.5 bg-zinc-900 border border-white/5 hover:border-indigo-500/50 rounded-xl transition-all ${fetching ? 'text-indigo-500' : 'text-zinc-500 hover:text-white'}`}
              >
                <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Cari pesan..." 
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in duration-700">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full"></div>
                  <div className="relative w-20 h-20 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/50">
                    <Mail className="w-8 h-8 text-zinc-700" />
                  </div>
                </div>
                <p className="text-sm font-black text-zinc-600 uppercase tracking-widest mb-1">Inbox Kosong</p>
                <p className="text-[10px] text-zinc-700 font-medium">Menunggu data terenkripsi masuk...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'hover:bg-white/5 border-transparent hover:border-white/5'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedMessage?.id === msg.id ? 'bg-indigo-400' : 'bg-zinc-700'}`}></div>
                      <p className={`text-sm font-black truncate ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-300'}`}>
                        {msg.from.split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-bold bg-black/30 px-2 py-0.5 rounded-md">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate transition-colors ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {msg.subject || '(Tanpa Subjek)'}
                  </p>
                  <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black text-indigo-400/50 uppercase tracking-tighter italic">Encrypted Connection</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. RIGHT PANE - Reader View */}
        <main className="flex-grow flex flex-col bg-black/30 overflow-hidden relative">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Toolbar Reader */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-2xl"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-2xl border border-white/10">
                      {selectedMessage.from[0].toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white leading-none mb-2 tracking-tight">
                      {selectedMessage.subject || '(Tanpa Subjek)'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-500">Dari:</span>
                      <span className="text-indigo-400 font-bold font-mono px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                        {selectedMessage.from}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex flex-col items-end mr-4">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Received Timestamp</p>
                    <p className="text-xs text-zinc-400 font-bold">{new Date(selectedMessage.date).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-4 bg-zinc-900 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-2xl text-zinc-500 hover:text-red-400 transition-all shadow-xl"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Reader Body */}
              <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                  <div className="relative p-10 bg-zinc-950/40 rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="absolute top-0 right-0 p-6 flex gap-2">
                       <Shield className="w-4 h-4 text-indigo-500/20" />
                    </div>
                    <div className="text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap font-sans selection:bg-indigo-500/50 min-h-[300px]">
                      {selectedMessage.body}
                    </div>
                  </div>
                  
                  <div className="mt-12 flex flex-col items-center">
                    <div className="w-12 h-1 bg-zinc-800 rounded-full mb-8"></div>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-950 border border-white/5 rounded-2xl text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] shadow-2xl">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                       Auto-Destruction Protocol: 60 Minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center selection:none">
              <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-indigo-500/40 transition duration-700"></div>
                <div className="relative w-32 h-32 bg-zinc-950 border border-white/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
                   <Inbox className="w-16 h-16 text-zinc-800 transition-all duration-700 group-hover:text-indigo-500 group-hover:scale-110" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-zinc-600 mb-3 tracking-tighter">DECRYPTING INBOX...</h3>
              <p className="text-sm max-w-sm text-zinc-700 leading-relaxed font-bold uppercase tracking-widest opacity-60">
                Hubungkan alamat di panel kiri untuk mulai menerima transmisi data terenkripsi.
              </p>
              
              {/* Decorative Tech Lines */}
              <div className="mt-16 flex gap-1 items-center opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`h-8 w-1 bg-zinc-500 rounded-full`} style={{ height: `${Math.random() * 32 + 8}px` }}></div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Security Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/5 shadow-2xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
               <ShieldCheck className="w-3.5 h-3.5" />
               End-to-End Secure
            </div>
            <div className="w-px h-3 bg-zinc-800"></div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
               <Zap className="w-3 h-3" />
               Instant Sync
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.2); }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.8; filter: brightness(1.2); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        body {
          background-color: #050505;
        }
      `}</style>
    </div>
  );
}
