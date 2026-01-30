/**
 * Source Tabs Component
 * Design: Premium Streaming Experience
 */

import { motion } from "framer-motion";
import { Film, Clapperboard, Tv, Heart, Zap, Sparkles } from "lucide-react";
import { SOURCES, type SourceType } from "@/lib/api";

interface SourceTabsProps {
  activeSource: SourceType;
  onSourceChange: (source: SourceType) => void;
}

// Icon mapping for each source
const sourceIcons: Record<SourceType, React.ElementType> = {
  dramabox: Film,
  reelshort: Clapperboard,
  netshort: Tv,
  melolo: Heart,
  flickreels: Zap,
  freereels: Sparkles,
};

// Color mapping for each source
const sourceColors: Record<SourceType, string> = {
  dramabox: "text-rose-400",
  reelshort: "text-blue-400",
  netshort: "text-emerald-400",
  melolo: "text-pink-400",
  flickreels: "text-amber-400",
  freereels: "text-purple-400",
};

export default function SourceTabs({ activeSource, onSourceChange }: SourceTabsProps) {
  const sources = Object.values(SOURCES);

  return (
    <div className="relative">
      {/* Scrollable container */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
        {sources.map((source) => {
          const isActive = activeSource === source.id;
          const Icon = sourceIcons[source.id as SourceType];
          const iconColor = sourceColors[source.id as SourceType];
          
          return (
            <motion.button
              key={source.id}
              onClick={() => onSourceChange(source.id as SourceType)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="source-bg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary/80"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              {/* Content */}
              <span className="relative flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : iconColor}`} />
                <span className="hidden sm:inline">{source.name}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
