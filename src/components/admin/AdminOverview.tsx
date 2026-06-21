import React from "react";
import { ArrowRight, BookOpen, Clock, Image as ImageIcon, Mail } from "lucide-react";

interface AdminOverviewProps {
  experienceCount: number;
  articlesCount: number;
  mediaCount: number;
  messagesCount: number;
  setActiveTab: (tab: any) => void;
  currentUser: any;
}

export default function AdminOverview({
  experienceCount,
  articlesCount,
  mediaCount,
  messagesCount,
  setActiveTab,
  currentUser
}: AdminOverviewProps) {
  return (
    <div className="flex flex-col gap-6 max-w-5xl animate-fadeIn">
      <div className="border-b border-white/5 pb-4">
        <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Overview</h4>
        <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">
          Manage portfolio content, media, publications, enquiries and professional information.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-[#C9A84C]/30 transition-all">
          <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest">History Events</span>
          <h5 className="text-3xl font-serif font-bold text-white mt-2">{experienceCount}</h5>
          <span className="text-[9px] text-[#8E8E93] font-mono mt-1 uppercase">Timeline History</span>
        </div>

        <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-[#C9A84C]/30 transition-all">
          <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest">Published Essays</span>
          <h5 className="text-3xl font-serif font-bold text-white mt-2">{articlesCount}</h5>
          <span className="text-[9px] text-[#8E8E93] font-mono mt-1 uppercase">Articles & Perspectives</span>
        </div>

        <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-[#C9A84C]/30 transition-all">
          <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest">Media Objects</span>
          <h5 className="text-3xl font-serif font-bold text-white mt-2">{mediaCount}</h5>
          <span className="text-[9px] text-[#8E8E93] font-mono mt-1 uppercase">Visual media in library</span>
        </div>

        <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-[#C9A84C]/30 transition-all text-[#C9A84C] bg-[#C9A84C]/5 border-[#C9A84C]/20">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">Messages</span>
          <h5 className="text-3xl font-serif font-bold text-[#FDFBF7] mt-2">{messagesCount}</h5>
          <span className="text-[9px] text-[#C9A84C]/80 font-mono mt-1 uppercase">Enquiries received</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Editorial Workflows card */}
        <div className="md:col-span-2 bg-[#1C1C1E] border border-white/5 p-6 rounded-none text-left flex flex-col gap-4">
          <h5 className="font-serif text-lg font-bold text-white">Editorial Workflows</h5>
          <p className="text-sm text-[#D5D3CC] leading-relaxed">
            Manage portfolio content, media, publications, enquiries and professional information. Update background bio parameters, upload editorial pictures, adjust credentials, organize public essays, or respond directly to professional message logs.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={() => setActiveTab("profile")}
              className="px-4 py-2 border border-white/5 hover:bg-white/10 text-white rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              Identity Profile
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className="px-4 py-2 border border-white/5 hover:bg-white/10 text-white rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              Experience Timeline
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className="px-4 py-2 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 text-[#C9A84C] rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              Write Essay
            </button>
            <button
              onClick={() => setActiveTab("mediaLibrary")}
              className="px-4 py-2 bg-[#C9A84C] hover:bg-[#DBC19D] text-black font-semibold rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              Media Manager
            </button>
          </div>
        </div>

        {/* Account Overview Card */}
        <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-none text-left flex flex-col gap-3">
          <h5 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C9A84C]">Account Overview</h5>
          <div className="flex flex-col gap-2.5 mt-1 text-xs text-[#8E8E93] font-mono">
            <div className="flex justify-between border-b border-white/5 pb-1.5 font-sans">
              <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Profile:</span>
              <span className="text-[#FDFBF7] font-medium font-serif">{currentUser?.name || "Tochukwu Ogunaka"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5 font-sans">
              <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Account Role:</span>
              <span className="text-[#FDFBF7] font-medium font-serif">{currentUser?.role || "Studio Owner"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5 font-sans">
              <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Email Address:</span>
              <span className="text-[#FDFBF7] font-medium truncate max-w-[150px]">{currentUser?.email || "ogunakatochukwu@gmail.com"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5 font-sans">
              <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Workspace Panel:</span>
              <span className="text-[#FDFBF7] font-medium font-serif">Portfolio Studio</span>
            </div>
            <div className="flex justify-between pointer-events-none font-sans">
              <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Website Status:</span>
              <span className="text-emerald-400 font-semibold uppercase">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
