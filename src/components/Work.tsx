import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Sparkles } from "lucide-react";
import { SelectedWorkItem } from "../types";

interface WorkProps {
  selectedWork: SelectedWorkItem[];
}

export default function Work({ selectedWork }: WorkProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!selectedWork || selectedWork.length === 0) return null;

  return (
    <section id="selected-work" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-28">

        {/* Section Main Header Wordmark */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Section 02
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              Featured Work
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              Selected communication projects, campaigns, and initiatives that reflect Tochukwu's experience across advocacy, media, and public engagement.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <FileText className="w-4 h-4" />
            <span>FEATURED PROJECTS</span>
          </div>
        </div>

        {/* Dynamic Map of Engagements/Selected Work */}
        {selectedWork.map((project, index) => {
          const isOdd = index % 2 === 1;
          
          return (
            <div key={project.id || index} className="flex flex-col gap-28 text-left">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start bg-[#1E1E20]/40 border border-white/5 lg:border-none lg:bg-transparent p-5 sm:p-8 lg:p-0 rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                {/* Graphics Panel (Alternating Layout) */}
                {/* For odd layout, graphics stays first on Desktop; on Mobile, stays last or follows flow */}
                <div className={`lg:col-span-6 ${isOdd ? "order-last lg:order-first" : "order-last lg:order-last"}`}>
                  <motion.div 
                    className="relative bg-[#202022] border border-[#C9A84C]/30 p-6 sm:p-8 flex flex-col justify-between aspect-video sm:aspect-[3/2] overflow-hidden rounded-lg"
                    whileHover={isMobile ? undefined : { scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-[#C9A84C]/50 uppercase">
                      FEATURED PROJECT
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-brand-muted uppercase">
                        {project.graphicHeader || "Project Overview"}
                      </span>
                      <h5 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#FDFBF7]/90 font-semibold italic">
                        {project.graphicTitle}
                      </h5>
                      <div className="w-16 h-px bg-brand-gold" />
                    </div>

                    {/* Rendering different graphics based on project structure to keep premium visuals */}
                    {project.graphicLabel1 && (
                      <div className="flex flex-col gap-1 mt-4 sm:mt-8">
                        <div className="text-[10px] font-mono text-brand-muted uppercase">
                          {project.graphicLabel1}
                        </div>
                        <div className="text-3xl sm:text-5xl font-serif font-semibold text-brand-gold tracking-tight">
                          {project.graphicValue1}
                        </div>
                        <div className="text-[11px] sm:text-xs text-[#8E8E93] font-sans">
                          {project.graphicDesc1}
                        </div>
                      </div>
                    )}

                    {project.graphicItems && (
                      <div className="flex flex-col gap-2 my-2 sm:my-4">
                        {project.graphicItems.map((gi, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] sm:text-xs py-1.5 border-b border-white/5">
                            <span className="text-brand-cream/90 font-sans truncate pr-2">{gi.label}</span>
                            <span className="text-[9px] font-mono text-brand-gold uppercase shrink-0">{gi.tag}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!project.graphicLabel1 && !project.graphicItems && project.graphicDesc1 && (
                      <div className="my-2 sm:my-4 bg-brand-dark/50 border border-white/5 p-3 sm:p-4 rounded-sm flex flex-col gap-1.5">
                        <div className="text-[9px] font-mono text-brand-gold uppercase tracking-widest">Global Communications Brief</div>
                        <p className="text-[11px] sm:text-xs text-[#8E8E93] italic font-serif leading-relaxed line-clamp-3">
                          "{project.graphicDesc1}"
                        </p>
                      </div>
                    )}

                    {/* Decos at bottom */}
                    <div className="border-t border-[#C9A84C]/20 pt-4 mt-4 flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-brand-muted">
                      <span>{(project.role || "").toUpperCase()}</span>
                      <span className="text-brand-gold">{(project.focus || "").toUpperCase()}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Left/Right Text Content (Alternating layout) */}
                <div className={`lg:col-span-6 flex flex-col gap-6 ${isOdd ? "order-first lg:order-last" : "order-first lg:order-first"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-mono text-brand-gold font-medium bg-brand-gold/10 px-2.5 py-1 rounded inline-block whitespace-normal leading-normal">
                      {project.organization}
                    </span>
                  </div>
                  
                  <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-tight text-[#F9F7F3] leading-snug">
                    {project.title}
                  </h4>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#C9A84C]/20">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-brand-gold block mb-1">Role</span>
                      <span className="text-xs sm:text-sm font-semibold text-brand-cream">{project.role}</span>
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-brand-gold block mb-1">Communication Focus</span>
                      <span className="text-xs sm:text-sm text-brand-muted">{project.focus}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Contribution (Key Responsibilities)</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm text-brand-cream/80 font-light">
                      {project.contributions.map((con, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 p-4 sm:p-5 rounded-lg bg-brand-gold/5 border border-brand-gold/25 flex flex-col gap-1">
                    <span className="text-[9px] sm:text-[10px] font-mono text-brand-gold uppercase tracking-widest font-semibold">Impact</span>
                    <p className="text-sm sm:text-base font-serif text-[#FDFBF7] font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
                      {project.impact}
                    </p>
                  </div>
                </div>
              </motion.div>

              {index < (selectedWork.length - 1) && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
              )}
            </div>
          );
        })}

      </div>
    </section>
  );
}
