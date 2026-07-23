"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function LikeButton({ blogId, initialCount }: { blogId: number; initialCount: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) { router.push("/login"); return; }
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await api.unlikeBlog(blogId);
        setCount((c) => Math.max(0, c - 1));
        setLiked(false);
      } else {
        await api.likeBlog(blogId);
        setCount((c) => c + 1);
        setLiked(true);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
        liked ? "text-danger" : "text-muted hover:text-danger"
      } ${loading ? "opacity-50" : ""}`}
    >
      <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {count}
    </button>
  );
}
