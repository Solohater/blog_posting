import Link from "next/link";
import type { Blog } from "@/types";

const statusStyles: Record<string, string> = {
  published: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-danger/10 text-danger",
};

export default function BlogCard({ blog }: { blog: Blog }) {
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
        <span>{blog.comments?.length ?? 0} comments</span>
        <span>{blog.likes?.length ?? 0} likes</span>
        {blog.ratings && blog.ratings.length > 0 && (
          <span>★ {(blog.ratings.reduce((s, r) => s + r.ratingvalue, 0) / blog.ratings.length).toFixed(1)}</span>
        )}
      </div>
    </div>
  );
}
