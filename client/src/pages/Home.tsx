/**
 * Home Page - Cinematic Landing
 * Design: Neo-Noir Cinema
 * 
 * Features:
 * - Multi-source tabs (DramaBox, ReelShort, NetShort, Melolo, FlickReels, FreeReels)
 * - Fullscreen hero banner with Ken Burns effect
 * - Auto-rotating featured drama
 * - Trending, Latest, For You sections per source
 * - Skeleton loaders everywhere
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Play, ChevronRight, Bookmark, BookmarkCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import DramaCard, { DramaCardSkeleton } from "@/components/DramaCard";
import SourceTabs from "@/components/SourceTabs";
import { getTrending, getLatest, getForYou, getCoverUrl, type Drama, type SourceType } from "@/lib/api";
import { useBookmarks, useWatchHistory } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

// Hero backgrounds for rotation
const heroBackgrounds = [
  "/images/hero-bg-1.jpg",
  "/images/hero-bg-2.jpg",
  "/images/hero-bg-3.jpg",
];

export default function Home() {
  const [activeSource, setActiveSource] = useState<SourceType>('dramabox');
  const [trending, setTrending] = useState<Drama[]>([]);
  const [latest, setLatest] = useState<Drama[]>([]);
  const [forYou, setForYou] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getContinueWatching } = useWatchHistory();
  const continueWatching = getContinueWatching();

  // Fetch data when source changes
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [trendingData, latestData, forYouData] = await Promise.all([
          getTrending(activeSource),
          getLatest(activeSource),
          getForYou(activeSource),
        ]);
        setTrending(trendingData);
        setLatest(latestData);
        setForYou(forYouData);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data. Silakan coba lagi.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeSource]);

  // Auto-rotate hero
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
      setHeroImageIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [trending.length]);

  const featuredDrama = trending[heroIndex];

  const handleBookmark = useCallback((drama: Drama) => {
    const added = toggleBookmark({
      bookId: drama.bookId,
      bookName: drama.bookName,
      coverWap: getCoverUrl(drama),
    });
    toast(added ? "Ditambahkan ke daftar simpan" : "Dihapus dari daftar simpan", {
      icon: added ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />,
    });
  }, [toggleBookmark]);

  const handleSourceChange = (source: SourceType) => {
    setActiveSource(source);
    setHeroIndex(0);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Oops!</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        {/* Background Image with Ken Burns */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center animate-ken-burns"
              style={{ backgroundImage: `url(${heroBackgrounds[heroImageIndex]})` }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative h-full container flex flex-col justify-end pb-16 md:pb-24">
          <AnimatePresence mode="wait">
            {featuredDrama && (
              <motion.div
                key={featuredDrama.bookId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                {/* Badge */}
                {featuredDrama.rankVo && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm mb-4"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {featuredDrama.rankVo.recCopy || `TOP ${featuredDrama.rankVo.sort || 1}`}
                  </motion.div>
                )}
                
                {/* Title */}
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white text-shadow-cinematic mb-4 leading-tight">
                  {featuredDrama.bookName}
                </h1>
                
                {/* Tags */}
                {featuredDrama.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredDrama.tags.slice(0, 4).map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Description */}
                <p className="text-white/70 text-sm md:text-base line-clamp-3 mb-6 max-w-xl">
                  {featuredDrama.introduction}
                </p>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link href={`/watch/${featuredDrama.bookId}/0`}>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-white gap-2 glow-crimson transition-all duration-300"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Tonton Sekarang
                    </Button>
                  </Link>
                  <Link href={`/drama/${featuredDrama.bookId}`}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10 gap-2"
                    >
                      <Info className="w-5 h-5" />
                      Detail
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="text-white hover:bg-white/10"
                    onClick={() => handleBookmark(featuredDrama)}
                  >
                    {isBookmarked(featuredDrama.bookId) ? (
                      <BookmarkCheck className="w-5 h-5 text-primary" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Hero indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {trending.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setHeroIndex(i);
                  setHeroImageIndex(i % heroBackgrounds.length);
                }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === heroIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Source Tabs */}
      <div className="container mt-8">
        <SourceTabs activeSource={activeSource} onSourceChange={handleSourceChange} />
      </div>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <Section title="Lanjutkan Menonton" href="/bookmarks">
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
            {continueWatching.map((item, index) => (
              <Link key={item.bookId} href={`/watch/${item.bookId}/${item.episodeIndex}`}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex-shrink-0 w-64 snap-start"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden group">
                    <img
                      src={item.coverWap}
                      alt={item.bookName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center glow-crimson">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-foreground line-clamp-1">{item.bookName}</h3>
                    <p className="text-xs text-muted-foreground">{item.episodeName}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Trending Section */}
      <Section title="Sedang Trending" href="/search?filter=trending" loading={loading}>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start">
                  <DramaCardSkeleton />
                </div>
              ))
            : trending.map((drama, index) => (
                <motion.div
                  key={drama.bookId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 snap-start"
                >
                  <DramaCard
                    drama={drama}
                    isBookmarked={isBookmarked(drama.bookId)}
                    onBookmark={() => handleBookmark(drama)}
                  />
                </motion.div>
              ))}
        </div>
      </Section>

      {/* Latest Section */}
      <Section title="Drama Terbaru" href="/search?filter=latest" loading={loading}>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start">
                  <DramaCardSkeleton />
                </div>
              ))
            : latest.map((drama, index) => (
                <motion.div
                  key={drama.bookId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 snap-start"
                >
                  <DramaCard
                    drama={drama}
                    isBookmarked={isBookmarked(drama.bookId)}
                    onBookmark={() => handleBookmark(drama)}
                  />
                </motion.div>
              ))}
        </div>
      </Section>

      {/* For You Section */}
      <Section title="Untuk Kamu" href="/search?filter=foryou" loading={loading}>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start">
                  <DramaCardSkeleton />
                </div>
              ))
            : forYou.map((drama, index) => (
                <motion.div
                  key={drama.bookId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 snap-start"
                >
                  <DramaCard
                    drama={drama}
                    isBookmarked={isBookmarked(drama.bookId)}
                    onBookmark={() => handleBookmark(drama)}
                  />
                </motion.div>
              ))}
        </div>
      </Section>
    </div>
  );
}

// Section Component
interface SectionProps {
  title: string;
  href?: string;
  children: React.ReactNode;
  loading?: boolean;
}

function Section({ title, href, children, loading }: SectionProps) {
  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl text-foreground">
          {title}
        </h2>
        {href && !loading && (
          <Link href={href}>
            <Button variant="ghost" className="gap-1 text-muted-foreground hover:text-foreground">
              Lihat Semua
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
