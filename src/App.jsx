import React, { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, Trash2, Eye, Copy, Check, Clock, ShieldCheck, Globe } from 'lucide-react';

// KONFIGURASI: Ganti dengan data Anda
const WORKER_URL = "https://temp-mail-backend.bihanadan18.workers.dev/"; // Ganti ini!
const MY_DOMAIN = "mail.rekenbutler.com"; // Ganti ini!

export default function App() {
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate Username Acak
  const generateRandomEmail = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    const newEmail = `${result}@${MY_DOMAIN}`;
    setEmail(newEmail);
    setMessages([]);
    setSelectedMessage(null);
    localStorage.setItem('saved_temp_email', newEmail);
  };

  const fetchMessages = useCallback(async (showLoading = false) => {
    if (!email) return;
    if (showLoading) setFetching(true);
    try {
      const response = await fetch(`${WORKER_URL}/messages?email=${email}`);
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Gagal mengambil pesan:", err);
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
    const interval = setInterval(() => fetchMessages(false), 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const copyToClipboard = () => {
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Branding */}
        <header className="flex flex-col items-center mb-10">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-3xl shadow-2xl shadow-blue-500/20 mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
            PRIVATE MAIL
          </h1>
          <div className="flex items-center gap-2 mt-2 text-neutral-500 text-sm">
            <Globe className="w-4 h-4" />
            <span>Powered by your domain: <span className="text-blue-400 font-mono">{MY_DOMAIN}</span></span>
          </div>
        </header>

        {/* Address Generator */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input 
                readOnly
                value={email}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl py-5 px-6 font-mono text-xl text-blue-400 focus:outline-none"
              />
              <button 
                onClick={copyToClipboard}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-all"
              >
                {copied ? <Check className="text-green-400" /> : <Copy className="text-neutral-300" />}
              </button>
            </div>
            <button 
              onClick={generateRandomEmail}
              className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} />
              Ganti Email
            </button>
          </div>
          {copied && <p className="text-green-500 text-xs mt-3 ml-2 font-medium">Alamat email disalin ke clipboard!</p>}
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          {/* List Pesan */}
          <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Inbox
              </h2>
              {fetching && <RefreshCw className="w-4 h-4 animate-spin text-neutral-600" />}
            </div>
            <div className="flex-grow overflow-y-auto p-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-600 p-8 text-center">
                  <Mail className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm">Menunggu pesan masuk...</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div 
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 mb-2 rounded-2xl cursor-pointer transition-all ${selectedMessage?.id === msg.id ? 'bg-blue-600/10 border border-blue-600/30' : 'hover:bg-neutral-800 border border-transparent'}`}
                  >
                    <p className="font-bold text-sm truncate">{msg.from}</p>
                    <p className="text-xs text-neutral-400 truncate mt-1">{msg.subject}</p>
                    <p className="text-[10px] text-neutral-600 mt-2 italic">
                      {new Date(msg.date).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Viewer Pesan */}
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            {selectedMessage ? (
              <>
                <div className="p-8 border-b border-neutral-800 bg-neutral-800/30">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-white">{selectedMessage.subject}</h3>
                    <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-neutral-700 rounded-full">
                      <Trash2 className="w-5 h-5 text-neutral-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl">
                      {selectedMessage.from[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{selectedMessage.from}</p>
                      <p className="text-xs text-neutral-500">Diterima pada {new Date(selectedMessage.date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-grow p-8 overflow-y-auto whitespace-pre-wrap font-sans text-neutral-300 leading-relaxed">
                  {selectedMessage.body}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                <Eye className="w-16 h-16 mb-4 opacity-10" />
                <p>Pilih pesan untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-10 text-center text-neutral-600 text-[11px] uppercase tracking-widest">
          Secured by Cloudflare Workers &bull; Auto-Cleanup Enabled (1 Hour)
        </footer>
      </div>
    </div>
  );
}
