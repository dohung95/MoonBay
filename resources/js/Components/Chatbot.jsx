import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../../css/Chatbot.css";

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children, isOpen: propIsOpen, setIsOpen: propSetIsOpen }) => {
  const [isOpen, setIsOpen] = useState(propIsOpen || false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì được cho bạn." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsOpen(propIsOpen);
  }, [propIsOpen]);

  const toggleChatbot = () => setIsOpen(!isOpen);
  const handleInputChange = (e) => setUserInput(e.target.value);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chatbot", { prompt: userInput });
      const botMsg = { sender: "bot", text: response.data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu." },
      ]);
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const chatBody = document.querySelector(".chatbot-body");
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, [messages]);

  return (
    <ChatbotContext.Provider value={{ toggleChatbot }}>
      {children}
      <div className="chatbot-container">
        <div className={`chatbot ${isOpen ? "open" : ""}`}>
          <div className="chatbot-header" onClick={toggleChatbot}>
            <h5>Trợ lý AI</h5>
            <span>{isOpen ? "−" : "+"}</span>
          </div>
          {isOpen && (
            <>
              <div className="chatbot-body">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chatbot-message ${msg.sender}`}>
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className="chatbot-message bot">
                    <p>Đang xử lý...</p>
                  </div>
                )}
              </div>
              <form className="chatbot-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Hỏi về phòng, giá, sức chứa..."
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                  Gửi
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
};