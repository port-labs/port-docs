import React, { useState, useEffect, useRef } from "react";
import { KapaProvider, useChat } from "@kapaai/react-sdk";
import ReactMarkdown from "react-markdown";
import { LuSend, LuThumbsUp, LuThumbsDown, LuRefreshCw } from "react-icons/lu";
import styles from "./Chat.module.css";

// Integration ID for Custom Frontend integration
// This needs to be obtained from Kapa dashboard: Integrations → Add Integration → Custom Frontend
// The website ID from the current config may not be the same as the integration ID
const INTEGRATION_ID = "1aefba51-348e-4747-9a4c-93306459542d";

// ChatHeader component
function ChatHeader({ conversation, resetConversation }) {
  return (
    <div className={styles.chatHeader}>
      <h2 className={styles.chatTitle}>👋 Ask me anything about Port!</h2>
      <button
        className={styles.newChatButton}
        onClick={resetConversation}
        disabled={conversation.length === 0}
      >
        <LuRefreshCw />
        New Chat
      </button>
    </div>
  );
}

// ChatMessage component
function ChatMessage({ qa }) {
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = (reaction) => {
    setFeedback(reaction);
    // Here you would typically send feedback to your analytics
    console.log(`Feedback: ${reaction} for question: ${qa.question}`);
  };

  return (
    <div className={styles.messageContainer}>
      {/* Question */}
      <div className={styles.questionContainer}>
        <p className={styles.questionText}>{qa.question}</p>
      </div>

      {/* Answer */}
      <div className={styles.answerContainer}>
        <div className={styles.answerText}>
          <ReactMarkdown>{qa.answer}</ReactMarkdown>
        </div>

        {/* Sources */}
        {qa.sources && qa.sources.length > 0 && (
          <div className={styles.sourcesContainer}>
            <p className={styles.sourcesTitle}>Sources:</p>
            <ul className={styles.sourcesList}>
              {qa.sources.map((source, index) => (
                <li key={index} className={styles.sourceItem}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sourceLink}
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feedback */}
        <div className={styles.feedbackContainer}>
          <button
            className={`${styles.feedbackButton} ${styles.positive} ${
              feedback === "positive" ? styles.selected : ""
            }`}
            onClick={() => handleFeedback("positive")}
            disabled={feedback !== null}
          >
            <LuThumbsUp />
            Helpful
          </button>
          <button
            className={`${styles.feedbackButton} ${styles.negative} ${
              feedback === "negative" ? styles.selected : ""
            }`}
            onClick={() => handleFeedback("negative")}
            disabled={feedback !== null}
          >
            <LuThumbsDown />
            Not helpful
          </button>
        </div>
      </div>
    </div>
  );
}

// Main ChatInterface component
function ChatInterface() {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState(null);
  const conversationListRef = useRef(null);
  const { conversation, submitQuery, resetConversation, isGenerating } = useChat();

  // Auto-scroll only the chat messages container when new messages arrive
  useEffect(() => {
    const container = conversationListRef.current;
    if (!container) return;
    // Keep the scroll within the chat area without affecting the page scroll
    container.scrollTop = container.scrollHeight;
  }, [conversation, isGenerating]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      try {
        submitQuery(question);
        setQuestion("");
        setError(null);
      } catch (err) {
        setError("Failed to submit question. Please check the integration configuration.");
        console.error("Submit error:", err);
      }
    }
  };

  return (
    <div className={styles.chatContainer}>
      <ChatHeader
        conversation={conversation}
        resetConversation={resetConversation}
      />
      {/* Messages area */}
      <div className={styles.conversationList} ref={conversationListRef}>
        {error && (
          <div className={styles.messagesArea} style={{ color: 'var(--chat-feedback-negative)' }}>
            ⚠️ {error}
          </div>
        )}
        {!error && conversation.length === 0 ? (
          <div className={styles.messagesArea}>
            <div>
              Ask about features &amp; capabilities, request resource definitions, or get help troubleshooting issues.<br /><br />
              See the&nbsp;
              <a
                href="https://docs.getport.io/docs-ai-assistant"
                target="_blank"
                rel="noopener noreferrer"
                style={{ whiteSpace: "nowrap", color: 'var(--chat-accent-primary)', textDecoration: "underline" }}
              >
                Docs AI assistant
              </a>
              &nbsp;page for tips and examples.
            </div>
          </div>
        ) : !error && (
          <>
            {conversation.map((qa, index) => (
              <ChatMessage key={index} qa={qa} />
            ))}
            {/* Thinking indicator */}
            {isGenerating && (
              <div className={styles.thinkingContainer}>
                <span>Thinking</span>
                <div className={styles.thinkingDots}>
                  <div className={styles.thinkingDot}></div>
                  <div className={styles.thinkingDot}></div>
                  <div className={styles.thinkingDot}></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about Port..."
            className={styles.textInput}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!question.trim() || isGenerating}
            className={styles.sendButton}
          >
            <LuSend />
          </button>
        </form>
      </div>

      {/* Footer with attribution */}
      <div className={styles.footer}>
        Powered by <a href="https://kapa.ai" target="_blank" rel="noopener noreferrer">kapa.ai</a>
      </div>
    </div>
  );
}

// Main EmbeddedChat component with KapaProvider
function EmbeddedChat() {
  return (
    <KapaProvider
      integrationId={INTEGRATION_ID}
      callbacks={{
        askAI: {
          onAnswerGenerationCompleted: (data) => {
            // Send to analytics if needed
            console.log('Answer generated:', data);
          },
          onFeedbackSubmit: (data) => {
            // Send feedback to analytics if needed
            console.log('Feedback submitted:', data);
          },
          onError: (error) => {
            console.error('Kapa error:', error);
          }
        }
      }}
    >
      <ChatInterface />
    </KapaProvider>
  );
}

export default EmbeddedChat;
