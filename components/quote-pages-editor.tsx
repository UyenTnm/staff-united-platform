"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  QuotePage,
  getQuotePages,
  createQuotePage,
  deleteQuotePage,
} from "@/lib/crm/quote-pages";

interface QuotePagesEditorProps {
  quoteId: string;
}

// Cho nhân viên tự thêm các trang nội dung riêng cho từng quote (VD:
// giới thiệu dự án cụ thể, case study liên quan tới khách này) — nằm
// trong flipbook, sau trang Services, trước các trang tĩnh chung.
export function QuotePagesEditor({ quoteId }: QuotePagesEditorProps) {
  const [pages, setPages] = useState<QuotePage[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPages() {
    const data = await getQuotePages(quoteId);
    setPages(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPages();
  }, [quoteId]);

  async function handleAdd() {
    if (!title.trim() || !content.trim()) {
      toast.warning("Please enter a page title and content.");
      return;
    }

    setSaving(true);
    try {
      await createQuotePage({
        quote_id: quoteId,
        title: title.trim(),
        content: content.trim(),
        sort_order: pages.length,
      });

      setTitle("");
      setContent("");
      await loadPages();
      toast.success("Page added to proposal.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add page.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteQuotePage(id);
      await loadPages();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete page.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Custom Proposal Pages
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Add extra pages specific to this client (e.g. project overview, relevant
        case study). These appear in the flipbook after the services page.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          {pages.length > 0 && (
            <div className="mb-4 space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {page.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                      {page.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <input
              type="text"
              placeholder="Page title (e.g. Project Overview)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <textarea
              placeholder="Page content..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <Button
              onClick={handleAdd}
              disabled={saving}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-1 h-4 w-4" />
              {saving ? "Adding..." : "Add Page"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
