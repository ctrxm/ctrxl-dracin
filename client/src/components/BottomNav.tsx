/**
 * Bottom Navigation Component
 * Design: Neo-Noir Cinema
 * 
 * Mobile-first bottom navigation with thumb-zone optimization
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
      <div className="absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      
      {/* Navigation bar */}
      <div className="glass-card border-t border-border/50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path === "/" && location === "/");
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className="relative flex flex-col items-center justify-center w-16 h-full"
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className={`text-[10px] mt-1 transition-colors duration-300 ${
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Badge for bookmarks with items */}
                  {item.path === "/bookmarks" && item.label === "Simpan" && (
                    <span className="sr-only">Bookmarks</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
          
          {/* Continue watching quick access */}
          {continueWatching.length > 0 && (
            <Link href={`/watch/${continueWatching[0].bookId}/${continueWatching[0].episodeIndex}`}>
              <motion.div
                className="relative flex flex-col items-center justify-center w-16 h-full"
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <Play className="w-6 h-6 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
                <span className="text-[10px] mt-1 text-muted-foreground">
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
