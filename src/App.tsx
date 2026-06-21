import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Preloader from "./components/Preloader";

// Import modular frontend components
import Header from "./components/Header";
import Hero from "./components/Hero";
import PracticeSection from "./components/PracticeSection";
import AreasOfPractice from "./components/AreasOfPractice";
import Work from "./components/Work";
import Experience from "./components/Experience";
import SpeakingLeadership from "./components/SpeakingLeadership";
import VisualArchive from "./components/VisualArchive";
import RecognitionEducation from "./components/RecognitionEducation";
import Thoughts from "./components/Thoughts";
import Endorsements from "./components/Endorsements";
import Contact from "./components/Contact";
import AdminDashboard from "./components/AdminDashboard";

// Import types
import { 
  Profile, Hero as HeroType, ExperienceItem, SelectedWorkItem, 
  GalleryItem, Certification, Article, Testimonial, Recognition, Organization 
} from "./types";

// Dynamic Fallback Datasets (ensures app is robust on clear states)
const FALLBACK_PROFILE: Profile = {
  name: "Tochukwu Ogunaka",
  title: "Communication Professional & Media Specialist",
  shortBio: "Through strategic communication, public engagement, and storytelling, I help organizations communicate with purpose, build trust, and create meaningful connections.",
  email: "ogunakatochukwu@gmail.com",
  phone: "+234 816 539 9171",
  location: "Abuja, Nigeria",
  linkedin: "https://www.linkedin.com/in/ogunakatochukwu/",
  profileImage: "/input_file_1.png"
};

const FALLBACK_HERO: HeroType = {
  headline: "Building clarity between organizations, communities, and people.",
  highlightedWord: "clarity",
  description: "Crafting high-impact strategic communications, coordinating public engagement initiatives, and directing media engagement strategies to foster trust and clear storytelling.",
  primaryCTA: "View Portfolio",
  secondaryCTA: "Start Conversation",
  heroImage: "/input_file_0.png",
  personas: [
    {
      id: 0,
      label: "Communication",
      portraitName: "Communication Professional",
      filePath: "/input_file_0.png",
      mood: "Professional, clear, collaborative",
      focus: "Supporting communication planning, clear messaging, and campaign initiatives"
    },
    {
      id: 1,
      label: "Media Specialist",
      portraitName: "Media Specialist",
      filePath: "/input_file_1.png",
      mood: "Experienced, engaging, detail-oriented",
      focus: "Coordinating media activities, developing press releases, and distributing updates"
    },
    {
      id: 2,
      label: "Storytelling",
      portraitName: "Storytelling Practitioner",
      filePath: "/input_file_3.png",
      mood: "Warm, human-centric, creative",
      focus: "Translating organization reports and ideas into relatable public stories"
    },
    {
      id: 3,
      label: "Advocacy",
      portraitName: "Advocacy Supporter",
      filePath: "/input_file_2.png",
      mood: "Grounded, community-first, dedicated",
      focus: "Structuring digital updates, awareness drives, and public outreach programs"
    }
  ]
};

export default function App() {
  const [showPreloader, setShowPreloader] = useState(() => {
    if (window.location.pathname.startsWith("/admin")) {
      return false;
    }
    try {
      const isDev = 
        (import.meta as any).env?.DEV || 
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1" ||
        window.location.href.includes("-dev-") ||
        window.location.search.includes("dev=true");

      if (isDev) {
        return true;
      }
      return !sessionStorage.getItem("tochukwu_portfolio_preloaded");
    } catch {
      return true;
    }
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminOpen, setIsAdminOpen] = useState(
    window.location.pathname === "/admin" || window.location.pathname === "/admin/dashboard"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Router navigation helper
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    setIsAdminOpen(path === "/admin" || path === "/admin/dashboard");
  };

  // App-level Dynamic State
  const [profile, setProfile] = useState<Profile>(FALLBACK_PROFILE);
  const [hero, setHero] = useState<HeroType>(FALLBACK_HERO);
  const [practice, setPractice] = useState({
    title: "COMMUNICATION PRACTICE // 02",
    pillars: [
      {
        id: "01",
        title: "Strategic Communication",
        description: "Designing communication strategies that align organizational objectives with audience needs."
      },
      {
        id: "02",
        title: "Public Engagement",
        description: "Fostering strategic dialogue between institutions, communities, and the public."
      },
      {
        id: "03",
        title: "Media & Storytelling",
        description: "Formatting complex insights into stories that inform, connect, and drive public interest."
      }
    ]
  });
  const [areasOfPractice, setAreasOfPractice] = useState<{ title: string; description: string; }[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [selectedWork, setSelectedWork] = useState<SelectedWorkItem[]>([]);
  const [organisations, setOrganisations] = useState<Organization[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [recognition, setRecognition] = useState<Recognition>({
    title: "National Spotlight Advocacy Feature",
    caption: "[ FEATURED PRESS ADVISORY // ABUJA ]",
    description: "Published and distributed across prime development segments, highlighting modern stakeholder alignment, youth-driven digital equity programs, and senior citizen advocacy initiatives across Nigeria.",
    image: "/input_file_2.png"
  });
  const [speaking, setSpeaking] = useState<any>(undefined);

  // Core Data Fetcher
  const fetchAllContent = async () => {
    const safeFetchJson = async (url: string) => {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await res.json();
        }
        console.warn(`Fetch to ${url} did not return valid JSON. Status: ${res.status}`);
        return { success: false, data: null };
      } catch (err) {
        console.error(`Error requesting ${url}:`, err);
        return { success: false, data: null };
      }
    };

    try {
      setIsLoading(true);
      const [
        profileRes,
        heroRes,
        practiceRes,
        experienceRes,
        speakingRes,
        galleryRes,
        recognitionRes,
        credentialsRes,
        articlesRes,
        testimonialsRes,
        orgsRes,
        workRes
      ] = await Promise.all([
        safeFetchJson("/api/profile"),
        safeFetchJson("/api/hero"),
        safeFetchJson("/api/practice"),
        safeFetchJson("/api/experience"),
        safeFetchJson("/api/speaking"),
        safeFetchJson("/api/gallery"),
        safeFetchJson("/api/recognition"),
        safeFetchJson("/api/credentials"),
        safeFetchJson("/api/articles"),
        safeFetchJson("/api/testimonials"),
        safeFetchJson("/api/organisations"),
        safeFetchJson("/api/selected-work")
      ]);

      if (profileRes.success && profileRes.data) setProfile(profileRes.data);
      if (heroRes.success && heroRes.data) setHero(heroRes.data);
      if (practiceRes.success && practiceRes.data) setPractice(practiceRes.data);
      if (experienceRes.success && experienceRes.data) setExperience(experienceRes.data);
      if (speakingRes.success && speakingRes.data) setSpeaking(speakingRes.data);
      if (galleryRes.success && galleryRes.data) setGallery(galleryRes.data);
      if (recognitionRes.success && recognitionRes.data) setRecognition(recognitionRes.data);
      if (credentialsRes.success && credentialsRes.data) {
        if (credentialsRes.data.certifications) setCertifications(credentialsRes.data.certifications);
      }
      if (articlesRes.success && articlesRes.data) setArticles(articlesRes.data);
      if (testimonialsRes.success && testimonialsRes.data) setTestimonials(testimonialsRes.data);
      if (orgsRes.success && orgsRes.data) setOrganisations(orgsRes.data);
      if (workRes.success && workRes.data) setSelectedWork(workRes.data);
    } catch (err) {
      console.error("Failed to load content from Express backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContent();

    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      setIsAdminOpen(path === "/admin" || path === "/admin/dashboard");
    };
    window.addEventListener("popstate", handlePopState);

    // Keyboard shortcut for hidden administrative access (Ctrl + Alt + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        navigateTo("/admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle saving state back to the server
  const handleSaveAll = async (updatedData: any) => {
    const token = localStorage.getItem("admin_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("/api/save-all", {
      method: "POST",
      headers,
      body: JSON.stringify(updatedData)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "HTTP fail" }));
      throw new Error(errorData.error || "HTTP failure saving database content");
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Save operation returned success=false");
    }

    // Direct update to local states for instant visual reactivity
    if (updatedData.profile) setProfile(updatedData.profile);
    if (updatedData.hero) setHero(updatedData.hero);
    if (updatedData.practice) setPractice(updatedData.practice);
    if (updatedData.areasOfPractice) setAreasOfPractice(updatedData.areasOfPractice);
    if (updatedData.experience) setExperience(updatedData.experience);
    if (updatedData.selectedWork) setSelectedWork(updatedData.selectedWork);
    if (updatedData.gallery) setGallery(updatedData.gallery);
    if (updatedData.certifications) setCertifications(updatedData.certifications);
    if (updatedData.articles) setArticles(updatedData.articles);
    if (updatedData.testimonials) setTestimonials(updatedData.testimonials);
    if (updatedData.recognition) setRecognition(updatedData.recognition);
    if (updatedData.speaking) setSpeaking(updatedData.speaking);
  };

  return (
    <>
      {/* ── PRELOADER TIMELINE ── */}
      <AnimatePresence>
        {showPreloader && (
          <Preloader onComplete={() => {
            try {
              const isDev = 
                (import.meta as any).env?.DEV || 
                window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1" ||
                window.location.href.includes("-dev-") ||
                window.location.search.includes("dev=true");

              if (!isDev) {
                sessionStorage.setItem("tochukwu_portfolio_preloaded", "true");
              }
            } catch {}
            setShowPreloader(false);
          }} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#161618] text-[#FDFBF7] font-sans selection:bg-[#C9A84C] selection:text-[#111112]">
        
        {/* Dynamic Nav Header */}
        <Header 
          profile={profile} 
          onOpenAdmin={() => navigateTo("/admin")} 
        />

        {/* Dynamic Hero Presentation */}
        <Hero 
          hero={hero} 
          organisations={organisations}
        />

        {/* Dynamic Practice Overview Section */}
        <PracticeSection 
          practice={practice} 
        />

        {/* Dynamic Areas of Practice Accordions/Cards */}
        <AreasOfPractice 
          areasOfPractice={areasOfPractice} 
        />

        {/* Dynamic Work Case Studies */}
        <Work 
          selectedWork={selectedWork} 
        />

        {/* Dynamic Experience Timeline */}
        <Experience 
          experience={experience} 
        />

        {/* Dynamic Speaking & Leadership Portfolio */}
        <SpeakingLeadership speaking={speaking} />

        {/* Dynamic Visual Media Archive */}
        <VisualArchive 
          gallery={gallery} 
        />

        {/* Dynamic Recognition & Certs Accordion */}
        <RecognitionEducation 
          recognition={recognition}
          certifications={certifications}
        />

        {/* Dynamic Thought Leadership Essays */}
        <Thoughts 
          articles={articles} 
        />

        {/* Dynamic Editorial Endorsements Banner */}
        <Endorsements testimonials={testimonials} />

        {/* Dynamic Interactive Conversational Contact Forms */}
        <Contact profile={profile} />

        {/* Master Corporate Footer */}
        <footer className="w-full bg-[#111112] py-16 border-t border-white/5 relative z-10 text-center text-xs text-[#8E8E93] font-mono select-none">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <p>© 2026 Tochukwu Ogunaka. All Rights Reserved.</p>
            <div className="flex flex-wrap items-center gap-6 text-[#8E8E93]">
              <span>Abuja, Nigeria</span>
              <span>•</span>
              <span>Communication • Media • Advocacy</span>
            </div>
          </div>
        </footer>

        {/* Master Admin CMS Dashboard Overlay Form Modal */}
        <AdminDashboard 
          isOpen={isAdminOpen} 
          onClose={() => navigateTo("/")}
          initialData={{
            profile,
            hero,
            practice,
            areasOfPractice,
            experience,
            selectedWork,
            gallery,
            certifications,
            articles,
            testimonials,
            recognition,
            speaking
          }}
          onSave={handleSaveAll}
        />

      </div>
    </>
  );
}
