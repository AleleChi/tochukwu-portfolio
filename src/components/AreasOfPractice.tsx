import { motion } from "motion/react";
import { Compass } from "lucide-react";
import { PracticeArea } from "../types";

interface AreasOfPracticeProps {
  areasOfPractice: PracticeArea[];
}

export default function AreasOfPractice({ areasOfPractice }: AreasOfPracticeProps) {
  if (!areasOfPractice || areasOfPractice.length === 0) return null;

  return (
    <section id="areas-of-practice" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24">

        {/* Section Header */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Areas of Practice
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              Areas of Practice
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              Communication expertise shaped around advocacy, storytelling, public engagement, and helping organizations connect clearly with their audiences.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <Compass className="w-4 h-4" />
            <span>COMMUNICATION EXPERTISE</span>
          </div>
        </div>

        {/* Alternating Two-Column Practice Area List */}
        <div className="flex flex-col">
          {areasOfPractice.map((area, index) => {
            const isAlternate = index % 2 === 1;
            return (
              <motion.div 
                key={index}
                className="border-b border-[#C9A84C]/25 py-12 lg:py-16 md:grid md:grid-cols-12 md:gap-12 lg:gap-16 items-center group transition-colors duration-300 hover:bg-neutral-900/40 px-4 -mx-4 text-left"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Title Column */}
                <div className={`md:col-span-5 flex flex-col gap-2 ${isAlternate ? "md:order-last md:text-right md:items-end" : "md:items-start"}`}>
                  <h4 className="text-2xl sm:text-3xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-snug group-hover:text-brand-gold transition-colors duration-300">
                    {area.title}
                  </h4>
                </div>

                {/* Description Column */}
                <div className={`md:col-span-7 mt-4 md:mt-0 ${isAlternate ? "md:text-right flex md:justify-end" : "flex md:justify-start"}`}>
                  <p className={`text-sm sm:text-base text-[#D5D3CC] font-light font-sans leading-relaxed max-w-lg ${isAlternate ? "md:text-right" : "md:text-left"}`}>
                    {area.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
