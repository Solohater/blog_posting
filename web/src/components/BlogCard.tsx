import Link from "next/link";
import type { Blog } from "@/types";

const statusStyles: Record<string, string> = {
  published: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-danger/10 text-danger",
};

export default function BlogCard({ blog }: { blog: Blog }) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="border border-border rounded-2xl p-5 bg-card shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/blogs/${blog.blogid}`} className="flex-1 group">
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {blog.title}
          </h2>
        </Link>
        {blog.status && blog.status !== "published" && (
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[blog.status] || "bg-muted/10 text-muted"}`}>
            {blog.status}
          </span>
        )}
      </div>
      <p className="text-muted mt-1.5 text-sm line-clamp-2 leading-relaxed">{blog.content}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
        {blog.user && (
          <Link href={`/profile/${blog.user.userid}`} className="hover:text-primary transition-colors">
            {blog.user.name || blog.user.username}
          </Link>
        )}
        {blog.createdAt && <span>{formatDate(blog.createdAt)}</span>}
        <span>{blog.comments?.length ?? 0} comments</span>
        <span>{blog.likes?.length ?? 0} likes</span>
        {blog.filePath && (
          <span className="inline-flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            File
          </span>
        )}
        {blog.ratings && blog.ratings.length > 0 && (
          <span>★ {(blog.ratings.reduce((s, r) => s + r.ratingvalue, 0) / blog.ratings.length).toFixed(1)}</span>
        )}
      </div>
    </div>
  );
}
