/**
 * Home Page - Corporate Dashboard Edition
 * Design: Executive Analytics & Portfolio Style
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Play, ChevronRight, Bookmark, BookmarkCheck, Info, Star, TrendingUp, Clock, BarChart3, Award } from "lucide-react";
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
        setError("Failed to load data. Please try again.");
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
    }, 7000);
    return () => clearInterval(interval);
  }, [trending.length]);

  const featuredDrama = trending[heroIndex];

  const handleBookmark = useCallback((drama: Drama) => {
    const added = toggleBookmark({
      bookId: drama.bookId,
      bookName: drama.bookName,
      coverWap: getCoverUrl(drama),
    });
    toast(added ? "Added to bookmarks" : "Removed from bookmarks", {
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
            <Play className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">System Error</h2>
          <p className="text-muted-foreground mb-6 text-sm">{error}</p>
          <Button onClick={() => window.location.reload()} className="btn-primary-glow">
            Retry Connection
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section - Executive Dashboard Style */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[650px] overflow-hidden border-b border-border">
        {/* Featured Drama Background */}
        <AnimatePresence mode="wait">
          {featuredDrama && (
            <motion.div
              key={featuredDrama.bookId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url(${getCoverUrl(featuredDrama)})` }}
              />
              {/* Corporate gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hero Content */}
        <div className="relative h-full container flex flex-col justify-end pb-12 md:pb-16">
          <AnimatePresence mode="wait">
            {featuredDrama && (
              <motion.div
                key={featuredDrama.bookId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl"
              >
                {/* Trending Badge */}
                {featuredDrama.rankVo && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 border border-primary/30 mb-4"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-primary text-xs font-bold uppercase tracking-wider">
                      {featuredDrama.rankVo.recCopy || `Rank #${featuredDrama.rankVo.sort || 1}`}
                    </span>
                  </motion.div>
                )}
                
                {/* Title */}
                <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 leading-tight tracking-tight">
                  {featuredDrama.bookName}
                </h1>
                
                {/* Meta Info - Corporate Style */}
                <div className="flex flex-wrap items-center gap-6 mb-5 text-sm">
                  {featuredDrama.chapterCount && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Play className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Episodes</div>
                        <div className="text-foreground font-bold">{featuredDrama.chapterCount}</div>
                      </div>
                    </div>
                  )}
                  {featuredDrama.rankVo?.hotCode && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rating</div>
                        <div className="text-accent font-bold">{featuredDrama.rankVo.hotCode}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                {featuredDrama.tags && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {featuredDrama.tags.slice(0, 4).map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 rounded bg-muted text-foreground text-[11px] font-semibold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Description */}
                <p className="text-muted-foreground text-sm md:text-base line-clamp-2 mb-6 max-w-2xl leading-relaxed">
                  {featuredDrama.introduction}
                </p>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link href={`/watch/${featuredDrama.bookId}/0`}>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-white gap-2 btn-primary-glow transition-corporate px-8 font-bold"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      WATCH NOW
                    </Button>
                  </Link>
                  <Link href={`/drama/${featuredDrama.bookId}`}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="gap-2 border-border hover:border-primary hover:text-primary transition-corporate font-semibold"
                    >
                      <Info className="w-5 h-5" />
                      Details
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="hover:bg-muted transition-corporate"
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
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === heroIndex 
                    ? "w-8 bg-primary" 
                    : "w-1 bg-muted hover:bg-border"
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
          title="Continue Watching" 
          icon={<Clock className="w-5 h-5 text-primary" />}
          href="/bookmarks"
        >
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {continueWatching.map((item, index) => (
              <Link key={item.bookId} href={`/watch/${item.bookId}/${item.episodeIndex}`}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex-shrink-0 w-80 group"
                >
                  <div className="relative aspect-video rounded-md overflow-hidden border border-border group-hover:border-primary transition-corporate">
                    <img
                      src={item.coverWap}
                      alt={item.bookName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center btn-primary-glow">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-foreground text-sm font-bold mb-1 line-clamp-1">{item.bookName}</h3>
                      <p className="text-muted-foreground text-xs">Episode {item.episodeIndex + 1}</p>
                      {item.progress > 0 && (
                        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
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
        title="Trending Now" 
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
        description="Most popular content this week"
      >
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <DramaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trending.map((drama, index) => (
              <DramaCard key={drama.bookId} drama={drama} index={index} showRank />
            ))}
          </div>
        )}
      </Section>

      {/* Latest Section */}
      <Section 
        title="Latest Releases" 
        icon={<Award className="w-5 h-5 text-secondary" />}
        description="Newest additions to the catalog"
      >
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <DramaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {latest.map((drama, index) => (
              <DramaCard key={drama.bookId} drama={drama} index={index} />
            ))}
          </div>
        )}
      </Section>

      {/* For You Section */}
      <Section 
        title="Recommended For You" 
        icon={<BarChart3 className="w-5 h-5 text-accent" />}
        description="Personalized picks based on your preferences"
      >
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <DramaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {forYou.map((drama, index) => (
              <DramaCard key={drama.bookId} drama={drama} index={index} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// Section Component
interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  href?: string;
  children: React.ReactNode;
}

function Section({ title, icon, description, href, children }: SectionProps) {
  return (
    <section className="container mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {icon}
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
          </div>
          {description && (
            <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">{description}</p>
          )}
        </div>
        {href && (
          <Link href={href}>
            <Button variant="ghost" size="sm" className="gap-1 hover:text-primary transition-corporate">
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
