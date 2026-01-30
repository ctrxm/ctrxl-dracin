/**
 * Bottom Navigation Component - Corporate Edition
 * Design: Minimalist Executive Interface
 */

import { Home, Search, Bookmark, Play } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useWatchHistory } from "@/hooks/useLocalStorage";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/bookmarks", icon: Bookmark, label: "Library" },
];

export default function BottomNav() {
  const [location] = useLocation();
  const { getContinueWatching } = useWatchHistory();
  const continueWatching = getContinueWatching();

  // Hide on watch page
  if (location.startsWith("/watch")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Navigation bar */}
      <div className="bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path === "/" && location === "/");
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className="relative flex flex-col items-center justify-center w-16 py-2 cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <Icon 
                    className={`w-5 h-5 transition-corporate ${
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Label */}
                  <span className={`text-[10px] mt-1 font-semibold uppercase tracking-wider transition-corporate ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
          
          {/* Continue watching quick access */}
          {continueWatching.length > 0 && (
            <Link href={`/watch/${continueWatching[0].bookId}/${continueWatching[0].episodeIndex}`}>
              <motion.div
                className="relative flex flex-col items-center justify-center w-16 py-2 cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded bg-primary flex items-center justify-center btn-primary-glow">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider text-muted-foreground">
                  Resume
                </span>
              </motion.div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
