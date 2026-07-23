"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useParams } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import type { Blog, User } from "@/types";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.role === "REVIEWER") {
          const allBlogs = await api.getAllBlogs();
          setBlogs(allBlogs.filter((b) => b.userid === Number(id)));
        }
        if (currentUser?.role === "REVIEWER" || currentUser?.userid === Number(id)) {
          try {
            const blogsData = await api.getMyBlogs();
            const userBlogs = blogsData.filter((b) => b.userid === Number(id));
            if (userBlogs.length > 0 && userBlogs[0].user) {
              setProfileUser(userBlogs[0].user);
            }
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [id, currentUser]);

  if (loading) return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-4 w-32" />
    </div>
  );

  const isViewer = currentUser?.userid === Number(id) || currentUser?.role === "REVIEWER";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
            {(profileUser?.name || profileUser?.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{profileUser?.name || profileUser?.username || "User"}</h1>
            {profileUser?.username && <p className="text-sm text-muted">@{profileUser.username}</p>}
            {profileUser?.bio && <p className="text-sm text-muted mt-1">{profileUser.bio}</p>}
          </div>
        </div>
      </div>

      {isViewer && (
        <>
          <h2 className="text-lg font-semibold text-foreground mb-3">Documents</h2>
          {blogs.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>No documents yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blogs.map((blog) => <BlogCard key={blog.blogid} blog={blog} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
