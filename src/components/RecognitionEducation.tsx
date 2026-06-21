import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, GraduationCap, BookOpen, Plus, Minus } from "lucide-react";
import { Recognition, Certification } from "../types";
import { MediaImage } from "./MediaImage";

interface RecognitionEducationProps {
  recognition: Recognition;
  certifications: Certification[];
}

export default function RecognitionEducation({ recognition, certifications }: RecognitionEducationProps) {
  const [activeCertIndex, setActiveCertIndex] = useState<number | null>(0);

  if (!recognition || !certifications) return null;

  return (
    <section id="education-recognition" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 font-sans selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24">

        {/* Section Heading Row */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="max-w-3xl font-sans text-left">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Recognition & Education
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              Recognition & Education
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              Academic achievements, professional development, and experiences that have shaped Tochukwu's communication journey.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <Award className="w-4 h-4 text-brand-gold" />
            <span>Recognition</span>
          </div>
        </div>

        {/* RECOGNITION (Asymmetric Editorial Magazine Spread) */}
        <div className="flex flex-col gap-8 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-wider font-semibold">Recognition</span>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Left Column: Premium publication cover / open journal flatlay representation */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] rounded-sm group">
                <MediaImage 
                  src={recognition.image}
                  alt="MarketingWorld Print Portrait"
                  imageClassName="grayscale contrast-[1.1] brightness-[0.8] transition-transform duration-700 group-hover:scale-101"
                  className="w-full h-full border-none"
                />
                {/* Subtle Elegant Badge on the image */}
                <div className="absolute top-6 left-6 bg-[#1C1C1E] border border-[#C9A84C]/45 px-4 py-2 flex flex-col">
                  <span className="text-[10px] font-mono text-brand-gold tracking-widest font-bold">Recognition</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] border-b border-[#C9A84C]/25 pb-2">
                <span>{recognition.caption}</span>
              </div>
            </div>

            {/* Right Column: Editorial writeup detailing MarketingWorld Magazine feature */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono text-brand-gold tracking-wider uppercase font-medium">Recognition</span>
                <h4 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-snug">
                  {recognition.title}
                </h4>
              </div>

              <div className="w-12 h-[1px] bg-brand-gold" />

              <p className="text-base text-[#D5D3CC] font-light leading-relaxed font-sans">
                {recognition.description}
              </p>

              {/* Structured insights list */}
              <div className="flex flex-col gap-4 pt-4 border-t border-white/5 mt-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C]">Areas Highlighted</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recognition.areasHighlighted?.map((area, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 border-l border-brand-gold/20 pl-4">
                      <h5 className="text-sm font-serif text-[#FDFBF7] font-semibold">{area.title}</h5>
                      <p className="text-xs text-[#8E8E93] leading-relaxed">{area.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Elegant Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/35 to-transparent" />

        {/* ACADEMIC FOUNDATION (Clean Parallel Editorial Layout) */}
        <div className="flex flex-col gap-12 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-wider font-semibold">Academic Foundation</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Academic Institution 01 */}
            <motion.div 
              className="lg:col-span-6 flex flex-col gap-8 border-r border-[#C9A84C]/10 pr-0 lg:pr-12 last:border-r-0"
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col gap-1.5 relative">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93]">ACADEMIC INSTITUTION 01</span>
                <h4 className="text-2xl sm:text-3xl font-serif font-medium text-[#FDFBF7] tracking-tight">
                  Ahmadu Bello University
                </h4>
                <p className="text-xs font-mono uppercase tracking-widest text-[#C9A84C] mt-1">
                  B.Sc. Sociology // Faculty of Social Sciences
                </p>
              </div>

              <div className="flex items-center gap-6 py-6 border-y border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">RECOGNITION</span>
                  <span className="text-base sm:text-lg font-serif font-semibold text-[#FDFBF7] mt-0.5">Second Best Graduating</span>
                </div>
                <div className="w-px h-10 bg-white/10 text-[#C9A84C]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">CUMULATIVE GPA</span>
                  <span className="text-base sm:text-lg font-mono text-brand-gold font-bold mt-0.5">4.37 / 5.00</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand-gold" />
                  LEADERSHIP & SERVICE PROFILE
                </span>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="flex flex-col gap-1 border-l-2 border-[#C9A84C]/30 pl-3">
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase">ROLE 01</span>
                    <span className="text-xs sm:text-sm font-sans font-medium text-[#D5D3CC]">Faculty Chairperson</span>
                  </div>
                  <div className="flex flex-col gap-1 border-l-2 border-[#C9A84C]/30 pl-3">
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase">ROLE 02</span>
                    <span className="text-xs sm:text-sm font-sans font-medium text-[#D5D3CC]">Academic Secretary</span>
                  </div>
                  <div className="flex flex-col gap-1 border-l-2 border-[#C9A84C]/30 pl-3">
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase">ROLE 03</span>
                    <span className="text-xs sm:text-sm font-sans font-medium text-[#D5D3CC]">Academic Tutor</span>
                  </div>
                  <div className="flex flex-col gap-1 border-l-2 border-[#C9A84C]/30 pl-3">
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase">ROLE 04</span>
                    <span className="text-xs sm:text-sm font-sans font-medium text-[#D5D3CC]">Level Coordinator</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Academic Institution 02 */}
            <motion.div 
              className="lg:col-span-6 flex flex-col gap-8 pl-0 lg:pl-4"
              initial={{ opacity: 0, x: 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93]">ACADEMIC INSTITUTION 02</span>
                <h4 className="text-2xl sm:text-3xl font-serif font-medium text-[#FDFBF7] tracking-tight">
                  Federal University of Education, Zaria
                </h4>
                <p className="text-xs font-mono uppercase tracking-widest text-[#C9A84C] mt-1">
                  NCE // English–Igbo Department
                </p>
              </div>

              <div className="flex items-center gap-6 py-6 border-y border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">RECOGNITION</span>
                  <span className="text-base sm:text-lg font-serif font-semibold text-[#FDFBF7] mt-0.5">Best Graduating Student</span>
                </div>
                <div className="w-px h-10 bg-white/10 text-[#C9A84C]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">CUMULATIVE GPA</span>
                  <span className="text-base sm:text-lg font-mono text-brand-gold font-bold mt-0.5">13.00 / 15.00</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand-gold" />
                  Academic Background
                </span>
                <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed font-sans font-light">
                  Her background in English and Igbo language education strengthened her ability to communicate clearly with diverse audiences.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Elegant Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/35 to-transparent" />

        {/* PROFESSIONAL DEVELOPMENT (Accordion-Based Learning Profile) */}
        <div className="flex flex-col gap-12 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-gold uppercase tracking-wider font-semibold">Professional Development</span>
            </div>
            <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-3 py-1 uppercase rounded-sm tracking-widest">
              Professional Development
            </span>
          </div>

          {/* Accordion Component Row */}
          <div className="flex flex-col divide-y divide-[#C9A84C]/15 border-t border-b border-[#C9A84C]/20">
            {certifications.map((cert, index) => {
              const isOpen = activeCertIndex === index;
              return (
                <div key={index} className="flex flex-col transition-colors duration-300 hover:bg-neutral-900/30">
                  
                  {/* Header bar button */}
                  <button
                    onClick={() => setActiveCertIndex(isOpen ? null : index)}
                    className="w-full py-6 md:py-8 flex items-center justify-between text-left gap-6 px-4 md:px-6 focus:outline-none cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 grow">
                      {/* Serial Identifier */}
                      <span className="text-xs font-mono text-brand-gold tracking-widest">
                        [ 0{index + 1} ]
                      </span>
                      {/* Institution */}
                      <span className="text-lg md:text-xl font-serif font-medium text-[#FDFBF7] group-hover:text-brand-gold transition-colors duration-200 w-full md:w-56 shrink-0">
                        {cert.institution}
                      </span>
                      {/* Core Focus Header */}
                      <span className="text-xs md:text-sm font-sans text-[#8E8E93] md:text-[#fdfbf7]/80 uppercase tracking-wider font-light line-clamp-1">
                        {cert.focus}
                      </span>
                    </div>
                    
                    {/* Plus/Minus Toggle State Indicator */}
                    <div className="p-2 border border-white/5 group-hover:border-brand-gold/45 rounded-full transition-all duration-300 text-[#C9A84C]">
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-brand-gold" />
                      ) : (
                        <Plus className="w-4 h-4 text-[#8E8E93]" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Content Panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-20 pb-8 sm:pb-12 pt-2 flex flex-col gap-4 max-w-4xl text-left">
                          <h5 className="text-[#FDFBF7] font-serif font-semibold text-base">
                            {cert.focus}
                          </h5>
                          <p className="text-sm text-[#D5D3CC] font-light leading-relaxed font-sans">
                            {cert.description}
                          </p>
                          {cert.verification && (
                            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/5">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                              <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.2em]">
                                {cert.verification}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
