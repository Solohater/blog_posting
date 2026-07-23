"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useParams, useRouter } from "next/navigation";
import LikeButton from "@/components/LikeButton";
import RatingStars from "@/components/RatingStars";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";
import type { Blog } from "@/types";

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      const blogs = await api.getMyBlogs();
      const found = blogs.find((b) => b.blogid === Number(id));
      setBlog(found || null);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchBlog(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this document?")) return;
    try {
      await api.deleteBlog(Number(id));
      router.push("/");
    } catch { /* ignore */ }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <div className="skeleton h-8 w-3/4" />
      <div className="skeleton h-4 w-1/4" />
      <div className="skeleton h-32 w-full" />
    </div>
  );

  if (!blog) return (
    <div className="text-center mt-16">
      <p className="text-muted text-lg">Document not found.</p>
      <Link href="/" className="text-primary hover:underline text-sm mt-2 inline-block">Go home</Link>
    </div>
  );

  const likeCount = blog.likes?.length ?? 0;
  const avgRating = blog.ratings?.length
    ? blog.ratings.reduce((s, r) => s + r.ratingvalue, 0) / blog.ratings.length
    : 0;

  const isOwner = user && user.userid === blog.userid;
  const canEdit = isOwner && blog.status === "pending";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-3xl font-bold text-foreground">{blog.title}</h1>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            blog.status === "pending" ? "bg-warning/10 text-warning" :
            blog.status === "passed" ? "bg-success/10 text-success" :
            blog.status === "failed" ? "bg-danger/10 text-danger" :
            "bg-muted/10 text-muted"
          }`}>
            {blog.status}
          </span>
        </div>
        {blog.user && (
          <Link href={`/profile/${blog.user.userid}`} className="text-sm text-primary hover:underline inline-block mt-1">
            By {blog.user.name || blog.user.username}
          </Link>
        )}
        <p className="text-muted text-sm mt-1">Tag #{blog.tagid}</p>

        <div className="mt-6 whitespace-pre-wrap text-foreground leading-relaxed">{blog.content}</div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
          <LikeButton blogId={blog.blogid} initialCount={likeCount} />
          <RatingStars blogId={blog.blogid} initialAvg={avgRating} />
        </div>

        {canEdit && (
          <div className="flex gap-3 mt-4">
            <Link href={`/blogs/${blog.blogid}/edit`} className="text-sm text-primary hover:underline font-medium">Edit</Link>
            <button onClick={handleDelete} className="text-sm text-danger hover:underline font-medium">Delete</button>
          </div>
        )}

        {isOwner && blog.status !== "pending" && (
          <p className="text-xs text-muted mt-3">This document has been reviewed and can no longer be edited.</p>
        )}
      </div>

      <div className="mt-8">
        <CommentSection blogId={blog.blogid} />
      </div>
    </div>
  );
}
