import { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, Trash2, Eye, Copy, Check, Clock, ShieldCheck, Globe, Inbox, Send, Star, AlertCircle } from 'lucide-react';

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
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR (Navigation & Identity) */}
      <aside className="w-80 flex flex-col border-r border-zinc-800 bg-[#0f0f0f]">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Private Mail</h1>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Alamat Aktif</p>
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <span className="text-sm font-mono text-indigo-400 truncate">{loading ? '...' : email}</span>
                <button onClick={copyToClipboard} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button 
              onClick={generateRandomEmail}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Ganti Alamat Baru
            </button>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-medium cursor-pointer">
            <Inbox className="w-5 h-5" /> Inbox
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 rounded-xl font-medium cursor-pointer transition-colors opacity-40 grayscale pointer-events-none">
            <Send className="w-5 h-5" /> Sent
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 rounded-xl font-medium cursor-pointer transition-colors opacity-40 grayscale pointer-events-none">
            <Star className="w-5 h-5" /> Starred
          </div>
        </nav>

        <div className="p-6 border-t border-zinc-800 mt-auto">
          <div className="flex items-center gap-2 text-xs text-zinc-600 mb-1">
            <Globe className="w-3 h-3 text-indigo-500/50" />
            <span>Server: {MY_DOMAIN}</span>
          </div>
          <p className="text-[10px] text-zinc-700 font-medium">© 2024 Private Mail System</p>
        </div>
      </aside>

      {/* 2. MIDDLE PANE (Message List) */}
      <section className="w-[400px] flex flex-col border-r border-zinc-800 bg-[#0c0c0c]">
        <div className="p-6 flex items-center justify-between border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Inbox 
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-normal">
              {messages.length}
            </span>
          </h2>
          <button onClick={() => fetchMessages(true)} className={`p-2 hover:bg-zinc-800 rounded-full text-zinc-500 ${fetching ? 'animate-spin text-indigo-500' : ''}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto overflow-x-hidden p-2 space-y-1 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-600">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 opacity-20" />
              </div>
              <p className="text-sm">Belum ada pesan</p>
              <p className="text-[10px] uppercase tracking-widest mt-1">Cek otomatis aktif...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedMessage?.id === msg.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'hover:bg-zinc-800/50 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-bold truncate pr-4 ${selectedMessage?.id === msg.id ? 'text-white' : 'text-zinc-300'}`}>
                    {msg.from}
                  </p>
                  <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                    {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate mb-2">{msg.subject || '(Tanpa Subjek)'}</p>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                   <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">New Message</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. RIGHT PANE (Reading Area) */}
      <main className="flex-grow flex flex-col bg-[#0a0a0a]">
        {selectedMessage ? (
          <>
            {/* Toolbar */}
            <div className="h-20 p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/10">
                  {selectedMessage.from[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-none mb-1">{selectedMessage.subject || '(Tanpa Subjek)'}</h3>
                  <p className="text-xs text-zinc-500">Dari: <span className="text-zinc-300">{selectedMessage.from}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600 mr-4 italic">{new Date(selectedMessage.date).toLocaleString()}</span>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="p-3 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow p-10 overflow-y-auto">
              <div className="max-w-4xl mx-auto bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50">
                <div className="text-zinc-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-sans selection:bg-indigo-500/30">
                  {selectedMessage.body}
                </div>
              </div>
              
              <div className="mt-12 text-center">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                   <AlertCircle className="w-3 h-3 text-indigo-500" />
                   Pesan akan terhapus otomatis dalam 1 jam
                 </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-20 opacity-30 select-none">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center">
                 <Mail className="w-16 h-16 text-zinc-700" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-zinc-800" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-zinc-500 mb-2">Pilih Pesan untuk Dibaca</h3>
            <p className="text-sm max-w-xs leading-relaxed">Pesan yang masuk ke alamat email sementara Anda akan muncul di sini secara otomatis.</p>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2d2d33; }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
