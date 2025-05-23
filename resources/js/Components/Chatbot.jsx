import React, { createContext, useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  const faqs = [
    "Có những loại phòng nào trong hệ thống?",
    "Giá phòng bao nhiêu?",
    "Sức chứa tối đa của phòng là bao nhiêu?",
    "Có ưu đãi nào đang áp dụng không?",
    "Làm thế nào để đặt phòng?"
  ];

  useEffect(() => {
    setIsOpen(propIsOpen);
  }, [propIsOpen]);

  const toggleChatbot = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => setUserInput(e.target.value);

  const handleSendMessage = async (e, faqText = null) => {
    e.preventDefault();
    const inputText = faqText || userInput;
    if (!inputText.trim()) return;

    const userMsg = { sender: "user", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chatbot", { prompt: inputText });
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

  const handleFaqClick = (faqText) => (e) => {
    handleSendMessage(e, faqText);
  };

  const parseMessageText = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const [fullMatch, linkText, url] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        parts.push(text.slice(lastIndex, startIndex));
      }

            parts.push(
        <a
          key={startIndex}
          href={url}
          className="chatbot-link"
          onClick={(e) => {
            e.preventDefault(); // Ngăn tải lại trang mặc định
            window.location.href = url; // Điều hướng thủ công
            setIsOpen(false); // Đóng chatbot
          }}
        >
          {linkText}
        </a>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
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
                {messages.length === 1 && (
                  <div className="chatbot-message bot faq-message">
                    <p>Câu hỏi thường gặp:</p>
                    <div className="faq-container">
                      {faqs.map((faq, idx) => (
                        <button
                          key={idx}
                          className="faq-button"
                          onClick={handleFaqClick(faq)}
                          disabled={isLoading}
                        >
                          {faq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chatbot-message ${msg.sender}`}>
                    <p style={{ whiteSpace: "pre-line" }}>
                      {parseMessageText(msg.text)}
                    </p>
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