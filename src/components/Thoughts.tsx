import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ChevronRight, ChevronLeft, Eye, X } from "lucide-react";
import { Article } from "../types";
import { MediaImage } from "./MediaImage";

interface ThoughtsProps {
  articles: Article[];
}

export default function Thoughts({ articles }: ThoughtsProps) {
  const [selectedThoughtIndex, setSelectedThoughtIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!articles || articles.length === 0) return null;

  const currentThought = selectedThoughtIndex !== null ? articles[selectedThoughtIndex] : null;

  const handlePrevThought = (e: any) => {
    e.stopPropagation();
    setSelectedThoughtIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? articles.length - 1 : prev - 1;
    });
  };

  const handleNextThought = (e: any) => {
    e.stopPropagation();
    setSelectedThoughtIndex((prev) => {
      if (prev === null) return null;
      return prev === articles.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <section id="thoughts" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 font-sans selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24 font-sans text-left">

        {/* Section Header */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Thoughts
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              Thoughts
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              Reflections on communication, storytelling, leadership, advocacy, and public engagement.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <BookOpen className="w-4 h-4 text-brand-gold" />
            <span>Perspectives</span>
          </div>
        </div>

        {/* Featured Article Spread Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Box: Image Frame */}
          <motion.div 
            className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden border border-white/10 group cursor-pointer bg-[#111112]"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => setSelectedThoughtIndex(0)}
          >
            <MediaImage 
              src={articles[0].imageUrl} 
              alt={articles[0].title}
              imageClassName="grayscale brightness-[0.7] group-hover:brightness-[0.9] contrast-[1.05] transition-all duration-700 ease-out group-hover:scale-101"
              className="w-full h-full border-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent p-6 sm:p-10 flex flex-col justify-end">
              <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest mb-2 block font-semibold">
                {(articles[0].category || "").toUpperCase()}
              </span>
              <span className="text-xs font-mono text-[#8E8E93] mb-1 block">
                {articles[0].date} — {articles[0].readTime}
              </span>
              <p className="text-[11px] font-mono text-brand-gold mt-2 uppercase tracking-wide flex items-center gap-2 font-semibold">
                <span>READ ARTICLE</span>
                <Eye className="w-3.5 h-3.5" />
              </p>
            </div>
          </motion.div>

          {/* Right Box: Editorial Headings and Excerpt */}
          <div className="lg:col-span-6 flex flex-col justify-center h-full gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-[#C9A84C] text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                Featured Article
              </span>
              <h4 
                onClick={() => setSelectedThoughtIndex(0)}
                className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-[#FDFBF7] cursor-pointer hover:text-brand-gold transition-colors duration-300 leading-tight tracking-tight"
              >
                {articles[0].title}
              </h4>
              <p className="text-xl text-[#C9A84C] font-serif italic font-light leading-relaxed">
                {articles[0].subtitle}
              </p>
            </div>

            <div className="w-16 h-[1px] bg-[#C9A84C]" />

            <p className="text-base text-[#D5D3CC] font-sans font-light leading-relaxed">
              {articles[0].description}
            </p>

            <div>
              <button
                onClick={() => setSelectedThoughtIndex(0)}
                className="inline-flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/15 border border-brand-gold/20 hover:border-[#C9A84C] pt-3.5 pb-3 px-7 rounded-sm tracking-[0.15em] font-medium transition-all duration-300 cursor-pointer"
              >
                READ ARTICLE
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Thin Gold Divider */}
        <div className="w-full h-px bg-[#C9A84C]/25 my-4" />

        {/* Additional Supporting Articles Shelf */}
        <div className="flex flex-col gap-12 font-sans text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-wider font-semibold">More Reflections</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {articles.slice(1).map((essay) => {
              const fullIdx = articles.findIndex(x => x.id === essay.id);
              return (
                <motion.div
                  key={essay.id}
                  className="flex flex-col gap-5 group cursor-pointer border-t border-white/5 hover:border-[#C9A84C]/35 pt-8 transition-all duration-300"
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    setSelectedThoughtIndex(fullIdx);
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {!isMobile && (
                    <div className="flex justify-between items-center text-[10px] font-mono text-brand-muted uppercase tracking-widest font-semibold">
                      <span>{essay.category}</span>
                      <span>{essay.readTime}</span>
                    </div>
                  )}

                  <h5 className="text-xl md:text-2xl font-serif text-[#FDFBF7] group-hover:text-brand-gold transition-colors duration-300 leading-tight tracking-tight">
                    {essay.title}
                  </h5>

                  {!isMobile && (
                    <p className="text-[#C9A84C] text-sm font-serif italic">
                      {essay.subtitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed font-sans font-light">
                    {essay.description}
                  </p>

                  <div className="pt-1.5 pb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C9A84C] group-hover:text-[#FDFBF7] transition-colors duration-300 font-medium tracking-wider">
                      <span>READ ESSAY</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── LIGHTBOX READING PANEL FOR ARTICLES ── */}
      <AnimatePresence>
        {selectedThoughtIndex !== null && currentThought && (
          <>
            {/* Dimmed glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedThoughtIndex(null)}
              className="fixed inset-0 bg-neutral-950/98 backdrop-blur-md z-50 cursor-pointer"
            />

            {/* Lightbox Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-4 sm:inset-10 md:inset-16 bg-[#1A1A1C] border border-white/10 z-50 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:grid lg:grid-cols-12 max-w-6xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Media and Stats Pane */}
              <div className="lg:col-span-12 lg:hidden relative p-6 h-[180px] bg-[#111112]">
                <div className="absolute inset-0 opacity-25">
                  <MediaImage
                    src={currentThought.imageUrl}
                    alt=""
                    imageClassName="grayscale brightness-50"
                    className="w-full h-full border-none"
                  />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono text-brand-gold uppercase tracking-wider font-semibold">{currentThought.category}</span>
                    <button
                      onClick={() => setSelectedThoughtIndex(null)}
                      className="p-1 px-2.5 bg-neutral-900 border border-white/10 text-brand-muted hover:text-white rounded-full text-xs font-mono cursor-pointer"
                    >
                      CLOSE
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevThought}
                      className="p-2 bg-neutral-950 text-[#FDFBF7] rounded-full border border-white/10 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextThought}
                      className="p-2 bg-neutral-950 text-[#FDFBF7] rounded-full border border-white/10 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-white/50">{selectedThoughtIndex + 1} / {articles.length}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:col-span-5 bg-[#111112] relative lg:flex flex-col justify-between p-6 sm:p-10 h-[30vh] sm:h-[40vh] lg:h-full overflow-hidden text-left">
                {/* Accent Image Background */}
                <div className="absolute inset-0 opacity-25 animate-fade-in">
                  <MediaImage
                    src={currentThought.imageUrl}
                    alt=""
                    imageClassName="grayscale brightness-50 blur-[2px]"
                    className="w-full h-full border-none"
                  />
                </div>

                {/* Top line metadata */}
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                    <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-semibold">
                      {currentThought.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    Published Online Edition // {currentThought.date}
                  </span>
                </div>

                {/* Navigators over Left Side */}
                <div className="relative z-10 my-4 flex items-center gap-3">
                  <button
                    onClick={handlePrevThought}
                    className="p-3 bg-neutral-900/90 hover:bg-neutral-900 text-[#FDFBF7] hover:text-brand-gold border border-white/10 hover:border-brand-gold/40 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleNextThought}
                    className="p-3 bg-neutral-900/90 hover:bg-neutral-900 text-[#FDFBF7] hover:text-brand-gold border border-white/10 hover:border-brand-gold/40 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-white/50 bg-neutral-900/80 px-3.5 py-1.5 rounded-full border border-white/5">
                    {selectedThoughtIndex + 1} / {articles.length}
                  </span>
                </div>

                {/* Bottom seal */}
                <div className="relative z-10 flex flex-col gap-2 border-t border-white/10 pt-4">
                  <span className="text-[11px] font-mono text-brand-gold uppercase tracking-[0.15em] font-medium">Tochukwu Ogunaka</span>
                  <span className="text-[9px] font-mono text-brand-muted uppercase tracking-widest">Communication Professional</span>
                </div>
              </div>

              {/* Right Editorial Text Frame */}
              <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 bg-[#1A1A1C] h-[65vh] sm:h-[60vh] lg:h-full overflow-y-auto text-left">
                <div>
                  {/* Close Trigger Header */}
                  <div className="flex justify-between items-center border-b border-[#C9A84C]/25 pb-6 mb-8">
                    <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-[0.2em]" />
                    <button
                      onClick={() => setSelectedThoughtIndex(null)}
                      className="p-2 border border-white/10 text-brand-muted hover:text-white hover:border-[#C9A84C] rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex flex-col gap-3 mb-8">
                    <h4 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#FDFBF7] leading-tight tracking-tight">
                      {currentThought.title}
                    </h4>
                    <p className="text-base sm:text-lg text-brand-gold font-serif italic font-light leading-relaxed">
                      {currentThought.subtitle}
                    </p>
                    <div className="w-12 h-px bg-brand-gold/40 mt-3" />
                  </div>

                  {/* Sections Rendering */}
                  <div className="flex flex-col gap-8 text-[#D5D3CC] font-sans font-light leading-relaxed text-sm sm:text-base">
                    {currentThought.sections?.map((section, idx) => (
                      <div key={idx} className="flex flex-col gap-3">
                        {section.heading && (
                          <h5 className="text-xs font-mono text-brand-gold uppercase tracking-wider font-semibold border-b border-white/5 pb-2">
                            {section.heading}
                          </h5>
                        )}
                        <p className="font-sans leading-relaxed text-[#BFBEB9]">
                          {section.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8 mt-12 flex justify-between items-center text-[9px] font-mono text-brand-muted uppercase tracking-widest select-none">
                  <span>Tochukwu Ogunaka © 2026</span>
                  <span className="text-brand-gold">Published Essay</span>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
