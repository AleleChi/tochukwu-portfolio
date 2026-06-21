import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryItem } from "../types";
import { MediaImage } from "./MediaImage";

interface VisualArchiveProps {
  gallery: GalleryItem[];
}

export default function VisualArchive({ gallery }: VisualArchiveProps) {
  const [activeArchiveCategory, setActiveArchiveCategory] = useState("All");
  const [selectedArchiveIndex, setSelectedArchiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!gallery || gallery.length === 0) return null;

  const filteredItems = gallery.filter(
    (item) => activeArchiveCategory === "All" || item.category === activeArchiveCategory
  );

  const handlePrevItem = (e: any) => {
    e.stopPropagation();
    setSelectedArchiveIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? filteredItems.length - 1 : prev - 1;
    });
  };

  const handleNextItem = (e: any) => {
    e.stopPropagation();
    setSelectedArchiveIndex((prev) => {
      if (prev === null) return null;
      return prev === filteredItems.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <section id="visual-archive" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 font-sans selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24">

        {/* Section Header */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Visual Stories
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              Visual Stories
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              A collection of moments from communication projects, events, workshops, and professional engagements.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <Camera className="w-4 h-4 text-brand-gold" />
            <span>Media Gallery</span>
          </div>
        </div>

        {/* Featured Image Area at the Top */}
        <motion.div 
          className="relative w-full aspect-[16/8] md:aspect-[21/9] overflow-hidden border border-white/10 cursor-pointer group bg-[#111112]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          onClick={() => {
            setSelectedArchiveIndex(0);
          }}
        >
          <MediaImage 
            src={filteredItems[0]?.imageUrl || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1600"}
            alt="Tochukwu Ogunaka - Visual Stories Media Gallery"
            imageClassName="grayscale brightness-[0.6] group-hover:brightness-[0.72] contrast-[1.08] transition-all duration-700 ease-out group-hover:scale-102"
            className="w-full h-full border-none"
          />
          {/* Elegant Vintage Frame Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111112] via-[#111112]/50 to-transparent p-6 md:p-12 flex flex-col gap-3 md:gap-4 justify-end text-left">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold font-semibold">MEDIA GALLERY // WORK OVERVIEW</span>
            </div>
            <h4 className="text-2xl sm:text-3xl md:text-5xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none">
              The Work Behind the Word
            </h4>
            <p className="text-xs sm:text-sm text-[#D5D3CC] font-light max-w-3xl leading-relaxed">
              A visual overview of projects, campaigns, events, and communications work across different organizations.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-brand-gold pt-2 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              <span>VIEW GALLERY</span>
            </div>
          </div>
        </motion.div>

        {/* Categories Tab Selector with Premium Styling */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#C9A84C]/20 pb-4">
            {["All", "Speaking", "Training", "Campaigns", "Events", "Media"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveArchiveCategory(cat);
                  setSelectedArchiveIndex(null);
                }}
                className={`px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] transition-all duration-300 relative cursor-pointer ${
                  activeArchiveCategory === cat
                    ? "text-brand-gold bg-brand-gold/10 font-bold border-l-2 border-brand-gold"
                    : "text-brand-muted hover:text-[#FDFBF7] hover:bg-white/5 border-l border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry Layout below */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
            {filteredItems.map((item, index) => {
              // Function to assign responsive columns for interesting asymmetric masonry
              const getColSpans = (idx: number) => {
                const patterns = [
                  "lg:col-span-7 aspect-[16/10]", 
                  "lg:col-span-5 aspect-[4/3]", 
                  "lg:col-span-4 aspect-[4/3]", 
                  "lg:col-span-8 aspect-[16/10]", 
                  "lg:col-span-6 aspect-[16/11]", 
                  "lg:col-span-6 aspect-[16/11]"
                ];
                return patterns[idx % patterns.length];
              };

              return (
                <motion.div
                  key={item.id}
                  className={`${isMobile ? "w-full flex flex-col font-sans" : getColSpans(index)} relative overflow-hidden border border-white/5 cursor-pointer group bg-[#161618] rounded-md`}
                  onClick={() => {
                    setSelectedArchiveIndex(index);
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
                >
                  <div className={isMobile ? "w-full aspect-[16/10] overflow-hidden" : "w-full h-full"}>
                    <MediaImage 
                      src={item.imageUrl} 
                      alt={item.title}
                      imageClassName="grayscale transition-all duration-700 ease-out group-hover:scale-102 group-hover:grayscale-0 brightness-[0.8] group-hover:brightness-95 contrast-[1.05]"
                      className="w-full h-full border-none"
                    />
                  </div>
                  
                  {isMobile ? (
                    <div className="bg-[#1E1E20]/65 p-5 border-t border-white/5 flex flex-col gap-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-brand-gold tracking-widest uppercase bg-brand-gold/15 border border-brand-gold/30 px-2.5 py-0.5 rounded-sm">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted">{item.year}</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.15em] font-medium">{item.location}</span>
                        <h5 className="text-base sm:text-lg font-serif font-medium text-[#FDFBF7] tracking-tight leading-tight">
                          {item.title}
                        </h5>
                        <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed font-sans font-light">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-brand-gold font-semibold">
                          <Eye className="w-3.5 h-3.5" />
                          <span>VIEW DETAILS</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Caption Overlay on Hover (no visible captions by default) */
                    <div className="absolute inset-0 bg-neutral-950/80 p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out border border-brand-gold/20 text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-brand-gold tracking-widest uppercase bg-[#242426] border border-brand-gold/35 px-2 py-0.5 rounded-sm">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted">{item.year}</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.15em] font-medium">{item.location}</span>
                        <h5 className="text-lg font-serif font-medium text-[#FDFBF7] tracking-tight leading-tight">
                          {item.title}
                        </h5>
                        <p className="text-xs text-[#8E8E93] leading-normal font-sans font-light line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-brand-gold">
                          <Eye className="w-3.5 h-3.5" />
                          <span>VIEW MEDIA DETAILS</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── LIGHTBOX INTEGRATION ── */}
      <AnimatePresence>
        {selectedArchiveIndex !== null && (() => {
          const currentItem = filteredItems[selectedArchiveIndex];
          if (!currentItem) return null;

          return (
            <>
              {/* Dimmed backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.95 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedArchiveIndex(null)}
                className="fixed inset-0 bg-neutral-950/98 z-50 cursor-pointer backdrop-blur-md"
              />

              {/* Lightbox Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 28, stiffness: 200 }}
                className="fixed inset-4 sm:inset-10 lg:inset-20 bg-[#1A1A1C] border border-white/10 z-50 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:grid lg:grid-cols-12 max-w-6xl mx-auto font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Left Side (Visual Media Frame) */}
                <div className="lg:col-span-7 bg-[#111112] relative flex items-center justify-center h-[40vh] lg:h-full group">
                  <MediaImage 
                    src={currentItem.imageUrl} 
                    alt={currentItem.title}
                    imageClassName="grayscale transition-all duration-500 hover:grayscale-0 p-4 object-contain"
                    className="w-full h-full border-none"
                  />
                  
                  {/* Subtle navigation triggers overlay inside media frame */}
                  <div className="absolute inset-x-4 flex justify-between pointer-events-none select-none">
                    <button
                      onClick={handlePrevItem}
                      className="p-3 bg-neutral-950/80 hover:bg-neutral-900 border border-white/5 text-[#FDFBF7] rounded-full transition-all cursor-pointer pointer-events-auto shadow-xl"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextItem}
                      className="p-3 bg-neutral-950/80 hover:bg-neutral-900 border border-white/5 text-[#FDFBF7] rounded-full transition-all cursor-pointer pointer-events-auto shadow-xl"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Side (Metadata & Description Text Frame) */}
                <div className="lg:col-span-5 p-6 sm:p-10 md:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 bg-[#1A1A1C] h-[60vh] lg:h-full overflow-y-auto text-left">
                  <div>
                    {/* Header Row */}
                    <div className="flex justify-between items-center border-b border-[#C9A84C]/20 pb-4 mb-8">
                      <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.2em] font-semibold">
                        Story Details // {selectedArchiveIndex + 1} of {filteredItems.length}
                      </span>
                      <button
                        onClick={() => setSelectedArchiveIndex(null)}
                        className="p-1.5 border border-white/10 text-brand-muted hover:text-white hover:border-[#C9A84C] rounded-full transition-all cursor-pointer flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata Content */}
                    <div className="flex flex-col gap-4">
                      
                      {/* Title & Year */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[9.5px] font-mono text-brand-gold uppercase tracking-[0.2em]">{currentItem.location}</span>
                        <h4 className="text-xl sm:text-2xl font-serif text-[#FDFBF7] leading-snug font-semibold">
                          {currentItem.title}
                        </h4>
                        <div className="w-12 h-px bg-brand-gold mt-2" />
                      </div>

                      {/* Description Narrative */}
                      <p className="text-xs sm:text-sm text-[#D5D3CC] font-light leading-relaxed font-sans mt-4">
                        {currentItem.description}
                      </p>

                      {/* Asymmetrical Print Specs box */}
                      <div className="flex flex-col gap-1.5 mt-8 border-t border-white/5 pt-6">
                        <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                          <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">YEAR</span>
                          <span className="text-xs font-mono text-white font-semibold">{currentItem.year}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                          <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">LOCATION</span>
                          <span className="text-xs font-sans text-brand-gold font-medium">{currentItem.location}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                          <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">CATEGORY</span>
                          <span className="text-xs font-mono text-white uppercase tracking-widest">{currentItem.category} ENGAGEMENT</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Footer Seal */}
                  <div className="pt-8 border-t border-white/10 mt-6 flex justify-between items-center text-[9px] font-mono text-brand-muted uppercase tracking-widest">
                    <span>Tochukwu Ogunaka © 2026</span>
                    <span className="text-brand-gold font-semibold">PORTFOLIO</span>
                  </div>

                </div>

              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
