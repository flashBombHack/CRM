"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import {
  HiChevronDown,
  HiOutlineMicrophone,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";
import { HiPlus, HiSearch, HiArrowLeft } from "react-icons/hi";
import { aiIdeasApi } from "@/lib/api-client";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export default function AIIdeasPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(
    () => [
      "How many leads do I have?",
      "Show me all contracts with status Accepted",
      "What is the total amount of all invoices?",
      "List all proposals from this month",
      "What is the average contract value?",
      "Show me leads from today",
      "How many invoices are overdue?",
      "What is the highest proposal total?",
    ],
    []
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fallbackAnswer =
    "I couldn't generate a detailed answer for that using the current AI Ideas tools. " +
    "Try asking one of the supported questions below or rephrase your query to be more specific.";

  const handleSend = async (prompt?: string) => {
    const query = (prompt ?? input).trim();
    if (!query || isSending) return;

    setError(null);
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await aiIdeasApi.ask(query);

      let answerText: string | null =
        response?.isSuccess && response.data?.answer
          ? response.data.answer
          : null;

      if (!answerText) {
        answerText = fallbackAnswer;
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answerText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI Ideas ask failed", err);
      setError("Something went wrong while contacting AI Ideas. Please try again.");

      const assistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: fallbackAnswer,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#EFF6FF] via-[#F2F8FC] to-[#FDF2FF] p-6">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/70 shadow-[0_18px_45px_rgba(15,23,42,0.08)] rounded-2xl h-full flex flex-col overflow-hidden">
              <div className="flex flex-1 min-h-0">
                {/* Left sidebar – conversations */}
                <aside className="hidden md:flex w-72 border-r border-gray-200/80 flex-col bg-gradient-to-b from-[#F9FAFB] to-[#EFF6FF]">
                  <div className="px-4 py-4 border-b border-gray-200/80 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                        AI Workspace
                      </span>
                      <h2 className="text-base font-semibold text-gray-900">
                        AI Ideas
                      </h2>
                    </div>
                    <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-600 shadow-sm">
                      <HiPlus className="w-3.5 h-3.5" />
                      New
                    </button>
                  </div>

                  <div className="px-4 py-3 border-b border-gray-100/80">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-xs">
                      <HiSearch className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search chats"
                        className="flex-1 bg-transparent text-[13px] outline-none border-none placeholder:text-gray-400"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 text-xs text-gray-500">
                    <p className="font-medium text-gray-700 mb-2">No saved chats yet</p>
                    <p className="text-[11px] leading-relaxed">
                      Start a conversation on the right and your questions and answers will appear here in a future update.
                    </p>
                  </div>
                </aside>

                {/* Main chat area */}
                <section className="flex-1 flex flex-col min-w-0">
                  {/* Chat header */}
                  <div className="px-6 py-4 border-b border-gray-200/80 flex items-center justify-between bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => router.push("/reports")}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-white shadow-xs"
                        aria-label="Back to Reports & Analytics"
                      >
                        <HiArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-primary/80 uppercase tracking-[0.16em]">
                            AI Ideas
                          </span>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Intelligence Analysis
                          </h2>
                        </div>
                        <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-full text-[11px] text-gray-700 hover:bg-gray-50 bg-white shadow-xs">
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-semibold text-emerald-700">
                            ●
                          </span>
                          GPT-4o
                          <HiChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
                        Share
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 bg-white">
                        <span className="sr-only">More</span>
                        <span className="w-1 h-1 bg-gray-500 rounded-full" />
                        <span className="w-1 h-1 bg-gray-500 rounded-full mx-0.5" />
                        <span className="w-1 h-1 bg-gray-500 rounded-full" />
                      </button>
                    </div>
                  </div>

                  {/* Chat body */}
                  <div className="flex-1 flex flex-col px-6 py-4 space-y-4 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center px-4">
                        <div className="max-w-2xl w-full text-center">
                          <p className="text-3xl md:text-[2.1rem] font-semibold text-gray-900 mb-3 tracking-tight">
                            Ready when you are.
                          </p>
                          <p className="text-sm md:text-[0.95rem] leading-relaxed text-gray-500 mb-6">
                            Ask the AI to analyse your season performance, forecast revenue, or
                            generate sponsorship ideas based on your CRM data. It works best with
                            clear, specific questions.
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2 mt-2 text-left">
                            {suggestions.slice(0, 4).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleSend(s)}
                                className="text-[13px] rounded-xl border border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/5 px-4 py-3 text-left text-gray-800 transition-colors"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-[0.95rem] leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-primary text-white rounded-br-sm"
                                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}

                    {error && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {error}
                      </div>
                    )}

                    {/* Suggested prompts below chat when there is history */}
                    {messages.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] font-medium text-gray-500 mb-2">
                          Try one of these supported prompts:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleSend(s)}
                              className="text-[11px] rounded-full border border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/5 px-3 py-1.5 text-gray-700 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Composer */}
                  <div className="border-t border-gray-200/80 bg-white/90 backdrop-blur-sm px-4 py-4">
                    <div className="max-w-3xl mx-auto">
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSend();
                        }}
                      >
                        <div className="flex items-end gap-2 bg-[#020617] rounded-2xl md:rounded-3xl px-4 md:px-5 py-3.5 md:py-4 shadow-[0_18px_40px_rgba(15,23,42,0.55)] border border-slate-700/80">
                          <input
                            type="text"
                            placeholder="Ask anything about your pipeline, partners, or revenue"
                            className="flex-1 bg-transparent text-sm md:text-[0.95rem] text-white placeholder:text-slate-400 outline-none border-none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isSending}
                          />
                          <button
                            type="button"
                            className="hidden sm:inline-flex p-2 rounded-full hover:bg-white/10 text-slate-300"
                            disabled
                          >
                            <HiOutlineMicrophone className="w-4 h-4" />
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center p-2.5 rounded-full bg-primary text-white hover:bg-primary-600 shadow-md shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={isSending || !input.trim()}
                          >
                            <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
                          </button>
                        </div>
                      </form>
                      <p className="mt-2 text-[11px] md:text-xs text-gray-400 text-center">
                        AI ideas are experimental and work best with structured questions. Always review outputs before sharing with partners.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}


