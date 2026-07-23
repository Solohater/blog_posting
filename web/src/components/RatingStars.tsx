"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function RatingStars({ blogId, initialAvg = 0 }: { blogId: number; initialAvg?: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const [avg, setAvg] = useState(initialAvg);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const rate = async (value: number) => {
    if (!user) { router.push("/login"); return; }
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.rateBlog(blogId, value);
      setAvg(res.rating);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => rate(star)}
          disabled={loading}
          className={`text-xl transition-all ${
            star <= (hover || Math.round(avg))
              ? "text-warning"
              : "text-muted/30 hover:text-warning/60"
          } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          ★
        </button>
      ))}
      <span className="text-sm text-muted ml-1.5 font-medium">
        {avg > 0 ? avg.toFixed(1) : "—"}
      </span>
    </div>
  );
}
