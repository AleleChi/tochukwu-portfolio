import { motion } from "motion/react";
import { Users, Quote } from "lucide-react";
import { Testimonial } from "../types";

interface EndorsementsProps {
  testimonials?: Testimonial[];
}

export default function Endorsements({ testimonials }: EndorsementsProps) {
  const dynamicTestimonials = testimonials || [];

  return (
    <section id="endorsements" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 font-sans selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24 font-sans text-left">

        {/* Section Header */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Professional Recommendations
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              Professional Recommendations
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              Perspectives from colleagues, collaborators, and organizations who have worked with Tochukwu.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <Users className="w-4 h-4 text-brand-gold" />
            <span>Recommendations</span>
          </div>
        </div>

        {/* Dynamic Editorial Grid of Endorsements */}
        {dynamicTestimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {dynamicTestimonials.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                className="relative bg-[#171719] border border-white/5 p-8 md:p-10 rounded-lg shadow-xl flex flex-col justify-between gap-6 hover:border-[#C9A84C]/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="absolute top-6 right-6 text-[#C9A84C]/10 select-none pointer-events-none">
                  <Quote className="w-8 h-8" />
                </div>
                
                <p className="text-sm sm:text-base text-[#D5D3CC] font-sans font-light leading-relaxed relative z-10 italic">
                  "{item.quote}"
                </p>

                <div className="pt-6 border-t border-white/5 flex flex-col">
                  <span className="text-sm font-serif font-semibold text-[#FDFBF7]">{item.name}</span>
                  <span className="text-xs text-[#8E8E93] mt-1">
                    {item.role}, <span className="text-brand-gold/80">{item.organization}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Core Content: Clean, High-Contrast Editorial Statement Card */}
        <div className="max-w-4xl mx-auto w-full">
          <motion.div 
            className="relative bg-[#171719] border border-white/5 p-8 md:p-16 rounded-xl overflow-hidden flex flex-col gap-8 justify-center items-center text-center shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Extra elegant quote watermark */}
            <div className="absolute top-6 right-10 text-[100px] sm:text-[140px] font-serif text-[#C9A84C]/5 select-none leading-none pointer-events-none">
              “
            </div>

            <div className="flex flex-col gap-4 relative z-10 items-center">
              <span className="text-brand-gold text-[10px] font-mono uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                Availability Notice
              </span>
              
              <h4 className="text-2xl sm:text-3xl font-serif text-[#FDFBF7] leading-snug tracking-tight max-w-2xl">
                Professional references available upon request.
              </h4>
            </div>

            <div className="w-16 h-px bg-[#C9A84C]/40" />

            <p className="text-base text-[#D5D3CC] font-sans font-light leading-relaxed max-w-2xl">
              Tochukwu has collaborated with diverse non-profit organizations, media groups, and community programs in Abuja, Nigeria. Detailed references, verification contact logs, and personal recommendations from senior leaders, project coordinators, and initiative partners are available for verification upon request.
            </p>

            <div className="pt-4">
              <a 
                href="#contact"
                className="inline-flex items-center gap-3 text-xs font-mono text-[#121214] bg-brand-gold hover:bg-[#DBC19D] pt-3.5 pb-3 px-8 rounded-sm tracking-[0.15em] font-bold transition-all duration-300 shadow-md hover:scale-[1.01]"
              >
                REQUEST REFERENCES
              </a>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
