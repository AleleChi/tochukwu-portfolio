import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";
import { Hero as HeroType, Organization } from "../types";

interface HeroProps {
  hero: HeroType;
  organisations: Organization[];
}

const getIcon = (name: string) => {
  const IconComponent = (Lucide as any)[name];
  return IconComponent || Lucide.Globe;
};

export default function Hero({ hero, organisations }: HeroProps) {
  const [activePersonaId, setActivePersonaId] = useState<number>(0);
  const activePersona = hero.personas?.find(p => p.id === activePersonaId) || hero.personas?.[0];

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (!hero || !hero.personas || hero.personas.length === 0) {
    return null;
  }

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="flex items-center py-8 sm:py-12 lg:py-20 px-6 md:px-12 max-w-7xl mx-auto w-full selection:bg-[#C9A84C] selection:text-[#111112]">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16 w-full items-center">
        
          {/* LEFT CONTAINER (Editorial Headlines + Copy + Actions) */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center gap-6 sm:gap-8 w-full">
            
            {/* Editorial label */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-[1px] bg-[#C9A84C]/45" />
              <span className="text-[10px] tracking-[0.2em] text-[#C9A84C] font-mono uppercase font-semibold">
                COMMUNICATION STRATEGY // PROFILE
              </span>
            </div>

            {/* Headline Section - Large luxurious editorial serif */}
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl sm:text-5xl lg:text-5xl xl:text-7xl font-serif font-semibold tracking-tight leading-[1.12] text-[#F9F7F3]">
                {/* Dynamically highlights portion of the headline if configured, or uses default design */}
                I communicate ideas,<br />
                tell stories,<br />
                and engage <span className="italic text-[#C9A84C] font-light font-serif">communities.</span>
              </h2>
            </div>

            {/* Custom Dividing Separator */}
            <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />

            {/* Subheading Body Code */}
            <p className="text-sm sm:text-base md:text-lg text-brand-cream/85 leading-relaxed font-sans max-w-xl font-light">
              {hero.description}
            </p>

            {/* Actions Block */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2 select-none">
              <button
                onClick={() => scrollToId("selected-work")}
                className="group relative cursor-pointer px-6 py-3.5 border border-[#C9A84C]/50 bg-[#C9A84C]/5 text-[#F9F7F3] hover:bg-[#C9A84C] hover:text-[#111112] text-center font-mono text-[10.5px] uppercase tracking-widest font-semibold transition-all duration-300"
              >
                {hero.primaryCTA || "View My Work"}
              </button>

              <button
                onClick={() => scrollToId("contact")}
                className="group cursor-pointer px-6 py-3.5 border border-white/10 bg-[#161618]/40 hover:bg-white/5 text-brand-cream hover:text-[#C9A84C] text-center font-mono text-[10.5px] uppercase tracking-widest font-medium transition-all duration-300"
              >
                {hero.secondaryCTA || "Start Conversation"}
              </button>
            </div>

            {/* BOTTOM INFORMATION (Focus Areas capability line replacing the bento blocks) */}
            <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#C9A84C] font-semibold">
                Focus Areas
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                {[
                  "Strategic Communication",
                  "Public Engagement",
                  "Media Relations",
                  "Storytelling"
                ].map((area, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-[#C9A84C]/70">0{idx + 1}</span>
                    <span className="text-xs sm:text-sm text-brand-cream/80 font-light font-sans tracking-wide">
                      {area}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT CONTAINER (Refined Portrait Canvas Room with subtle editorial framing) */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col justify-center w-full mt-4 lg:mt-0">
            
            {/* Refined editorial frame */}
            <div className="relative bg-[#161618] p-4 border border-white/10 shadow-2xl flex flex-col w-full">
              
              {/* Clean section marker */}
              <div className="flex items-center justify-between font-mono text-[9px] text-[#C9A84C]/60 uppercase tracking-[0.15em] mb-3 select-none">
                <span>PROFILE</span>
                <span className="text-white/40">0{activePersona.id + 1} // 04</span>
              </div>

              {/* Main Portrait Box with responsive aspect ratio */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] w-full bg-brand-dark overflow-hidden border border-white/15">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePersona.id}
                    className="absolute inset-0 w-full h-full object-cover object-top filter contrast-[1.01] brightness-[0.98]"
                    src={activePersona.filePath}
                    alt={`Tochukwu Ogunaka - ${activePersona.label}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                    }}
                    initial={{ opacity: 0, filter: "brightness(0.5) contrast(1.05)" }}
                    animate={{ opacity: 1, filter: "brightness(0.98) contrast(1.01)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                {/* Subtle lower vignette to support legibility & blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Elegant Active Persona Profile Presentation */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2.5 text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePersona.id}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex flex-col gap-1.5"
                  >
                    {/* Category/Area */}
                    <span className="text-[9px] font-mono tracking-[0.2em] text-[#C9A84C] uppercase font-bold">
                      {activePersona.label}
                    </span>
                    {/* Role */}
                    <span className="text-sm font-serif font-semibold text-[#FDFBF7] tracking-tight">
                      {activePersona.portraitName}
                    </span>
                    {/* Profile Summary */}
                    <p className="text-xs text-brand-cream/75 leading-relaxed font-sans font-light mt-1">
                      {activePersona.focus}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Selector Row in Frame */}
              <div className="flex flex-row justify-between border-t border-white/10 mt-4 pt-3 gap-1 select-none">
                {hero.personas.map((p) => {
                  const isActive = p.id === activePersonaId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePersonaId(p.id)}
                      className={`group flex items-center gap-1 transition-all duration-300 cursor-pointer text-left pb-1 border-b ${
                        isActive 
                          ? "border-[#C9A84C] text-[#C9A84C] font-semibold" 
                          : "border-transparent text-brand-cream/40 hover:text-brand-cream/85"
                      }`}
                    >
                      <span className="text-[8.5px] font-mono opacity-50">0{p.id + 1}</span>
                      <span className="text-[9.5px] uppercase font-mono tracking-widest truncate max-w-[55px] sm:max-w-none">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── ORGANIZATIONS & TRUST SECTION (Luxury Annual Report Aesthetic) ── */}
      <motion.section 
        className="w-full bg-[#1C1C1E] py-24 px-6 md:px-12 border-t border-[#C9A84C]/30 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
                Organizations & Institutions
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-tight">
                Organizations and institutions I have contributed to.
              </h3>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono text-brand-muted shrink-0 lg:mb-2 bg-black/25 border border-white/5 py-1.5 px-4 rounded-full">
              <Lucide.Globe className="w-3.5 h-3.5 text-brand-gold" />
              <span>Communication, Advocacy & Development</span>
            </div>
          </div>

          {/* Luxury Editorial Grid (4 Cols on desktop, divided by thin antique gold lines) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-[#C9A84C]/20">
            {organisations.map((org, index) => {
              const OrgIcon = getIcon(org.icon);
              return (
                <div 
                  key={index}
                  className="p-6 sm:p-8 border-r border-b border-[#C9A84C]/20 hover:brightness-125 transition-all duration-300 group flex flex-col justify-between min-h-[190px] sm:min-h-[220px] bg-[#1C1C1E]"
                >
                  {/* Item index & Icon indicator */}
                  <div className="flex justify-between items-center mb-6 sm:mb-8">
                    <div className="w-2 h-2 rounded-full bg-brand-gold/40" />
                    <OrgIcon className="w-4 h-4 text-brand-muted group-hover:text-brand-gold transition-colors duration-300" />
                  </div>

                  {/* Typographic Logo wordmark */}
                  <div className="mb-4">
                    <div className="text-lg xl:text-xl font-serif font-bold tracking-tight text-[#F9F7F3] group-hover:text-white transition-colors duration-300 mb-2">
                      {org.logoName}
                    </div>
                    {/* Full institutional name */}
                    <p className="text-xs text-[#8E8E93] group-hover:text-brand-cream/80 transition-colors duration-300 font-sans leading-relaxed">
                      {org.fullName}
                    </p>
                  </div>

                  {/* Foot metadata */}
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-brand-muted">
                    <span>{org.roleType}</span>
                    <span className="text-[#C9A84C]/70">{org.region}</span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </motion.section>
    </>
  );
}
