import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import Navbar from "@/components/Navbar";
import ThemePicker from "@/components/ThemePicker";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlogApp",
  description: "A full-stack blog application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
            <ThemePicker />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
