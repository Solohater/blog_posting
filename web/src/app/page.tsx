"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import BlogCard from "@/components/BlogCard";
import type { Blog } from "@/types";

const filters = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "passed", label: "Passed" },
  { key: "failed", label: "Failed" },
] as const;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    setLoading(true);
    setError("");
    api.getMyBlogs(activeFilter || undefined)
      .then(setBlogs)
      .catch(() => setError("Failed to load docs"))
      .finally(() => setLoading(false));
  }, [user, authLoading, activeFilter, router]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4 mt-6">
        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <div key={f.key} className="skeleton h-8 w-20 rounded-lg" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-2xl p-5 bg-card">
            <div className="skeleton h-6 w-3/4 mb-3" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-16">
        <p className="text-danger text-lg">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-primary hover:underline text-sm">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Docs</h1>
        <span className="text-sm text-muted">{blogs.length} document{blogs.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex gap-2 border-b border-border pb-3">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground hover:bg-card-hover"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">No {activeFilter ? activeFilter : ""} documents.</p>
          <p className="text-sm mt-1">
            <a href="/blogs/new" className="text-primary hover:underline">Create one</a>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => <BlogCard key={blog.blogid} blog={blog} />)}
        </div>
      )}
    </div>
  );
}
