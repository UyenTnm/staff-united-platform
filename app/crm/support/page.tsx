"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { getOpenThreads } from "@/lib/crm/support";

interface ThreadRow {
  session: { id: string; ticket_number: string };
  clientEmail: string;
  lastMessage: {
    message: string;
    sender_type: string;
    created_at: string;
  } | null;
  unreadCount: number;
}

// Inbox chỉ hiện các Session ĐANG MỞ — cần Sale xử lý. Session đã
// đóng xem lại trong lịch sử ngay tại trang chat của từng khách.
export default function SupportInboxPage() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getOpenThreads();
      setThreads(data as ThreadRow[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Support Inbox
          </h1>
          <p className="text-sm text-slate-500">
            Open conversations that need a reply.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : threads.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No open conversations right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {threads.map((t) => (
              <Link
                key={t.session.id}
                href={`/crm/support/${encodeURIComponent(t.clientEmail)}`}
                className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <MessageCircle className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t.clientEmail}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">
                      {t.session.ticket_number}
                    </p>
                    <p className="mt-0.5 max-w-md truncate text-sm text-slate-500">
                      {t.lastMessage?.sender_type === "staff" ? "You: " : ""}
                      {t.lastMessage?.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {t.lastMessage &&
                      new Date(t.lastMessage.created_at).toLocaleDateString()}
                  </span>
                  {t.unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {t.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
