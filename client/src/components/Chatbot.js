import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi 👋 I’m your Civic AI assistant. Ask me anything!", type: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // 🔽 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 Send message (API connected)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, type: "user" };
    setMessages(prev => [...prev, userMsg]);

    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { text: data.reply || "No response", type: "bot" }
      ]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { text: "⚠️ AI not responding. Check backend.", type: "bot" }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* 💬 FLOAT BUTTON */}
      <button style={styles.fab} onClick={() => setOpen(!open)}>
        💬
      </button>

      {/* 💬 CHAT WINDOW */}
      {open && (
        <div style={styles.chatBox}>
          
          {/* HEADER */}
          <div style={styles.header}>🤖 Civic AI</div>

          {/* MESSAGES */}
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.msg,
                  alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                  background: msg.type === "user" ? "#2563eb" : "#e5e7eb",
                  color: msg.type === "user" ? "white" : "black"
                }}
              >
                {msg.text}
              </div>
            ))}

            {/* ⏳ Typing */}
            {loading && (
              <div style={styles.typing}>AI is typing...</div>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* INPUT */}
          <div style={styles.inputBox}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button onClick={sendMessage} style={styles.sendBtn}>
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
}


// 🎨 STYLES
const styles = {
  fab: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    zIndex: 1000,
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
  },

  chatBox: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "300px",
    height: "400px",
    background: "white",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    overflow: "hidden",
    zIndex: 1000
  },

  header: {
    background: "#1e293b",
    color: "white",
    padding: "10px",
    fontWeight: "bold",
    textAlign: "center"
  },

  messages: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  msg: {
    padding: "8px 12px",
    borderRadius: "10px",
    maxWidth: "70%",
    fontSize: "14px"
  },

  typing: {
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic"
  },

  inputBox: {
    display: "flex",
    borderTop: "1px solid #ccc"
  },

  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none"
  },

  sendBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "0 15px",
    cursor: "pointer"
  }
};