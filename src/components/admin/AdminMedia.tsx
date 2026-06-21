import React, { useState, useRef } from "react";
import { Upload, Trash2, Copy, Check, Image as ImageIcon, AlertCircle } from "lucide-react";
import { uploadMedia } from "../../utils/uploadService";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  altText: string;
  category: "profile" | "hero" | "experience" | "speaking" | "gallery" | "recognition" | "articles" | "other";
  uploadedDate: string;
  fileSize?: number;
  originalFilename?: string | null;
  uploadedFilename?: string | null;
}

interface AdminMediaProps {
  mediaLibrary: MediaItem[];
  onRefresh: () => void;
  onUploadSuccess?: () => void;
}

export default function AdminMedia({ mediaLibrary, onRefresh, onUploadSuccess }: AdminMediaProps) {
  const [selectedCategory, setSelectedCategory] = useState<"profile" | "hero" | "speaking" | "gallery" | "recognition" | "articles" | "other" | "all">("all");
  const [uploadCategory, setUploadCategory] = useState<"profile" | "hero" | "experience" | "speaking" | "gallery" | "recognition" | "articles" | "other">("gallery");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Enforce single-image sections protection
    const singleImageTypes = ["profile", "hero", "speaking", "recognition", "articles"];
    if (singleImageTypes.includes(uploadCategory)) {
      if (files.length > 1) {
        setErrorMessage("Only one image is allowed for this section.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    // Limit multi-upload for safety
    const LIMIT = 5;
    if (files.length > LIMIT) {
      setErrorMessage(`For quality control, maximum ${LIMIT} simultaneous uploads are allowed for gallery sections.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    let successfulCount = 0;
    let fallbackError = "Upload failed";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const data = await uploadMedia({
          file,
          category: uploadCategory,
          altText: `Tochukwu Ogunaka Portfolio Media: ${file.name}`
        });
        if (data.success) {
          successfulCount++;
        } else {
          fallbackError = data.message || fallbackError;
        }
      } catch (err: any) {
        fallbackError = err.message || "Network error: failed to establish communication with the upload service.";
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (successfulCount > 0) {
      setSuccessMessage(`Successfully uploaded ${successfulCount} of ${files.length} asset(s) into category "${uploadCategory}".`);
      onRefresh();
      if (onUploadSuccess) onUploadSuccess();
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(fallbackError);
    }
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (!window.confirm(`Are you certain you wish to permanently delete the image "${name}" from disk? This cannot be undone and may break active pages using its path.`)) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Asset successfully removed from media storage.");
        onRefresh();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(data.error || "Failed to remove asset.");
      }
    } catch (err) {
      setErrorMessage("Network error: failed to resolve communication with the resource server.");
    }
  };

  const handleCopyPath = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes?: number, decimals = 1) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Filter media list
  const filteredMedia = mediaLibrary.filter(item => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE) || 1;
  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Title section + quick actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Media Library</h4>
          <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">
            Upload and manage assets. Copy relative paths directly to input fields when modifying content sections.
          </p>
        </div>

        {/* Upload Drawer Quick Panel */}
        <div className="flex items-center gap-3 bg-[#111112] border border-white/5 p-2 font-mono text-[10px] self-start">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-mono text-[#C9A84C] uppercase tracking-wider px-1">Storage Tag Category</span>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as any)}
              className="bg-[#1C1C1E] border-none px-2 py-1 text-xs text-[#D5D3CC] focus:text-white rounded cursor-pointer outline-none font-sans"
            >
              <option value="profile">Profile Picture</option>
              <option value="hero">Hero Picture</option>
              <option value="speaking">Speaking Engagements</option>
              <option value="gallery">Visual Archive Gallery</option>
              <option value="recognition">Recognitions & Awards</option>
              <option value="articles">Articles thoughts</option>
              <option value="other">General Assets</option>
            </select>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
            multiple
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-9 px-4 bg-[#C9A84C] hover:bg-[#DBC19D] text-[#111112] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/15 rounded-none flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-none flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category selector drawer for exploration */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 font-mono text-[10px]">
        {([
          { name: "all", label: "Show All" },
          { name: "profile", label: "Profile" },
          { name: "hero", label: "Hero" },
          { name: "speaking", label: "Speaking" },
          { name: "gallery", label: "Gallery" },
          { name: "recognition", label: "Recognition" },
          { name: "articles", label: "Articles" },
          { name: "other", label: "Other Assets" }
        ] as const).map((cat) => {
          const count = cat.name === "all" 
            ? mediaLibrary.length 
            : mediaLibrary.filter(item => item.category === cat.name).length;

          return (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 transition-colors cursor-pointer border ${
                selectedCategory === cat.name
                  ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#C9A84C] font-semibold"
                  : "border-white/5 text-[#8E8E93] hover:text-white hover:border-white/20"
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-white/10 rounded-none flex flex-col gap-3 justify-center items-center bg-[#1C1C1E]/50">
          <ImageIcon className="w-10 h-10 text-[#8E8E93]/40" />
          <p className="text-sm font-sans font-light text-[#8E8E93]">No images match the designated category.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedMedia.map((item) => (
              <div 
                key={item.id} 
                className="p-3 border border-white/5 bg-[#1C1C1E] flex flex-col justify-between gap-3 group relative hover:border-[#C9A84C]/35 transition-all rounded-none"
              >
                {/* Delete button absolutely positioned */}
                <button
                  onClick={() => handleDeleteMedia(item.id, item.filename)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all z-10 border border-red-500/20"
                  title="Remove file permanently from disk"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* REQUIRED: Fixed dimension, object-fit: cover, responsive behavior */}
                <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-[#111112]">
                  <img
                    src={item.url}
                    alt={item.altText}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <span className="absolute bottom-1 left-1.5 px-2 py-0.5 text-[8px] font-mono uppercase bg-black/85 text-[#C9A84C] tracking-wider border border-[#C9A84C]/45 font-semibold">
                    {item.category}
                  </span>
                </div>

                {/* Info Block */}
                <div className="flex flex-col gap-2.5 text-left grow font-mono text-[9px] text-[#8E8E93]">
                  <div className="flex flex-col border-b border-white/5 pb-1.5">
                    <span className="text-[8px] text-[#C9A84C] uppercase tracking-wider font-semibold">Original Filename:</span>
                    <span className="text-[#D5D3CC] truncate text-xs mt-0.5 font-sans font-light" title={item.originalFilename || item.filename}>
                      {item.originalFilename || item.filename}
                    </span>
                  </div>

                  <div className="flex flex-col border-b border-white/5 pb-1.5">
                    <span className="text-[8px] text-[#C9A84C] uppercase tracking-wider font-semibold">Uploaded Filename:</span>
                    <span className="text-[#D5D3CC] truncate mt-0.5" title={item.uploadedFilename || item.filename}>
                      {item.uploadedFilename || item.filename}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-white/5 pb-1.5 text-[10px]">
                    <span>Uploaded Date:</span>
                    <span className="text-white">{new Date(item.uploadedDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between text-[10px]">
                    <span>File Size:</span>
                    <span className="text-white">{formatBytes(item.fileSize)}</span>
                  </div>
                </div>

                {/* Utility to copy path to content block input fields */}
                <button
                  type="button"
                  onClick={() => handleCopyPath(item.url, item.id)}
                  className="w-full mt-1.5 py-2 border border-white/10 hover:border-[#C9A84C] text-[#D5D3CC] hover:text-[#C9A84C] transition-all text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer rounded-none bg-white/[0.01]"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Relative Path</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
              <span className="text-[10px] font-mono text-[#8E8E93] uppercase">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedia.length)} of {filteredMedia.length} assets
              </span>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#D5D3CC] cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-white bg-white/5 border border-white/5">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#D5D3CC] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
