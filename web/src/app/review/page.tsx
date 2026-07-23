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
          {blogs.map((blog) => (
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
                  <p className="text-sm text-muted mt-2 line-clamp-2">{blog.content}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
