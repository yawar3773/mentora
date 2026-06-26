import { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
} from "lucide-react";

import aiService from "../../services/aiService.js";
import ReactMarkdown from "react-markdown";
import { useOutletContext } from "react-router-dom";

const ChatTab = () => {
  const { documentId } = useOutletContext();

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);

      const response = await aiService.getChatHistory(
        documentId
      );

      setMessages(response?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!question.trim() || sending) return;

    const userMessage = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentQuestion = question;
    setQuestion("");

    try {
      setSending(true);

      const response = await aiService.chat(
        documentId,
        currentQuestion
      );

      const assistantMessage = {
        role: "assistant",
        content: response?.data?.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.message ||
            "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden h-[80vh] flex flex-col">
      {/* Header */}
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">
          Chat with Document
        </h2>
        <p className="text-sm text-gray-500">
          Ask questions about the uploaded document.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bot
                size={50}
                className="mx-auto mb-4 text-gray-400"
              />
              <h3 className="font-medium text-lg">
                Start a Conversation
              </h3>
              <p className="text-gray-500 mt-1">
                Ask anything about this document.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] flex gap-3 ${
                  message.role === "user"
                    ? "flex-row-reverse"
                    : ""
                }`}
              >
                <div className="shrink-0">
                  {message.role === "user" ? (
                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <Bot size={18} />
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-white border"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <Bot size={18} />
              </div>

              <div className="bg-white border rounded-2xl px-4 py-3">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 bg-white"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder="Ask a question about this document..."
            className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={sending || !question.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 rounded-lg flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatTab;