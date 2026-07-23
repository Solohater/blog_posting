"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-64" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
