"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/AuthGuard";
import BlogCard from "@/components/BlogCard";
import type { Blog } from "@/types";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      api.getMyBlogs().then(setBlogs).catch(() => {});
    }
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    try {
      await api.updateProfile({ name, bio });
      await refresh();
      setEditing(false);
      setMsgType("success");
      setMsg("Profile updated!");
    } catch (err: any) {
      setMsgType("error");
      setMsg(err.message);
    }
    setSaving(false);
  };

  if (!user) return null;

  const initials = (user.name || user.username).charAt(0).toUpperCase();

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{user.name || user.username}</h1>
              <p className="text-sm text-muted">@{user.username}</p>
              {user.bio && <p className="text-sm text-muted mt-2">{user.bio}</p>}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-sm text-primary hover:text-primary-hover font-medium shrink-0">
                Edit
              </button>
            )}
          </div>

          {msg && (
            <div className={`mt-3 text-sm rounded-lg px-4 py-2 ${
              msgType === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
            }`}>
              {msg}
            </div>
          )}

          {editing && (
            <form onSubmit={save} className="mt-4 pt-4 border-t border-border space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="border border-border rounded-lg w-full px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="border border-border rounded-lg w-full px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="border border-border px-4 py-2 rounded-lg text-sm text-muted hover:bg-card-hover transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-3">My Blogs</h2>
        {blogs.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>No blogs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map((blog) => <BlogCard key={blog.blogid} blog={blog} />)}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
