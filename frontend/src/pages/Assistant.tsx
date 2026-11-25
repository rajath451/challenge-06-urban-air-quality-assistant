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
  Headphones
} from 'lucide-react';
import { EnvironmentalReadings, LocationInfo, ChatMessage } from '../types';
import { askAssistant } from '../services/api';

interface AssistantProps {
  readings: EnvironmentalReadings;
  currentLocation: LocationInfo;
}

// Clean formatted markdown renderer for Assistant outputs (no exposed raw markdown symbols)
const FormattedAssistantMessage: React.FC<{ content: string }> = ({ content }) => {
  // Normalize bullet symbols (• or ●) to standard markdown unordered list items
  const normalized = content.replace(/^[•●]\s*/gm, '- ');

  return (
    <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed space-y-2">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 font-normal">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-4 list-disc marker:text-emerald-700">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1.5 pl-4 list-decimal marker:text-emerald-700">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed pl-1 text-slate-800">{children}</li>,
          h1: ({ children }) => <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-3 mb-1.5">{children}</h3>,
          h2: ({ children }) => <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-2.5 mb-1">{children}</h4>,
          h3: ({ children }) => <h5 className="font-bold text-xs text-slate-900 mt-2 mb-1">{children}</h5>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md font-mono text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-emerald-600 pl-3 my-2 text-slate-600 italic">
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
  currentLocation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **VayuCoach Environmental Decision Intelligence Copilot** powered by Google Gemini.\n\nI am grounded in live monitoring telemetry for **${currentLocation.name}**:\n- **CPCB Indian NAQI**: **${readings.indian_naqi} (${readings.indian_naqi_category})**\n- **PM2.5**: **${readings.pm2_5} µg/m³**\n- **Coastal Wind**: **${readings.wind_speed} km/h** (${readings.weather_condition})\n\nYou can speak to me using the **Microphone** button or listen to recommendations with the **Audio Readout**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

    // Cancel speech on unmount
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

    // Pick best Indian English or clear English voice if available
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
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
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

    // Stop ongoing speech before recording
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

  const quickPrompts = [
    'Should I exercise outdoors right now or postpone?',
    'Should I open or close my home windows today?',
    'How does deep frying (tadka) affect my indoor PM2.5?',
    'Explain the difference between Indian NAQI and US AQI.',
    'Why is the afternoon breeze cleaner than morning air?'
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
      const response = await askAssistant(query, messages, readings, currentLocation);

      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // If Auto Voice Output is enabled, speak out the AI reply
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in flex flex-col h-[calc(100vh-5.5rem)]">
      
      {/* Grounded Telemetry & Voice Control Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs mb-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-sans">
                VayuCoach Voice & Decision Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                CPCB Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Live Station: {currentLocation.name.split(',')[0]} • NAQI {readings.indian_naqi} • PM2.5: {readings.pm2_5} µg/m³
            </p>
          </div>
        </div>

        {/* Voice Controls: Auto-Speak toggle & Speaking indicator */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200 animate-pulse hover:bg-red-100 transition"
              title="Stop voice playback"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">Stop Audio</span>
            </button>
          )}

          <button
            onClick={() => {
              setAutoVoiceReply(!autoVoiceReply);
              if (isSpeaking) stopSpeaking();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              autoVoiceReply
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Automatically read aloud new assistant replies"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[11px]">Voice Readout: {autoVoiceReply ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Mic listening alert banner */}
      {isListening && (
        <div className="mb-2 p-2.5 rounded-xl bg-emerald-950 text-emerald-200 border border-emerald-700 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-emerald-300">Listening to your voice... Speak now</span>
          </div>
          <button
            onClick={toggleListening}
            className="px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-medium"
          >
            Done Speaking
          </button>
        </div>
      )}

      {speechError && (
        <div className="mb-2 p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-center justify-between">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-600 hover:underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCurrentlySpeakingThis = activeSpeechMsgId === msg.id && isSpeaking;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-800 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-[85%] sm:max-w-[75%] space-y-1.5">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-emerald-800 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans text-white">
                      {msg.content}
                    </div>
                  ) : (
                    <div>
                      <FormattedAssistantMessage content={msg.content} />

                      {/* Listen to Audio Button for Bot Message */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => speakText(msg.content, msg.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                            isCurrentlySpeakingThis
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200/80'
                          }`}
                        >
                          {isCurrentlySpeakingThis ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-red-600" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Listen Aloud</span>
                            </>
                          )}
                        </button>
                        {isCurrentlySpeakingThis && (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-mono">
                            <Radio className="w-3.5 h-3.5 animate-spin" />
                            <span>Speaking...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className={`text-[10px] font-mono text-slate-400 block ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-mono ml-1">Grounded atmospheric reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Chips */}
      <div className="py-2 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isTyping}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-700 whitespace-nowrap shadow-2xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field with Microphone & Voice Action */}
      <div className="pt-2 shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening... Speak your air quality question..." : "Ask or speak about exercise, opening windows, coastal breeze, or indoor smoke..."}
            disabled={isTyping}
            className={`w-full pl-4 pr-24 py-3 rounded-xl border bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden shadow-2xs transition-all ${
              isListening
                ? 'border-emerald-600 ring-2 ring-emerald-200 bg-emerald-50/30'
                : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
            }`}
          />
          
          <div className="absolute right-1.5 flex items-center gap-1.5">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isTyping}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
              title={isListening ? "Stop listening" : "Speak your question (Voice Input)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-sans">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Voice-enabled assistant • Speech-to-Text & Text-to-Speech active</span>
          </span>
          <span className="font-mono text-slate-400 hidden sm:inline">
            VayuCoach × Gemini Voice
          </span>
        </div>
      </div>

    </div>
  );
};
