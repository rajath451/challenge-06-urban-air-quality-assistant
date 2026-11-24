import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  Lightbulb,
  Info,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { EnvironmentalReadings, LocationInfo, ChatMessage } from '../types';
import { askAssistant } from '../services/api';

interface AssistantProps {
  readings: EnvironmentalReadings;
  currentLocation: LocationInfo;
}

export const Assistant: React.FC<AssistantProps> = ({
  readings,
  currentLocation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **VayuCoach Environmental Decision Intelligence Copilot** powered by Google Gemini.\n\nI am grounded in live monitoring telemetry for **${currentLocation.name}**:\n• **CPCB Indian NAQI**: **${readings.indian_naqi} (${readings.indian_naqi_category})**\n• **PM2.5**: **${readings.pm2_5} µg/m³**\n• **Coastal Wind**: **${readings.wind_speed} km/h** (${readings.weather_condition})\n\nAsk me anything about safe exercise times, window ventilation, cooking exhaust protocols, or particulate dosimetry.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    'Should I exercise outdoors right now or postpone?',
    'Should I open or close my home windows in Mangaluru today?',
    'How does deep frying (tadka) affect my indoor PM2.5?',
    'Explain the difference between Indian NAQI and US AQI.',
    'Why is the afternoon sea breeze cleaner than morning air?'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

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

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col h-[calc(100vh-5.5rem)]">
      
      {/* Grounded Telemetry Strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs mb-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-sans">
                VayuCoach Grounded Assistant
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                CPCB NAQI Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Live Station: {currentLocation.name.split(',')[0]} • NAQI {readings.indian_naqi} • PM2.5: {readings.pm2_5} µg/m³
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-500">
          Source: Open-Meteo & Decision Engine
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
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
                  <div className="space-y-2 whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
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

      {/* Input Field & Disclaimers */}
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
            placeholder="Ask about outdoor runs, opening windows, coastal breeze timings, or indoor frying..."
            disabled={isTyping}
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden shadow-2xs transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-sans">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Environmental guidance only — not a clinical medical diagnostic tool.</span>
          </span>
          <span className="font-mono text-slate-400 hidden sm:inline">
            VayuCoach × Gemini 2.5
          </span>
        </div>
      </div>

    </div>
  );
};
