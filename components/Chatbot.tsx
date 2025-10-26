import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
// import { firebaseConfig } from '../firebaseConfig'; // FIX: API key should come from process.env, not firebaseConfig.
import ChatIcon from './icons/ChatIcon';
import XIcon from './icons/XIcon';
import SendIcon from './icons/SendIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import RobotIcon from './icons/RobotIcon';

// Define the structure for a chat message
interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize the chat session when the component mounts
  useEffect(() => {
    try {
      // FIX: Initialize GoogleGenAI using the API key from environment variables.
      // Initialize GoogleGenAI and create a chat session.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        // System instruction to define the chatbot's persona.
        config: {
          systemInstruction: 'Anda adalah chatbot asisten virtual untuk "Martabak Juara". Anda ramah, membantu, dan sedikit humoris. Jawab pertanyaan seputar menu, promo, atau cara menjadi member. Jangan menjawab pertanyaan di luar topik martabak.',
        },
      });
      setChat(newChat);
      setHistory([{ role: 'model', text: 'Halo! Ada yang bisa saya bantu seputar Martabak Juara?' }]);
    } catch (error) {
        console.error("Failed to initialize chatbot:", error);
        setHistory([{ role: 'model', text: 'Maaf, chatbot sedang tidak tersedia saat ini.' }]);
    }
  }, []);

  // Scroll to the bottom of the chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use chat.sendMessageStream for a streaming response.
      const responseStream = await chat.sendMessageStream({ message: input });
      
      let modelResponse = '';
      setHistory(prev => [...prev, { role: 'model', text: '' }]); // Add placeholder for model response

      for await (const chunk of responseStream) {
        // Directly access the text from the chunk.
        modelResponse += chunk.text;
        // Update the last message (model's response) in the history
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: modelResponse };
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setHistory(prev => [...prev, { role: 'model', text: 'Maaf, terjadi kesalahan. Coba lagi nanti.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-transform transform hover:scale-110 z-50"
        aria-label="Buka chatbot"
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-full max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in-up z-50">
          <header className="flex items-center justify-between p-4 bg-yellow-400 text-yellow-900 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <RobotIcon className="h-6 w-6" />
              <h3 className="font-bold text-lg">Asisten Martabak Juara</h3>
            </div>
          </header>

          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {history.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0"><RobotIcon className="h-5 w-5 text-yellow-900" /></div>}
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0"><RobotIcon className="h-5 w-5 text-yellow-900" /></div>
                <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                  <SpinnerIcon className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaanmu..."
                rows={1}
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-yellow-500 focus:border-yellow-500"
                disabled={!chat || isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || !chat}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-yellow-500 hover:text-yellow-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                aria-label="Kirim pesan"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;