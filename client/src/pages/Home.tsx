/**
 * Home Page - Premium Streaming Experience
 * Design: Modern, Clean, Netflix-inspired
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Play, ChevronRight, Bookmark, BookmarkCheck, Info, Star, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DramaCard, { DramaCardSkeleton } from "@/components/DramaCard";
import SourceTabs from "@/components/SourceTabs";
import { getTrending, getLatest, getForYou, getCoverUrl, type Drama, type SourceType } from "@/lib/api";
import { useBookmarks, useWatchHistory } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

export default function Home() {
  const [activeSource, setActiveSource] = useState<SourceType>('dramabox');
  const [trending, setTrending] = useState<Drama[]>([]);
  const [latest, setLatest] = useState<Drama[]>([]);
  const [forYou, setForYou] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getContinueWatching } = useWatchHistory();
  const continueWatching = getContinueWatching();

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

  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 6000);
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-display text-foreground mb-3">Oops! Terjadi Kesalahan</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="glow-primary">
            Coba Lagi
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[75vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 gradient-mesh" />
        
        {/* Featured Drama Background */}
        <AnimatePresence mode="wait">
          {featuredDrama && (
            <motion.div
              key={featuredDrama.bookId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                style={{ backgroundImage: `url(${getCoverUrl(featuredDrama)})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hero Content */}
        <div className="relative h-full container flex flex-col justify-end pb-12 md:pb-16">
          <AnimatePresence mode="wait">
            {featuredDrama && (
              <motion.div
                key={featuredDrama.bookId}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                {/* Trending Badge */}
                {featuredDrama.rankVo && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-4"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-primary text-sm font-semibold">
                      {featuredDrama.rankVo.recCopy || `#${featuredDrama.rankVo.sort || 1} Trending`}
                    </span>
                  </motion.div>
                )}
                
                {/* Title */}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground text-shadow-hero mb-4 leading-tight">
                  {featuredDrama.bookName}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                  {featuredDrama.chapterCount && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Play className="w-4 h-4" />
                      {featuredDrama.chapterCount} Episode
                    </span>
                  )}
                  {featuredDrama.rankVo?.hotCode && (
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      {featuredDrama.rankVo.hotCode}
                    </span>
                  )}
                </div>
                
                {/* Tags */}
                {featuredDrama.tags && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {featuredDrama.tags.slice(0, 4).map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Description */}
                <p className="text-muted-foreground text-sm md:text-base line-clamp-2 mb-6 max-w-xl">
                  {featuredDrama.introduction}
                </p>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link href={`/watch/${featuredDrama.bookId}/0`}>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-white gap-2 glow-primary transition-all duration-300 px-6"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Tonton Sekarang
                    </Button>
                  </Link>
                  <Link href={`/drama/${featuredDrama.bookId}`}>
                    <Button 
                      size="lg" 
                      variant="secondary" 
                      className="gap-2 bg-secondary/80 hover:bg-secondary"
                    >
                      <Info className="w-5 h-5" />
                      Detail
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="hover:bg-white/10"
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
          
          {/* Hero Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {trending.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === heroIndex 
                    ? "w-8 bg-primary" 
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Source Tabs */}
      <div className="container mt-8 mb-6">
        <SourceTabs activeSource={activeSource} onSourceChange={handleSourceChange} />
      </div>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <Section 
          title="Lanjutkan Menonton" 
          icon={<Clock className="w-5 h-5 text-primary" />}
          href="/bookmarks"
        >
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4">
            {continueWatching.map((item, index) => (
              <Link key={item.bookId} href={`/watch/${item.bookId}/${item.episodeIndex}`}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex-shrink-0 w-72 snap-start group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img
                      src={item.coverWap}
                      alt={item.bookName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center glow-primary">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold line-clamp-1 mb-1">
                        {item.bookName}
                      </h3>
                      <p className="text-white/70 text-xs">
                        {item.episodeName} • {item.progress}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Trending Section */}
      <Section 
        title="Sedang Trending" 
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start">
                  <DramaCardSkeleton size="lg" />
                </div>
              ))
            : trending.slice(0, 10).map((drama, index) => (
                <div key={drama.bookId} className="flex-shrink-0 snap-start">
                  <DramaCard drama={drama} index={index} size="lg" showRank />
                </div>
              ))}
        </div>
      </Section>

      {/* Latest Section */}
      <Section 
        title="Drama Terbaru" 
        icon={<Sparkles className="w-5 h-5 text-accent" />}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start">
                  <DramaCardSkeleton size="lg" />
                </div>
              ))
            : latest.slice(0, 10).map((drama, index) => (
                <div key={drama.bookId} className="flex-shrink-0 snap-start">
                  <DramaCard drama={drama} index={index} size="lg" />
                </div>
              ))}
        </div>
      </Section>

      {/* For You Section */}
      <Section 
        title="Untuk Kamu" 
        icon={<Star className="w-5 h-5 text-amber-400" />}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start">
                  <DramaCardSkeleton size="lg" />
                </div>
              ))
            : forYou.slice(0, 10).map((drama, index) => (
                <div key={drama.bookId} className="flex-shrink-0 snap-start">
                  <DramaCard drama={drama} index={index} size="lg" />
                </div>
              ))}
        </div>
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}

function Section({ title, icon, href, children }: SectionProps) {
  return (
    <section className="container mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl md:text-2xl text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {href && (
          <Link href={href}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
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
