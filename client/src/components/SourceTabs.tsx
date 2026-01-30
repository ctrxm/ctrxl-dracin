/**
 * Source Tabs Component
 * Multi-source navigation tabs
 */

import { motion } from "framer-motion";
import { SOURCES, type SourceType } from "@/lib/api";

interface SourceTabsProps {
  activeSource: SourceType;
  onSourceChange: (source: SourceType) => void;
}

export default function SourceTabs({ activeSource, onSourceChange }: SourceTabsProps) {
  const sources = Object.values(SOURCES);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide mb-8">
      <div className="flex gap-2 min-w-max px-4 md:px-8">
        {sources.map((source) => {
          const isActive = activeSource === source.id;
          return (
            <motion.button
              key={source.id}
              onClick={() => onSourceChange(source.id as SourceType)}
              className={`
                relative px-6 py-3 rounded-xl font-medium transition-all
                ${isActive 
                  ? 'text-white shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground bg-background/50 hover:bg-background/80'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 bg-gradient-to-r ${source.color} rounded-xl`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">{source.icon}</span>
                <span className="hidden sm:inline">{source.name}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
