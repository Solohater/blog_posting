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
  const [showPreview, setShowPreview] = useState(false);

  const fetchBlog = async () => {
    try {
      const data = await api.getBlog(Number(id));
      setBlog(data);
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

  const isPdf = (path: string) => /\.pdf$/i.test(path);
  const isImage = (path: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(path);
  const isOffice = (path: string) => /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(path);
  const isText = (path: string) => /\.(txt|csv)$/i.test(path);

  const getPreviewType = (path: string) => {
    if (isPdf(path)) return "pdf";
    if (isImage(path)) return "image";
    if (isText(path)) return "text";
    if (isOffice(path)) return "office";
    return "other";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
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

  const fileUrl = blog.filePath || null;
  const previewType = fileUrl ? getPreviewType(fileUrl) : null;

  const googleDocsViewer = fileUrl && isOffice(fileUrl)
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + fileUrl)}&embedded=true`
    : null;

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
        <div className="flex gap-4 text-xs text-muted mt-1">
          {blog.createdAt && <span>Created: {formatDate(blog.createdAt)}</span>}
          {blog.reviewedAt && <span>Reviewed: {formatDate(blog.reviewedAt)}</span>}
        </div>
        {blog.tagid && (
          <p className="text-muted text-sm mt-1">Tag #{blog.tagid}</p>
        )}

        <div className="mt-6 whitespace-pre-wrap text-foreground leading-relaxed">{blog.content}</div>

        {fileUrl && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
            <a
              href={fileUrl}
              download
              className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 border border-border px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-card-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showPreview ? "Close" : "Preview"}
            </button>
          </div>
        )}

        {showPreview && fileUrl && (
          <div className="mt-4 border border-border rounded-xl overflow-hidden">
            {previewType === "pdf" && (
              <iframe src={fileUrl} className="w-full h-[500px]" title="PDF Preview" />
            )}
            {previewType === "image" && (
              <img src={fileUrl} alt="Preview" className="w-full max-h-[500px] object-contain" />
            )}
            {previewType === "text" && (
              <object data={fileUrl} type="text/plain" className="w-full h-[400px] bg-white rounded-lg">
                <a href={fileUrl} download className="text-primary underline">Download to view</a>
              </object>
            )}
            {previewType === "office" && googleDocsViewer && (
              <iframe src={googleDocsViewer} className="w-full h-[500px]" title="Document Preview" />
            )}
            {previewType === "other" && (
              <div className="p-6 text-center text-muted">
                <p className="mb-2">Preview not available for this file type.</p>
                <a href={fileUrl} download className="text-primary hover:underline text-sm">Download to view</a>
              </div>
            )}
          </div>
        )}

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