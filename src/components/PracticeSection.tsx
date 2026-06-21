import { motion } from "motion/react";
import { Practice } from "../types";

interface PracticeSectionProps {
  practice: Practice;
}

export default function PracticeSection({ practice }: PracticeSectionProps) {
  if (!practice) return null;

  return (
    <motion.section 
      id="practice-overview" 
      className="w-full bg-[#1C1C1E] py-24 sm:py-32 px-6 md:px-12 border-t border-white/5 relative z-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* LEFT Side: Introduction Copy */}
        <div className="lg:col-span-6 flex flex-col gap-6 sm:gap-8 justify-start text-left">
          {/* Section label */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-[1px] bg-[#C9A84C]/45" />
            <span className="text-[10px] tracking-[0.25em] text-[#C9A84C] font-mono uppercase font-semibold">
              {practice.title || "COMMUNICATION PRACTICE // 02"}
            </span>
          </div>

          {/* Main Heading */}
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold tracking-tight text-[#F9F7F3] leading-[1.2] max-w-xl">
            Building clarity between organizations, communities, and people.
          </h3>

          {/* Subtle dividing element */}
          <div className="w-16 h-[1px] bg-[#C9A84C]/35" />

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-brand-cream/80 font-light font-sans leading-relaxed max-w-lg">
            Through strategic communication, public engagement, and storytelling, I help organizations communicate with purpose, build trust, and create meaningful connections.
          </p>
        </div>

        {/* RIGHT Side: Three Communication Pillars */}
        <div className="lg:col-span-6 flex flex-col gap-10 mt-8 lg:mt-0 pt-8 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/15 lg:pl-16 text-left">
          
          {practice.pillars?.map((pillar, index) => (
            <div key={pillar.id || index} className="flex flex-col gap-12">
              <div className="flex flex-col gap-2.5 group">
                <div className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#C9A84C] font-semibold leading-none">
                  <span>{pillar.id} //</span>
                  <span>{pillar.title}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-serif font-medium text-white tracking-tight leading-snug group-hover:text-[#C9A84C] transition-colors duration-300">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-brand-cream/70 font-light font-sans leading-relaxed max-w-md">
                  {pillar.description}
                </p>
              </div>

              {index < (practice.pillars.length - 1) && (
                <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}
            </div>
          ))}

        </div>

      </div>
    </motion.section>
  );
}
