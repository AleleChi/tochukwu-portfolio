import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Settings } from "lucide-react";
import { Profile } from "../types";

interface HeaderProps {
  profile: Profile;
  onOpenAdmin: () => void;
}

export default function Header({ profile, onOpenAdmin }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToId = (id: string) => {
    if (id === "root") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ── TOP NAV BAR (Refined World-Class Personal Brand Header) ── */}
      <header id="app-header" className={`sticky top-0 z-40 backdrop-blur-md border-b border-white/5 transition-all duration-300 w-full ${isScrolled ? "py-4 bg-[#111112]/95 shadow-xl" : "py-6 bg-[#161618]/40"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Elegant Corporate/Advisory Brand Name & Subtitle Branding */}
          <div 
            className="flex flex-col text-left select-none justify-center cursor-pointer" 
            onClick={() => scrollToId("root")}
            onDoubleClick={onOpenAdmin}
            title={`${profile.name} - Double click to sign in`}
          >
            <h1 className="text-sm sm:text-base font-bold tracking-[0.16em] text-white font-sans uppercase leading-none">
              {(profile.name || "").toUpperCase()}
            </h1>
            <span className="text-[7.5px] sm:text-[8px] text-[#C9A84C] font-mono uppercase tracking-[0.02em] whitespace-nowrap mt-1 leading-none block">
              {profile.title}
            </span>
          </div>

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-[#D5D3CC] font-mono text-[11px] uppercase tracking-[0.2em] font-medium">
            <button 
              onClick={() => scrollToId("areas-of-practice")}
              className="hover:text-brand-gold transition-colors duration-200 cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => scrollToId("education-recognition")}
              className="hover:text-brand-gold transition-colors duration-200 cursor-pointer"
            >
              Recognition
            </button>
            <button 
              onClick={() => scrollToId("selected-work")}
              className="hover:text-brand-gold transition-colors duration-200 cursor-pointer"
            >
              Work
            </button>
            <button 
              onClick={() => scrollToId("thoughts")}
              className="hover:text-brand-gold transition-colors duration-200 cursor-pointer"
            >
              Thoughts
            </button>
            <button 
              onClick={() => scrollToId("visual-archive")}
              className="hover:text-brand-gold transition-colors duration-200 cursor-pointer"
            >
              Media
            </button>
            <button 
              onClick={() => scrollToId("contact")}
              className="hover:text-brand-gold transition-colors duration-200 cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Desktop Right CTA (Subtle consulting advisory position button) */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={() => scrollToId("contact")}
              className="px-4.5 py-2 border border-[#C9A84C]/35 bg-[#161618] hover:bg-[#C9A84C] hover:text-[#111112] text-[#C9A84C] font-mono text-[10px] uppercase tracking-widest rounded-none transition-all duration-300 font-semibold cursor-pointer"
            >
              Start Conversation
            </button>
          </div>

          {/* Mobile Actions Container */}
          <div className="flex lg:hidden items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="flex p-2 text-[#FDFBF7] hover:text-[#C9A84C] transition-colors focus:outline-none cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
        </div>
      </header>

      {/* ── FULL SCREEN MOBILE NAVIGATION OVERLAY ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#121214] z-[100] flex flex-col justify-between p-6 sm:p-10 border border-[#C9A84C]/10"
          >
            {/* Header section of full overlay */}
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col text-left select-none justify-center">
                <span className="text-sm font-bold tracking-[0.16em] text-white font-sans uppercase leading-none">
                  {(profile.name || "").toUpperCase()}
                </span>
                <span className="text-[7.5px] sm:text-[8px] text-[#C9A84C] font-mono uppercase tracking-[0.02em] whitespace-nowrap mt-1 block leading-none">
                  {profile.title}
                </span>
              </div>

              {/* Close icon */}
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#FDFBF7] hover:text-[#C9A84C] transition-colors focus:outline-none cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Middle nav menu items list - exactly: Home, About, Experience, Work, Speaking, Thoughts, Contact */}
            <nav className="flex flex-col gap-6 my-auto text-left pl-2">
              {[
                { label: "Home", target: "root" },
                { label: "About", target: "areas-of-practice" },
                { label: "Experience", target: "professional-experience" },
                { label: "Work", target: "selected-work" },
                { label: "Speaking", target: "leadership" },
                { label: "Thoughts", target: "thoughts" },
                { label: "Contact", target: "contact" }
              ].map((item, idx) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.35 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      scrollToId(item.target);
                    }, 250);
                  }}
                  className="text-2xl sm:text-3xl font-serif text-brand-cream hover:text-brand-gold transition-colors text-left font-light uppercase tracking-widest py-1 cursor-pointer"
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>

            {/* Bottom Footer block */}
            <div className="pt-6 border-t border-white/5 flex flex-col gap-2 text-left">
              <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-[0.25em]">{profile.name}</span>
              <span className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-widest">
                {profile.title} // © 2026
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
