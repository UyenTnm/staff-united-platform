"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Star, Clock } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/components/auth/auth-provider";
import {
  SupportMessage,
  SupportSession,
  getOpenSession,
  getMessagesForSession,
  sendMessage,
  markSessionReadByStaff,
  closeSession,
  getSessionHistory,
} from "@/lib/crm/support";

export default function SupportThreadPage() {
  const params = useParams();
  const { employee } = useAuth();
  const clientEmail = decodeURIComponent(params.email as string);

  const [tab, setTab] = useState<"chat" | "history">("chat");
  const [session, setSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [history, setHistory] = useState<SupportSession[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendingLockRef = useRef(false);

  async function refresh() {
    const openSession = await getOpenSession(clientEmail);
    setSession(openSession);

    if (openSession) {
      const msgs = await getMessagesForSession(openSession.id);
      setMessages(msgs);
      await markSessionReadByStaff(openSession.id);
    } else {
      setMessages([]);
    }

    const fullHistory = await getSessionHistory(clientEmail);
    setHistory(fullHistory);
  }

  useEffect(() => {
    async function init() {
      await refresh();
      setLoading(false);
    }
    init();

    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [clientEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !session) return;
    if (sendingLockRef.current) return;
    sendingLockRef.current = true;

    setSending(true);
    try {
      const messageText = input.trim();
      setInput("");
      await sendMessage(
        session.id,
        clientEmail,
        "staff",
        employee?.full_name || "STAFF United",
        messageText,
      );
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      sendingLockRef.current = false;
    }
  }

  async function handleClose() {
    if (!session) return;
    await closeSession(session.id, "staff");
    await refresh();
  }

  const closedSessions = history.filter((s) => s.status === "closed");
  const ratedSessions = closedSessions.filter((s) => s.rating !== null);
  const avgRating =
    ratedSessions.length > 0
      ? (
          ratedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) /
          ratedSessions.length
        ).toFixed(1)
      : null;

  // Cảnh báo — tin nhắn CUỐI CÙNG là của Sale, đã hơn 48 tiếng chưa
  // thấy khách trả lời → gợi ý Sale có thể Close.
  const lastMsg = messages[messages.length - 1];
  const showStaleWarning =
    session &&
    lastMsg?.sender_type === "staff" &&
    Date.now() - new Date(lastMsg.created_at).getTime() > 48 * 60 * 60 * 1000;

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-6rem)] flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/crm/support"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inbox
            </Link>
            <div className="mt-2 flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {clientEmail}
              </h1>
              {avgRating && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {avgRating} avg ({ratedSessions.length})
                </span>
              )}
            </div>
            {session && (
              <p className="mt-1 font-mono text-xs text-slate-400">
                {session.ticket_number}
                {session.quotes && (
                  <span className="ml-2 text-emerald-600">
                    · Re: {session.quotes.title || session.quotes.quote_number}
                  </span>
                )}
              </p>
            )}
          </div>

          {session && (
            <button
              onClick={handleClose}
              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Close conversation
            </button>
          )}
        </div>

        {showStaleWarning && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            <Clock className="h-4 w-4 flex-shrink-0" />
            No reply from client for over 48 hours — you may close this
            conversation.
          </div>
        )}

        {/* Tab Chat / History */}
        <div className="flex gap-1 border-b border-slate-200">
          <button
            onClick={() => setTab("chat")}
            className={`cursor-pointer border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "chat"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setTab("history")}
            className={`cursor-pointer border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "history"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500"
            }`}
          >
            History ({closedSessions.length})
          </button>
        </div>

        {tab === "history" ? (
          <div className="flex-1 space-y-2 overflow-y-auto">
            {closedSessions.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">
                No past conversations yet.
              </p>
            ) : (
              closedSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {s.ticket_number}
                    </p>
                    {s.quotes && (
                      <p className="text-xs text-emerald-600">
                        Re: {s.quotes.title || s.quotes.quote_number}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(s.created_at).toLocaleDateString()} · Closed by{" "}
                      {s.closed_by}
                    </p>
                  </div>
                  {s.rating ? (
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < s.rating!
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Not rated</span>
                  )}
                </div>
              ))
            )}
          </div>
        ) : !session ? (
          <div className="flex-1 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">
              No open conversation with this client right now.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_type === "staff"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender_type === "staff"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.sender_type === "staff" && (
                      <p className="mb-0.5 text-xs font-semibold opacity-70">
                        {msg.sender_name}
                      </p>
                    )}
                    <p>{msg.message}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        msg.sender_type === "staff"
                          ? "text-emerald-100"
                          : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your reply..."
                className="flex-1 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
