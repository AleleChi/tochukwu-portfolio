import React, { useState } from "react";
import { X, Mail, Lock, AlertCircle } from "lucide-react";

interface AdminLoginProps {
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AdminLogin({ onClose, onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("admin_token", data.token);
        onLoginSuccess(data.token, data.user);
      } else {
        setErrorMessage(data.error || "Invalid email address or passphrase combination.");
      }
    } catch (err) {
      setErrorMessage("Network error: failed to establish connection with the authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col grow justify-center items-center p-6 bg-[#111112]">
      <div className="w-full max-w-md p-8 sm:p-10 border border-[#C9A84C]/15 bg-[#161618] rounded-none text-center flex flex-col gap-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border border-white/5 hover:border-[#C9A84C] text-[#8E8E93] hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2 mt-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A84C] uppercase">Tochukwu Ogunaka</span>
          <h4 className="text-2xl font-serif font-semibold text-white tracking-tight mt-1">Administrator Login</h4>
          <p className="text-xs text-[#8E8E93] max-w-xs mx-auto">Sign in to manage portfolio content</p>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/15 text-left rounded-none flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 text-left mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#111112] border border-white/10 rounded-none pl-9 pr-3.5 py-2.5 w-full text-xs text-white focus:border-[#C9A84C] outline-none tracking-wide transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#111112] border border-white/10 rounded-none pl-9 pr-3.5 py-2.5 w-full text-xs text-white focus:border-[#C9A84C] placeholder-white/20 outline-none tracking-wide transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-50 text-[#111112] text-xs font-mono font-bold uppercase tracking-widest py-3 transition-colors cursor-pointer rounded-none mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
