import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

export default function FAQ() {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      q: "📍 How do I report a new civic issue?",
      a: "To report an issue: 1. Click on 'Report Issue' in the sidebar. 2. Provide a descriptive title and detailed description. 3. Use the 'Use My Location' button or click on the map to pin the issue location. 4. Drag & drop or upload a photo of the issue. 5. Click 'Submit Issue'."
    },
    {
      q: "🗳️ What does upvoting an issue do?",
      a: "Upvoting allows other citizens to express support for a reported issue. The system ranks issues on the public feed based on upvote count. A higher upvote count signals to administrators that the issue is a high-priority concern for the community."
    },
    {
      q: "🧑‍💼 How are workers assigned to issues?",
      a: "Administrators monitor all submitted issues from the Admin Dashboard. They can view the issue details and select an active sanitation or maintenance worker from the dropdown list to assign the task. The issue status then updates to 'Assigned'."
    },
    {
      q: "👷 What is the workflow for a worker?",
      a: "Once assigned a task, it appears on the worker's dashboard. The worker can click 'Start Work' to change the status to 'In Progress'. Once resolved, the worker uploads a resolution photo and adds description remarks, setting the status to 'Resolved'."
    },
    {
      q: "🔐 How do I enable Google 2FA OTP security?",
      a: "Go to your 'Profile' page from the sidebar. In the 'Two-Factor Authentication' section, click 'Enable 2FA'. Scan the displayed QR code with your Google Authenticator app, enter the 6-digit code shown in the app, and click 'Verify & Enable'."
    },
    {
      q: "🤖 How does the Civic AI chatbot work?",
      a: "The floating chat button on the bottom right connects you to our Civic AI helper. You can ask it general questions, ask how to report issues, or query specific platform workflows. It utilizes advanced AI modeling to guide you."
    },
    {
      q: "📊 Where can I see city resolution statistics?",
      a: "The main Citizen Dashboard displays real-time statistics including total issues, resolved issues, pending issues, and your own contributions. It also renders animated status distribution charts."
    }
  ];

  const filteredFaqs = faqs.filter(
    faq =>
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.main,
        marginLeft: isOpen ? "220px" : "20px"
      }}>
        <h1 style={styles.heading}>❔ Help & FAQ Guide</h1>
        <p style={styles.subtitle}>Find answers to common questions about using the CivicTrack platform.</p>

        {/* 🔍 SEARCH */}
        <input
          placeholder="Search FAQs by keywords..."
          value={search}
          className="glass-input"
          style={styles.searchBar}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.faqList}>
          {filteredFaqs.length === 0 ? (
            <p style={styles.noResults}>No matching questions found.</p>
          ) : (
            filteredFaqs.map((faq, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <div key={i} style={styles.faqCard}>
                  <div style={styles.faqHeader} onClick={() => toggleExpand(i)}>
                    <span style={styles.question}>{faq.q}</span>
                    <span style={styles.icon}>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  <div style={{
                    ...styles.faqBody,
                    maxHeight: isExpanded ? "500px" : "0",
                    opacity: isExpanded ? "1" : "0",
                    paddingTop: isExpanded ? "12px" : "0",
                  }}>
                    <p style={styles.answer}>{faq.a}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Chatbot />
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#f8fafc"
  },

  main: {
    padding: "30px",
    width: "100%",
    marginTop: "60px",
    transition: "0.3s",
    boxSizing: "border-box"
  },

  heading: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "5px"
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "25px"
  },

  searchBar: {
    maxWidth: "500px",
    marginBottom: "25px",
    display: "block"
  },

  faqList: {
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  faqCard: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    padding: "16px 20px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
    transition: "all 0.3s ease"
  },

  faqHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer"
  },

  question: {
    fontWeight: "600",
    fontSize: "16px",
    color: "#ffffff"
  },

  icon: {
    fontSize: "12px",
    color: "#94a3b8",
    marginLeft: "10px"
  },

  faqBody: {
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)"
  },

  answer: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0
  },

  noResults: {
    color: "#94a3b8",
    fontStyle: "italic"
  }
};
