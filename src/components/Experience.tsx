import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { ExperienceItem } from "../types";

interface ExperienceProps {
  experience: ExperienceItem[];
}

export default function Experience({ experience }: ExperienceProps) {
  if (!experience || experience.length === 0) return null;

  return (
    <section id="professional-experience" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24">

        {/* Header Block */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Experience & Leadership
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              Experience & Leadership
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              Experience across communication, advocacy, media support, and community-focused initiatives.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <Briefcase className="w-4 h-4" />
            <span>EXPERIENCE & LEADERSHIP</span>
          </div>
        </div>

        {/* Timeline Experience Grid */}
        <div className="flex flex-col relative border-l-0 pl-0 md:border-l md:border-[#C9A84C]/20 md:pl-0 text-left">
          {experience.map((exp, index) => {
            return (
              <motion.div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 relative pb-10 md:pb-16 last:pb-0 group bg-[#1E1E20]/40 md:bg-transparent border border-white/5 md:border-none p-5 sm:p-6 md:p-0 rounded-xl mb-6 md:mb-0 last:mb-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                {/* Left Column: Chronology (Year Marker) */}
                <div className="md:col-span-3 flex md:flex-col md:text-right items-baseline md:items-end gap-2 pr-0 md:pr-8 relative">
                  {/* Timeline dot locator for decorative alignment */}
                  <div className="hidden md:block absolute md:right-[-5px] top-2 w-[9px] h-[9px] rounded-full bg-[#C9A84C] border-2 border-[#1C1C1E]" />
                  
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#C9A84C] group-hover:text-brand-gold transition-colors duration-300">
                    {exp.year}
                  </span>
                  {exp.location && (
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] mt-1 block">
                      {exp.location}
                    </span>
                  )}
                </div>

                {/* Right Column: Roles, Organizations and Highlights */}
                <div className="md:col-span-9 flex flex-col gap-4 md:border-l md:border-[#C9A84C]/15 md:pl-12">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-mono font-medium text-brand-gold tracking-wide uppercase">
                      {exp.organization}
                    </p>
                    <h4 className="text-lg sm:text-xl md:text-2xl font-serif font-medium text-[#FDFBF7] tracking-tight group-hover:text-brand-gold transition-colors duration-300">
                      {exp.role}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-1 border-t border-white/5 pt-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E93] block mb-1.5">
                        Contribution
                      </span>
                      <p className="text-xs sm:text-sm text-[#D5D3CC] font-light leading-relaxed font-sans">
                        {exp.contribution}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-gold block mb-1.5">
                        Impact
                      </span>
                      <p className="text-xs sm:text-sm text-[#D5D3CC] font-light leading-relaxed font-sans">
                        {exp.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
