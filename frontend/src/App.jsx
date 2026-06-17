import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

const initialAssistantMessage = {
  id: `m-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
  sender: "ai",
  text: "👋 Halo, saya Lumina AI.\n\nAsisten Pembelajaran AI pribadi Anda.\n\nPilih tingkat penjelasan yang Anda inginkan — Beginner, Intermediate, atau Expert — dan saya akan membantu Anda memahami konsep, teknologi, dan pengetahuan kompleks dengan cara yang jelas, terstruktur, dan mudah dipahami.",
  justAdded: false,
};

// Animated Typing Indicator (3 dots)
const AnimatedTyping = () => (
  <div className="typing-indicator">
    <span>Lumina AI is typing</span>
    <span className="typing-dot">.</span>
    <span className="typing-dot typing-dot-2">.</span>
    <span className="typing-dot typing-dot-3">.</span>
  </div>
);

// Markdown Content - simple rendering
const MarkdownContent = ({ children }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="markdown-p">{children}</p>,
      ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
      ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
      li: ({ children }) => <li className="markdown-li">{children}</li>,
      strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
      em: ({ children }) => <em className="markdown-em">{children}</em>,
      code: ({ inline, children }) => inline ? 
        <code className="markdown-inline-code">{children}</code> :
        <pre className="markdown-code-block"><code>{children}</code></pre>,
      h1: ({ children }) => <h2 className="markdown-h1">{children}</h2>,
      h2: ({ children }) => <h3 className="markdown-h2">{children}</h3>,
      blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
    }}
  >
    {children}
  </ReactMarkdown>
);

// Copy button handler
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

const QUOTA_STORAGE_KEY = "luminaQuotaInfo";
const DEFAULT_QUOTA_LIMIT = 50;
const DEFAULT_QUOTA_PERIOD = "daily";

const getNextResetDate = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(14, 0, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

const formatResetText = (isoString) => {
  const date = new Date(isoString);
  const dateString = date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${dateString} pukul 14:00 WIB`;
};

const createDefaultQuotaInfo = () => ({
  tier: "Free Tier",
  limit: DEFAULT_QUOTA_LIMIT,
  used: 0,
  period: DEFAULT_QUOTA_PERIOD,
  resetAt: getNextResetDate().toISOString(),
});

const loadQuotaInfo = () => {
  try {
    const saved = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (!saved) return createDefaultQuotaInfo();
    const parsed = JSON.parse(saved);
    const resetAt = new Date(parsed.resetAt);
    if (isNaN(resetAt.getTime()) || resetAt <= new Date()) {
      const period = parsed.period || DEFAULT_QUOTA_PERIOD;
      return {
        ...createDefaultQuotaInfo(),
        period,
      };
    }
    return {
      ...createDefaultQuotaInfo(),
      ...parsed,
      resetAt: resetAt.toISOString(),
    };
  } catch {
    return createDefaultQuotaInfo();
  }
};

const saveQuotaInfo = (info) => {
  localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(info));
};

function App() {

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [quotaMessage, setQuotaMessage] =
    useState(null);

  const [apiError, setApiError] =
    useState(null);

  const [copiedId, setCopiedId] = useState(null);
  const [level, setLevel] = useState(() => localStorage.getItem("userLevel") || "beginner");
  const [quotaInfo, setQuotaInfo] = useState(() => loadQuotaInfo());

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // SAVE LEVEL KE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("userLevel", level);
  }, [level]);

  // LOAD QUOTA INFO DARI LOCAL STORAGE
  useEffect(() => {
    const fresh = loadQuotaInfo();
    setQuotaInfo(fresh);
    saveQuotaInfo(fresh);
  }, []);

  // LOAD CHAT DARI LOCAL STORAGE
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    if (!saved) return [initialAssistantMessage];

    try {
      const parsed = JSON.parse(saved);
      return parsed.map((m) => ({
        id: m.id || `m-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        sender: m.sender,
        text: m.text,
        justAdded: false,
      }));
    } catch (e) {
      return [initialAssistantMessage];
    }
  });

  // AUTO SCROLL CHAT
  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, loading]);

  // SAVE CHAT KE LOCAL STORAGE
  useEffect(() => {

    localStorage.setItem(
      "chatMessages",
      JSON.stringify(messages)
    );

  }, [messages]);

  // AUTO RESIZE TEXTAREA
  useEffect(() => {

    if (textareaRef.current) {

      textareaRef.current.style.height =
        "auto";

      textareaRef.current.style.height =
        `${textareaRef.current.scrollHeight}px`;
    }

  }, [message]);

  // CLEAR CHAT
  const clearChat = () => {

    setMessages([
      {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        sender: "ai",
        text:
          "👋 Halo, saya Lumina AI.\n\nAsisten Pembelajaran AI pribadi Anda.\n\nPilih tingkat penjelasan yang Anda inginkan — Beginner, Intermediate, atau Expert — dan saya akan membantu Anda memahami konsep, teknologi, dan pengetahuan kompleks dengan cara yang jelas, terstruktur, dan mudah dipahami.",
        justAdded: false,
      },
    ]);

    localStorage.removeItem("chatMessages");

    setApiError(null);
    setQuotaMessage(null);
  };

  // FORMAT HURUF BESAR USER
  const formatUserText = (text) => {

    if (!text) return "";

    return (
      text.charAt(0).toUpperCase() +
      text.slice(1)
    );
  };

  // SEND MESSAGE
  const sendMessage = async () => {

    // CEGAH SPAM
    if (loading) return;

    // INPUT KOSONG
    if (!message.trim()) return;

    // RESET ERROR
    setApiError(null);
    setQuotaMessage(null);

    // SIMPAN PESAN
    const current = message;

    // TAMPILKAN PESAN USER (beri id dan flag justAdded)
    const userId = `m-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userId,
        sender: "user",
        text: current,
        justAdded: true,
      },
    ]);

    // hapus flag justAdded setelah animasi selesai
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === userId ? { ...m, justAdded: false } : m)));
    }, 420);

    // KOSONGKAN INPUT
    setMessage("");

    // LOADING ON
    setLoading(true);

    try {

      // REQUEST KE BACKEND
      const res = await fetch(
        "http://localhost:3000/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: current,
            level: level,
          }),
        }
      );

      const data = await res.json();

      // HANDLE ERROR
      if (!res.ok) {

        // ERROR QUOTA
        if (res.status === 429) {

          setQuotaMessage(
            data.details ||
            data.error ||
            "AI quota exhausted. Please try again later."
          );

        } else {

          setApiError(
            data.error ||
            "Terjadi error pada AI"
          );

        }

        return;
      }

      // TAMPILKAN BALASAN AI (dengan animasi masuk)
      const aiId = `m-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          sender: "ai",
          text: data.reply,
          justAdded: true,
        },
      ]);

      setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, justAdded: false } : m)));
      }, 420);

      const nextQuota = {
        ...quotaInfo,
        used: Math.min(quotaInfo.limit, quotaInfo.used + 1),
      };
      setQuotaInfo(nextQuota);
      saveQuotaInfo(nextQuota);

    } catch (err) {

      console.error(err);

      setApiError(
        "An error occurred with the AI"
      );

      const errId = `m-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      setMessages((prev) => [
        ...prev,
        {
          id: errId,
          sender: "ai",
          text: "An error occurred 😢",
          justAdded: true,
        },
      ]);

      setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === errId ? { ...m, justAdded: false } : m)));
      }, 420);

    } finally {

      // LOADING OFF
      setLoading(false);

    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <img 
            src="../Header lumina AI.png" 
            alt="Lumina AI Header" 
            className="header-image"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* QUOTA MESSAGE */}
        {quotaMessage && (
          <div className="status-banner status-warning">
            <div>{quotaMessage}</div>
            <button onClick={() => setQuotaMessage(null)}>Close</button>
          </div>
        )}

        {/* API ERROR */}
        {apiError && (
          <div className="status-banner status-error">
            <div>{apiError}</div>
            <button onClick={() => setApiError(null)}>Close</button>
          </div>
        )}

      </header>

      {/* CHAT AREA */}
      <main className="chat-area">

        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender} ${msg.justAdded ? 'enter' : ''}`}>
            {msg.sender === "ai" && <div className="message-avatar ai-avatar">🤖</div>}
            
            <div className="message-bubble-wrapper">
              <div className="message-bubble">
                {msg.sender === "user" ? formatUserText(msg.text) : <MarkdownContent>{msg.text}</MarkdownContent>}
              </div>
              
              <button 
                className="message-copy-btn"
                onClick={() => {
                  copyToClipboard(msg.text);
                  setCopiedId(msg.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                title="Copy message"
              >
                {copiedId === msg.id ? "✓ Copied!" : "📋"}
              </button>
            </div>

            {msg.sender === "user" && <div className="message-avatar user-avatar">🧑‍🎓</div>}
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="message-row ai">
            <div className="message-avatar ai-avatar">🤖</div>
            <AnimatedTyping />
          </div>
        )}

        {/* AUTO SCROLL TARGET */}
        <div ref={chatEndRef} />

      </main>

      {/* INPUT AREA */}
      <footer className="chat-input-panel">

        {/* LEVEL SELECTOR */}
        <div className="level-selector-container">
          <span className="level-label">Choose level:</span>
          <div className="level-buttons">
            {[
              { id: 'beginner', icon: '🎓', label: 'Beginner' },
              { id: 'intermediate', icon: '🧑‍💻', label: 'Intermediate' },
              { id: 'expert', icon: '🚀', label: 'Expert' }
            ].map(btn => (
              <button
                key={btn.id}
                className={`level-btn ${level === btn.id ? 'active' : ''}`}
                onClick={() => setLevel(btn.id)}
              >
                <span className="level-icon">{btn.icon}</span>
                <span className="level-text">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="input-card">
          {/* TEXTAREA */}
          <textarea
            ref={textareaRef}
            rows="1"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }

            onKeyDown={(e) => {

              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {

                e.preventDefault();

                sendMessage();
              }
            }}

            placeholder="Ask a question..."

            className="w-full bg-transparent text-white resize-none outline-none text-[15px] leading-relaxed max-h-[200px] pr-24 pb-10 overflow-y-auto"
          />

          {/* BUTTON AREA */}
          <div className="controls">
            <button type="button" className="button-clear" onClick={clearChat}>
              Clear Chat
            </button>

            <button
              type="button"
              className="button-send"
              onClick={sendMessage}
              disabled={!message.trim() || loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

        </div>

        {/* INFO */}
        <p className="footer-note">Press Enter to send, Shift + Enter for newline.</p>

        {/* QUOTA CARD - BOTTOM */}
        <div className="quota-card">
          <div className="quota-card-top">
            <div>
              <div className="quota-tier">{quotaInfo.tier}</div>
              <div className="quota-description">Available quota level & usage status</div>
            </div>
            <span className="quota-period">Reset: {quotaInfo.period === 'monthly' ? 'monthly' : 'daily'}</span>
          </div>

          <div className="quota-values">
            <div className="quota-block">
              <div className="quota-label">Total quota</div>
              <div className="quota-value">{quotaInfo.limit} request</div>
            </div>
            <div className="quota-block">
              <div className="quota-label">Used</div>
              <div className="quota-value">{quotaInfo.used} request</div>
            </div>
            <div className="quota-block">
              <div className="quota-label">Remaining</div>
              <div className="quota-value">{Math.max(0, quotaInfo.limit - quotaInfo.used)} request</div>
            </div>
          </div>

          <div className="quota-progress-bar">
            <div
              className="quota-progress-fill"
              style={{ width: `${Math.min(100, (quotaInfo.used / quotaInfo.limit) * 100)}%` }}
            />
          </div>

          <div className="quota-meta">Next reset: {formatResetText(quotaInfo.resetAt)}</div>
        </div>

      </footer>

    </div>
  );
}

export default App;