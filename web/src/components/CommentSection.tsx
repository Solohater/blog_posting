"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import type { Comment } from "@/types";

export default function CommentSection({ blogId }: { blogId: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await api.getComments(blogId);
      setComments(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [blogId]);

  const add = async () => {
    if (!user) { router.push("/login"); return; }
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await api.addComment(blogId, content.trim());
      setContent("");
      await fetchComments();
    } catch { /* ignore */ }
    setPosting(false);
  };

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4 text-foreground">
        Comments <span className="text-muted font-normal">({comments.length})</span>
      </h3>

      {user && (
        <div className="flex gap-2 mb-4">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Write a comment..."
            className="border border-border rounded-lg px-3 py-2 flex-1 text-sm bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={add}
            disabled={posting || !content.trim()}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 bg-card border border-border rounded-xl">
          <p className="text-sm text-muted">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.commentid} className="border border-border rounded-xl p-4 bg-card transition-colors hover:bg-card-hover">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{c.username}</span>
                {user && user.userid === c.userid && (
                  <button
                    onClick={async () => {
                      await api.deleteComment(blogId, c.commentid);
                      fetchComments();
                    }}
                    className="text-xs text-muted hover:text-danger transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-muted">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
