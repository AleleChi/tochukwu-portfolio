import React, { useState, useEffect } from "react";

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "wide" | "auto" | "video";
  className?: string;
  imageClassName?: string;
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt = "Tochukwu Ogunaka - Professional Workspace Content",
  aspectRatio = "auto",
  className = "",
  imageClassName = "",
  ...props
}) => {
  const fallback = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";
  const [imageSrc, setImageSrc] = useState<string>(src || fallback);
  const [hasError, setHasError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setHasError(false);
    setLoading(true);
    
    if (!src) {
      setImageSrc(fallback);
      setLoading(false);
      return;
    }

    setImageSrc(src);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallback);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Map of standard aspect ratio aspect calculations
  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    wide: "aspect-[16/9]",
    video: "aspect-video",
    auto: "h-auto"
  };

  const chosenAspect = aspectClasses[aspectRatio] || "h-auto";

  return (
    <div 
      className={`relative overflow-hidden bg-[#161618] border border-white/5 ${chosenAspect} ${className}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleError}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            loading ? "opacity-30 scale-95" : "opacity-100 scale-100"
          } ${imageClassName}`}
          {...props}
        />
      ) : null}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-4 h-4 border border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
