"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-primary hover:text-primary-hover">
            DocReview
          </Link>
          {user && (
            <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors hidden sm:block">
              My Docs
            </Link>
          )}
          <form onSubmit={handleSearch} className="hidden sm:flex gap-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="border border-border rounded-lg px-3 py-1.5 text-sm w-40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-hover transition-colors">
              Go
            </button>
          </form>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-sm">
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="w-7 h-7 rounded-full border-2 border-border"
              style={{ background: theme.colors["--primary"] }}
              title="Change theme"
            />
            {themeOpen && (
              <div className="absolute right-0 top-8 bg-card border border-border rounded-2xl shadow-xl p-3 z-50">
                <div className="grid grid-cols-4 gap-1.5">
                  {themes.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => { setTheme(t.name); setThemeOpen(false); }}
                      title={t.label}
                      className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                        theme.name === t.name ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ background: t.colors["--primary"] }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <>
              {user.role === "REVIEWER" && (
                <>
                  <Link href="/review" className="text-warning hover:text-warning font-medium">
                    Review
                  </Link>
                  <Link href="/search" className="text-muted hover:text-foreground">
                    Browse
                  </Link>
                </>
              )}
              <Link href="/blogs/new" className="bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors">
                New Doc
              </Link>
              <Link href="/profile" className="text-foreground hover:text-primary font-medium">
                {user.name || user.username}
              </Link>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="text-danger hover:text-danger transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-foreground hover:text-primary">Login</Link>
              <Link href="/register" className="bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors">
                Register
              </Link>
            </>
          )}
        </div>

        <button className="sm:hidden p-2 text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-card px-4 py-3 space-y-2">
          <form onSubmit={handleSearch} className="flex gap-1">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="border border-border rounded-lg px-3 py-1.5 text-sm flex-1 bg-background text-foreground" />
            <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm">Go</button>
          </form>
          <div className="flex items-center gap-2 py-1">
            <span className="text-xs text-muted">Theme:</span>
            <div className="flex gap-1">
              {themes.slice(0, 6).map((t) => (
                <button
                  key={t.name}
                  onClick={() => { setTheme(t.name); setMenuOpen(false); }}
                  className={`w-5 h-5 rounded border-2 ${theme.name === t.name ? "border-foreground" : "border-transparent"}`}
                  style={{ background: t.colors["--primary"] }}
                />
              ))}
            </div>
          </div>
          {user ? (
            <>
              <Link href="/" className="block py-1 text-foreground" onClick={() => setMenuOpen(false)}>My Docs</Link>
              <Link href="/blogs/new" className="block py-1 text-foreground" onClick={() => setMenuOpen(false)}>New Doc</Link>
              <Link href="/profile" className="block py-1 text-foreground" onClick={() => setMenuOpen(false)}>Profile</Link>
              {user.role === "REVIEWER" && (
                <>
                  <Link href="/review" className="block text-warning py-1" onClick={() => setMenuOpen(false)}>Review</Link>
                  <Link href="/search" className="block py-1 text-foreground" onClick={() => setMenuOpen(false)}>Browse</Link>
                </>
              )}
              <button onClick={() => { logout(); router.push("/"); setMenuOpen(false); }} className="block text-danger py-1">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-1 text-foreground" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="block py-1 text-foreground" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
