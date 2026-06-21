import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Check, Send, MessageCircle, Linkedin } from "lucide-react";
import { Profile } from "../types";

interface ContactProps {
  profile?: Profile;
}

export default function Contact({ profile }: ContactProps) {
  const [inPageContactForm, setInPageContactForm] = useState({
    name: "",
    organization: "",
    email: "",
    topic: "Communication Strategy",
    message: "",
  });
  const [inPageSubmitting, setInPageSubmitting] = useState(false);
  const [inPageSubmitted, setInPageSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInPageContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInPageSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/contact-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inPageContactForm.name,
          email: inPageContactForm.email,
          subject: `Inquiry: ${inPageContactForm.topic} ${inPageContactForm.organization ? `(${inPageContactForm.organization})` : ""}`,
          message: inPageContactForm.message,
          organization: inPageContactForm.organization,
          category: inPageContactForm.topic
        }),
      });
      const data = await response.json();
      if (data.success) {
        setInPageSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to submit message. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Could not contact the server. Please try again later.");
    } finally {
      setInPageSubmitting(false);
    }
  };

  const emailVal = profile?.email || "ogunakatochukwu@gmail.com";
  const phoneVal = profile?.phone || "+234 816 539 9171";
  const locationVal = profile?.location || "Abuja, Nigeria";
  const linkedinVal = profile?.linkedin || "https://www.linkedin.com/in/ogunakatochukwu/";
  const linkedinLabel = profile?.linkedin?.replace("https://www.", "")?.replace("https://", "") || "linkedin.com/in/ogunakatochukwu";

  return (
    <section id="contact" className="w-full bg-[#1C1C1E] py-32 border-t border-[#C9A84C]/30 relative z-10 font-sans text-[#FDFBF7] selection:bg-[#C9A84C] selection:text-[#111112]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        
        {/* Left Column: Editorial Brand Statement & Details */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-10 text-left">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.25em] block">
              Contact
            </span>
            <h3 className="text-4xl md:text-5xl font-serif font-medium text-[#FDFBF7] tracking-tight leading-tight">
              Let's Start a Conversation
            </h3>
          </div>

          <div className="w-16 h-[1px] bg-[#C9A84C]" />

          <div className="flex flex-col gap-6 text-base text-[#D5D3CC] font-sans font-light leading-relaxed max-w-lg">
            <p>
              If you would like to collaborate on communication projects, advocacy initiatives, storytelling, or professional training, get in touch.
            </p>
          </div>

          {/* Premium Meta Details (Abuja, Nigeria // Email // Phone) */}
          <div className="border-t border-[#C9A84C]/25 pt-8 flex flex-col gap-6 font-mono text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-brand-gold/60 uppercase tracking-widest text-[10px] font-bold">Location</span>
              <span className="text-sm font-sans font-light text-[#D5D3CC] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gold" />
                {locationVal}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-brand-gold/60 uppercase tracking-widest text-[10px] font-bold">Email Address</span>
              <a 
                href={`mailto:${emailVal}`} 
                className="text-sm sm:text-base font-sans font-light text-[#D5D3CC] hover:text-brand-gold transition-colors duration-300 underline underline-offset-4 decoration-brand-gold/30 hover:decoration-white"
              >
                {emailVal}
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-brand-gold/60 uppercase tracking-widest text-[10px] font-bold">WhatsApp & Phone</span>
              <a 
                href="https://wa.me/2348165399171" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-sans font-light text-[#D5D3CC] hover:text-brand-gold transition-colors duration-300 underline underline-offset-4 decoration-brand-gold/30 hover:decoration-white inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-brand-gold shrink-0" />
                <span>+234 816 539 9171</span>
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-brand-gold/60 uppercase tracking-widest text-[10px] font-bold">LinkedIn Profile</span>
              <a 
                href={linkedinVal.startsWith("http") ? linkedinVal : `https://${linkedinVal}`} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Visit Tochukwu Ogunaka's LinkedIn Professional Profile"
                className="text-sm sm:text-base font-sans font-light text-[#D5D3CC] hover:text-brand-gold transition-colors duration-300 underline underline-offset-4 decoration-brand-gold/30 hover:decoration-white inline-flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4 text-brand-gold shrink-0" />
                <span>LinkedIn Profile</span>
              </a>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="border-t border-white/5 pt-8 mt-4 flex flex-col gap-1">
            <span className="text-[13.5px] font-serif italic text-[#C9A84C] block mt-1">
              “Communication is ultimately about people.”
            </span>
            <span className="text-[11px] font-mono text-brand-muted uppercase tracking-wider block mt-1">
              Thank you for visiting.
            </span>
          </div>
        </div>

        {/* Right Column: Conversational Design Form */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-10 border-t xl:border-t-0 xl:border-l border-[#C9A84C]/25 pt-12 xl:pt-0 xl:pl-16 text-left">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-brand-gold uppercase tracking-[0.2em]">
              CONVERSATION INITIATIVE
            </span>
            <h4 className="text-xl sm:text-2xl font-serif font-medium text-[#FDFBF7] tracking-tight">
              Start a Conversation
            </h4>
          </div>

          {inPageSubmitted ? (
            <motion.div 
              className="bg-brand-gold/5 border border-brand-gold/20 p-8 rounded-lg flex flex-col gap-4 text-center my-auto py-16"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto text-brand-gold mb-2">
                 <Check className="w-6 h-6" />
              </div>
              <h5 className="font-serif text-xl font-medium text-[#FDFBF7]">
                Message Sent Successfully
              </h5>
              <p className="text-xs sm:text-sm text-brand-muted font-sans font-light leading-relaxed max-w-md mx-auto">
                Thank you, {inPageContactForm.name || "visitor"}. Your inquiry regarding <span className="text-brand-gold italic font-serif">"{inPageContactForm.topic}"</span> has been logged. Tochukwu will respond to you directly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleInPageContactSubmit} className="flex flex-col gap-8">
              
              {errorMessage && (
                <div className="text-red-400 text-xs font-mono bg-red-950/25 border border-red-500/20 p-3">
                  {errorMessage}
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col gap-2 group">
                <label htmlFor="inpage_name" className="text-[10px] font-mono text-brand-gold uppercase tracking-wider group-focus-within:text-white transition-colors">
                  YOUR FULL NAME *
                </label>
                <input
                  id="inpage_name"
                  type="text"
                  required
                  placeholder="E.g., Dr. Jane Doe"
                  value={inPageContactForm.name}
                  onChange={(e) => setInPageContactForm({ ...inPageContactForm, name: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#C9A84C] py-3 text-sm sm:text-base text-white placeholder-white/20 outline-none transition-all duration-300 font-sans font-light focus:placeholder-transparent"
                />
              </div>

              {/* Organization */}
              <div className="flex flex-col gap-2 group">
                <label htmlFor="inpage_org" className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider group-focus-within:text-brand-gold transition-colors">
                  ORGANIZATION / AFFILIATION (OPTIONAL)
                </label>
                <input
                  id="inpage_org"
                  type="text"
                  placeholder="E.g., Global Governance Forum"
                  value={inPageContactForm.organization}
                  onChange={(e) => setInPageContactForm({ ...inPageContactForm, organization: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#C9A84C] py-3 text-sm sm:text-base text-white placeholder-white/20 outline-none transition-all duration-300 font-sans font-light focus:placeholder-transparent"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 group">
                <label htmlFor="inpage_email" className="text-[10px] font-mono text-brand-gold uppercase tracking-wider group-focus-within:text-white transition-colors">
                  EMAIL ADDRESS *
                </label>
                <input
                  id="inpage_email"
                  type="email"
                  required
                  placeholder="E.g., jane@organization.org"
                  value={inPageContactForm.email}
                  onChange={(e) => setInPageContactForm({ ...inPageContactForm, email: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#C9A84C] py-3 text-sm sm:text-base text-white placeholder-white/20 outline-none transition-all duration-300 font-sans font-light focus:placeholder-transparent"
                />
              </div>

              {/* What would you like to discuss? Radio Choices */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider block mb-1">
                  WHAT WOULD YOU LIKE TO DISCUSS? *
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    "Communication Strategy",
                    "Speaking Engagement",
                    "Partnership",
                    "Media & Communications Support",
                    "Training & Facilitation",
                    "Other"
                  ].map((topic) => {
                    const isSelected = inPageContactForm.topic === topic;
                    return (
                      <div 
                        key={topic}
                        onClick={() => setInPageContactForm({ ...inPageContactForm, topic })}
                        className={`cursor-pointer border py-3 px-4 rounded-sm flex items-center justify-between text-xs font-mono uppercase tracking-wider transition-all duration-300 select-none ${
                          isSelected 
                            ? "bg-brand-gold/10 border-brand-gold text-white font-semibold" 
                            : "bg-[#1E1E20] border-white/5 text-[#8E8E93] hover:border-white/15 hover:text-[#FDFBF7]"
                        }`}
                      >
                        <span>{topic}</span>
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? "border-brand-gold" : "border-[#8E8E93]/40"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2 group mt-2">
                <label htmlFor="inpage_msg" className="text-[10px] font-mono text-brand-gold uppercase tracking-wider group-focus-within:text-white transition-colors">
                  MESSAGE *
                </label>
                <textarea
                  id="inpage_msg"
                  required
                  rows={4}
                  placeholder="Outline your objectives, timelines, or key questions..."
                  value={inPageContactForm.message}
                  onChange={(e) => setInPageContactForm({ ...inPageContactForm, message: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#C9A84C] py-3 text-sm sm:text-base text-white placeholder-white/20 outline-none transition-all duration-300 font-sans font-light resize-none leading-relaxed focus:placeholder-transparent"
                />
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={inPageSubmitting}
                  className="w-full group relative cursor-pointer overflow-hidden rounded-md bg-brand-gold hover:bg-[#DBC19D] py-4 text-center font-mono text-xs uppercase tracking-widest text-[#121214] font-semibold transition-all duration-300 disabled:opacity-55 active:scale-[0.99] shadow-lg shadow-brand-gold/10"
                >
                  <span className="flex items-center justify-center gap-2">
                    {inPageSubmitting ? "SENDING MESSAGE..." : "SEND MESSAGE"}
                    {!inPageSubmitting && <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                  </span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
