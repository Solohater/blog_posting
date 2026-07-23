"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import type { SearchResult } from "@/types";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    api.search(q).then(setResults).catch(() => {}).finally(() => setLoading(false));
  }, [q]);

  if (!q) return (
    <div className="text-center mt-16">
      <p className="text-muted">Enter a search term.</p>
    </div>
  );
  if (loading) return (
    <div className="text-center mt-16 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full max-w-md mx-auto" />)}
    </div>
  );
  if (!results) return <p className="text-danger text-center mt-16">Search failed.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Results for &ldquo;{q}&rdquo;</h1>

      {results.users.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-foreground mt-4">Users</h2>
          <div className="space-y-2">
            {results.users.map((u) => (
              <Link key={u.userid} href={`/profile/${u.userid}`} className="block border border-border rounded-xl p-4 bg-card hover:bg-card-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(u.name || u.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{u.name || u.username}</p>
                    {u.bio && <p className="text-sm text-muted">{u.bio}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {results.blogs.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-foreground mt-4">Blogs</h2>
          <div className="space-y-3">
            {results.blogs.map((blog: any) => (
              <BlogCard key={blog.blogid || blog.blogid} blog={blog} />
            ))}
          </div>
        </>
      )}

      {results.users.length === 0 && results.blogs.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p>No results found.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10 text-muted">Loading...</p>}>
      <SearchResults />
    </Suspense>
  );
}
