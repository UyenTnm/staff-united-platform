"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Star, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PortalLayout } from "@/components/portal-layout";
import {
  SupportMessage,
  SupportSession,
  getOpenSession,
  createSession,
  getMessagesForSession,
  sendMessage,
  markSessionReadByClient,
  submitRating,
  getSessionHistory,
  closeSession,
} from "@/lib/crm/support";

export default function PortalSupportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"chat" | "history">("chat");
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [session, setSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [history, setHistory] = useState<SupportSession[]>([]);
  const [input, setInput] = useState("");
  const [myQuotes, setMyQuotes] = useState<
    { id: string; quote_number: string; title: string }[]
  >([]);
  const [startingQuoteId, setStartingQuoteId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendingLockRef = useRef(false);

  async function refresh(email: string) {
    const openSession = await getOpenSession(email);
    setSession(openSession);

    if (openSession) {
      const msgs = await getMessagesForSession(openSession.id);
      setMessages(msgs);
      await markSessionReadByClient(openSession.id);
    } else {
      setMessages([]);
    }

    const fullHistory = await getSessionHistory(email);
    setHistory(fullHistory);
  }

  useEffect(() => {
    async function load() {
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();

      if (!authSession) {
        router.push("/portal/login");
        return;
      }

      const email = authSession.user.email || "";
      setUserEmail(email);

      const { data: quote } = await supabase
        .from("quotes")
        .select("company_name")
        .or(`contact_email.eq.${email},billing_email.eq.${email}`)
        .limit(1)
        .maybeSingle();

      setCompanyName(quote?.company_name || email);

      const { data: quotesList } = await supabase
        .from("quotes")
        .select("id, quote_number, title")
        .or(`contact_email.eq.${email},billing_email.eq.${email}`)
        .order("created_at", { ascending: false });

      if (quotesList) setMyQuotes(quotesList);

      await refresh(email);
      setLoading(false);
    }
    load();

    const interval = setInterval(async () => {
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();
      if (authSession?.user?.email) await refresh(authSession.user.email);
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !userEmail) return;
    if (sendingLockRef.current) return;
    sendingLockRef.current = true;

    setSending(true);
    try {
      const messageText = input.trim();
      setInput("");

      let activeSession = session;
      if (!activeSession) {
        // Chưa có Session mở — tạo TICKET MỚI, gắn Quote nếu khách
        // đã chọn lúc bắt đầu.
        activeSession = await createSession(userEmail, startingQuoteId || null);
        setStartingQuoteId("");
      }

      await sendMessage(
        activeSession.id,
        userEmail,
        "client",
        companyName,
        messageText,
      );
      await refresh(userEmail);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      sendingLockRef.current = false;
    }
  }

  async function handleEndChat() {
    if (!session) return;
    await closeSession(session.id, "client");
    await refresh(userEmail);
  }

  async function handleSubmitRating(sessionId: string) {
    if (ratingInput === 0) return;
    await submitRating(sessionId, ratingInput);
    await refresh(userEmail);
    setRatingInput(0);
  }

  if (loading) {
    return (
      <PortalLayout userEmail={userEmail}>
        <p className="text-sm text-slate-500">Loading...</p>
      </PortalLayout>
    );
  }

  const closedSessions = history.filter((s) => s.status === "closed");
  const justClosedUnrated = closedSessions.find((s) => s.rating === null);

  return (
    <PortalLayout userEmail={userEmail}>
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Support</h1>
          <p className="mt-1 text-sm text-slate-500">
            Message your account manager directly.
          </p>
        </div>

        {/* Tab Chat / History */}
        <div className="mb-4 flex gap-1 border-b border-slate-200">
          <button
            onClick={() => setTab("chat")}
            className={`cursor-pointer border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "chat"
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setTab("history")}
            className={`cursor-pointer border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "history"
                ? "border-brand-600 text-brand-700"
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
                <div key={s.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs font-semibold text-slate-700">
                        {s.ticket_number}
                      </p>
                      {s.quotes && (
                        <p className="mt-0.5 text-xs text-brand-600">
                          Re: {s.quotes.title || s.quotes.quote_number}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(s.created_at).toLocaleDateString()}
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
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {justClosedUnrated && !session && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-sm font-medium text-amber-800">
                  How was your last conversation?
                </p>
                <div className="mt-2 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingInput(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= ratingInput
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {ratingInput > 0 && (
                  <button
                    onClick={() => handleSubmitRating(justClosedUnrated.id)}
                    className="mt-3 cursor-pointer rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                  >
                    Submit Rating
                  </button>
                )}
              </div>
            )}

            {session && (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
                <div>
                  <p className="font-mono text-xs font-semibold text-slate-700">
                    {session.ticket_number}
                  </p>
                  {session.quotes && (
                    <p className="text-xs text-brand-600">
                      Re: {session.quotes.title || session.quotes.quote_number}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleEndChat}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                >
                  <X className="h-3 w-3" />
                  End chat
                </button>
              </div>
            )}

            {!session ? (
              <div className="flex-1 space-y-3 rounded-xl bg-white p-6 shadow-sm">
                <p className="text-center text-sm text-slate-500">
                  Start a new conversation below.
                </p>
                {myQuotes.length > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Is this about a specific deal? (optional)
                    </label>
                    <select
                      value={startingQuoteId}
                      onChange={(e) => setStartingQuoteId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                    >
                      <option value="">General question</option>
                      {myQuotes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title || q.quote_number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-white p-4 shadow-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === "client"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender_type === "client"
                          ? "bg-brand-600 text-white"
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
                          msg.sender_type === "client"
                            ? "text-brand-100"
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
            )}

            <div className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  session ? "Type your message..." : "Start typing..."
                }
                className="flex-1 rounded-xl border border-slate-200 p-3 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="flex cursor-pointer items-center justify-center rounded-xl bg-brand-600 px-4 text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
