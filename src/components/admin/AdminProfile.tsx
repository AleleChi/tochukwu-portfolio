import React, { useState } from "react";
import { User, Shield, Calendar, Mail, Check, AlertCircle } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Studio Owner" | "Administrator";
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
}

interface AdminProfileProps {
  currentUser: AdminUser;
  allAdmins: AdminUser[];
  onRefresh: () => void;
  setActiveTab?: (tab: any) => void;
}

export default function AdminProfile({ currentUser, allAdmins, onRefresh, setActiveTab }: AdminProfileProps) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Your administrator profile details have been successfully saved.");
        onRefresh();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(data.error || "Failed to update profile details.");
      }
    } catch (err) {
      setErrorMessage("Network error: failed to resolve communication with the authentication server.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl animate-fadeIn text-left">
      <div className="border-b border-white/5 pb-4">
        <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Identity Profile</h4>
        <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">
          Review, configure, and manage your administrative credential settings and role allocations.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/15 rounded-none flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-none flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card Summary */}
        <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-none flex flex-col gap-5">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-12 h-12 bg-[#2C2C2E] flex items-center justify-center text-[#C9A84C] border border-[#C9A84C]/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-serif text-base font-bold text-white">{currentUser?.name}</h5>
              <div className="flex items-center gap-1.5 mt-0.5 text-[#8E8E93] font-mono text-[9px] uppercase tracking-wider">
                <Shield className="w-3 h-3 text-[#C9A84C]" />
                <span className="text-[#C9A84C] font-semibold">{currentUser?.role}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs text-[#8E8E93] pb-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase text-[#C9A84C] tracking-wider font-semibold">Email Address</span>
              <span className="text-[#D5D3CC] font-sans text-sm">{currentUser?.email}</span>
            </div>

            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[9px] uppercase text-[#C9A84C] tracking-wider font-semibold">Last System Logon</span>
              <span className="text-[#D5D3CC]">
                {currentUser?.lastLogin 
                  ? new Date(currentUser.lastLogin).toLocaleString() 
                  : "First active session"}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 mt-1 border-t border-white/5 pt-3">
              <span className="text-[9px] uppercase text-[#8E8E93] tracking-wider font-semibold">Account Initialized</span>
              <span className="text-white/60">
                {currentUser?.createdAt 
                  ? new Date(currentUser.createdAt).toLocaleDateString() 
                  : "Active since migration"}
              </span>
            </div>
          </div>

          {setActiveTab && (
            <button
              onClick={() => setActiveTab("settings")}
              className="w-full mt-2 py-2 border border-white/5 hover:border-[#C9A84C] text-[#8E8E93] hover:text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition-all bg-white/[0.01]"
            >
              Password Management Options
            </button>
          )}
        </div>

        {/* Update Details Form */}
        <div className="lg:col-span-2 bg-[#1C1C1E] border border-white/5 p-6 rounded-none flex flex-col gap-5">
          <h5 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-2.5">Edit Personal Information</h5>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 font-mono text-xs">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Full Profile Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Registered Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-[#8E8E93] focus:text-white focus:border-[#C9A84C] outline-none font-sans"
              />
              <span className="text-[9px] text-[#8E8E93] font-light italic mt-0.5 leading-relaxed font-sans block">
                Warning: Updating this email will permanently modify your system login identity name.
              </span>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-3.5 bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-50 text-[#111112] text-xs font-bold uppercase tracking-widest self-start rounded-none mt-2 transition-colors cursor-pointer"
            >
              {isUpdating ? "Saving modifications..." : "Save Identity Changes"}
            </button>
          </form>
        </div>
      </div>

      {allAdmins.length > 1 && (
        <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-none mt-4">
          <h5 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-2.5 mb-4">Authorized Administrative Personnel</h5>
          
          <div className="flex flex-col gap-3 font-mono text-xs select-none">
            {allAdmins.map((admin) => (
              <div 
                key={admin.id} 
                className="p-4 border border-white/5 bg-[#111112]/40 rounded-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-[#C9A84C]/20 transition-all font-sans"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-[#2C2C2E] flex items-center justify-center text-[#C9A84C] border border-[#C9A84C]/10 text-xs shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-serif font-bold text-white text-sm flex items-center gap-2">
                      {admin.name}
                      {admin.id === currentUser?.id && (
                        <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/20">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-[#8E8E93]">{admin.email}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-left sm:text-right font-mono text-[10px] text-[#8E8E93] gap-1 shrink-0">
                  <div className="flex items-center gap-1 sm:justify-end text-[#C9A84C] font-semibold">
                    <Shield className="w-3 h-3" />
                    <span>{admin.role}</span>
                  </div>
                  <span>Logon: {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "First time user"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
