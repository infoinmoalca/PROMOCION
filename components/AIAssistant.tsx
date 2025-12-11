
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Hola, soy tu asistente inmobiliario. ¿En qué puedo ayudarte hoy? Puedo analizar costes, redactar correos o resumir el estado de tus obras.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Pass the *entire* history to the service function, including the new user message context if needed 
      // (though the service function reconstructs it from history array)
      const response = await sendChatMessage(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response || "No pude generar una respuesta." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, hubo un error conectando con Gemini." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Hidden on Print */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 no-print ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window - Hidden on Print */}
      <div
        className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right border border-slate-200 no-print ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: '500px' }}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-emerald-400" />
            <h3 className="font-bold">Asistente PromotorAI</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 size={16} className="animate-spin text-slate-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta sobre tus proyectos..."
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
