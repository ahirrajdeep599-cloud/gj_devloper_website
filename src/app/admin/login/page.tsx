"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02050f] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Back to public site */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to GJ Devloper</span>
        </Link>
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[1.5px] mx-auto mb-4 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
            <div className="w-full h-full bg-[#070d24] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-sky-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            GJ Devloper Admin
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Secure Agency Management Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5 font-medium">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5 font-medium">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="electric"
            size="lg"
            className="w-full mt-2"
            disabled={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? "Authenticating..." : "Access Dashboard"}
          </Button>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono text-slate-400 text-center mt-4">
            Default credentials: <span className="text-sky-300">admin</span> / <span className="text-sky-300">admin123</span>
          </div>
        </form>
      </div>
    </div>
  );
}
