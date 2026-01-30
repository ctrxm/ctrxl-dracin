/**
 * Drama Card Component
 * Design: Neo-Noir Cinema
 * 
 * Cinematic card with spotlight hover effect and film grain texture
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Play, Star } from "lucide-react";
import type { Drama } from "@/lib/api";
import { getCoverUrl } from "@/lib/api";
import { useState, useRef } from "react";

interface DramaCardProps {
  drama: Drama;
  index?: number;
  size?: "sm" | "md" | "lg";
  showRank?: boolean;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

export default function DramaCard({ drama, index = 0, size = "md", showRank = false }: DramaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const sizeClasses = {
    sm: "w-28 aspect-[2/3]",
    md: "w-36 aspect-[2/3]",
    lg: "w-44 aspect-[2/3]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/drama/${drama.bookId}`}>
        <motion.div
          ref={cardRef}
          className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden cursor-pointer group`}
          onMouseMove={handleMouseMove}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          style={{
            "--mouse-x": `${mousePosition.x}%`,
            "--mouse-y": `${mousePosition.y}%`,
          } as React.CSSProperties}
        >
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          
          {/* Cover image */}
          <img
            src={getCoverUrl(drama)}
            alt={drama.bookName}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-105`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
              setImageLoaded(true);
            }}
          />
          
          {/* Spotlight overlay */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, oklch(1 0 0 / 0.15) 0%, transparent 50%)`,
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Rank badge */}
          {showRank && drama.rankVo && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-primary/90 text-primary-foreground text-xs font-bold">
              <Star className="w-3 h-3 fill-current" />
              {drama.rankVo.hotCode}
            </div>
          )}
          
          {/* Corner badge */}
          {drama.corner && (
            <div 
              className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{ backgroundColor: drama.corner.color }}
            >
              {drama.corner.name}
            </div>
          )}
          
          {/* Episode count */}
          {drama.chapterCount && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px]">
              {drama.chapterCount} EP
            </div>
          )}
          
          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center glow-crimson"
            >
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </motion.div>
          </div>
          
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white text-sm font-medium line-clamp-2 text-shadow-cinematic">
              {drama.bookName}
            </h3>
            {drama.tags && drama.tags.length > 0 && (
              <p className="text-white/60 text-[10px] mt-1 line-clamp-1">
                {drama.tags.slice(0, 2).join(" • ")}
              </p>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Skeleton version for loading states
export function DramaCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-28 aspect-[2/3]",
    md: "w-36 aspect-[2/3]",
    lg: "w-44 aspect-[2/3]",
  };

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden`}>
      <div className="w-full h-full skeleton" />
    </div>
  );
}
