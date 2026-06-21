import React, { useState, useEffect } from "react";
import { Lock, LogOut, Check, AlertCircle, Server } from "lucide-react";

interface AdminSettingsProps {
  onLogoutAllSessions?: () => void;
  onLogout?: () => void;
}

export default function AdminSettings({ onLogoutAllSessions, onLogout }: AdminSettingsProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isTerminatingSessions, setIsTerminatingSessions] = useState(false);
  
  const [cloudName, setCloudName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [provider, setProvider] = useState("cloudinary");
  const [isSavingStorage, setIsSavingStorage] = useState(false);
  const [storageMessage, setStorageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [terminationMessage, setTerminationMessage] = useState<string | null>(null);

  // Synchronize Cloudinary settings
  useEffect(() => {
    const fetchStorageConfig = async () => {
      const token = localStorage.getItem("admin_token");
      try {
        const res = await fetch("/api/admin/cloudinary-config", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCloudName(data.data.cloudName || "");
          setApiKey(data.data.apiKey || "");
          setApiSecret(data.data.apiSecret || "");
          setProvider(data.data.provider || "cloudinary");
        }
      } catch (err) {
        console.error("Failed to load Cloudinary config in settings:", err);
      }
    };
    fetchStorageConfig();
  }, []);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("The proposed password is too simple. Please provide a passkey of at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The new passwords do not correspond. Verify that confirm password matches exactly.");
      return;
    }

    setIsChangingPass(true);
    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Your private administrative passphrase has been altered successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.error || "The current password inputted is incorrect.");
      }
    } catch (err) {
      setErrorMessage("Network error: failed to establish connection with security gateway.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleTerminateOtherSessions = async () => {
    if (!window.confirm("Are you certain you wish to purge and invalidate all other active logon sessions? You will remain signed in on this client browser, but all other browsers will be logged out immediate.")) {
      return;
    }

    setIsTerminatingSessions(true);
    setErrorMessage(null);
    setTerminationMessage(null);

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/logout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTerminationMessage("All other active logon sessions were purged. System token versions have been incremented.");
        if (onLogoutAllSessions) onLogoutAllSessions();
        setTimeout(() => setTerminationMessage(null), 4000);
      } else {
        setErrorMessage(data.error || "Failed to purge external login contexts.");
      }
    } catch (err) {
      setErrorMessage("Network error: failed to contact central sessions server.");
    } finally {
      setIsTerminatingSessions(false);
    }
  };

  const handleStorageConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStorageMessage(null);
    
    if (isSavingStorage) return;

    if (!cloudName || !cloudName.trim()) {
      setStorageMessage({ type: "error", text: "Cloudinary cloud name is required." });
      return;
    }
    if (!apiKey || !apiKey.trim()) {
      setStorageMessage({ type: "error", text: "Cloudinary API key is required." });
      return;
    }
    if (!apiSecret || !apiSecret.trim()) {
      setStorageMessage({ type: "error", text: "Cloudinary API secret is required." });
      return;
    }

    setIsSavingStorage(true);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/cloudinary-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          cloudName: cloudName.trim(), 
          apiKey: apiKey.trim(), 
          apiSecret: apiSecret.trim(), 
          provider 
        })
      });
      const data = await res.json();
      if (data.success) {
        setStorageMessage({ type: "success", text: "Storage configuration updated successfully." });
        setTimeout(() => setStorageMessage(null), 5000);
      } else {
        setStorageMessage({ type: "error", text: data.error || "Failed to synchronize storage parameters." });
      }
    } catch (err) {
      setStorageMessage({ type: "error", text: "Network error: failed to establish connection with storage gateway." });
    } finally {
      setIsSavingStorage(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl animate-fadeIn text-left">
      <div className="border-b border-white/5 pb-4">
        <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Security & Settings</h4>
        <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">
          Perform administrative system maintenance, alter access passkeys, and invalidate rogue sessions.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/15 rounded-none flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-[#C9A84C]/25 rounded-none flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {terminationMessage && (
        <div className="p-4 text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-none flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{terminationMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Passcode Alter Box */}
        <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-none flex flex-col gap-5">
          <h5 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C9A84C]" />
            <span>Altering Access Passphrase</span>
          </h5>

          <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-4 font-mono text-xs">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Current Passphrase</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">New Proposed Passphrase</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Confirm New Passphrase</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-3.5 bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-50 text-[#111112] text-xs font-bold uppercase tracking-widest self-start rounded-none mt-2 transition-colors cursor-pointer"
            >
              {isChangingPass ? "Hashing and Altering..." : "Alter Passphrase"}
            </button>
          </form>
        </div>

        {/* Sessions Purge Box */}
        <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-none flex flex-col gap-5 justify-between h-full min-h-[350px]">
          <div>
            <h5 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Logon Sessions Management</span>
            </h5>
            
            <p className="text-sm font-sans font-light text-[#D5D3CC] leading-relaxed mt-4">
              To guarantee physical account security across external computers and mobile browsers, you can force the system to invalidate and invalidate all other authenticated session tokens immediately. This increments your account token cryptographic salt, logging out all other devices.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              onClick={handleTerminateOtherSessions}
              disabled={isTerminatingSessions}
              className="w-full py-3.5 border border-red-500/20 hover:border-red-400 hover:bg-red-500/5 text-red-400 transition-all font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50"
            >
              {isTerminatingSessions ? "Terminating other devices..." : "Terminate All Other Sessions"}
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white transition-all font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer border border-white/10"
              >
                Sign out of current browser
              </button>
            )}
          </div>
        </div>

        {/* Production Media Storage Integration */}
        <div className="col-span-1 md:col-span-2 bg-[#1C1C1E] border border-white/5 p-6 rounded-none flex flex-col gap-5 mt-4">
          <h5 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#C9A84C]" />
            <span>Production Media Storage Integration</span>
          </h5>
          
          <p className="text-xs font-mono text-[#8E8E93] leading-relaxed">
            Configure your Cloudinary Free Tier storage parameters to securely hand off gallery and profile media uploads. Deployed instances will stream optimized binaries directly into Cloudinary folders.
          </p>

          <form onSubmit={handleStorageConfigSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {storageMessage && (
              <div className={`p-4 text-xs font-mono border rounded-none flex items-center gap-2.5 md:col-span-2 ${
                storageMessage.type === "success" 
                  ? "bg-green-500/10 text-green-400 border-green-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{storageMessage.text}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left md:col-span-2">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Media Storage Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none"
              >
                <option value="cloudinary">Cloudinary (Production Default)</option>
              </select>
              <span className="text-[9px] text-[#8E8E93] font-sans mt-0.5 leading-relaxed block">
                Direct integration only supports Cloudinary.
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Cloudinary Cloud Name (CLOUDINARY_CLOUD_NAME)</label>
              <input
                type="text"
                required
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                placeholder="e.g. dxyz12345"
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Cloudinary API Key (CLOUDINARY_API_KEY)</label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. 123456789012345"
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left md:col-span-2">
              <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Cloudinary API Secret (CLOUDINARY_API_SECRET)</label>
              <input
                type="password"
                required
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingStorage}
              className="px-5 py-3.5 bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-50 text-[#111112] text-xs font-bold uppercase tracking-widest self-start rounded-none mt-2 transition-colors cursor-pointer md:col-span-2 font-mono"
            >
              {isSavingStorage ? "SAVING..." : "Update Storage Configuration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
