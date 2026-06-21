import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { uploadMedia } from "../utils/uploadService";
import { 
  X, Save, Upload, Plus, Trash2, Edit3, Image as ImageIcon, 
  FileText, Briefcase, Award, Users, Mail, Settings, BookOpen, AlertCircle,
  Eye
} from "lucide-react";
import { 
  Profile, Hero, ExperienceItem, SelectedWorkItem, GalleryItem, 
  Certification, Article, Testimonial, Recognition 
} from "../types";

// Modular Administrative Sub-components
import AdminLogin from "./admin/AdminLogin";
import AdminOverview from "./admin/AdminOverview";
import AdminMessages from "./admin/AdminMessages";
import AdminMedia from "./admin/AdminMedia";
import AdminProfile from "./admin/AdminProfile";
import AdminSettings from "./admin/AdminSettings";
import { AdminToastContainer, ToastMessage } from "./admin/AdminToast";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    profile: Profile;
    hero: Hero;
    practice: { title: string; pillars: { id: string; title: string; description: string; }[] };
    areasOfPractice: { title: string; description: string; }[];
    experience: ExperienceItem[];
    selectedWork: SelectedWorkItem[];
    gallery: GalleryItem[];
    certifications: Certification[];
    articles: Article[];
    testimonials: Testimonial[];
    recognition: Recognition;
    speaking?: any;
  };
  onSave: (newData: any) => Promise<void>;
}

export default function AdminDashboard({ isOpen, onClose, initialData, onSave }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "hero" | "experience" | "work" | "gallery" | "education" | "articles" | "speaking" | "overview" | "mediaLibrary" | "submissions" | "account">("overview");
  
  // Real-time dynamic notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: "success" | "error" | "info" | "warning", title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5500);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // Auth state management
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("admin_token"));
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);

  // Admin User management states
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"Studio Owner" | "Administrator">("Administrator");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");
  const [adminManageMessage, setAdminManageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Account settings state
  const [actName, setActName] = useState("");
  const [actEmail, setActEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [actMessage, setActMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  // Cloudinary media storage parameters config
  const [cloudName, setCloudName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [provider, setProvider] = useState("cloudinary");
  const [isSavingStorage, setIsSavingStorage] = useState(false);
  const [storageMessage, setStorageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Hydrate Cloudinary configurations dynamically
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      const fetchStorageConfig = async () => {
        const token = localStorage.getItem("admin_token");
        try {
          const res = await fetch("/api/admin/cloudinary-config", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data) {
            setCloudName(data.data.cloudName || "");
            setApiKey(data.data.apiKey || "");
            setApiSecret(data.data.apiSecret || "");
            setProvider(data.data.provider || "cloudinary");
          }
        } catch (err) {
          console.error("Failed to load Cloudinary config in dashboard:", err);
        }
      };
      fetchStorageConfig();
    }
  }, [isOpen, isAuthenticated]);

  const handleStorageConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStorageMessage(null);
    
    // Prevent multiple requests
    if (isSavingStorage) return;

    if (!cloudName || !cloudName.trim()) {
      addToast("error", "Validation Error", "Cloudinary cloud name is required.");
      setStorageMessage({ type: "error", text: "Cloudinary cloud name is required." });
      return;
    }
    if (!apiKey || !apiKey.trim()) {
      addToast("error", "Validation Error", "Cloudinary API key is required.");
      setStorageMessage({ type: "error", text: "Cloudinary API key is required." });
      return;
    }
    if (!apiSecret || !apiSecret.trim()) {
      addToast("error", "Validation Error", "Cloudinary API secret is required.");
      setStorageMessage({ type: "error", text: "Cloudinary API secret is required." });
      return;
    }

    setIsSavingStorage(true);
    addToast("info", "Saving Configuration", "Updating storage configuration settings...");
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/cloudinary-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          cloudName: cloudName.trim(), 
          apiKey: apiKey.trim(), 
          apiSecret: apiSecret.trim(), 
          provider 
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast("success", "Storage Configuration", "Storage configuration updated successfully. Cloudinary connection settings have been saved.");
        setStorageMessage({ type: "success", text: "Storage configuration updated successfully." });
        setTimeout(() => setStorageMessage(null), 5000);
      } else {
        const errorMsg = data.error || "Failed to synchronize storage parameters.";
        addToast("error", "Unable to update storage configuration", errorMsg);
        setStorageMessage({ type: "error", text: errorMsg });
      }
    } catch (err) {
      addToast("error", "Unable to update storage configuration", "Network error: failed to establish connection with storage gateway.");
      setStorageMessage({ type: "error", text: "Network error: failed to establish connection with storage gateway." });
    } finally {
      setIsSavingStorage(false);
    }
  };

  // Synchronize currentUser fields into account settings form inputs
  useEffect(() => {
    if (currentUser) {
      setActName(currentUser.name || "");
      setActEmail(currentUser.email || "");
    }
  }, [currentUser]);

  // Administrative collection states
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [mediaCategory, setMediaCategory] = useState("gallery");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Local state for all database models
  const [profile, setProfile] = useState<Profile>({ ...initialData.profile });
  const [hero, setHero] = useState<Hero>({ ...initialData.hero });
  const [practice, setPractice] = useState({ ...initialData.practice });
  const [areasOfPractice, setAreasOfPractice] = useState([...initialData.areasOfPractice]);
  const [experience, setExperience] = useState<ExperienceItem[]>([...initialData.experience]);
  const [selectedWork, setSelectedWork] = useState<SelectedWorkItem[]>([...initialData.selectedWork]);
  const [gallery, setGallery] = useState<GalleryItem[]>([...initialData.gallery]);
  const [certifications, setCertifications] = useState<Certification[]>([...initialData.certifications]);
  const [articles, setArticles] = useState<Article[]>([...initialData.articles]);
  const [recognition, setRecognition] = useState<Recognition>({ ...initialData.recognition });
  const [speaking, setSpeaking] = useState<any>(initialData.speaking || { title: "", description: "", blocks: [], image1: "", image2: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // Image upload handles
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingField, setUploadingField] = useState<{ type: string; id?: number; field?: string } | null>(null);

  // Telemetry logs for Hero Strategic Narrative editor section
  useEffect(() => {
    if (activeTab === "hero") {
      console.log("HERO EDITOR LOAD");
      console.log("CTA VALUES:");
      console.log("primaryCTA:", hero.primaryCTA || "View Portfolio");
      console.log("secondaryCTA:", hero.secondaryCTA || "Start Conversation");
    }
  }, [activeTab, hero.primaryCTA, hero.secondaryCTA]);

  // Admin Data Sync Engine
  const loadAdminData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Verify token/session validity and get current administrative user details
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success && verifyData.user) {
        setCurrentUser(verifyData.user);
      } else {
        handleLogout();
        return;
      }

      // Fetch full raw content
      const contentRes = await fetch("/api/all-content", { headers });
      const contentData = await contentRes.json();
      if (contentData.success && contentData.data) {
        const d = contentData.data;
        if (d.profile) setProfile(d.profile);
        if (d.hero) setHero(d.hero);
        if (d.practice) setPractice(d.practice);
        if (d.areasOfPractice) setAreasOfPractice(d.areasOfPractice);
        if (d.experience) setExperience(d.experience);
        if (d.selectedWork) setSelectedWork(d.selectedWork);
        if (d.gallery) setGallery(d.gallery);
        if (d.certifications) setCertifications(d.certifications);
        if (d.articles) setArticles(d.articles);
        if (d.testimonials) setTestimonials(d.testimonials);
        if (d.recognition) setRecognition(d.recognition);
        if (d.speaking) setSpeaking(d.speaking);
        if (d.contactSubmissions) setContactSubmissions(d.contactSubmissions);
        if (d.adminUsers) setAllAdmins(d.adminUsers);
      }

      // Fetch media library
      const mediaRes = await fetch("/api/media", { headers });
      const mediaData = await mediaRes.json();
      if (mediaData.success && mediaData.data) {
        setMediaLibrary(mediaData.data);
      }
    } catch (err) {
      console.error("Error loading secure admin data:", err);
    }
  };

  React.useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        setLoginPassword("");
        if (data.user) {
          setCurrentUser(data.user);
        }
        // Set path to dashboard
        window.history.pushState({}, "", "/admin/dashboard");
        // Reload raw data
        setTimeout(loadAdminData, 100);
      } else {
        setLoginError(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setLoginError("Failed to reach auth server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setActiveTab("overview");
    setCurrentUser(null);
    // Explicitly navigate back to public landing page on sign out
    window.history.pushState({}, "", "/");
    onClose();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingAccount(true);
    setActMessage(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: actName, email: actEmail })
      });
      const data = await res.json();
      if (data.success) {
        if (data.token) localStorage.setItem("admin_token", data.token);
        if (data.user) setCurrentUser(data.user);
        setActMessage({ type: "success", text: "Profile settings updated successfully." });
      } else {
        setActMessage({ type: "error", text: data.error || "Failed to update profile settings." });
      }
    } catch (err) {
      setActMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingAccount(true);
    setActMessage(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (data.success) {
        if (data.token) localStorage.setItem("admin_token", data.token);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setActMessage({ type: "success", text: "Password changed successfully." });
      } else {
        setActMessage({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch (err) {
      setActMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleForceLogoutSessions = async () => {
    if (!confirm("Are you sure you want to invalidate all active login sessions on other devices? You will remain signed in on this dev instance.")) {
      return;
    }
    setIsUpdatingAccount(true);
    setActMessage(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/logout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setActMessage({ type: "success", text: "All other sessions have been successfully invalidated." });
        // Retrieve fresh details
        loadAdminData();
      } else {
        setActMessage({ type: "error", text: data.error || "Failed to invalidate sessions." });
      }
    } catch (err) {
      setActMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword !== newAdminConfirmPassword) {
      setAdminManageMessage({ type: "error", text: "New password fields do not match." });
      return;
    }
    setIsCreatingAdmin(true);
    setAdminManageMessage(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          role: newAdminRole,
          password: newAdminPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminRole("Administrator");
        setNewAdminPassword("");
        setNewAdminConfirmPassword("");
        setAdminManageMessage({ type: "success", text: data.message || "Administrator registered successfully." });
        loadAdminData();
      } else {
        setAdminManageMessage({ type: "error", text: data.error || "Failed to create administrator." });
      }
    } catch (err) {
      setAdminManageMessage({ type: "error", text: "Network connection refused." });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (currentUser?.id === adminId) {
      alert("Conflict error: You are not permitted to self-delete from active administrative users.");
      return;
    }
    if (!confirm("Are you certain you wish to permanently strip administrator privileges from this user? This action cannot be reversed.")) {
      return;
    }

    setAdminManageMessage(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/users/${adminId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAdminManageMessage({ type: "success", text: data.message || "Administrator removed successfully." });
        loadAdminData();
      } else {
        setAdminManageMessage({ type: "error", text: data.error || "Failed to delete administrator." });
      }
    } catch (err) {
      setAdminManageMessage({ type: "error", text: "Network connection refused." });
    }
  };

  const handleMediaLibraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    setSaveMessage("Optimizing image...");
    addToast("info", "Image Upload", "Optimizing image...");
    
    // Simulate minor progress so the user sees the stages clearly
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setSaveMessage("Uploading image...");
    addToast("info", "Image Upload", "Uploading image...");

    try {
      const data = await uploadMedia({
        file,
        category: mediaCategory
      });
      if (data.success && data.data) {
        setMediaLibrary(prev => [data.data!, ...prev]);
        setSaveMessage("Image uploaded successfully! ✓");
        addToast("success", "Image Upload", "Image uploaded successfully.");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorMsg = data.message || "Upload failed due to service rejection.";
        addToast("error", "Image Upload Failed", `Image upload failed: ${errorMsg}`);
        setSaveMessage(`✕ Upload failed: ${errorMsg}`);
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || "Error uploading to Media Library.";
      addToast("error", "Image Upload Failed", `Image upload failed: ${errorMsg}`);
      setSaveMessage(`✕ Upload failed: ${errorMsg}`);
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image? It will physically remove the image from the server and cannot be undone!")) return;
    
    try {
      const token = localStorage.getItem("admin_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json();
      if (data.success) {
        setMediaLibrary(prev => prev.filter(item => item.id !== id));
        setSaveMessage("✓ Physical file and reference removed!");
        addToast("success", "Media Library", "Item removed successfully.");
        setTimeout(() => setSaveMessage(null), 3050);
      } else {
        const errorMsg = data.error || "Delete failed";
        addToast("error", "Delete Failed", errorMsg);
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Delete Failed", "Error deleting media from central registry.");
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [testimonials, setTestimonials] = useState<Testimonial[]>([...initialData.testimonials]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadingField) return;

    // Enforce single-image sections protection
    const singleImageTypes = ["profile", "hero", "persona", "recognition", "speaking-image1", "speaking-image2", "work-item", "article-image"];
    if (singleImageTypes.includes(uploadingField.type)) {
      if (files.length > 1) {
        addToast("error", "Asset Policy", "Only one image is allowed for this section.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    const file = files[0];
    setSaveMessage("Optimizing image...");
    addToast("info", "Image Upload", "Optimizing image...");

    try {
      // Simulate small delay for optimizing stage to make states readable
      await new Promise(resolve => setTimeout(resolve, 600));

      setSaveMessage("Uploading image...");
      addToast("info", "Image Upload", "Uploading image...");

      const data = await uploadMedia({
        file,
        category: uploadingField.type,
        recordId: uploadingField.id
      });

      if (data.success && data.url) {
        // Assign the newly uploaded URL to local states immediately to refresh UI
        if (uploadingField.type === "profile") {
          setProfile(prev => ({ ...prev, profileImage: data.url }));
        } else if (uploadingField.type === "hero") {
          setHero(prev => ({ ...prev, heroImage: data.url }));
        } else if (uploadingField.type === "persona" && uploadingField.id !== undefined) {
          setHero(prev => {
            const updatedPersonas = prev.personas.map(p => 
              p.id === uploadingField.id ? { ...p, filePath: data.url } : p
            );
            return { ...prev, personas: updatedPersonas };
          });
        } else if (uploadingField.type === "recognition") {
          setRecognition(prev => ({ ...prev, image: data.url }));
        } else if (uploadingField.type === "gallery-item" && uploadingField.id !== undefined) {
          setGallery(prev => prev.map((item, idx) => 
            idx === uploadingField.id ? { ...item, imageUrl: data.url } : item
          ));
        } else if (uploadingField.type === "work-item" && uploadingField.id !== undefined) {
          setSelectedWork(prev => prev.map((item, idx) => 
            idx === uploadingField.id ? { ...item, imageUrl: data.url } : item
          ));
        } else if (uploadingField.type === "article-image" && uploadingField.id !== undefined) {
          setArticles(prev => prev.map((item, idx) => 
            idx === uploadingField.id ? { ...item, imageUrl: data.url } : item
          ));
        } else if (uploadingField.type === "speaking-image1") {
          setSpeaking(prev => ({ ...prev, image1: data.url }));
        } else if (uploadingField.type === "speaking-image2") {
          setSpeaking(prev => ({ ...prev, image2: data.url }));
        }
        
        // Selectively call the correct dedicated API PUT endpoint to persist immediately without full validation blockage
        let endpoint = `/api/profile/image`;
        const bodyObj: any = { imageUrl: data.url };
        
        if (uploadingField.type === "profile") {
          endpoint = `/api/profile/image`;
        } else if (uploadingField.type === "hero") {
          endpoint = `/api/hero/image`;
        } else if (uploadingField.type === "persona" && uploadingField.id !== undefined) {
          endpoint = `/api/hero/persona/image/${uploadingField.id}`;
        } else if (uploadingField.type === "recognition") {
          endpoint = `/api/recognition/image`;
        } else if (uploadingField.type === "gallery-item" && uploadingField.id !== undefined) {
          const actualItem = gallery[uploadingField.id];
          const actualId = actualItem ? actualItem.id : uploadingField.id;
          endpoint = `/api/gallery/image/${actualId}`;
        } else if (uploadingField.type === "article-image" && uploadingField.id !== undefined) {
          const actualItem = articles[uploadingField.id];
          const actualId = actualItem ? actualItem.id : uploadingField.id;
          endpoint = `/api/articles/image/${actualId}`;
        } else if (uploadingField.type === "speaking-image1") {
          endpoint = `/api/speaking/image/1`;
        } else if (uploadingField.type === "speaking-image2") {
          endpoint = `/api/speaking/image/2`;
        } else {
          endpoint = `/api/profile/image-update`;
          bodyObj.field = uploadingField.type;
        }

        try {
          const token = localStorage.getItem("admin_token");
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const putRes = await fetch(endpoint, {
            method: "PUT",
            headers,
            body: JSON.stringify(bodyObj)
          });
          if (putRes.ok) {
            const putResData = await putRes.json();
            if (putResData.success) {
              console.log("Dedicated field image URL persisted successfully on backend:", putResData.message);
              setSaveMessage("Image uploaded successfully! ✓");
              addToast("success", "Image Upload", "Image uploaded successfully.");
              setTimeout(() => setSaveMessage(null), 3000);
              return;
            } else {
              const errText = putResData.error || "Database update failed";
              setSaveMessage(`✗ Image save failed: ${errText}`);
              addToast("error", "Image Upload Failed", `Image upload failed: ${errText}`);
              setTimeout(() => setSaveMessage(null), 5000);
              return;
            }
          } else {
            const putResErrData = await putRes.json().catch(() => ({}));
            const errText = putResErrData.error || "System error saving image";
            setSaveMessage(`✗ Image save error: ${errText}`);
            addToast("error", "Image Upload Failed", `Image upload failed: ${errText}`);
            setTimeout(() => setSaveMessage(null), 5000);
            return;
          }
        } catch (putErr) {
          console.error("Dedicated partial image saving endpoint failed:", putErr);
          setSaveMessage("✗ Network error saving image changes.");
          addToast("error", "Image Upload Failed", "Image upload failed: Network error saving image changes.");
          setTimeout(() => setSaveMessage(null), 5000);
          return;
        }
      } else {
        const errText = data.message || "Upload failed";
        addToast("error", "Image Upload Failed", `Image upload failed: ${errText}`);
        setSaveMessage(null);
      }
    } catch (err: any) {
      console.error(err);
      const errText = err.message || "Error uploading image";
      addToast("error", "Image Upload Failed", `Image upload failed: ${errText}`);
      setSaveMessage(null);
    } finally {
      setUploadingField(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUploadInput = (type: string, id?: number, field?: string) => {
    setUploadingField({ type, id, field });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleGlobalSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveMessage("Syncing portfolio edits with core database...");
    addToast("info", "Saving Changes", "Syncing portfolio edits with core database...");
    
    const payload = {
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
    };

    const tabNames: Record<string, string> = {
      profile: "Profile",
      hero: "Hero section",
      experience: "Experience timeline",
      work: "Selected work",
      gallery: "Visual gallery",
      education: "Certifications",
      articles: "Articles / Thoughts",
      speaking: "Speaking engagements",
      overview: "Workspace content",
      mediaLibrary: "Media Library",
      submissions: "Submissions",
      account: "Account credentials"
    };

    try {
      await onSave(payload);
      const label = tabNames[activeTab] || "Workspace";
      if (activeTab === "hero") {
        setSaveMessage("Hero content updated successfully.");
        console.log("HERO UPDATE SUCCESS");
      } else {
        setSaveMessage(`✓ ${label} updated successfully`);
      }
      
      if (activeTab === "articles") {
        addToast("success", "Article Saving", "Article updated successfully.");
      } else if (activeTab === "hero") {
        addToast("success", "Hero Saving", "Hero content updated successfully.");
      } else {
        addToast("success", "Content Saving", "Changes saved successfully.");
      }

      setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : "Database update failed.";
      setSaveMessage(`✕ Save failed: ${errorMsg}`);
      addToast("error", "Save Failed", `Unable to save changes: ${errorMsg}`);
      setTimeout(() => setSaveMessage(null), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="admin-editor-overlay" className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 font-sans selection:bg-[#C9A84C] selection:text-[#111112]">
        
        {/* Real hidden file uploader */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
          accept="image/*"
          multiple
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          className="bg-[#1C1C1E] border border-[#C9A84C]/35 rounded-xl shadow-2xl w-full h-full max-w-7xl flex flex-col overflow-hidden text-[#FDFBF7]"
        >
          {!isAuthenticated ? (
            <AdminLogin 
              onClose={onClose} 
              onLoginSuccess={(token, user) => {
                localStorage.setItem("admin_token", token);
                setIsAuthenticated(true);
                setCurrentUser(user);
                addToast("success", "Authentication", "Welcome back. Login successful.");
                window.history.pushState({}, "", "/admin/dashboard");
                setTimeout(loadAdminData, 100);
              }}
            />
          ) : (
            /* FULL AUTHENTICATED ADMINISTRATOR WORKSPACE */
            <>
              {/* Header Row */}
              <div className="bg-[#111112] border-b border-[#C9A84C]/20 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#C9A84C] rounded-full shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-serif font-bold tracking-tight text-white uppercase">Content Management Console</h3>
                    <p className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">Tochukwu Ogunaka Editorial Studio</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 animate-fadeIn flex-wrap justify-end">
                  {saveMessage && (
                    <div className="text-xs font-mono text-brand-gold bg-[#C9A84C]/5 border border-[#C9A84C]/20 py-1.5 px-3.5 rounded-full flex items-center gap-1.5 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{saveMessage}</span>
                    </div>
                  )}
                  <button
                    onClick={handleGlobalSave}
                    disabled={isSaving}
                    className="bg-brand-gold hover:bg-[#DBC19D] disabled:opacity-55 px-4 py-2 rounded-none text-xs font-mono font-bold uppercase tracking-wider text-[#121214] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    title="Publish edited section content to database"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "SAVING..." : "SAVE CHANGES"}</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3 py-2 border border-white/10 hover:border-brand-gold hover:bg-[#C9A84C]/5 text-brand-muted hover:text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 rounded-none"
                    title="Exit console and view public website"
                  >
                    <Eye className="w-4 h-4 text-brand-gold shrink-0" />
                    <span>View Website</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3 py-2 border border-white/10 hover:border-brand-gold hover:bg-white/5 text-brand-muted hover:text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 rounded-none"
                    title="Close Editorial Studio"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    <span>Close</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 border border-[#C9A84C]/25 hover:bg-[#C9A84C]/10 text-brand-gold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer rounded-none"
                    title="Sign out of the workspace"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="grow flex flex-col lg:flex-row overflow-hidden">
                
                {/* Left Nav Bar Tabs */}
                <div className="w-full lg:w-64 bg-[#111112]/50 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-row lg:flex-col gap-1.5 p-3 lg:p-4 overflow-x-auto lg:overflow-y-auto shrink-0 text-left scrollbar-none items-center lg:items-stretch">
                  <span className="text-[9px] font-mono text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-2.5 hidden lg:block px-2.5">Studio Navigation</span>
                  
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "overview" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("mediaLibrary")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "mediaLibrary" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Media Manager</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("submissions")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center justify-between gap-3 lg:gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "submissions" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Messages</span>
                    </div>
                    {contactSubmissions.filter((s: any) => (s.status || "New") === "New").length > 0 && (
                      <span className="bg-[#C9A84C] text-[#111112] text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full animate-pulse shrink-0 tracking-normal">
                        {contactSubmissions.filter((s: any) => (s.status || "New") === "New").length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("account")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 lg:mb-5 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "account" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </button>

                  <span className="text-[9px] font-mono text-[#C9A84C] uppercase tracking-[0.25em] font-bold mb-2.5 hidden lg:block px-2.5">Content Sections</span>
                  
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "profile" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Identity Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("hero")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "hero" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Presentation Hero</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("experience")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "experience" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Experience Timeline</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("work")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "work" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Selected Portfolios</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("gallery")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "gallery" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Visual Stories</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("education")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "education" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Recognition & Certs</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("articles")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "articles" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Articles & Thoughts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("speaking")}
                    className={`w-auto lg:w-full py-2 px-3 lg:py-2.5 lg:px-3.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer rounded-none shrink-0 border-b-2 lg:border-b-0 lg:border-l-2 ${activeTab === "speaking" ? "text-[#C9A84C] bg-[#C9A84C]/5 font-bold border-[#C9A84C]" : "text-[#8E8E93] hover:text-[#FDFBF7] hover:bg-white/5 border-transparent"}`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Speaking & Leadership</span>
                  </button>
                </div>

             {/* Main Content Workspace Panel */}
            <div className="grow overflow-y-auto p-4 md:p-8 bg-[#161618] text-left">
              
              {/* SYSTEM OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-6 max-w-5xl animate-fadeIn">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Overview</h4>
                    <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">Manage portfolio content, media archives, and professional requests.</p>
                  </div>

                  {/* Summary Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-brand-gold/30 transition-all">
                      <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">History Events</span>
                      <h5 className="text-3xl font-serif font-bold text-white mt-2">{experience.length}</h5>
                      <span className="text-[9px] text-[#8E8E93] font-mono mt-1 uppercase">Timeline Timeline Events</span>
                    </div>

                    <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-brand-gold/30 transition-all">
                      <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">Published Essays</span>
                      <h5 className="text-3xl font-serif font-bold text-white mt-2">{articles.length}</h5>
                      <span className="text-[9px] text-[#8E8E93] font-mono mt-1 uppercase">Essays & Perspectives</span>
                    </div>

                    <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-brand-gold/30 transition-all">
                      <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">Media Objects</span>
                      <h5 className="text-3xl font-serif font-bold text-white mt-2">{mediaLibrary.length}</h5>
                      <span className="text-[9px] text-[#8E8E93] font-mono mt-1 uppercase">Visual items in gallery</span>
                    </div>

                    <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-none text-left flex flex-col justify-between hover:border-brand-gold/30 transition-all text-brand-gold bg-brand-gold/5 border-brand-gold/20">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">Messages</span>
                      <h5 className="text-3xl font-serif font-bold text-[#FDFBF7] mt-2">{contactSubmissions.length}</h5>
                      <span className="text-[9px] text-[#C9A84C]/80 font-mono mt-1 uppercase">Inquiries received</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="md:col-span-2 bg-[#1C1C1E] border border-white/5 p-6 rounded-none text-left flex flex-col gap-4">
                      <h5 className="font-serif text-lg font-bold text-white">Editorial Workflows</h5>
                      <p className="text-sm text-[#D5D3CC] leading-relaxed">
                        This workspace manages Tochukwu Ogunaka’s digital representation. Update background bio parameters, upload editorial pictures, adjust credentials, organize public essays, or respond directly to professional message logs.
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <button
                          onClick={() => setActiveTab("profile")}
                          className="px-4 py-2 border border-white/5 hover:bg-white/10 text-white rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Identity Profile
                        </button>
                        <button
                          onClick={() => setActiveTab("experience")}
                          className="px-4 py-2 border border-white/5 hover:bg-white/10 text-white rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Experience Timeline
                        </button>
                        <button
                          onClick={() => setActiveTab("articles")}
                          className="px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-[#C9A84C] rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Write Essay
                        </button>
                        <button
                          onClick={() => setActiveTab("mediaLibrary")}
                          className="px-4 py-2 bg-[#C9A84C] hover:bg-[#DBC19D] text-black font-semibold rounded-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Media Manager
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-none text-left flex flex-col gap-3">
                      <h5 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-gold">Account Overview</h5>
                      <div className="flex flex-col gap-2.5 mt-1 text-xs text-[#8E8E93] font-mono">
                        <div className="flex justify-between border-b border-white/5 pb-1.5 font-sans">
                          <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Profile:</span>
                          <span className="text-[#FDFBF7] font-medium font-serif">Tochukwu Ogunaka</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5 font-sans">
                          <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Account Role:</span>
                          <span className="text-[#FDFBF7] font-medium font-serif">Studio Owner</span>
                        </div>
                        <div className="flex justify-between pointer-events-none font-sans">
                          <span className="font-mono text-[10px] uppercase text-[#8E8E93]">Website Status:</span>
                          <span className="text-emerald-400 font-semibold uppercase">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MEDIA LIBRARY TAB */}
              {activeTab === "mediaLibrary" && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Active Media Library catalog</h4>
                      <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-widest mt-1">Upload, copy relative paths, and physically unlink portfolio photos</p>
                    </div>

                    {/* Quick Media Upload Block */}
                    <div className="flex items-center gap-3 bg-[#111112] border border-white/5 p-2 rounded-lg">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] font-mono text-brand-gold uppercase tracking-wider px-1">Storage Tag Category</label>
                        <select
                          value={mediaCategory}
                          onChange={(e) => setMediaCategory(e.target.value)}
                          className="bg-[#1C1C1E] border-none px-2 py-1 text-xs text-brand-muted focus:text-white rounded cursor-pointer outline-none"
                        >
                          <option value="profile">Profile Identity</option>
                          <option value="hero">Hero Presentation</option>
                          <option value="gallery">Visual Stories Gallery</option>
                          <option value="recognition">Spotlight Feature</option>
                          <option value="articles">Articles thoughts</option>
                          <option value="other">General Assets</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        disabled={isUploadingMedia}
                        className="h-10 px-4 bg-brand-gold hover:bg-[#DBC19D] disabled:opacity-55 text-[#121214] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 rounded transition-all cursor-pointer align-middle"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingMedia ? "UPLOADING..." : "UPLOAD PHOTO"}</span>
                      </button>
                    </div>
                  </div>

                  {mediaLibrary.length === 0 ? (
                    <div className="p-16 text-center border border-dashed border-white/10 rounded-lg flex flex-col gap-3 justify-center items-center">
                      <ImageIcon className="w-10 h-10 text-brand-muted/40" />
                      <p className="text-sm text-brand-muted">No images currently catalogued. Add assets to get started.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {mediaLibrary.map((item) => (
                        <div key={item.id} className="p-3 border border-white/5 rounded-md bg-[#1C1C1E] flex flex-col justify-between gap-3 group relative hover:border-[#C9A84C]/35 transition-all">
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Remove file permanently from disk"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div className="relative aspect-square w-full rounded overflow-hidden border border-white/10 bg-[#111112]">
                            <img
                              src={item.url}
                              alt={item.altText}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            />
                            <span className="absolute bottom-1 left-1.5 px-2 py-0.5 text-[8px] font-mono uppercase bg-black/85 text-brand-gold rounded-full tracking-wider border border-[#C9A84C]/45">
                              {item.category}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5 text-left grow">
                            <h6 className="text-[10px] font-mono text-[#D5D3CC] truncate" title={item.filename}>
                              {item.filename}
                            </h6>
                            <span className="text-[9px] font-mono text-[#8E8E93]">
                              {(item.fileSize / 1024).toFixed(1)} KB
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleCopyLink(item.url)}
                              className={`w-full py-1 text-[9px] font-mono uppercase border border-white/5 hover:border-brand-gold/45 text-center cursor-pointer rounded transition-all mt-1 flex items-center justify-center gap-1.5 ${copiedId === item.url ? "bg-brand-gold text-black border-brand-gold" : "bg-[#111112] text-brand-gold"}`}
                            >
                              <span>{copiedId === item.url ? "✓ PATH COPIED" : "COPY PATH"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* INQUIRIES SUBMISSIONS LOG TAB */}
              {activeTab === "submissions" && (
                <AdminMessages 
                  submissions={contactSubmissions} 
                  onRefresh={loadAdminData} 
                  onAddToast={addToast}
                />
              )}

              {/* TAB 1: Profile & Identity */}
              {activeTab === "profile" && (
                <div className="flex flex-col gap-6 max-w-4xl">
                  <h4 className="text-xl font-serif font-bold mb-2">Profile & Identity Systems</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-brand-gold uppercase tracking-wider font-semibold">Strategist Name</label>
                      <input 
                        type="text" 
                        value={profile.name || ""}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-brand-gold uppercase tracking-wider font-semibold">Professional Title Subtitle</label>
                      <input 
                        type="text" 
                        value={profile.title || ""}
                        onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider font-semibold">About Practice Short Bio</label>
                    <textarea 
                      rows={3}
                      value={profile.shortBio || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, shortBio: e.target.value }))}
                      className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2.5 px-3 text-sm focus:border-brand-gold outline-none font-sans"
                    />
                  </div>

                  {/* Contact Links */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">Email Address</label>
                      <input 
                        type="text" 
                        value={profile.email || ""}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">LinkedIn Handle Link</label>
                      <input 
                        type="text" 
                        value={profile.linkedin || ""}
                        onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">Default Location</label>
                      <input 
                        type="text" 
                        value={profile.location || ""}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Profile Portrait Replacement */}
                  <div className="flex items-center gap-6 p-4 border border-white/5 rounded bg-[#111112]">
                    <img 
                      src={profile.profileImage} 
                      alt="" 
                      className="w-16 h-16 rounded object-cover border border-[#C9A84C]/35 grayscale"
                    />
                    <div className="flex flex-col gap-2 text-left">
                      <span className="text-[10px] font-mono text-[#8E8E93] uppercase">Identity Headshot Image</span>
                      <button
                        onClick={() => triggerUploadInput("profile")}
                        className="px-4 py-2 border border-[#C9A84C]/35 hover:bg-[#C9A84C] hover:text-[#111112] text-brand-gold text-xs font-mono uppercase tracking-widest cursor-pointer transition-all"
                      >
                        Upload custom portrait
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Hero & Profile Images */}
              {activeTab === "hero" && (
                <div className="flex flex-col gap-6 max-w-4xl text-left">
                  <h4 className="text-xl font-serif font-bold mb-2">Hero Strategic Narrative</h4>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-brand-gold uppercase tracking-wider font-semibold">Aesthetic Headline Statement</label>
                    <input 
                       type="text" 
                       value={hero.headline || ""}
                       onChange={(e) => setHero(prev => ({ ...prev, headline: e.target.value }))}
                       className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">Supporting Sub-Text Info</label>
                    <textarea 
                      rows={3}
                      value={hero.description || ""}
                      onChange={(e) => setHero(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">Primary CTA Label</label>
                      <input 
                         type="text" 
                         value={hero.primaryCTA || ""}
                         onChange={(e) => setHero(prev => ({ ...prev, primaryCTA: e.target.value }))}
                         placeholder="View Portfolio"
                         className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">Secondary CTA Label</label>
                      <input 
                         type="text" 
                         value={hero.secondaryCTA || ""}
                         onChange={(e) => setHero(prev => ({ ...prev, secondaryCTA: e.target.value }))}
                         placeholder="Start Conversation"
                         className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Profile sliders cards */}
                  <span className="text-xs font-mono text-brand-gold uppercase tracking-wider font-bold mt-4 block">Interactive Profile Portraits (4 blocks)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hero.personas.map((persona) => (
                      <div key={persona.id} className="p-4 border border-white/5 rounded-md bg-[#1E1E20] flex flex-col gap-3 text-left">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-2">
                          <img src={persona.filePath} className="w-12 h-12 object-cover border border-white/10 grayscale" />
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold uppercase text-brand-gold">{persona.label}</span>
                            <span className="text-[10px] text-[#8E8E93] font-mono">{persona.portraitName}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-mono text-[#8E8E93]">Category/Area</label>
                          <input 
                            type="text" 
                            value={persona.label || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setHero(prev => ({
                                ...prev,
                                personas: prev.personas.map(p => p.id === persona.id ? { ...p, label: newVal } : p)
                              }));
                            }}
                            className="bg-[#111112] border border-[#d5d3cc]/20 focus:border-[#C9A84C] text-[#FDFBF7] rounded px-2.5 py-1 text-xs outline-none focus:ring-0"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-mono text-[#8E8E93]">Role</label>
                          <input 
                            type="text" 
                            value={persona.portraitName || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setHero(prev => ({
                                ...prev,
                                personas: prev.personas.map(p => p.id === persona.id ? { ...p, portraitName: newVal } : p)
                              }));
                            }}
                            className="bg-[#111112] border border-[#d5d3cc]/20 focus:border-[#C9A84C] text-[#FDFBF7] rounded px-2.5 py-1 text-xs outline-none focus:ring-0"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-mono text-[#8E8E93]">Professional Tone</label>
                          <input 
                            type="text" 
                            value={persona.mood || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setHero(prev => ({
                                ...prev,
                                personas: prev.personas.map(p => p.id === persona.id ? { ...p, mood: newVal } : p)
                              }));
                            }}
                            className="bg-[#111112] border border-[#d5d3cc]/20 focus:border-[#C9A84C] text-[#FDFBF7] rounded px-2.5 py-1 text-xs outline-none focus:ring-0"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-mono text-[#8E8E93]">Profile Summary</label>
                          <textarea 
                            rows={3}
                            value={persona.focus || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setHero(prev => ({
                                ...prev,
                                personas: prev.personas.map(p => p.id === persona.id ? { ...p, focus: newVal } : p)
                              }));
                            }}
                            className="bg-[#111112] border border-[#d5d3cc]/20 focus:border-[#C9A84C] text-[#FDFBF7] rounded px-2.5 py-1 text-xs font-sans outline-none focus:ring-0 resize-none leading-relaxed"
                          />
                        </div>

                        <button 
                          onClick={() => triggerUploadInput("persona", persona.id)}
                          className="mt-2 text-center py-1.5 bg-[#111112] hover:bg-[#C9A84C]/10 border border-brand-gold/20 text-[10px] font-mono uppercase text-brand-gold hover:text-white cursor-pointer transition-all"
                        >
                          Update Profile Image
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Experience Timeline */}
              {activeTab === "experience" && (
                <div className="flex flex-col gap-6 max-w-4xl text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h4 className="text-xl font-serif font-bold">Experience Chronology Timeline</h4>
                    <button
                      onClick={() => {
                        const newEvent: ExperienceItem = {
                          year: new Date().getFullYear().toString(),
                          role: "Communication Assistant",
                          organization: "New Agency",
                          location: "Abuja, Nigeria",
                          contribution: "Contributed descriptive content, drafted reports.",
                          impact: "Improved engagement metrics."
                        };
                        setExperience(prev => [newEvent, ...prev]);
                      }}
                      className="px-3.5 py-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-black text-brand-gold text-xs font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Timeline Event</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {experience.map((exp, index) => (
                      <div key={index} className="p-4 border border-white/5 rounded bg-[#111112]/50 hover:bg-[#1E1E20] flex flex-col gap-3 relative transition-all">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this experience timeline event?")) {
                              setExperience(prev => prev.filter((_, i) => i !== index));
                              addToast("success", "Experience update", "Item removed successfully.");
                            }
                          }}
                          className="absolute top-4 right-4 p-1 rounded hover:bg-red-500/10 text-[#8E8E93] hover:text-red-400 cursor-pointer"
                          title="Delete Timeline Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Year / Range</label>
                            <input 
                              type="text" 
                              value={exp.year || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setExperience(prev => prev.map((item, i) => i === index ? { ...item, year: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Professional Role</label>
                            <input 
                              type="text" 
                              value={exp.role || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setExperience(prev => prev.map((item, i) => i === index ? { ...item, role: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2 py-1 text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Organization Agency</label>
                            <input 
                              type="text" 
                              value={exp.organization || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setExperience(prev => prev.map((item, i) => i === index ? { ...item, organization: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2 py-1 text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Location</label>
                            <input 
                              type="text" 
                              value={exp.location || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setExperience(prev => prev.map((item, i) => i === index ? { ...item, location: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Detailed Contribution</label>
                            <textarea 
                              rows={2}
                              value={exp.contribution || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setExperience(prev => prev.map((item, i) => i === index ? { ...item, contribution: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded p-2 text-xs font-sans font-light"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-[#C9A84C]">Strategic Impact & Achievements</label>
                            <textarea 
                              rows={2}
                              value={exp.impact || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setExperience(prev => prev.map((item, i) => i === index ? { ...item, impact: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded p-2 text-xs font-sans font-light text-brand-gold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Selected Portfolios */}
              {activeTab === "work" && (
                <div className="flex flex-col gap-6 max-w-4xl text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h4 className="text-xl font-serif font-bold">Selected Case Studies (Selected Work)</h4>
                    <button
                      onClick={() => {
                        const newWork: SelectedWorkItem = {
                          id: String(Date.now()),
                          organization: "Global NGO",
                          title: "IAVE × IBM SkillsBuild Programme",
                          role: "Communications Lead",
                          focus: "Strategic communication & programme visibility",
                          contributions: ["Communication planning"],
                          impact: "Reached over 15,000 young people.",
                          graphicHeader: "Project Overview",
                          graphicTitle: "IBM × YASIF",
                          graphicLabel1: "Audience Reached",
                          graphicValue1: "15,000+",
                          graphicDesc1: "Active learners engaged through multi-channel campaigns."
                        };
                        setSelectedWork(prev => [newWork, ...prev]);
                      }}
                      className="px-3.5 py-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-black text-brand-gold text-xs font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Case Study</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {selectedWork.map((work, index) => (
                      <div key={work.id} className="p-5 border border-white/5 rounded-md bg-[#111112]/40 hover:bg-[#1E1E20] flex flex-col gap-4 relative transition-all">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this selected work case study?")) {
                              setSelectedWork(prev => prev.filter((_, i) => i !== index));
                              addToast("success", "Portfolio Update", "Item removed successfully.");
                            }
                          }}
                          className="absolute top-4 right-4 p-1.5 hover:bg-red-500/10 text-[#8E8E93] hover:text-red-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Organization Agency</label>
                            <input 
                              value={work.organization || ""} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, organization: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Project Title</label>
                            <input 
                              value={work.title || ""} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, title: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Role</label>
                            <input 
                              value={work.role || ""} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, role: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Service Focus Area</label>
                            <input 
                              value={work.focus || ""} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, focus: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Metric Name Label</label>
                            <input 
                              value={work.graphicLabel1 || ""} 
                              placeholder="e.g. Audience Reached"
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, graphicLabel1: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Metric Value</label>
                            <input 
                              value={work.graphicValue1 || ""} 
                              placeholder="e.g. 15,000+"
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, graphicValue1: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Metric Brief Details</label>
                            <input 
                              value={work.graphicDesc1 || ""} 
                              placeholder="e.g. Active learners engaged."
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, graphicDesc1: newVal } : item));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-brand-gold uppercase font-semibold">Strategic Impact & Direct Achievements</label>
                          <textarea 
                            rows={2}
                            value={work.impact} 
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setSelectedWork(prev => prev.map((item, i) => i === index ? { ...item, impact: newVal } : item));
                            }}
                            className="bg-[#111112] border border-[#C9A84C]/20 p-2 text-xs text-brand-gold font-sans font-light rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Visual Stories */}
              {activeTab === "gallery" && (
                <div className="flex flex-col gap-6 max-w-4xl text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h4 className="text-xl font-serif font-bold">Visual Stories Media Gallery</h4>
                    <button
                      onClick={() => {
                        const newItem: GalleryItem = {
                          id: Date.now(),
                          title: "New Training Session Story",
                          category: "Training",
                          location: "Abuja Conference Hub",
                          description: "Narrative story summary of communication session with workshop leads.",
                          year: "2026",
                          imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
                        };
                        setGallery(prev => [newItem, ...prev]);
                      }}
                      className="px-3.5 py-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-black text-brand-gold text-xs font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Media Item</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gallery.map((item, index) => (
                      <div key={item.id} className="p-4 border border-white/5 rounded-md bg-[#111112] flex flex-col gap-3 relative transition-all">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this media item from gallery?")) {
                              setGallery(prev => prev.filter((_, i) => i !== index));
                              addToast("success", "Gallery Update", "Item removed successfully.");
                            }
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-full cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-4">
                          <img src={item.imageUrl} className="w-16 h-16 object-cover border border-white/10 grayscale" />
                          <div className="flex flex-col gap-1.5 text-left grow">
                            <span className="text-[10px] font-mono text-brand-gold uppercase">{item.category}</span>
                            <button
                              onClick={() => triggerUploadInput("gallery-item", index)}
                              className="px-2.5 py-1 bg-[#111112] border border-brand-gold/25 text-[9px] font-mono uppercase text-brand-gold cursor-pointer transition-all"
                            >
                              Upload photo / image
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-[#8E8E93]">Story Title</label>
                            <input 
                              value={item.title || ""} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setGallery(prev => prev.map((it, i) => i === index ? { ...it, title: newVal } : it));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-[#8E8E93]">Location</label>
                            <input 
                              value={item.location || ""} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setGallery(prev => prev.map((it, i) => i === index ? { ...it, location: newVal } : it));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#8E8E93]">Long description / meta-story</label>
                          <textarea 
                            rows={2}
                            value={item.description || ""} 
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setGallery(prev => prev.map((it, i) => i === index ? { ...it, description: newVal } : it));
                            }}
                            className="bg-[#111112] border border-white/10 rounded p-2 text-xs font-sans font-light"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: Recognition & Education */}
              {activeTab === "education" && (
                <div className="flex flex-col gap-6 max-w-4xl text-left">
                  <h4 className="text-xl font-serif font-bold">Featured Recognition (Annual Publication Spotlight)</h4>

                  <div className="p-4 border border-[#C9A84C]/25 bg-neutral-900/50 rounded flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">Spotlight Title</label>
                        <input 
                          type="text" 
                          value={recognition.title || ""}
                          onChange={(e) => setRecognition(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-[#111112] border border-white/10 rounded px-2.5 py-1.5 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">Footer caption</label>
                        <input 
                          type="text" 
                          value={recognition.caption || ""}
                          onChange={(e) => setRecognition(prev => ({ ...prev, caption: e.target.value }))}
                          className="bg-[#111112] border border-white/10 rounded px-2.5 py-1.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-[#8E8E93] uppercase">Detailed editorial writeup description</label>
                      <textarea 
                        rows={3}
                        value={recognition.description || ""}
                        onChange={(e) => setRecognition(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-[#111112] border border-white/10 rounded p-2.5 text-xs font-sans font-light"
                      />
                    </div>

                    {/* Image Cover */}
                    <div className="flex items-center gap-6 pt-2">
                      <img src={recognition.image} className="w-14 h-18 object-cover rounded border border-white/10 grayscale" />
                      <button
                        onClick={() => triggerUploadInput("recognition")}
                        className="px-3.5 py-1.5 border border-brand-gold text-brand-gold text-xs font-mono uppercase cursor-pointer"
                      >
                        Change Featured image
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mt-6">
                    <h4 className="text-xl font-serif font-bold">Professional Certifications Accordions</h4>
                    <button
                      onClick={() => {
                        const newCert: Certification = {
                          institution: "Executive Institute",
                          focus: "Core Communication Competency",
                          description: "Professional development program detailing clear institutional communication alignment.",
                          verification: "VERIFIED CREDENTIAL // ID-9980"
                        };
                        setCertifications(prev => [...prev, newCert]);
                      }}
                      className="px-3.5 py-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-black hover:border-brand-gold text-brand-gold text-xs font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Certification</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {certifications.map((cert, index) => (
                      <div key={index} className="p-4 border border-white/5 rounded bg-[#111112] flex flex-col gap-3 relative text-left">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this certification?")) {
                              setCertifications(prev => prev.filter((_, i) => i !== index));
                              addToast("success", "Certifications Update", "Item removed successfully.");
                            }
                          }}
                          className="absolute top-4 right-4 p-1 hover:bg-red-500/10 text-red-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-[#8E8E93] uppercase font-mono">Issuing Institution</label>
                            <input 
                              value={cert.institution || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setCertifications(prev => prev.map((c, i) => i === index ? { ...c, institution: newVal } : c));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-[#8E8E93] uppercase font-mono font-medium text-brand-gold">Program Title Focus</label>
                            <input 
                              value={cert.focus || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setCertifications(prev => prev.map((c, i) => i === index ? { ...c, focus: newVal } : c));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#8E8E93] uppercase font-mono">Detailed Course/Skill Decription</label>
                          <textarea 
                            rows={2}
                            value={cert.description || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCertifications(prev => prev.map((c, i) => i === index ? { ...c, description: newVal } : c));
                            }}
                            className="bg-[#111112] border border-white/10 rounded p-2 text-xs font-sans font-light"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 mr-auto">
                          <label className="text-[9px] text-[#C9A84C] uppercase font-mono">Verification Code Seal Label</label>
                          <input 
                            value={cert.verification || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setCertifications(prev => prev.map((c, i) => i === index ? { ...c, verification: newVal } : c));
                            }}
                            className="bg-[#111112] border border-brand-gold/20 text-[#C9A84C] rounded px-2.5 py-1 text-[10px] font-mono uppercase"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: Articles & Thoughts */}
              {activeTab === "articles" && (
                <div className="flex flex-col gap-6 max-w-4xl text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h4 className="text-xl font-serif font-bold">Articles & Thought Leadership Journals</h4>
                    <button
                      onClick={() => {
                        const newArticle: Article = {
                          id: Date.now(),
                          title: "New Editorial Essay",
                          subtitle: "Storytelling directives in communications and youth coordination",
                          description: "Overview draft description for readers' brief insight summary",
                          category: "Advocacy",
                          date: "July 2026",
                          readTime: "4 Mins Read",
                          imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600",
                          sections: [
                            { heading: "Narrative Strategy Alignment", text: "Paragraph text writing aligned with advocacy planning directives." }
                          ]
                        };
                        setArticles(prev => [newArticle, ...prev]);
                      }}
                      className="px-3.5 py-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-black text-brand-gold text-xs font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Article</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {articles.map((art, index) => (
                      <div key={art.id} className="p-5 border border-white/5 rounded-md bg-[#111112]/50 hover:bg-[#1E1E20] flex flex-col gap-4 relative transition-all">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this article?")) {
                              setArticles(prev => prev.filter((_, i) => i !== index));
                              addToast("success", "Article Saving", "Item removed successfully.");
                            }
                          }}
                          className="absolute top-4 right-4 p-1.5 text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <img src={art.imageUrl} className="w-full h-24 object-cover rounded border border-white/10 grayscale" />
                          <div className="md:col-span-2 flex flex-col gap-1.5">
                            <button
                              onClick={() => triggerUploadInput("article-image", index)}
                              className="px-3 py-1 bg-[#111112] max-w-xs border border-brand-gold/30 text-[10px] font-mono uppercase text-brand-gold text-center cursor-pointer transition-all"
                            >
                              Upload Article Cover Image
                            </button>
                            
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-[#8E8E93]">Category</label>
                                <input 
                                  value={art.category || ""}
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    setArticles(prev => prev.map((a, i) => i === index ? { ...a, category: newVal } : a));
                                  }}
                                  className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-[#8E8E93]">Read Time</label>
                                <input 
                                  value={art.readTime || ""}
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    setArticles(prev => prev.map((a, i) => i === index ? { ...a, readTime: newVal } : a));
                                  }}
                                  className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-brand-gold block font-mono">Article Title Headline</label>
                            <input 
                              value={art.title || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setArticles(prev => prev.map((a, i) => i === index ? { ...a, title: newVal } : a));
                              }}
                              className="bg-[#111112] border border-brand-gold/25 text-[#FDFBF7] rounded px-3 py-2 text-sm font-serif font-bold"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-[#8E8E93] font-mono">Subtitle Italic Statement</label>
                            <input 
                              value={art.subtitle || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setArticles(prev => prev.map((a, i) => i === index ? { ...a, subtitle: newVal } : a));
                              }}
                              className="bg-[#111112] border border-white/10 text-brand-muted italic font-serif rounded px-3 py-2 text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-[#8E8E93] font-mono">Introductory Briefing Description</label>
                            <textarea 
                              rows={2}
                              value={art.description || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setArticles(prev => prev.map((a, i) => i === index ? { ...a, description: newVal } : a));
                              }}
                              className="bg-[#111112] border border-white/10 rounded p-2 text-xs font-sans font-light"
                            />
                          </div>
                        </div>

                        {/* Article Paragraph Sections */}
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-brand-gold uppercase">Draft editorial sections ({art.sections?.length || 0})</span>
                            <button
                              onClick={() => {
                                const updatedSections = [...(art.sections || []), { heading: "New Subheading", text: "Enter paragraph text writeups..." }];
                                setArticles(prev => prev.map((a, i) => i === index ? { ...a, sections: updatedSections } : a));
                              }}
                              className="px-2 py-1 bg-[#111112] hover:bg-neutral-900 border border-brand-gold/20 text-[9px] font-mono text-brand-gold uppercase cursor-pointer"
                            >
                              + Add Paragraph Block
                            </button>
                          </div>

                          <div className="flex flex-col gap-3 mt-2">
                            {art.sections?.map((sec, secIdx) => (
                              <div key={secIdx} className="p-3 border border-white/5 bg-[#111112] rounded flex flex-col gap-2 relative">
                                <button
                                  onClick={() => {
                                    const updatedSections = art.sections.filter((_, sI) => sI !== secIdx);
                                    setArticles(prev => prev.map((a, i) => i === index ? { ...a, sections: updatedSections } : a));
                                  }}
                                  className="absolute top-2 right-2 p-1 text-[#8E8E93] hover:text-red-400 cursor-pointer"
                                  title="Remove Block"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] text-[#8E8E93]">Block Subheading</label>
                                  <input 
                                    value={sec.heading || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedSections = art.sections.map((s, sI) => sI === secIdx ? { ...s, heading: val } : s);
                                      setArticles(prev => prev.map((a, i) => i === index ? { ...a, sections: updatedSections } : a));
                                    }}
                                    className="bg-[#1C1C1E] border border-white/10 px-2 py-1 text-xs text-white"
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] text-[#8E8E93]">Main Paragraph Text Body</label>
                                  <textarea 
                                    rows={3}
                                    value={sec.text || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updatedSections = art.sections.map((s, sI) => sI === secIdx ? { ...s, text: val } : s);
                                      setArticles(prev => prev.map((a, i) => i === index ? { ...a, sections: updatedSections } : a));
                                    }}
                                    className="bg-[#1C1C1E] border border-white/10 p-2 text-xs font-sans font-light leading-relaxed"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: Speaking & Leadership */}
              {activeTab === "speaking" && (
                <div className="flex flex-col gap-6 max-w-4xl text-left">
                  <h4 className="text-xl font-serif font-bold mb-2">Speaking, Media & Leadership Systems</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-brand-gold uppercase tracking-wider font-semibold">Section Heading Title</label>
                      <input 
                        type="text" 
                        value={speaking.title || ""}
                        onChange={(e) => setSpeaking(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono text-brand-gold uppercase tracking-wider font-semibold">Section Narrative Description</label>
                      <textarea 
                        rows={3}
                        value={speaking.description || ""}
                        onChange={(e) => setSpeaking(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-[#1E1E20] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-brand-gold outline-none font-sans font-light"
                      />
                    </div>
                  </div>

                  {/* Images Upload Area */}
                  <div className="border border-white/5 rounded p-4 bg-[#111112]/50 flex flex-col gap-4">
                    <span className="text-xs font-mono text-brand-gold uppercase tracking-widest font-bold">Speaking, Mentorship & Event Imagery</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-mono text-[#8E8E93] uppercase">Leadership Event Photo (Image 1)</label>
                        <div className="flex items-center gap-4">
                          {speaking.image1 && <img src={speaking.image1} alt="Event 1" className="w-16 h-16 object-cover border border-white/10 rounded" />}
                          <button
                            type="button"
                            onClick={() => triggerUploadInput("speaking-image1")}
                            className="px-3 py-1.5 bg-brand-gold/10 hover:bg-brand-gold hover:text-black text-brand-gold text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Replace Image 1
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-mono text-[#8E8E93] uppercase">Public Engagement Photo (Image 2)</label>
                        <div className="flex items-center gap-4">
                          {speaking.image2 && <img src={speaking.image2} alt="Event 2" className="w-16 h-16 object-cover border border-white/10 rounded" />}
                          <button
                            type="button"
                            onClick={() => triggerUploadInput("speaking-image2")}
                            className="px-3 py-1.5 bg-brand-gold/10 hover:bg-brand-gold hover:text-black text-brand-gold text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Replace Image 2
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Areas Blocks List */}
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h5 className="font-serif text-base font-bold">Dynamic Leadership Contribution Pillars</h5>
                      <button
                        onClick={() => {
                          const newBlk = {
                            category: "Category Name",
                            title: "New Initiative Pillar",
                            description: "Strategic actions and communications overview."
                          };
                          setSpeaking(prev => ({
                            ...prev,
                            blocks: [...(prev.blocks || []), newBlk]
                          }));
                        }}
                        className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-xs font-mono uppercase hover:bg-brand-gold hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pillar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(speaking.blocks || []).map((blk: any, idx: number) => (
                        <div key={idx} className="p-4 border border-white/5 rounded bg-[#111112]/50 hover:bg-[#1E1E20] flex flex-col gap-3 relative transition-all animate-fadeIn">
                          <button
                            onClick={() => {
                              const updated = speaking.blocks.filter((_: any, bI: number) => bI !== idx);
                              setSpeaking((prev: any) => ({ ...prev, blocks: updated }));
                            }}
                            className="absolute top-4 right-4 p-1 rounded hover:bg-red-500/10 text-[#8E8E93] hover:text-red-400 cursor-pointer"
                            title="Delete Pillar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Pillar Category (e.g., Mentorship)</label>
                            <input 
                              type="text"
                              value={blk.category || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = speaking.blocks.map((b: any, bI: number) => bI === idx ? { ...b, category: val } : b);
                                setSpeaking((prev: any) => ({ ...prev, blocks: updated }));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Pillar Title</label>
                            <input 
                              type="text"
                              value={blk.title || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = speaking.blocks.map((b: any, bI: number) => bI === idx ? { ...b, title: val } : b);
                                setSpeaking((prev: any) => ({ ...prev, blocks: updated }));
                              }}
                              className="bg-[#111112] border border-white/10 rounded px-2.5 py-1 text-xs text-[#FDFBF7]"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-[#8E8E93]">Pillar Narrative Description</label>
                            <textarea 
                              rows={2}
                              value={blk.description || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = speaking.blocks.map((b: any, bI: number) => bI === idx ? { ...b, description: val } : b);
                                setSpeaking((prev: any) => ({ ...prev, blocks: updated }));
                              }}
                              className="bg-[#111112] border border-white/10 rounded p-2 text-xs font-sans font-light text-[#D5D3CC] leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACCOUNT SETTINGS TAB */}
              {activeTab === "account" && (
                <div className="flex flex-col gap-6 max-w-5xl animate-fadeIn">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Account Settings</h4>
                    <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">
                      Manage your profile details, secure credentials, and active system sessions.
                    </p>
                  </div>

                  {actMessage && (
                    <div className={`p-4 text-xs font-mono border rounded-none flex items-center gap-2.5 ${
                      actMessage.type === "success" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{actMessage.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                    {/* PROFILE BLOCK */}
                    <form onSubmit={handleUpdateProfile} className="bg-[#1C1C1E] border border-white/5 p-6 flex flex-col gap-5">
                      <div>
                        <h5 className="font-serif text-base font-bold text-white">Administrative Identity</h5>
                        <p className="text-xs text-[#8E8E93] mt-1">Update your professional identifier and contact email.</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          required
                          value={actName}
                          onChange={(e) => setActName(e.target.value)}
                          className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          value={actEmail}
                          onChange={(e) => setActEmail(e.target.value)}
                          className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Assigned Operations Role</label>
                        <div className="bg-[#111112] border border-white/5 rounded-none px-3 py-2 text-xs text-[#8E8E93] uppercase font-mono">
                          {currentUser?.role || "Administrator"}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingAccount}
                        className="mt-2 self-start bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-55 px-5 py-2.5 rounded-none text-xs font-mono font-bold uppercase tracking-widest text-[#111112] cursor-pointer"
                      >
                        {isUpdatingAccount ? "Saving..." : "Update Profile"}
                      </button>
                    </form>

                    {/* PASSWORD AND SESSIONS BLOCK */}
                    <div className="flex flex-col gap-8">
                      <form onSubmit={handleChangePassword} className="bg-[#1C1C1E] border border-white/5 p-6 flex flex-col gap-5">
                        <div>
                          <h5 className="font-serif text-base font-bold text-white">Change Workspace Password</h5>
                          <p className="text-xs text-[#8E8E93] mt-1">Update your system entry passphrase.</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Current Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUpdatingAccount}
                          className="mt-2 self-start bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-55 px-5 py-2.5 rounded-none text-xs font-mono font-bold uppercase tracking-widest text-[#111112] cursor-pointer"
                        >
                          {isUpdatingAccount ? "Changing..." : "Change Password"}
                        </button>
                      </form>

                      {/* SESSION AUDITING / LOGOUT ALL ACTIVE SESSIONS */}
                      <div className="bg-[#1C1C1E] border border-white/5 p-6 flex flex-col gap-4">
                        <div>
                          <h5 className="font-serif text-base font-bold text-white">Active System Sessions</h5>
                          <p className="text-xs text-[#8E8E93] mt-1">
                            Invalidate active workspace signatures across other computers, tablets, or phones.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleForceLogoutSessions}
                          disabled={isUpdatingAccount}
                          className="self-start text-xs font-mono font-semibold uppercase tracking-wider text-red-400 bg-red-400/5 hover:bg-red-400/15 border border-red-500/20 px-4 py-2.5 transition-all cursor-pointer rounded-none"
                        >
                          Sign Out Other Sessions
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PRODUCTION MEDIA STORAGE INTEGRATION */}
                  <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-none flex flex-col gap-5 mt-8">
                    <div>
                      <h5 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-sm font-mono text-brand-gold uppercase tracking-wider font-bold">Production Media Storage Integration</span>
                      </h5>
                      <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                        Configure your Cloudinary Free Tier storage parameters to securely stream optimized portfolio uploads directly to cloud storage.
                      </p>
                    </div>

                    <form onSubmit={handleStorageConfigSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                      {storageMessage && (
                        <div className={`p-4 text-xs font-mono border rounded-none flex items-center gap-2.5 md:col-span-2 ${
                          storageMessage.type === "success" 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{storageMessage.text}</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                        <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Media Storage Provider</label>
                        <select
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                          className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none"
                        >
                          <option value="cloudinary">Cloudinary (Production Default)</option>
                        </select>
                        <span className="text-[9px] text-[#8E8E93] font-sans mt-0.5 block">
                          Only Cloudinary is currently supported for production deployments.
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Cloudinary Cloud Name (CLOUDINARY_CLOUD_NAME)</label>
                        <input
                          type="text"
                          required
                          value={cloudName}
                          onChange={(e) => setCloudName(e.target.value)}
                          placeholder="e.g. dxyz12345"
                          className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none font-sans"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Cloudinary API Key (CLOUDINARY_API_KEY)</label>
                        <input
                          type="text"
                          required
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="e.g. 123456789012345"
                          className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none font-sans"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                        <label className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">Cloudinary API Secret (CLOUDINARY_API_SECRET)</label>
                        <input
                          type="password"
                          required
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="w-full bg-[#111112] border border-white/10 rounded-none py-2.5 px-3.5 text-xs text-white focus:border-[#C9A84C] outline-none font-sans"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingStorage}
                        className="px-5 py-3.5 bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-50 text-[#111112] text-xs font-bold uppercase tracking-widest self-start rounded-none mt-2 transition-colors cursor-pointer md:col-span-2 font-mono"
                      >
                        {isSavingStorage ? "SAVING..." : "Update Storage Configuration"}
                      </button>
                    </form>
                  </div>

                  {/* CENTRAL SECURITY AND ADMINISTRATORS DIRECTORY */}
                  <div className="border-t border-white/5 pt-8 mt-6">
                    <div className="mb-6">
                      <h4 className="text-xl font-serif font-bold text-white tracking-tight">Administrative Directory</h4>
                      <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">
                        Register and oversee security credentials of authorized system operators.
                      </p>
                    </div>

                    {adminManageMessage && (
                      <div className={`mb-6 p-4 text-xs font-mono border rounded-none flex items-center gap-2.5 ${
                        adminManageMessage.type === "success" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{adminManageMessage.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Left: Active operator directory */}
                      <div className="md:col-span-7 flex flex-col gap-4">
                        <div className="bg-[#1C1C1E] border border-white/5 p-6 flex flex-col gap-4">
                          <div>
                            <h5 className="font-serif text-base font-bold text-white font-semibold">Active System Operators</h5>
                            <p className="text-xs text-[#8E8E93] mt-1">Personnel authorized with administrative cockpit permissions.</p>
                          </div>

                          <div className="flex flex-col gap-3 font-mono">
                            {allAdmins.map((admin) => (
                              <div key={admin.id} className="p-4 bg-[#111112] border border-white/5 flex items-center justify-between text-left gap-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xs text-[#FDFBF7] font-semibold font-sans">{admin.name}</span>
                                    {admin.id === currentUser?.id && (
                                      <span className="text-[7.5px] font-bold uppercase bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/35 px-1.5 py-0.5 font-mono">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#8E8E93]">{admin.email}</span>
                                  <div className="flex flex-wrap gap-4 text-[9px] text-[#8E8E93] mt-1">
                                    <span>ROLE: <strong className="text-[#C9A84C]">{admin.role}</strong></span>
                                    {admin.lastLogin && (
                                      <span>REGISTRATION: <strong>{new Date(admin.lastLogin).toLocaleString()}</strong></span>
                                    )}
                                  </div>
                                </div>

                                {admin.id !== currentUser?.id && (
                                  <button
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                    type="button"
                                    className="p-2 text-red-400 hover:text-red-500 font-bold bg-[#1C1C1E] hover:bg-red-400/10 border border-white/5 hover:border-red-500/25 cursor-pointer text-[10px] uppercase font-mono tracking-widest px-3"
                                  >
                                    STRIP PRIVILEGES
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Add new operator form */}
                      <form onSubmit={handleCreateAdmin} className="md:col-span-5 bg-[#1C1C1E] border border-white/5 p-6 flex flex-col gap-4">
                        <div>
                          <h5 className="font-serif text-base font-bold text-white font-semibold">Register Operator</h5>
                          <p className="text-xs text-[#8E8E93] mt-1">Generate access credentials for additional developers or admins.</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Chukwuma Obi"
                            value={newAdminName}
                            onChange={(e) => setNewAdminName(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. operator@domain.com"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Authorization Role</label>
                          <select
                            value={newAdminRole}
                            onChange={(e: any) => setNewAdminRole(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none font-mono"
                          >
                            <option value="Administrator">Administrator (Read-Write Actions)</option>
                            <option value="Studio Owner">Studio Owner (All Actions)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">System Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Password (min 6 chars)"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Confirm Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Retype password"
                            value={newAdminConfirmPassword}
                            onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                            className="bg-[#111112] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus:border-[#C9A84C] outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isCreatingAdmin}
                          className="mt-2 self-start bg-[#C9A84C] hover:bg-[#DBC19D] disabled:opacity-55 px-5 py-2.5 rounded-none text-xs font-mono font-bold uppercase tracking-widest text-[#111112] cursor-pointer"
                        >
                          {isCreatingAdmin ? "Adding..." : "Grant Cockpit Access"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
          </>
          )}

        </motion.div>
        <AdminToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AnimatePresence>
  );
}
