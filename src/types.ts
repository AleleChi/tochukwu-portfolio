export interface Profile {
  name: string;
  title: string;
  shortBio: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  profileImage: string;
}

export interface Persona {
  id: number;
  label: string;
  portraitName: string;
  filePath: string;
  mood: string;
  focus: string;
}

export interface Hero {
  headline: string;
  highlightedWord: string;
  description: string;
  primaryCTA: string;
  secondaryCTA: string;
  heroImage: string;
  personas: Persona[];
  
  // Custom alternate schema keys for CMS flexibility
  name?: string;
  title?: string;
  subtitle?: string;
  heroStatement?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  imageUrl?: string;
}

export interface PracticePillar {
  id: string;
  title: string;
  description: string;
}

export interface Practice {
  title: string;
  pillars: PracticePillar[];
}

export interface PracticeArea {
  title: string;
  description: string;
}

export interface ExperienceItem {
  year: string;
  role: string;
  organization: string;
  location?: string;
  contribution: string;
  impact: string;
}

export interface SelectedWorkGraphicItem {
  label: string;
  tag: string;
}

export interface SelectedWorkItem {
  id: string;
  organization: string;
  title: string;
  role: string;
  focus: string;
  contributions: string[];
  impact: string;
  graphicHeader: string;
  graphicTitle: string;
  graphicLabel1?: string;
  graphicValue1?: string;
  graphicDesc1?: string;
  graphicItems?: SelectedWorkGraphicItem[];
}

export interface Organization {
  logoName: string;
  fullName: string;
  roleType: string;
  region: string;
  icon: string;
}

export interface RecognitionArea {
  title: string;
  description: string;
}

export interface Recognition {
  title: string;
  description: string;
  areasHighlighted: RecognitionArea[];
  image: string;
  caption: string;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  description: string;
}

export interface Certification {
  institution: string;
  focus: string;
  description: string;
  verification?: string;
}

export interface ThoughtSection {
  heading?: string;
  text: string;
}

export interface Article {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  readTime: string;
  imageUrl: string;
  category: string;
  sections: ThoughtSection[];
}

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  organization: string;
  category?: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: "Speaking" | "Training" | "Campaigns" | "Events" | "Media" | string;
  location: string;
  year: string;
  description: string;
  imageUrl: string;
}

export interface ReplyItem {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  date: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  organization?: string | null;
  category?: string | null;
  status?: string;
  createdAt?: string;
  replies?: ReplyItem[];
}

export interface SpeakingBlock {
  category: string;
  title: string;
  description: string;
}

export interface Speaking {
  title: string;
  description: string;
  blocks: SpeakingBlock[];
  image1: string;
  image2: string;
}

export interface DatabaseState {
  profile: Profile;
  hero: Hero;
  practice: Practice;
  areasOfPractice: PracticeArea[];
  experience: ExperienceItem[];
  selectedWork: SelectedWorkItem[];
  organisations: Organization[];
  recognition: Recognition;
  education: Education;
  certifications: Certification[];
  articles: Article[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  speaking?: Speaking;
  contactSubmissions?: ContactSubmission[];
}
