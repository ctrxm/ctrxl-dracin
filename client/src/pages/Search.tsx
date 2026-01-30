/**
 * Search Page - Fast as Thought
 * Design: Neo-Noir Cinema
 * 
 * Features:
 * - Live typing search
 * - Animated results
 * - Empty state with personality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DramaCard, { DramaCardSkeleton } from "@/components/DramaCard";
import { searchDrama, getPopularSearch, getTrending, type Drama } from "@/lib/api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Drama[]>([]);
  const [popularSearches, setPopularSearches] = useState<Drama[]>([]);
  const [trending, setTrending] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadInitial() {
      try {
        const [popular, trend] = await Promise.all([
          getPopularSearch(),
          getTrending(),
        ]);
        setPopularSearches(popular);
        setTrending(trend);
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitial();
    
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const data = await searchDrama(searchQuery);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (drama: Drama) => {
    setQuery(drama.bookName);
    performSearch(drama.bookName);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border safe-top">
        <div className="container py-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Cari drama..."
              value={query}
              onChange={handleInputChange}
              className="pl-12 pr-12 h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground rounded-xl"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="font-display text-xl text-foreground mb-4">
                  Hasil Pencarian ({results.length})
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {results.map((drama, index) => (
                    <DramaCard key={drama.bookId} drama={drama} index={index} size="sm" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🎬</div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Tidak ditemukan
                </h2>
                <p className="text-muted-foreground">
                  Coba kata kunci lain atau jelajahi drama trending
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Initial State - Popular & Trending */}
        {!loading && !hasSearched && (
          <div className="space-y-8">
            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <section>
                <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Pencarian Populer
                </h2>
                <div className="flex flex-wrap gap-2">
                  {initialLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-8 w-24 skeleton rounded-full" />
                      ))
                    : popularSearches.slice(0, 12).map((drama) => (
                        <motion.button
                          key={drama.bookId}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestionClick(drama)}
                          className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                        >
                          {drama.bookName}
                        </motion.button>
                      ))}
                </div>
              </section>
            )}

            {/* Trending Dramas */}
            <section>
              <h2 className="font-display text-xl text-foreground mb-4">
                Sedang Trending
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {initialLoading
                  ? Array.from({ length: 12 }).map((_, i) => (
                      <DramaCardSkeleton key={i} size="sm" />
                    ))
                  : trending.slice(0, 12).map((drama, index) => (
                      <DramaCard key={drama.bookId} drama={drama} index={index} size="sm" />
                    ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
