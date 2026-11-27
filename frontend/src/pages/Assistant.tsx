import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Headphones,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  Trash2,
  Compass,
  Wind,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { EnvironmentalReadings, LocationInfo, ChatMessage } from '../types';
import { askAssistant } from '../services/api';

interface AssistantProps {
  readings: EnvironmentalReadings | null;
  currentLocation: LocationInfo | null;
  onOpenCityModal?: () => void;
}

// Clean formatted markdown renderer for Assistant outputs (no exposed raw markdown symbols)
const FormattedAssistantMessage: React.FC<{ content: string }> = ({ content }) => {
  const normalized = content.replace(/^[•●]\s*/gm, '- ');

  return (
    <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed space-y-2 font-sans">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 font-normal">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-4 list-disc marker:text-emerald-600">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1.5 pl-4 list-decimal marker:text-emerald-600">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed pl-1 text-slate-800">{children}</li>,
          h1: ({ children }) => <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 mt-3 mb-1.5">{children}</h3>,
          h2: ({ children }) => <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 mt-2.5 mb-1">{children}</h4>,
          h3: ({ children }) => <h5 className="font-heading font-bold text-xs text-slate-900 mt-2 mb-1">{children}</h5>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md font-mono text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-emerald-600 pl-3 my-2 text-slate-600 italic bg-emerald-50/40 py-1 rounded-r">
              {children}
            </blockquote>
          )
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
};

// Strips markdown symbols for natural speech synthesis
function cleanMarkdownForSpeech(text: string): string {
  return text
    .replace(/[*#_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[•●-]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const Assistant: React.FC<AssistantProps> = ({
  readings,
  currentLocation,
  onOpenCityModal
}) => {
  const initialWelcomeMsg: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: currentLocation && readings
      ? `Hello! I am your **VayuCoach Environmental Decision Intelligence Copilot** powered by Google Gemini.\n\nI am grounded in live monitoring telemetry for **${currentLocation.name}**:\n- **CPCB Indian NAQI**: **${readings.indian_naqi} (${readings.indian_naqi_category})**\n- **PM2.5**: **${readings.pm2_5} µg/m³**\n- **Atmospheric Wind**: **${readings.wind_speed} km/h** (${readings.weather_condition})\n\nYou can ask me about workout timings, indoor air safety, or speak using the **Microphone**!`
      : `Hello! I am your **VayuCoach Environmental Decision Intelligence Copilot** powered by Google Gemini.\n\nNo monitoring station has been selected yet. Please select an active monitoring station so I can calibrate my advice with real-time CPCB telemetry!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMsg]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Check speech synthesis & recognition capability
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition && !window.speechSynthesis) {
      setVoiceSupported(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Text-To-Speech Synthesizer
  const speakText = useCallback((text: string, msgId?: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (msgId && activeSpeechMsgId === msgId && isSpeaking) {
      setIsSpeaking(false);
      setActiveSpeechMsgId(null);
      return;
    }

    const cleanText = cleanMarkdownForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(v => v.lang === 'en-IN' || v.name.includes('India')) ||
      voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setActiveSpeechMsgId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [activeSpeechMsgId, isSpeaking]);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechMsgId(null);
    }
  };

  // Speech-To-Text Recognition
  const toggleListening = () => {
    setSpeechError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(`Microphone issue: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech initialization error:', err);
      setSpeechError('Could not access microphone. Please grant browser microphone permission.');
      setIsListening(false);
    }
  };

  // Section 5.A Suggested Questions
  const suggestedQuestions = [
    'Is the air quality safe for outdoor exercise?',
    'Should I go running today?',
    'What is causing the current pollution level?',
    'How can I improve my indoor air quality?',
    'Explain today\'s PM2.5 reading.',
    'What precautions should I take today?'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }

    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await askAssistant(query, messages, readings || undefined, currentLocation || undefined);

      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      if (autoVoiceReply) {
        speakText(response.reply, botMsgId);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting to the decision engine right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleClearChat = () => {
    stopSpeaking();
    setMessages([initialWelcomeMsg]);
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in flex flex-col h-[calc(100vh-5.5rem)] font-sans">
      
      {/* Top Header & Environmental Context Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs mb-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-heading font-bold text-slate-900 truncate">
                AI Copilot • Environmental Decision Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                Gemini Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              {currentLocation
                ? `${currentLocation.name.split(',')[0]} • CPCB NAQI ${readings?.indian_naqi ?? '--'} (${readings?.indian_naqi_category ?? 'Unselected'}) • PM2.5: ${readings?.pm2_5 ?? '--'} µg/m³`
                : 'No station selected • Click Switch Station above to calibrate'}
            </p>
          </div>
        </div>

        {/* Voice Controls: Status pills & Auto-Speak toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Animated Audio Waveform (Active when listening or speaking) */}
          {(isListening || isSpeaking) && (
            <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono">
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="text-[10px] font-semibold ml-1">
                {isListening ? 'Listening' : 'Speaking'}
              </span>
            </div>
          )}

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
              title="Stop audio readout"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">Stop</span>
            </button>
          )}

          <button
            onClick={() => {
              setAutoVoiceReply(!autoVoiceReply);
              if (isSpeaking) stopSpeaking();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
              autoVoiceReply
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle automatic audio readouts for AI responses"
          >
            {autoVoiceReply ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">Voice:</span>
            <span>{autoVoiceReply ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleClearChat}
            title="Reset conversation"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speech error banner */}
      {speechError && (
        <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-700 font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs mb-3">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const isMsgSpeaking = activeSpeechMsgId === message.id && isSpeaking;

          return (
            <div
              key={message.id}
              className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm shadow-2xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200/80 rounded-tl-xs text-slate-800'
                  }`}
                >
                  {isUser ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <FormattedAssistantMessage content={message.content} />
                  )}
                </div>

                {/* Message Footer Actions */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] font-mono text-slate-400">
                  <span>{message.timestamp}</span>

                  {!isUser && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => handleCopyMessage(message.id || String(Math.random()), message.content)}
                        className="hover:text-emerald-700 flex items-center gap-0.5 transition cursor-pointer"
                        title="Copy response"
                      >
                        {copiedMsgId === message.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <span>•</span>
                      <button
                        onClick={() => speakText(message.content, message.id)}
                        className={`flex items-center gap-0.5 transition cursor-pointer ${
                          isMsgSpeaking ? 'text-emerald-600 font-bold' : 'hover:text-emerald-700'
                        }`}
                        title={isMsgSpeaking ? 'Stop speaking' : 'Listen aloud'}
                      >
                        {isMsgSpeaking ? <VolumeX className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                        <span>{isMsgSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 sm:gap-3 items-center text-slate-500 text-xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Analyzing atmospheric model & generating decision response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Carousel (Section 5.A) */}
      <div className="mb-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1 shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          Suggested:
        </span>
        {suggestedQuestions.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            disabled={isTyping}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/90 hover:border-emerald-300 text-[11px] font-medium whitespace-nowrap transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Message Composer & Large Mic Button (Keyboard-aware layout) */}
      <div className="shrink-0 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-2">
        {/* Large Accessible Microphone Control (44px) */}
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse scale-105'
              : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200'
          }`}
          title={isListening ? 'Tap to stop recording' : 'Speak with Voice Assistant'}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={isListening ? 'Listening to your voice... Speak now...' : 'Ask about air quality, outdoor running, or room ventilation...'}
          disabled={isTyping}
          className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden disabled:opacity-50 font-sans"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
