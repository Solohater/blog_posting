"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import type { Tag } from "@/types";

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", tagId: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    api.getTags().then(setTags).catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploading(true);
    setError("");
    try {
      const result = await api.uploadFile(f);
      setFileUrl(result.fileUrl);
    } catch (err: any) {
      setError(err.message);
      setFile(null);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const blog = await api.createBlog({
        title: form.title,
        content: form.content,
        tagId: form.tagId ? Number(form.tagId) : undefined,
        fileUrl: fileUrl || undefined,
      });
      router.push(`/blogs/${blog.blogid}`);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">New Document</h1>
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-2 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                placeholder="Enter your document title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border border-border rounded-lg w-full px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Content</label>
              <textarea
                placeholder="Write your document content..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="border border-border rounded-lg w-full px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                rows={12}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tag</label>
              <select
                value={form.tagId}
                onChange={(e) => setForm({ ...form, tagId: e.target.value })}
                className="border border-border rounded-lg w-full px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a tag</option>
                {tags.map((t) => (
                  <option key={t.tagid} value={t.tagid}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Attach File (PDF, Word, Excel, etc.)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="border border-border rounded-lg w-full px-3 py-2 text-sm bg-background text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium hover:file:opacity-90"
              />
              {uploading && <p className="text-xs text-muted mt-1">Uploading...</p>}
              {fileUrl && file && (
                <p className="text-xs text-success mt-1">Uploaded: {file.name}</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving || uploading} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
                {saving ? "Creating..." : "Create Document"}
              </button>
              <button type="button" onClick={() => router.back()} className="border border-border px-6 py-2.5 rounded-lg text-sm text-muted hover:bg-card-hover transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}