'use client';

import * as React from 'react';
import { Bot, X, Send, Sparkles, Mic, Square, ThumbsUp, ThumbsDown, RotateCcw, Copy, Image as ImageIcon, Trash2, History, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type VideoSuggestion = {
  title: string;
  url: string;
  thumbnail: string;
};

type Message = {
  role: 'ai' | 'user';
  text: string;
  emotion?: string;
  isVoice?: boolean;
  isImage?: boolean;
  imageUrl?: string;
  duration?: number;
  recommendations?: string[];
  closing?: string;
  video?: VideoSuggestion;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
};

const STARTER_PROMPTS = [
  { label: "أشعر بالقلق والتوتر 😟", text: "أشعر بالقلق والتوتر اليوم، هل يمكنك مساعدتي؟" },
  { label: "يوم سعيد وطاقة رائعة! 😊", text: "أنا سعيد للغاية اليوم وأريد مشاركة طاقة إيجابية!" },
  { label: "حزين وأريد التحدث 😢", text: "أشعر بالحزن والضيق الشديد في صدري ولا أعرف السبب..." },
  { label: "غاضب ومنزعج جداً 😡", text: "أواجه يوماً سيئاً للغاية وأشعر بالغضب الشديد حالياً." }
];

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'ai',
      text: 'مرحباً بك! أنا ديبو (Depo)، مساعدك النفسي والوجداني الذكي. كيف تشعر اليوم؟ أنا هنا لأستمع إليك وأحلل مشاعرك بحب.',
      emotion: 'Neutral'
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  
  // Sessions & History State
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [showHistory, setShowHistory] = React.useState(false);

  // Feedback states
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [feedbacks, setFeedbacks] = React.useState<{ [key: number]: 'like' | 'dislike' | null }>({});
  const [completedRecs, setCompletedRecs] = React.useState<{ [key: string]: boolean }>({});

  const toggleRec = (msgIndex: number, recIndex: number) => {
    const key = `${msgIndex}-${recIndex}`;
    setCompletedRecs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const recordingTimeRef = React.useRef(0);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat sessions from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    try {
      const storedSessions = localStorage.getItem('depo_chat_sessions');
      const activeId = localStorage.getItem('depo_chat_active_session_id');
      
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions) as ChatSession[];
        setSessions(parsed);
        
        if (activeId) {
          const activeSes = parsed.find(s => s.id === activeId);
          if (activeSes) {
            setMessages(activeSes.messages);
            setActiveSessionId(activeId);
            setSessionId(activeId);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
    }
  }, []);

  // Save sessions list to localStorage helper
  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    try {
      localStorage.setItem('depo_chat_sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  };

  // Auto-sync active conversation changes to the sessions list
  React.useEffect(() => {
    if (!mounted) return;
    
    // We only create or update a session if there's actual conversation (more than welcome message)
    if (messages.length <= 1 && !activeSessionId) return;

    let currentActiveId = activeSessionId;
    if (!currentActiveId) {
      // Create new session ID
      currentActiveId = 'session_' + Date.now();
      setActiveSessionId(currentActiveId);
      setSessionId(currentActiveId);
      localStorage.setItem('depo_chat_active_session_id', currentActiveId);
    }

    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === currentActiveId);
      let updated = [...prev];
      
      // Determine session title from the first user message
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg 
        ? (firstUserMsg.text.substring(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '')) 
        : 'محادثة جديدة';

      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          messages: messages,
          timestamp: Date.now()
        };
      } else {
        updated.unshift({
          id: currentActiveId!,
          title,
          messages: messages,
          timestamp: Date.now()
        });
      }
      
      // Sort by recency
      updated.sort((a, b) => b.timestamp - a.timestamp);
      saveSessionsToStorage(updated);
      return updated;
    });
  }, [messages, activeSessionId, mounted]);

  const handleStartNewChat = () => {
    const defaultMsg: Message[] = [
      {
        role: 'ai',
        text: 'مرحباً بك! أنا ديبو (Depo)، مساعدك النفسي والوجداني الذكي. كيف تشعر اليوم؟ أنا هنا لأستمع إليك وأحلل مشاعرك بحب.',
        emotion: 'Neutral'
      }
    ];
    setMessages(defaultMsg);
    setActiveSessionId(null);
    setSessionId(null);
    setCompletedRecs({});
    localStorage.removeItem('depo_chat_active_session_id');
    setShowHistory(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setMessages(session.messages);
    setActiveSessionId(session.id);
    setSessionId(session.id);
    localStorage.setItem('depo_chat_active_session_id', session.id);
    setShowHistory(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionToDeleteId: string) => {
    e.stopPropagation();
    if (window.confirm('هل تريد حذف هذه المحادثة من السجل؟')) {
      const updated = sessions.filter(s => s.id !== sessionToDeleteId);
      setSessions(updated);
      saveSessionsToStorage(updated);
      
      if (activeSessionId === sessionToDeleteId) {
        const defaultMsg: Message[] = [
          {
            role: 'ai',
            text: 'مرحباً بك! أنا ديبو (Depo)، مساعدك النفسي والوجداني الذكي. كيف تشعر اليوم؟ أنا هنا لأستمع إليك وأحلل مشاعرك بحب.',
            emotion: 'Neutral'
          }
        ];
        setMessages(defaultMsg);
        setActiveSessionId(null);
        setSessionId(null);
        localStorage.removeItem('depo_chat_active_session_id');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      setRecordingTime(0);
      recordingTimeRef.current = 0;
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const finalDuration = recordingTimeRef.current;
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await handlePredict(null, audioBlob, null, finalDuration);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePredict = async (text: string | null, audioBlob: Blob | null, imageFile: File | null, duration?: number) => {
    setIsLoading(true);
    
    // Add user message to UI
    const newUserMsg: Message = { role: 'user', text: text || (imageFile ? 'صورة مرفقة' : 'رسالة صوتية 🎙️') };
    if (audioBlob) {
      newUserMsg.isVoice = true;
      newUserMsg.duration = duration;
    }
    if (imageFile && imagePreview) {
      newUserMsg.isImage = true;
      newUserMsg.imageUrl = imagePreview;
    }
    
    setMessages(prev => [...prev, newUserMsg]);

    // Ensure session ID is initialized
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = 'session_' + Date.now();
      setSessionId(currentSessionId);
      setActiveSessionId(currentSessionId);
      localStorage.setItem('depo_chat_active_session_id', currentSessionId);
    }

    try {
      // Using the Emotion API endpoint with session management
      const API_URL = 'https://ahmed-hamed-emotion-api.hf.space/chat';
      const formData = new FormData();
      
      formData.append('session_id', currentSessionId);
      
      if (text) formData.append('text', text);
      if (audioBlob) formData.append('audio', audioBlob, 'recording.wav');
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      
      // Store session_id for future requests to maintain conversation context
      if (data.session_id && data.session_id !== 'default_session') {
        setSessionId(data.session_id);
      }
      
      // Extract response - assistant_message is now a rich object
      const assistantMsg = data.assistant_message;
      let finalResponseText: string;
      let recommendations: string[] | undefined;
      let closing: string | undefined;
      let video: VideoSuggestion | undefined;

      if (assistantMsg && typeof assistantMsg === 'object') {
        // New API format: assistant_message is an object
        finalResponseText = assistantMsg.response || "عذراً، لم أتمكن من معالجة الطلب حالياً.";
        recommendations = assistantMsg.recommendations;
        closing = assistantMsg.closing;
        video = assistantMsg.video;
      } else {
        // Fallback for plain string format
        finalResponseText = assistantMsg || data.assistant_reply || data.response || data.text || data.message || "عذراً، لم أتمكن من معالجة الطلب حالياً.";
      }

      const finalEmotion = data.final_emotion || data.emotion_label || data.emotion || data.sentiment || "Neutral";

      setMessages(prev => [
        ...prev,
        { 
          role: 'ai', 
          text: finalResponseText,
          emotion: finalEmotion,
          recommendations,
          closing,
          video,
        }
      ]);
    } catch (error) {
      console.error('AI Predict Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، واجهت مشكلة في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.' }]);
    } finally {
      setIsLoading(false);
      setInput('');
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage && !isLoading) return;
    handlePredict(input.trim() || null, null, selectedImage);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFeedback = (index: number, type: 'like' | 'dislike') => {
    setFeedbacks(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }));
  };

  const handleRegenerate = (text: string, index: number) => {
    // Find the last user prompt before this AI response to regenerate
    let lastUserPrompt = '';
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserPrompt = messages[i].text;
        break;
      }
    }
    if (lastUserPrompt && !isLoading) {
      handlePredict(lastUserPrompt, null, null);
    }
  };

  const getEmotionDetails = (emotion?: string) => {
    if (!emotion) return null;
    const e = emotion.toLowerCase().trim();
    if (e.includes('happy') || e.includes('joy') || e.includes('سعيد') || e.includes('بهج') || e.includes('سرور')) {
      return {
        bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        emoji: '😊',
        label: 'سعيد'
      };
    }
    if (e.includes('sad') || e.includes('sorrow') || e.includes('حزين') || e.includes('كآب') || e.includes('حزن')) {
      return {
        bg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
        glow: 'shadow-[0_0_15px_rgba(99,102,241,0.25)]',
        emoji: '😢',
        label: 'حزين'
      };
    }
    if (e.includes('angr') || e.includes('fury') || e.includes('غاضب') || e.includes('غضب') || e.includes('نقم')) {
      return {
        bg: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
        emoji: '😡',
        label: 'غاضب'
      };
    }
    if (e.includes('anx') || e.includes('fear') || e.includes('scared') || e.includes('قلق') || e.includes('خوف') || e.includes('توتر')) {
      return {
        bg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        emoji: '😟',
        label: 'قلق'
      };
    }
    if (e.includes('love') || e.includes('affection') || e.includes('حب') || e.includes('عشق') || e.includes('ود')) {
      return {
        bg: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
        glow: 'shadow-[0_0_15px_rgba(236,72,153,0.25)]',
        emoji: '💖',
        label: 'حب'
      };
    }
    return {
      bg: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      glow: 'shadow-[0_0_15px_rgba(14,165,233,0.25)]',
      emoji: '✨',
      label: emotion
    };
  };

  if (!mounted) return null;

  return (
    <>
      {/* Inject custom visual styles safely */}
      <style dangerouslySetInnerHTML={{ __html: `
        .chat-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.18);
        }
        @keyframes wave-visualizer {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }
        .wave-glow-bar {
          animation: wave-visualizer 1s ease-in-out infinite;
        }
        .wave-glow-bar:nth-child(1) { animation-delay: 0.1s; }
        .wave-glow-bar:nth-child(2) { animation-delay: 0.3s; }
        .wave-glow-bar:nth-child(3) { animation-delay: 0.5s; }
        .wave-glow-bar:nth-child(4) { animation-delay: 0.2s; }
        .wave-glow-bar:nth-child(5) { animation-delay: 0.4s; }
      `}} />

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-[0_10px_30px_-5px_rgba(59,130,246,0.5)] border border-white/20 cursor-pointer"
          >
            <Bot className="h-8 w-8 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.88, y: 40, filter: 'blur(8px)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="fixed bottom-6 right-6 z-50 flex h-[680px] w-[420px] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#090d1a] shadow-[0_32px_80px_-8px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl text-right"
            dir="rtl"
          >
            {/* ── Compact Premium Header ── */}
            <div className="relative flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] overflow-hidden shrink-0">
              {/* subtle gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/5 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500/30 via-violet-500/20 to-transparent" />

              {/* Bot identity */}
              <div className="flex items-center gap-3 z-10">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-500/25 to-violet-500/25 border border-blue-400/25 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                    <Bot className="h-[18px] w-[18px] text-blue-300" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#090d1a] shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
                </div>
                {/* Name + status */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13.5px] font-bold text-white tracking-wide leading-none">ديبو</span>
                    <span className="text-[10px] text-slate-500 font-normal leading-none mt-0.5">| Depo</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400/80 mt-0.5 font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                    متصل الآن
                  </span>
                </div>
              </div>

              {/* Right side: Action buttons (History, New Chat, Close) */}
              <div className="flex items-center gap-1.5 z-10">
                {/* Chat History Toggle */}
                <button
                  onClick={() => setShowHistory(prev => !prev)}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border",
                    showHistory 
                      ? "bg-blue-600/20 text-blue-400 border-blue-500/30" 
                      : "text-slate-400 hover:text-white hover:bg-white/8 border-transparent"
                  )}
                  title={showHistory ? "العودة للمحادثة" : "سجل المحادثات"}
                >
                  <History className="h-4.5 w-4.5" />
                </button>

                {/* New Chat Button */}
                <button
                  onClick={handleStartNewChat}
                  type="button"
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-white/8 transition-all duration-200 cursor-pointer"
                  title="محادثة جديدة"
                >
                  <Plus className="h-4.5 w-4.5" />
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showHistory ? (
              /* History Screen */
              <div className="flex-1 flex flex-col bg-[#090d1a] p-5 overflow-y-auto space-y-4 chat-scrollbar">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2 shrink-0">
                  <h3 className="text-[13px] font-bold text-white flex items-center gap-2">
                    <History className="h-4.5 w-4.5 text-violet-400" />
                    سجل المحادثات السابقة
                  </h3>
                  <button
                    onClick={handleStartNewChat}
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    محادثة جديدة
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 space-y-3 py-12">
                    <History className="h-12 w-12 text-slate-700 animate-pulse" />
                    <p className="text-sm font-medium">لا توجد محادثات سابقة محفوظة</p>
                    <p className="text-xs text-slate-600">ابدأ بالتحدث مع ديبو لحفظ الجلسة</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sessions.map(s => {
                      const dateStr = new Date(s.timestamp).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      const isActive = s.id === activeSessionId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSession(s)}
                          className={cn(
                            "group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-right",
                            isActive 
                              ? "bg-blue-600/15 border-blue-500/40 hover:bg-blue-600/20" 
                              : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className={cn("text-xs font-semibold truncate", isActive ? "text-blue-400" : "text-slate-200")}>
                              {s.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-sans block mt-1">{dateStr}</span>
                          </div>
                          
                          <button
                            onClick={(e) => handleDeleteSession(e, s.id)}
                            type="button"
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
                            title="حذف المحادثة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Normal Chat screen (Messages + Input) */
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 chat-scrollbar">
                  {messages.map((msg, i) => {
                    const emotionStyles = getEmotionDetails(msg.emotion);
                    return (
                      <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-start" : "items-end")}>
                        {msg.role === 'ai' && (
                          <div className="flex items-start gap-2.5 max-w-[90%] flex-row-reverse">
                            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20 shadow-sm">
                              <Bot className="h-4.5 w-4.5" />
                            </div>
                            <div className="flex flex-col items-start gap-1.5 w-full">
                              {emotionStyles && (
                                <div className="flex">
                                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shadow-sm transition-all duration-300 backdrop-blur-sm", emotionStyles.bg, emotionStyles.glow)}>
                                    <span className="text-xs">{emotionStyles.emoji}</span>
                                    <span>الوضع النفسي المكتشف: {emotionStyles.label}</span>
                                  </span>
                                </div>
                              )}
                              <div className="bg-white/[0.04] backdrop-blur-md px-4.5 py-3.5 rounded-2xl rounded-tr-none text-slate-100 text-[14px] leading-relaxed border border-white/5 shadow-xl text-right w-full">
                                {msg.text}
                              </div>

                              {/* Recommendations */}
                              {msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 w-full text-right shadow-inner space-y-2.5 mt-1">
                                  <p className="text-[11px] font-bold text-violet-400 flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                                    خطوات عملية مقترحة لك:
                                  </p>
                                  <div className="space-y-1.5">
                                    {msg.recommendations.map((rec, ri) => {
                                      const isDone = completedRecs[`${i}-${ri}`];
                                      return (
                                        <div
                                          key={ri}
                                          onClick={() => toggleRec(i, ri)}
                                          className={cn(
                                            "p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-right group",
                                            isDone 
                                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80 line-through" 
                                              : "bg-white/[0.01] border-white/[0.04] hover:border-white/10 hover:bg-white/[0.03] text-slate-300"
                                          )}
                                        >
                                          <span className="text-[12px] flex-1 leading-relaxed font-sans">{rec}</span>
                                          <div className={cn(
                                            "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all",
                                            isDone 
                                              ? "bg-emerald-500 border-emerald-500 text-white" 
                                              : "border-white/20 group-hover:border-white/40"
                                          )}>
                                            {isDone && (
                                              <svg className="h-2.5 w-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                              </svg>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Closing message */}
                              {msg.closing && (
                                <div className="relative bg-gradient-to-r from-blue-500/5 to-violet-500/5 border border-white/[0.04] rounded-xl px-4 py-2.5 text-[11px] text-slate-300 italic text-right w-full flex items-start gap-1.5 shadow-sm mt-0.5">
                                  <span className="text-violet-400/50 text-base leading-none font-serif shrink-0">“</span>
                                  <span className="flex-1 font-sans">{msg.closing}</span>
                                </div>
                              )}

                              {/* Video suggestion */}
                              {msg.video && (
                                <a
                                  href={msg.video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full group mt-1 block"
                                >
                                  <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-blue-500/30 transition-all duration-300 shadow-md">
                                    <div className="relative h-28 w-full overflow-hidden">
                                      <img
                                        src={msg.video.thumbnail}
                                        alt={msg.video.title}
                                        className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-102 transition-all duration-500"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-10 w-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all duration-200">
                                          <svg className="h-4.5 w-4.5 text-white fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                      </div>
                                      <span className="absolute top-2 right-2 bg-red-600/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">
                                        فيديو مقترح
                                      </span>
                                    </div>
                                    <div className="px-3.5 py-2 bg-[#0c1022]">
                                      <div className="text-[11px] text-slate-200 font-semibold group-hover:text-blue-400 transition-colors leading-normal text-right font-sans truncate">
                                        {msg.video.title}
                                      </div>
                                      <p className="text-[9px] text-slate-500 text-right mt-0.5 font-sans">انقر للتشغيل على يوتيوب</p>
                                    </div>
                                  </div>
                                </a>
                              )}
                              
                              {/* Mini Actions Bar under AI Messages */}
                              <div className="flex items-center gap-4 mt-1 px-1 text-slate-500 text-[11px]">
                                <button 
                                  onClick={() => handleCopy(msg.text, i)} 
                                  type="button"
                                  className="hover:text-blue-400 transition-colors flex items-center gap-1 group cursor-pointer"
                                  title="نسخ الرد"
                                >
                                  {copiedIndex === i ? (
                                    <span className="text-emerald-400 font-semibold animate-pulse">تم النسخ!</span>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5 group-hover:scale-105 transition-transform" />
                                      <span>نسخ</span>
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleRegenerate(msg.text, i)}
                                  type="button"
                                  className="hover:text-blue-400 transition-colors flex items-center gap-1 group cursor-pointer"
                                  title="إعادة التوليد"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform" />
                                  <span>إعادة</span>
                                </button>
                                <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                                  <button 
                                    onClick={() => handleFeedback(i, 'like')}
                                    type="button"
                                    className={cn("hover:text-emerald-400 transition-colors cursor-pointer", feedbacks[i] === 'like' && "text-emerald-400")}
                                  >
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleFeedback(i, 'dislike')}
                                    type="button"
                                    className={cn("hover:text-rose-400 transition-colors cursor-pointer", feedbacks[i] === 'dislike' && "text-rose-400")}
                                  >
                                    <ThumbsDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {msg.role === 'user' && (
                          <div className="flex flex-col items-end max-w-[82%]">
                            <div className={cn(
                              "px-5 py-3.5 rounded-3xl rounded-tl-none font-medium overflow-hidden shadow-lg border border-white/10 text-[14.5px] text-right",
                              msg.isVoice 
                                ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center gap-2" 
                                : "bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 text-white"
                            )}>
                              {msg.isImage && msg.imageUrl && (
                                <img src={msg.imageUrl} alt="صورة مرسلة" className="mb-2 rounded-xl max-w-full h-auto border border-white/20 shadow" />
                              )}
                              <div className="flex items-center gap-2 flex-row-reverse">
                                {msg.isVoice && <Mic className="h-4.5 w-4.5 animate-pulse text-white/95" />}
                                <span className="break-words font-sans">{msg.text}</span>
                                {msg.isVoice && msg.duration && (
                                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-sans opacity-90">{msg.duration}ث</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Starter Quick Chips */}
                  {messages.length <= 1 && (
                    <div className="py-4 px-2 space-y-3">
                      <p className="text-xs text-slate-400 text-center font-medium">اختر شعورك الحالي لتبدأ الدردشة معي:</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {STARTER_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInput(prompt.text);
                              handlePredict(prompt.text, null, null);
                            }}
                            className="text-right text-xs px-4 py-3 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-gradient-to-l hover:from-blue-600/20 hover:to-violet-600/20 hover:border-blue-500/30 text-slate-200 hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
                          >
                            {prompt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-start gap-2.5 max-w-[90%] flex-row-reverse">
                      <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20 shadow-sm">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 px-4.5 py-3.5 rounded-2xl rounded-tr-none text-slate-400 italic text-sm shadow-md flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        ديبو يحلل حالتك الوجدانية...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Preview for selected image */}
                {imagePreview && (
                  <div className="px-5 py-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/20 shadow-md">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button 
                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                        type="button"
                        className="absolute top-0 left-0 bg-red-500/90 text-white p-0.5 rounded-br-lg hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 truncate flex-1 text-left font-sans">{selectedImage?.name}</span>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4.5 border-t border-white/10 bg-gradient-to-t from-white/[0.02] to-transparent shrink-0">
                  <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageSelect} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    
                    {/* Image Attach Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-12 w-12 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all duration-200 bg-white/[0.04] border border-white/10 hover:border-blue-500/30 cursor-pointer hover:scale-105"
                      title="إرفاق صورة"
                    >
                      <ImageIcon className="h-5.5 w-5.5" />
                    </button>

                    {/* Text & Voice Input Field Wrapper */}
                    <div className="relative flex-1">
                      {isRecording ? (
                        <div className="w-full bg-rose-950/20 border border-rose-500/30 rounded-full px-6 py-3.5 pr-14 pl-16 text-rose-300 flex items-center justify-between">
                          <span className="text-xs font-semibold animate-pulse font-sans">جاري التسجيل... {recordingTime}ث</span>
                          
                          {/* CSS-animated voice wave bars */}
                          <div className="flex items-center gap-1 pl-2">
                            <div className="wave-glow-bar bg-rose-500 w-[3px] rounded-full"></div>
                            <div className="wave-glow-bar bg-rose-500 w-[3px] rounded-full"></div>
                            <div className="wave-glow-bar bg-rose-500 w-[3px] rounded-full"></div>
                            <div className="wave-glow-bar bg-rose-500 w-[3px] rounded-full"></div>
                            <div className="wave-glow-bar bg-rose-500 w-[3px] rounded-full"></div>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={isLoading ? "ديبو يفكر..." : "تحدث مع ديبو عن مشاعرك..."}
                          disabled={isLoading}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-3.5 pr-6 pl-14 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50 text-[14px]"
                        />
                      )}
                      
                      {/* Floating Mic/Stop Button inside input bar */}
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                          "absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105",
                          isRecording 
                            ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse" 
                            : "bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/30"
                        )}
                        title={isRecording ? "إيقاف التسجيل" : "تسجيل رسالة صوتية"}
                      >
                        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4.5 w-4.5" />}
                      </button>
                    </div>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={(!input.trim() && !selectedImage) || isLoading || isRecording}
                      className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/20 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 cursor-pointer shrink-0"
                    >
                      <Send className="h-5 w-5 transform rotate-180" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
