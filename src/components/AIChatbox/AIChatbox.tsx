import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import { authClient, getAccessToken } from '../../api/auth';
import './AIChatbox.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://api.inkpulse.com/api/v1';

interface ProductCardData {
  id?: string;
  title: string;
  author?: string;
  price?: string;
  category?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  products?: ProductCardData[];
}

const LOADING_STEPS = [
  "Đang tra cứu kho sách...",
  "Đang tổng hợp thông tin...",
  "Đang soạn câu trả lời..."
];

const AIChatbox: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Hide AI Chatbox on authentication & MFA screens
  const hiddenRoutes = [
    '/login',
    '/register',
    '/mfa',
    '/forgot-password',
    '/reset-password',
    '/register-google'
  ];

  const isHidden = hiddenRoutes.some(route => location.pathname.startsWith(route));

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào! Mình là AI hỗ trợ từ InkPulse. Bạn cần tư vấn thông tin về sách, đơn hàng hay ưu đãi nào hôm nay?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming) {
      setLoadingStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIndex(prev => (prev + 1) % LOADING_STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming || !user) return;

    const userQuery = inputMessage.trim();
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    // Append user message and empty assistant placeholder
    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: userQuery },
      { id: assistantMsgId, sender: 'assistant', text: '' }
    ]);

    setInputMessage('');
    setIsStreaming(true);

    try {
      // Get stored JWT in-memory token
      const token = getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/customer/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ message: userQuery })
      });

      if (!response.ok) {
        let errorText = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
        try {
          const errJson = await response.json();
          if (errJson && errJson.message) {
            errorText = errJson.message;
          }
        } catch (_) {}

        setMessages(prev =>
          prev.map(m => m.id === assistantMsgId ? { ...m, text: errorText } : m)
        );
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        setIsStreaming(false);
        return;
      }

      let accumulatedText = '';
      let accumulatedProducts: ProductCardData[] = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            let dataContent = line.slice(5);
            if (dataContent === '[DONE]') {
              break;
            }

            if (dataContent.includes('[[METADATA]]')) {
              const parts = dataContent.split('[[METADATA]]');
              accumulatedText += parts[0];
              try {
                const parsed = JSON.parse(parts[1]);
                if (parsed && parsed.products) {
                  accumulatedProducts = parsed.products;
                }
              } catch (_) {}
            } else {
              accumulatedText += dataContent;
            }
            
            // Update assistant message text in real time
            setMessages(prev =>
              prev.map(m => m.id === assistantMsgId ? { 
                ...m, 
                text: accumulatedText,
                products: accumulatedProducts
              } : m)
            );
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn cho AI:', err);
      setMessages(prev =>
        prev.map(m => m.id === assistantMsgId ? { ...m, text: 'Lỗi kết nối tới AI. Vui lòng thử lại sau!' } : m)
      );
    } finally {
      setIsStreaming(false);
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        className="ai-chatbox-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        title="Trò chuyện cùng AI InkPulse"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="ai-chatbox-modal">
          <div className="ai-chatbox-header">
            <div className="ai-chatbox-header-info">
              <div className="ai-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
                </svg>
              </div>
              <div>
                <h4 className="ai-title">Trợ lý AI InkPulse</h4>
                <p className="ai-subtitle">
                  <span className="ai-subtitle-dot"></span> Đang trực tuyến
                </p>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="ai-messages-container">
            {!user ? (
              <div className="ai-guest-warning">
                <div className="ai-guest-warning-icon">🔒</div>
                <h5>Yêu cầu đăng nhập</h5>
                <p>Bạn cần đăng nhập để sử dụng tính năng trò chuyện với AI của nhà sách.</p>
                <button 
                  className="ai-login-btn"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(ROUTES.LOGIN);
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <div key={msg.id} className={`ai-message-bubble ${msg.sender}`}>
                    {msg.text ? (
                      <>
                        <div>{msg.text}</div>
                        {msg.products && msg.products.length > 0 && (
                          <div className="ai-mentioned-books">
                            {msg.products.map((book, idx) => (
                              <div key={idx} className="ai-product-card">
                                <div className="ai-product-card-header">
                                  <span className="ai-product-badge">{book.category || "Sách InkPulse"}</span>
                                  {book.price && <span className="ai-product-price">{book.price}đ</span>}
                                </div>
                                <div className="ai-product-title">{book.title}</div>
                                {book.author && <div className="ai-product-author">Tác giả: {book.author}</div>}
                                <button 
                                  className="ai-product-action-btn"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/books?search=${encodeURIComponent(book.title)}`);
                                  }}
                                >
                                  Xem chi tiết →
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      msg.sender === 'assistant' && isStreaming && (
                        <div className="ai-typing-indicator">
                          <div className="ai-typing-dots">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                          </div>
                          <span className="ai-loading-step-text" key={loadingStepIndex}>
                            {LOADING_STEPS[loadingStepIndex]}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {user && (
            <div className="ai-chat-input-row">
              <input
                type="text"
                className="ai-chat-input"
                placeholder="Nhập câu hỏi cho AI..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={isStreaming}
              />
              <button 
                className="ai-send-btn" 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isStreaming}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatbox;
