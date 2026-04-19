import { useState, useEffect, useCallback } from 'react';
import { 
  Mail, RefreshCw, Trash2, Copy, Check, 
  ShieldCheck, Globe, Inbox, Send, Star, 
  ChevronRight, Zap, Shield, Search, Lock
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
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
      
      {/* Dynamic Background Light */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Glass Application Container */}
      <div className="relative w-full h-full md:h-[85vh] max-w-[1400px] flex flex-col md:flex-row bg-[#0d0d0d]/80 backdrop-blur-3xl border border-white/5 rounded-none md:rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* PANEL 1: SIDEBAR (Navigation & Identity) */}
        <aside className="w-full md:w-72 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-black/40">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-10 group cursor-default">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/50 blur-lg opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-white tracking-tighter italic leading-none">PRIVATEMAY</h1>
                <span className="text-[9px] text-zinc-500 font-bold tracking-[0.3em] uppercase mt-1">Encrypted Node</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative p-5 bg-black/60 border border-white/5 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Live Node</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-mono text-indigo-300 truncate font-semibold">
                      {loading ? 'Decrypting...' : email}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={copyToClipboard} 
                        className="flex-1 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={generateRandomEmail}
                disabled={loading}
                className="w-full py-4 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl hover:shadow-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                GENERATE NEW ID
              </button>
            </div>
          </div>

          <nav className="flex-grow px-4 mt-8 space-y-1">
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-500/10 text-indigo-400 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-indigo-500/20 cursor-pointer shadow-[0_8px_20px_rgba(99,102,241,0.1)]">
              <div className="flex items-center gap-4 italic">
                <Inbox className="w-4 h-4" /> Inbox
              </div>
              <span className="bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg text-[9px]">{messages.length}</span>
            </div>
            {['Archive', 'Starred', 'Spam'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4 text-zinc-600 rounded-2xl font-bold text-[11px] uppercase tracking-widest cursor-not-allowed opacity-30 grayscale transition-all">
                {idx === 0 ? <Send className="w-4 h-4" /> : idx === 1 ? <Star className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                {item}
              </div>
            ))}
          </nav>

          <div className="p-8">
            <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 flex items-center gap-3">
              <Globe className="w-4 h-4 text-indigo-500/40" />
              <div className="overflow-hidden">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-0.5 text-center">Active Link</p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">{MY_DOMAIN}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL 2: MIDDLE (Message List) */}
        <section className="w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-white/5 bg-black/10">
          <div className="p-8 pb-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white tracking-tighter">INBOX</h2>
              <button 
                onClick={() => fetchMessages(true)} 
                className={`p-2.5 bg-zinc-900/50 border border-white/5 hover:border-indigo-500/40 rounded-xl transition-all ${fetching ? 'text-indigo-500' : 'text-zinc-600 hover:text-white'}`}
              >
                <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search encrypted data..." 
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-dashed border-zinc-800">
                  <Mail className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Listening for signals...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`relative p-5 rounded-3xl cursor-pointer transition-all duration-500 border group ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'hover:bg-white/5 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 max-w-[70%]">
                      <div className={`w-2 h-2 rounded-full ${selectedMessage?.id === msg.id ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-zinc-800'}`}></div>
                      <p className={`text-sm font-black truncate tracking-tight ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-400'}`}>
                        {msg.from.split('<')[0].trim()}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-700 font-bold bg-black/40 px-2 py-1 rounded-lg">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate font-medium transition-colors ${selectedMessage?.id === msg.id ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {msg.subject || '(No Subject Provided)'}
                  </p>
                  <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[9px] font-black text-indigo-500/40 uppercase tracking-widest italic flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> SECURE TUNNEL
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-800" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PANEL 3: RIGHT (Reader View) */}
        <main className="flex-grow flex flex-col bg-black/20 overflow-hidden relative">
          {selectedMessage ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Header Reader */}
              <div className="p-8 md:p-10 border-b border-white/5 bg-zinc-950/30 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-20"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-3xl flex items-center justify-center font-black text-white text-3xl shadow-2xl border border-white/10">
                      {selectedMessage.from[0].toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2 tracking-tighter">
                      {selectedMessage.subject || '(No Subject)'}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Sender:</span>
                      <span className="text-[11px] text-indigo-400 font-bold font-mono px-3 py-1 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        {selectedMessage.from}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-5 bg-zinc-950 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-[2rem] text-zinc-600 hover:text-red-400 transition-all duration-500 shadow-2xl"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-grow overflow-y-auto p-8 md:p-12 custom-scrollbar bg-black/40">
                <div className="max-w-3xl mx-auto">
                  <div className="relative p-10 bg-zinc-900/20 rounded-[3rem] border border-white/5 min-h-[400px]">
                    <div className="absolute top-0 right-0 p-8 flex gap-3 opacity-20">
                       <Shield className="w-5 h-5" />
                    </div>
                    <div className="text-zinc-300 leading-[1.8] text-lg whitespace-pre-wrap font-medium selection:bg-indigo-500/50">
                      {selectedMessage.body}
                    </div>
                  </div>
                  
                  <div className="mt-16 flex flex-col items-center opacity-40">
                    <div className="w-16 h-1 bg-zinc-800 rounded-full mb-10"></div>
                    <div className="flex items-center gap-4 px-8 py-3 bg-black border border-white/5 rounded-full text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                       SESSION AUTO-DESTRUCT ACTIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-1000">
              <div className="relative mb-12 group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/30 transition duration-1000"></div>
                <div className="relative w-40 h-40 bg-zinc-950 border border-white/10 rounded-[3rem] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent"></div>
                   <Inbox className="w-16 h-16 text-zinc-900 transition-all duration-1000 group-hover:text-indigo-400 group-hover:scale-110" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-zinc-800 mb-4 tracking-tighter">LISTENING FOR TRANSMISSION...</h3>
              <p className="text-[11px] max-w-sm text-zinc-700 leading-relaxed font-black uppercase tracking-[0.3em] italic">
                Awaiting incoming secure signals on current node.
              </p>
              
              {/* Animated Wave Elements */}
              <div className="mt-20 flex gap-2 items-end opacity-5">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="h-8 w-1.5 bg-zinc-500 rounded-full animate-wave" style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          )}

          {/* Persistent Tech Footer */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 px-10 py-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-400 shadow-indigo-500/20">
               <ShieldCheck className="w-4 h-4" />
               SECURE PROTOCOL
            </div>
            <div className="w-px h-4 bg-zinc-800"></div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">
               <Zap className="w-4 h-4" />
               NODE: {MY_DOMAIN.toUpperCase()}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.1); }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.15; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }

        body {
          background-color: #030303;
        }
      `}</style>
    </div>
  );
}
