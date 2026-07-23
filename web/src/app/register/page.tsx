"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.register(form);
      await login(res.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-6">Create account</h1>
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-2 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Username</label>
              <input
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="border border-border rounded-lg w-full px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-border rounded-lg w-full px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border border-border rounded-lg w-full px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name (optional)</label>
              <input
                placeholder="Your display name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-border rounded-lg w-full px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white w-full py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>
          <p className="text-sm text-center mt-4 text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
