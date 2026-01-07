
import React, { useState, useRef, useEffect } from 'react';
import { GeminiChatSession } from './services/geminiService';
import { Message, MessageRole } from './types';
import { INITIAL_MESSAGE } from './constants';
import { 
  Send, 
  Film, 
  Clapperboard, 
  MessageSquare, 
  Info, 
  History, 
  Menu, 
  X,
  Sparkles,
  Search,
  ExternalLink,
  Bot
} from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: MessageRole.MODEL,
      text: INITIAL_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<GeminiChatSession | null>(null);

  // Telegram WebApp Initialization
  useEffect(() => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      // Set header color to match our theme
      tg.setHeaderColor('#0c0c0c');
      tg.setBackgroundColor('#0a0a0a');
    }
    chatSession.current = new GeminiChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading || !chatSession.current) return;

    // Trigger haptic feedback if in Telegram
    // @ts-ignore
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let fullResponse = '';
      const modelMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: MessageRole.MODEL,
        text: '',
        timestamp: new Date()
      }]);

      await chatSession.current.sendMessageStream(userMessage.text, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, text: fullResponse } : msg
        ));
      });
      
      // @ts-ignore
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: MessageRole.MODEL,
        text: err.message || "Xatolik yuz berdi.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'initial',
      role: MessageRole.MODEL,
      text: INITIAL_MESSAGE,
      timestamp: new Date()
    }]);
    chatSession.current = new GeminiChatSession();
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-200 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 w-72 h-full bg-[#111] border-r border-white/10 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">AI-Kinochi</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase px-3 pb-2">Asosiy</p>
          <button 
            onClick={clearChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Yangi suhbat
          </button>
          
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase px-3 pb-2">Telegram Bot</p>
            <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bot Holati</span>
                <span className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mb-3 truncate font-mono">ID: 8151939477...dw1_g</p>
              <a 
                href="https://t.me/UZHD_Kinolari" 
                target="_blank"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                <Bot className="w-3.5 h-3.5" />
                Telegram-ga o'tish
              </a>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase px-3 pb-2">Resurslar</p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-gray-400">
              <Search className="w-4 h-4" />
              Filmlar qidiruvi
            </button>
            <a href="https://t.me/UZHD_Kinolari" target="_blank" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-gray-400">
              <Clapperboard className="w-4 h-4" />
              UZHD Kanal
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </a>
          </div>
        </nav>

        <div className="p-6 border-t border-white/10 text-xs text-gray-500 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3" />
            <span>AI-Kinochi v2.5.0</span>
          </div>
          <p>© 2024 UZHD Ecosystem</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c] relative">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0c0c0c]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold flex items-center gap-2">
                AI-Kinochi
                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black tracking-tighter">UZHD</span>
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Rasmiy Bot Interfeysi</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border-2 border-[#0c0c0c]"></span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`
                  flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg
                  ${msg.role === MessageRole.USER ? 'bg-indigo-600' : 'bg-red-600'}
                `}>
                  {msg.role === MessageRole.USER ? (
                    <span className="text-xs font-bold">SM</span>
                  ) : (
                    <Film className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`
                  flex flex-col max-w-[85%] sm:max-w-[75%] gap-1.5
                  ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}
                `}>
                  <div className={`
                    px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-xl
                    ${msg.role === MessageRole.USER 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-[#1a1a1a] text-gray-100 border border-white/5 rounded-tl-none'}
                  `}>
                    {msg.text || (isLoading && msg.role === MessageRole.MODEL ? (
                      <div className="flex gap-1.5 py-2 items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </div>
                    ) : null)}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium px-1 uppercase tracking-wider">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c] to-transparent sticky bottom-0 z-20">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-indigo-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl focus-within:border-red-600/50 transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-transparent py-4 pl-6 pr-4 focus:outline-none text-[15px] placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`
                  p-4 transition-all
                  ${!inputText.trim() || isLoading 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-red-500 hover:text-red-400 active:scale-90'}
                `}
              >
                <Send className={`w-6 h-6 ${isLoading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </form>
          <p className="text-[10px] text-gray-600 text-center mt-3 font-bold uppercase tracking-[0.2em] opacity-50">
            Powered by Gemini 3 Flash & UZHD AI
          </p>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      </main>
    </div>
  );
};

export default App;
