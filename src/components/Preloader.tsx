import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PreloaderProps {
  onComplete: () => void;
}

type PreloaderStatus =
  | "name-only"
  | "name-with-subtitle"
  | "statement-1"
  | "statement-2"
  | "statement-3"
  | "completed";

interface Step {
  status: PreloaderStatus;
  duration: number;
}

// Sequence designed to last exactly 5.2 seconds before the exit transition (800ms) triggers, totaling 6 seconds
const STEPS: Step[] = [
  { status: "name-only", duration: 1200 },          // 0ms - 1200ms
  { status: "name-with-subtitle", duration: 1300 }, // 1200ms - 2500ms
  { status: "statement-1", duration: 650 },         // 2500ms - 3150ms
  { status: "statement-2", duration: 650 },         // 3150ms - 3800ms
  { status: "statement-3", duration: 1400 },        // 3800ms - 5200ms (held active before exit)
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [status, setStatus] = useState<PreloaderStatus>("name-only");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Stable reference to onComplete to prevent timeline reset on parent re-renders
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Check for prefers-reduced-motion to keep the experience highly accessible
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Lock scrolling during the editorial splash introduction
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Sequential state stepper
  useEffect(() => {
    if (stepIndex >= STEPS.length) {
      setStatus("completed");
      onCompleteRef.current();
      return;
    }

    const currentStep = STEPS[stepIndex];
    setStatus(currentStep.status);

    const timer = setTimeout(() => {
      setStepIndex((prev) => prev + 1);
    }, currentStep.duration);

    return () => {
      clearTimeout(timer);
    };
  }, [stepIndex]);

  // Precision Bezier curve designed for editorial publication aesthetics (Slow, premium curves)
  const titleTransition = {
    duration: prefersReducedMotion ? 0.3 : 1.0,
    ease: [0.22, 1, 0.36, 1],
  };

  const subtitleTransition = {
    duration: prefersReducedMotion ? 0.25 : 0.8,
    ease: [0.22, 1, 0.36, 1],
  };

  const statementTransition = {
    duration: prefersReducedMotion ? 0.25 : 0.7,
    ease: [0.22, 1, 0.36, 1],
  };

  const hasSubtitle = status !== "name-only";

  return (
    <AnimatePresence mode="wait">
      {status !== "completed" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 bg-[#161618] z-[9999] flex flex-col items-center justify-center text-[#FDFBF7]"
          id="editorial-preloader"
        >
          {/* Centered Structured Grid Framework */}
          <div className="relative w-full max-w-xl px-4 flex flex-col items-center select-none text-center">
            
            {/* 1. Brand Anchor Name */}
            <motion.h1
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={titleTransition}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#FDFBF7] tracking-[0.06em] uppercase leading-none"
            >
              Tochukwu Ogunaka
            </motion.h1>

            {/* Elegant Minimalist Antique Gold Structural Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: hasSubtitle ? 1 : 0, opacity: hasSubtitle ? 0.4 : 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-[1px] bg-[#C9A84C] w-20 my-3 sm:my-4 origin-center"
            />

            {/* 2. Professional Role Header (Responsively structured to scale beautifully on narrow viewports) */}
            <div className="h-10 sm:h-12 flex items-center justify-center">
              <AnimatePresence>
                {hasSubtitle && (
                  <motion.div
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={subtitleTransition}
                    className="font-sans text-[10px] sm:text-xs tracking-[0.25em] text-[#C9A84C] uppercase font-semibold leading-relaxed px-2"
                  >
                    <span className="block sm:inline">Communication Professional</span>
                    <span className="hidden sm:inline"> &amp; </span>
                    <span className="block sm:inline sm:mt-0">&amp; Media Specialist</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Elegant separation padding before statements carousel */}
            <div className="h-6 sm:h-8" />

            {/* 3. Focal statements rotating text block */}
            <div className="h-12 flex items-center justify-center relative w-full overflow-hidden">
              <AnimatePresence mode="wait">
                {status === "statement-1" && (
                  <motion.p
                    key="preloader-st1"
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                    transition={statementTransition}
                    className="font-serif text-lg sm:text-xl italic text-[#8E8E93] font-light tracking-[0.02em]"
                  >
                    Communicating Ideas.
                  </motion.p>
                )}

                {status === "statement-2" && (
                  <motion.p
                    key="preloader-st2"
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                    transition={statementTransition}
                    className="font-serif text-lg sm:text-xl italic text-[#8E8E93] font-light tracking-[0.02em]"
                  >
                    Telling Stories.
                  </motion.p>
                )}

                {status === "statement-3" && (
                  <motion.p
                    key="preloader-st3"
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                    transition={statementTransition}
                    className="font-serif text-lg sm:text-xl italic text-[#8E8E93] font-light tracking-[0.02em]"
                  >
                    Building Understanding.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
