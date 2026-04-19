import { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, Trash2, Eye, Copy, Check, Clock, ShieldCheck, Globe } from 'lucide-react';

/**
 * KONFIGURASI FINAL:
 * URL dan Domain sudah disesuaikan dengan milik Anda.
 */
const WORKER_URL = "https://temp-mail-backend.bihanadan18.workers.dev"; 
const MY_DOMAIN = "mail.rekenbutler.com"; 

// Definisi struktur data pesan agar TypeScript tidak error
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

  // Fungsi untuk membuat alamat email acak baru
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

  // Fungsi untuk mengambil pesan dari Backend (Cloudflare Worker)
  const fetchMessages = useCallback(async (showLoading = false) => {
    if (!email || email === '') return;
    if (showLoading) setFetching(true);
    try {
      // Membersihkan URL dari trailing slash jika ada
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

  // Load email terakhir dari localStorage saat aplikasi dibuka
  useEffect(() => {
    const saved = localStorage.getItem('saved_temp_email');
    if (saved && saved.endsWith(MY_DOMAIN)) {
      setEmail(saved);
    } else {
      generateRandomEmail();
    }
  }, []);

  // Auto-refresh inbox setiap 8 detik
  useEffect(() => {
    if (!email) return;
    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(false), 8000);
    return () => clearInterval(interval);
  }, [fetchMessages, email]);

  // Fungsi untuk menyalin email ke clipboard (fallback untuk iFrame)
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-4 md:p-8 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col items-center mb-10">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-3xl shadow-2xl shadow-blue-500/20 mb-4 animate-pulse-slow">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500 text-center uppercase">
            Private Mail
          </h1>
          <div className="flex items-center gap-2 mt-2 text-neutral-500 text-sm">
            <Globe className="w-4 h-4 text-blue-500/50" />
            <span>Domain aktif: <span className="text-blue-400 font-mono font-bold">{MY_DOMAIN}</span></span>
          </div>
        </header>

        {/* Email Display & Generator */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-6 mb-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow group">
              <input 
                readOnly
                value={loading ? "Generating..." : email}
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-2xl py-5 px-6 font-mono text-xl text-blue-400 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button 
                onClick={copyToClipboard}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-all active:scale-90"
                title="Salin Alamat"
              >
                {copied ? <Check className="text-green-400 w-6 h-6" /> : <Copy className="text-neutral-300 w-6 h-6" />}
              </button>
            </div>
            <button 
              onClick={generateRandomEmail}
              disabled={loading}
              className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} />
              <span>Ganti Email</span>
            </button>
          </div>
          {copied && (
            <div className="flex items-center gap-2 mt-3 ml-2 text-green-500 text-xs font-medium animate-in fade-in slide-in-from-left-2">
              <Check className="w-3 h-3" />
              <span>Berhasil disalin ke clipboard!</span>
            </div>
          )}
        </div>

        {/* Inbox Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          
          {/* List Pesan (Sidebar) */}
          <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/20">
              <h2 className="font-bold flex items-center gap-2 text-neutral-300">
                <Clock className="w-4 h-4 text-blue-500" /> Inbox
              </h2>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] bg-neutral-800 px-2 py-1 rounded text-neutral-500 font-mono">
                  {messages.length} pesan
                 </span>
                 {fetching && <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />}
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-600 p-8 text-center">
                  <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-sm font-medium">Belum ada pesan</p>
                  <p className="text-[10px] mt-1 opacity-50 uppercase tracking-widest italic">Menunggu email masuk...</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div 
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 mb-2 rounded-2xl cursor-pointer transition-all duration-200 group ${selectedMessage?.id === msg.id ? 'bg-blue-600/10 border border-blue-600/30' : 'hover:bg-neutral-800/50 border border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm truncate text-neutral-200 flex-grow pr-2">{msg.from}</p>
                      <p className="text-[9px] text-neutral-600 whitespace-nowrap mt-1 italic">
                        {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500 truncate group-hover:text-neutral-400 transition-colors">{msg.subject || '(Tanpa Subjek)'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Viewer Pesan (Main Content) */}
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            {selectedMessage ? (
              <>
                <div className="p-8 border-b border-neutral-800 bg-neutral-800/30 backdrop-blur-md">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-white leading-tight">{selectedMessage.subject || '(Tanpa Subjek)'}</h3>
                    <button 
                      onClick={() => setSelectedMessage(null)} 
                      className="p-2 hover:bg-neutral-700/50 rounded-full transition-colors group"
                    >
                      <Trash2 className="w-5 h-5 text-neutral-500 group-hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg">
                      {selectedMessage.from ? selectedMessage.from[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-200">{selectedMessage.from}</p>
                      <p className="text-xs text-neutral-500">Diterima pada {new Date(selectedMessage.date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-grow p-8 overflow-y-auto bg-neutral-900/50 custom-scrollbar">
                  <div className="whitespace-pre-wrap font-sans text-neutral-300 leading-relaxed text-base">
                    {selectedMessage.body}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600 p-10 text-center">
                <div className="relative mb-6">
                  <Eye className="w-20 h-20 opacity-5" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="w-8 h-8 opacity-10" />
                  </div>
                </div>
                <p className="text-lg font-medium text-neutral-700">Pilih pesan untuk dibaca</p>
                <p className="text-sm text-neutral-800 mt-2 italic">Isi pesan akan muncul di sini secara otomatis</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-600 text-[10px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Status: Operational</span>
          </div>
          <p className="font-medium italic">
            Powered by Cloudflare Workers &bull; Auto-Cleanup Enabled
          </p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #404040; }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
