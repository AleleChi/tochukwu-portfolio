import { motion } from "motion/react";
import { Users } from "lucide-react";
import { Speaking } from "../types";
import { MediaImage } from "./MediaImage";

interface SpeakingLeadershipProps {
  speaking?: Speaking;
}

export default function SpeakingLeadership({ speaking }: SpeakingLeadershipProps) {
  // Graceful fallback to approved design copy
  const title = speaking?.title || "Speaking, Media & Leadership";
  const description = speaking?.description || "Beyond communication projects, Tochukwu contributes to conversations around leadership, storytelling, advocacy, and community development.";
  const blocks = speaking?.blocks || [
    {
      category: "Leadership",
      title: "Leadership",
      description: "Supporting communication activities, coordinating content, and contributing to campaigns and public-facing initiatives."
    },
    {
      category: "Training & Mentorship",
      title: "Training & Mentorship",
      description: "Supporting learning in communication, storytelling, digital engagement, and professional growth."
    },
    {
      category: "Speaking Engagements",
      title: "Public Speaking",
      description: "Participating in conversations around communication, leadership, youth development, and social impact."
    },
    {
      category: "Institutional Engagement",
      title: "Institutional Engagement",
      description: "Working with organizations and communities to support communication initiatives."
    }
  ];
  const image1 = speaking?.image1 || "/input_file_3.png";
  const image2 = speaking?.image2 || "/input_file_2.png";

  const leadershipBlocks = blocks.slice(0, 2);
  const speakingBlocks = blocks.slice(2);

  return (
    <section id="leadership" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 font-sans selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24">

        {/* Section Heading Row */}
        <div className="border-b border-[#C9A84C]/30 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block mb-3">
              Speaking & Leadership
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-none mb-6">
              {title}
            </h3>
            <p className="text-base sm:text-lg text-[#8E8E93] font-sans leading-relaxed max-w-2xl font-light">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-brand-gold bg-brand-gold/5 border border-brand-gold/15 py-2 px-5 rounded-md">
            <Users className="w-4 h-4 text-brand-gold" />
            <span>COMMUNICATION LEADER</span>
          </div>
        </div>

        {/* Asymmetrical Editorial Story Rows */}
        <div className="flex flex-col gap-28 text-left">

          {/* Row 1: Text Left, Photo Right */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Left Column (Content Areas: Leadership & Training) */}
            <div className="lg:col-span-7 flex flex-col gap-12">
              
              {leadershipBlocks.map((block, idx) => (
                <div key={idx} className="flex flex-col gap-4 border-l border-[#C9A84C]/30 pl-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">{block.category}</span>
                  <h4 className="text-2xl sm:text-3xl font-serif font-medium text-[#FDFBF7] tracking-tight">
                    {block.title}
                  </h4>
                  <p className="text-sm sm:text-base text-[#D5D3CC] font-light leading-relaxed font-sans max-w-xl">
                    {block.description}
                  </p>
                </div>
              ))}

            </div>

            {/* Right Column (Large Premium Photo) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="overflow-hidden bg-[#1A1A1C] border border-white/10 group aspect-[4/3] lg:aspect-[4/3] w-full">
                <MediaImage 
                  src={image1} 
                  alt="Tochukwu Ogunaka - Mentorship & Training Leadership Portrait" 
                  imageClassName="grayscale contrast-[1.08] brightness-[0.92] transition-transform duration-700 hover:scale-[1.02]"
                  className="w-full h-full border-none cursor-pointer"
                />
              </div>
              {/* Subtle caption */}
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] border-b border-[#C9A84C]/25 pb-2">
                <span>Training Session</span>
                <span className="text-[#C9A84C] font-semibold">Leadership Event</span>
              </div>
            </div>

          </motion.div>

          {/* Premium Gold Accent Separator Line */}
          <div className="w-full h-px bg-gradient-to-r from-[#C9A84C]/10 via-[#C9A84C]/25 to-[#C9A84C]/10" />

          {/* Row 2: Photo Left, Text Right (Alternating Layout) */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Left Column (Large Premium Photo) */}
            <div className="lg:col-span-5 order-last lg:order-first flex flex-col gap-4">
              <div className="overflow-hidden bg-[#1A1A1C] border border-white/10 group aspect-[4/3] lg:aspect-[4/3] w-full">
                <MediaImage 
                  src={image2} 
                  alt="Tochukwu Ogunaka - Speaking Engagement Feature Narrative" 
                  imageClassName="grayscale contrast-[1.08] brightness-[0.92] transition-transform duration-700 hover:scale-[1.02]"
                  className="w-full h-full border-none cursor-pointer"
                />
              </div>
              {/* Subtle caption */}
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] border-b border-[#C9A84C]/25 pb-2">
                <span>Speaking Engagement</span>
                <span className="text-[#C9A84C] font-semibold">Leadership Event</span>
              </div>
            </div>

            {/* Right Column (Content Areas: Public Speaking & Institutional Engagement) */}
            <div className="lg:col-span-7 flex flex-col gap-12">
              
              {speakingBlocks.map((block, idx) => (
                <div key={idx} className="flex flex-col gap-4 border-l border-[#C9A84C]/30 pl-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">{block.category}</span>
                  <h4 className="text-2xl sm:text-3xl font-serif font-medium text-[#FDFBF7] tracking-tight">
                    {block.title}
                  </h4>
                  <p className="text-sm sm:text-base text-[#D5D3CC] font-light leading-relaxed font-sans max-w-xl">
                    {block.description}
                  </p>
                </div>
              ))}

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
