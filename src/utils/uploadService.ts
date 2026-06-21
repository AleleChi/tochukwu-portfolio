// Shared Media Upload Service
// Implements Requirement 1: Reusable upload handler for all portfolio image sections

interface UploadMediaOptions {
  file: File;
  category: "profile" | "hero" | "speaking" | "recognition" | "gallery" | "articles" | string;
  recordId?: string | number;
  altText?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  // Extra schema-compliant data property
  data?: {
    id: string;
    filename: string;
    url: string;
    altText: string;
    category: string;
    fileSize: number;
    uploadedAt: string;
  };
}

/**
 * Shared media uploader service to handle single or multiple image uploads.
 * Communicates with `/api/upload` secure backend endpoint.
 */
export async function uploadMedia({
  file,
  category,
  recordId,
  altText
}: UploadMediaOptions): Promise<UploadResponse> {
  // Validate maximum 5MB on client side first
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds standard 5MB criteria limit.");
  }

  // Validate extension
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  if (!allowedExtensions.includes(fileExt)) {
    throw new Error("Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.");
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("category", category);
  
  if (recordId !== undefined && recordId !== null) {
    formData.append("id", String(recordId));
  }
  
  if (altText) {
    formData.append("altText", altText);
  }

  const token = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers,
    body: formData
  });

  const jq = await res.json();
  if (!res.ok || !jq.success) {
    throw new Error(jq.error || "Establishment communication failed during upload.");
  }

  return jq as UploadResponse;
}
