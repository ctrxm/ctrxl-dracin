/**
 * Drama Card Component - Corporate Edition
 * Design: Executive Portfolio Style
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Play, Star, TrendingUp, Award } from "lucide-react";
import type { Drama } from "@/lib/api";
import { getCoverUrl } from "@/lib/api";
import { useState } from "react";

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

  const sizeClasses = {
    sm: "w-32 aspect-[2/3]",
    md: "w-40 aspect-[2/3]",
    lg: "w-48 aspect-[2/3]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link href={`/drama/${drama.source || 'dramabox'}/${drama.bookId}`}>
        <motion.div
          className={`relative ${sizeClasses[size]} rounded-md overflow-hidden cursor-pointer group transition-corporate`}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-card to-muted animate-pulse" />
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
          
          {/* Corporate gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
          
          {/* Rank badge - Top Left */}
          {showRank && drama.rankVo && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-primary/90 backdrop-blur-sm">
              <TrendingUp className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold tracking-wide">
                #{drama.rankVo.sort || 1}
              </span>
            </div>
          )}
          
          {/* Corner badge - Top Right */}
          {drama.corner && (
            <div 
              className="absolute top-2 right-2 px-2 py-1 rounded text-[9px] font-bold text-white backdrop-blur-sm uppercase tracking-wider"
              style={{ backgroundColor: drama.corner.color }}
            >
              {drama.corner.name}
            </div>
          )}
          
          {/* Episode count - Top Right (if no corner) */}
          {drama.chapterCount && !drama.corner && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-muted/80 backdrop-blur-sm text-foreground text-[10px] font-semibold tracking-wide">
              {drama.chapterCount} EP
            </div>
          )}
          
          {/* Play button on hover - Center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}
            >
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </motion.div>
          </div>
          
          {/* Content - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Rating */}
            {drama.rankVo?.hotCode && (
              <div className="flex items-center gap-1 mb-1.5">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-accent text-[11px] font-bold tracking-wide">
                  {drama.rankVo.hotCode}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h3 className="text-foreground text-sm font-bold line-clamp-2 mb-1 group-hover:text-primary transition-colors tracking-tight">
              {drama.bookName}
            </h3>
            
            {/* Tags */}
            {drama.tags && drama.tags.length > 0 && (
              <p className="text-muted-foreground text-[10px] line-clamp-1 uppercase tracking-wider font-medium">
                {drama.tags.slice(0, 2).join(" • ")}
              </p>
            )}
          </div>
          
          {/* Border on hover */}
          <div className="absolute inset-0 rounded-md border border-border group-hover:border-primary transition-all duration-300" />
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
    <div className={`${sizeClasses[size]} rounded-md overflow-hidden border border-border`}>
      <div className="w-full h-full bg-gradient-to-br from-card to-muted animate-pulse" />
    </div>
  );
}
