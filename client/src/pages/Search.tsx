/**
 * Search Page - Premium Streaming Experience
 * Design: Modern, Clean, Netflix-inspired
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, TrendingUp, Loader2, Film, Sparkles } from "lucide-react";
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
    inputRef.current?.focus();
  }, []);

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
      <header className="sticky top-0 z-40 glass-nav safe-top">
        <div className="container py-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Cari drama favorit kamu..."
              value={query}
              onChange={handleInputChange}
              className="pl-12 pr-12 h-14 bg-secondary/80 border-0 text-foreground placeholder:text-muted-foreground rounded-2xl text-base focus:ring-2 focus:ring-primary/50"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-xl"
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
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground">Mencari drama...</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Film className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl text-foreground">
                    Hasil Pencarian
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {results.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {results.map((drama, index) => (
                    <DramaCard key={drama.bookId} drama={drama} index={index} size="md" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <SearchIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-display text-foreground mb-2">
                  Tidak Ditemukan
                </h2>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  Drama dengan kata kunci "{query}" tidak ditemukan. Coba kata kunci lain atau jelajahi drama trending.
                </p>
                <Button 
                  variant="secondary" 
                  onClick={clearSearch}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Hapus Pencarian
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Initial State - Popular & Trending */}
        {!loading && !hasSearched && (
          <div className="space-y-10">
            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Pencarian Populer
                </h2>
                <div className="flex flex-wrap gap-2">
                  {initialLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-10 w-28 skeleton rounded-full" />
                      ))
                    : popularSearches.slice(0, 12).map((drama) => (
                        <motion.button
                          key={drama.bookId}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestionClick(drama)}
                          className="px-4 py-2.5 rounded-full bg-secondary/80 text-secondary-foreground text-sm font-medium hover:bg-secondary transition-colors border border-transparent hover:border-primary/30"
                        >
                          {drama.bookName}
                        </motion.button>
                      ))}
                </div>
              </motion.section>
            )}

            {/* Trending Dramas */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Sedang Trending
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {initialLoading
                  ? Array.from({ length: 12 }).map((_, i) => (
                      <DramaCardSkeleton key={i} size="md" />
                    ))
                  : trending.slice(0, 12).map((drama, index) => (
                      <DramaCard key={drama.bookId} drama={drama} index={index} size="md" />
                    ))}
              </div>
            </motion.section>
          </div>
        )}
      </main>
    </div>
  );
}
