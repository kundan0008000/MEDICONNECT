import React, { useContext, useRef, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const Chatbot = () => {
  const { backendUrl } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm MediConnect AI Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to chatbot
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${backendUrl}/api/chatbot/send-message`, {
        message: inputMessage,
      });

      if (data.success) {
        const botMsg = {
          id: messages.length + 2,
          text: data.reply,
          sender: "bot",
          timestamp: data.timestamp,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.log(error);
      const errorMsg = {
        id: messages.length + 2,
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = typeof timestamp === 'string' || typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    if (!(date instanceof Date) || isNaN(date)) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Suggested questions
  const suggestions = [
    "I have a fever",
    "How to book appointment?",
    "Tell me about medicines",
    "24/7 ambulance service",
  ];

  const handleSuggestion = async (suggestion) => {
    setInputMessage(suggestion);

    // Trigger send message automatically
    const userMsg = {
      id: messages.length + 1,
      text: suggestion,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${backendUrl}/api/chatbot/send-message`, {
        message: suggestion,
      });

      if (data.success) {
        const botMsg = {
          id: messages.length + 2,
          text: data.reply,
          sender: "bot",
          timestamp: data.timestamp,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Button - Fixed at bottom right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center text-3xl transition transform hover:scale-110 active:scale-95"
          title="Open Chat"
        >
          💬
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl flex flex-col h-96 border border-blue-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">🤖 MediConnect AI</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions - Show if conversation is just starting */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(suggestion)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
              >
                Send
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="text-xs text-gray-500 text-center p-2 border-t border-gray-200">
            For emergencies, call 🚑
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
