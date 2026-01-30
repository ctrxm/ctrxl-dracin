/**
 * Bottom Navigation Component
 * Design: Premium Streaming Experience
 */

import { Home, Search, Bookmark, Play } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useWatchHistory } from "@/hooks/useLocalStorage";

const navItems = [
  { path: "/", icon: Home, label: "Beranda" },
  { path: "/search", icon: Search, label: "Cari" },
  { path: "/bookmarks", icon: Bookmark, label: "Simpan" },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Gradient fade effect */}
      <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      
      {/* Navigation bar */}
      <div className="glass-nav">
        <div className="flex items-center justify-around h-18 max-w-lg mx-auto px-6 py-2">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path === "/" && location === "/");
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className="relative flex flex-col items-center justify-center w-16 py-2"
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 rounded-2xl bg-primary/15"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <div className="relative">
                    <Icon 
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive 
                          ? "text-primary" 
                          : "text-muted-foreground"
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {/* Active dot */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </div>
                  
                  <span className={`text-[10px] mt-1.5 font-medium transition-colors duration-300 ${
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
                className="relative flex flex-col items-center justify-center w-16 py-2"
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary fill-primary" />
                  </div>
                  <motion.span 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <span className="text-[10px] mt-1.5 font-medium text-muted-foreground">
                  Lanjut
                </span>
              </motion.div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
