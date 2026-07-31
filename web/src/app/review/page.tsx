"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import type { Blog } from "@/types";

type Tab = "pending" | "all";

export default function ReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewBlogId, setPreviewBlogId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "REVIEWER") {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = tab === "pending"
        ? await api.getPendingBlogs()
        : await api.getAllBlogs();
      setBlogs(data);
    } catch {
      setError("Failed to load documents");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === "REVIEWER") fetchBlogs();
  }, [tab, user]);

  const handlePass = async (id: number) => {
    try {
      await api.passBlog(id);
      fetchBlogs();
    } catch { /* ignore */ }
  };

  const handleFail = async (id: number) => {
    try {
      await api.failBlog(id);
      fetchBlogs();
    } catch { /* ignore */ }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const isPdf = (path: string) => /\.pdf$/i.test(path);
  const isImage = (path: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(path);
  const isOffice = (path: string) => /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(path);

  if (authLoading || !user) return null;
  if (user.role !== "REVIEWER") return null;

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Review Dashboard</h1>
      </div>

      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "pending" ? "bg-primary text-white" : "text-muted hover:text-foreground hover:bg-card-hover"
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "all" ? "bg-primary text-white" : "text-muted hover:text-foreground hover:bg-card-hover"
          }`}
        >
          All Documents
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-2xl p-5 bg-card">
              <div className="skeleton h-6 w-3/4 mb-3" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center mt-8">
          <p className="text-danger">{error}</p>
          <button onClick={fetchBlogs} className="mt-2 text-primary hover:underline text-sm">Retry</button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">{tab === "pending" ? "No pending documents." : "No documents found."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => {
            const fileUrl = blog.filePath || null;
            return (
              <div key={blog.blogid} className="border border-border rounded-2xl p-5 bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/blogs/${blog.blogid}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {blog.title}
                    </Link>
                    {blog.user && (
                      <p className="text-xs text-muted mt-1">
                        By {blog.user.name || blog.user.username} &middot; Tag #{blog.tagid}
                      </p>
                    )}
                    <div className="flex gap-3 text-xs text-muted mt-0.5">
                      {blog.createdAt && <span>Created: {formatDate(blog.createdAt)}</span>}
                      {blog.reviewedAt && <span>Reviewed: {formatDate(blog.reviewedAt)}</span>}
                    </div>
                    <p className="text-sm text-muted mt-2 line-clamp-2">{blog.content}</p>
                    {fileUrl && (
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={fileUrl}
                          download
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                        <button
                          onClick={() => setPreviewBlogId(previewBlogId === blog.blogid ? null : blog.blogid)}
                          className="inline-flex items-center gap-1 text-xs text-foreground hover:text-primary"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      blog.status === "pending" ? "bg-warning/10 text-warning" :
                      blog.status === "passed" ? "bg-success/10 text-success" :
                      blog.status === "failed" ? "bg-danger/10 text-danger" :
                      "bg-muted/10 text-muted"
                    }`}>
                      {blog.status}
                    </span>
                    {blog.status === "pending" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handlePass(blog.blogid)}
                          className="px-3 py-1 text-xs font-medium rounded-lg bg-success text-white hover:opacity-90 transition-opacity"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => handleFail(blog.blogid)}
                          className="px-3 py-1 text-xs font-medium rounded-lg bg-danger text-white hover:opacity-90 transition-opacity"
                        >
                          Fail
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {previewBlogId === blog.blogid && fileUrl && (
                  <div className="mt-3 border border-border rounded-xl overflow-hidden">
                    {isPdf(fileUrl) ? (
                      <iframe src={fileUrl} className="w-full h-[400px]" title="Preview" />
                    ) : isImage(fileUrl) ? (
                      <img src={fileUrl} alt="Preview" className="w-full max-h-[400px] object-contain" />
                    ) : isOffice(fileUrl) ? (
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + fileUrl)}&embedded=true`}
                        className="w-full h-[400px]"
                        title="Document Preview"
                      />
                    ) : (
                      <div className="p-4 text-center text-muted text-sm">
                        <p>Preview not available.</p>
                        <a href={fileUrl} download className="text-primary hover:underline mt-1 inline-block">Download to view</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}