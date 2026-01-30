/**
 * Drama Card Component
 * Design: Premium Streaming Experience
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Play, Star, TrendingUp } from "lucide-react";
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
    sm: "w-32 aspect-[2/3]",
    md: "w-40 aspect-[2/3]",
    lg: "w-48 aspect-[2/3]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/drama/${drama.source || 'dramabox'}/${drama.bookId}`}>
        <motion.div
          ref={cardRef}
          className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden cursor-pointer group card-hover`}
          onMouseMove={handleMouseMove}
          whileTap={{ scale: 0.98 }}
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
            } group-hover:scale-110`}
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
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, oklch(1 0 0 / 0.2) 0%, transparent 50%)`,
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
          
          {/* Rank badge */}
          {showRank && drama.rankVo && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/90 backdrop-blur-sm">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-bold">
                #{drama.rankVo.sort || 1}
              </span>
            </div>
          )}
          
          {/* Corner badge */}
          {drama.corner && (
            <div 
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white backdrop-blur-sm"
              style={{ backgroundColor: drama.corner.color }}
            >
              {drama.corner.name}
            </div>
          )}
          
          {/* Episode count */}
          {drama.chapterCount && !drama.corner && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
              {drama.chapterCount} EP
            </div>
          )}
          
          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center glow-primary"
            >
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </motion.div>
          </div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Rating */}
            {drama.rankVo?.hotCode && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-amber-400 text-xs font-semibold">
                  {drama.rankVo.hotCode}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
              {drama.bookName}
            </h3>
            
            {/* Tags */}
            {drama.tags && drama.tags.length > 0 && (
              <p className="text-white/60 text-[11px] line-clamp-1">
                {drama.tags.slice(0, 2).join(" • ")}
              </p>
            )}
          </div>
          
          {/* Border glow on hover */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Skeleton version for loading states
export function DramaCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-32 aspect-[2/3]",
    md: "w-40 aspect-[2/3]",
    lg: "w-48 aspect-[2/3]",
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden`}>
      <div className="w-full h-full skeleton" />
    </div>
  );
}
