/**
 * Drama Detail Page - Corporate Edition
 * Design: Executive Portfolio & Data-Driven Style
 */

import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Bookmark, BookmarkCheck, Share2, ChevronDown, ChevronUp, 
  Film, Star, ArrowLeft, Lock, Clock, Users, Award, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getDramaDetail, getAllEpisodes, getCoverUrl,
  type DramaDetail as DramaDetailType, type Episode 
} from "@/lib/api";
import { useBookmarks, useLastWatchedEpisode } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

export default function DramaDetail() {
  const { id, source } = useParams<{ id: string; source: string }>();
  const [, setLocation] = useLocation();
  const [drama, setDrama] = useState<DramaDetailType | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodesExpanded, setEpisodesExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [lastWatched] = useLastWatchedEpisode(id || "");

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        const sourceType = (source as any) || 'dramabox';
        const [dramaData, episodesData] = await Promise.all([
          getDramaDetail(id, sourceType),
          getAllEpisodes(id, sourceType),
        ]);
        setDrama(dramaData);
        setEpisodes(episodesData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load drama details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleBookmark = () => {
    if (!drama) return;
    const added = toggleBookmark({
      bookId: drama.bookId,
      bookName: drama.bookName,
      coverWap: getCoverUrl(drama),
    });
    toast(added ? "Added to library" : "Removed from library");
  };

  const handleShare = async () => {
    if (!drama) return;
    try {
      await navigator.share({
        title: drama.bookName,
        text: drama.introduction,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard");
    }
  };

  const displayedEpisodes = episodesExpanded ? episodes : episodes.slice(0, 20);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!drama) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded bg-muted flex items-center justify-center border border-border">
            <Film className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2 tracking-tight">Content Not Found</h2>
          <p className="text-muted-foreground mb-6 text-sm">The requested content is unavailable</p>
          <Button onClick={() => setLocation("/")} variant="outline">Return to Home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Back Button */}
      <div className="container pt-6 pb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/")}
          className="gap-2 hover:text-primary transition-corporate"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="container">
          <div className="grid md:grid-cols-[300px,1fr] gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-[2/3] rounded-md overflow-hidden border border-border"
            >
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-card to-muted animate-pulse" />
              )}
              <img
                src={getCoverUrl(drama)}
                alt={drama.bookName}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight leading-tight">
                {drama.bookName}
              </h1>

              {/* Meta Stats - Corporate Style */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {drama.chapterCount && (
                  <div className="p-3 rounded bg-muted border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Film className="w-4 h-4 text-primary" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Episodes</span>
                    </div>
                    <div className="text-foreground font-bold text-lg">{drama.chapterCount}</div>
                  </div>
                )}
                {drama.rankVo?.hotCode && (
                  <div className="p-3 rounded bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rating</span>
                    </div>
                    <div className="text-accent font-bold text-lg">{drama.rankVo.hotCode}</div>
                  </div>
                )}
                {drama.rankVo?.sort && (
                  <div className="p-3 rounded bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rank</span>
                    </div>
                    <div className="text-primary font-bold text-lg">#{drama.rankVo.sort}</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {drama.tags && drama.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {drama.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 rounded bg-secondary/10 text-secondary text-xs font-semibold uppercase tracking-wider border border-secondary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {drama.introduction}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Link href={`/watch/${drama.bookId}/${lastWatched || 0}`}>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white gap-2 btn-primary-glow transition-corporate px-8 font-bold"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {lastWatched ? `RESUME EP ${lastWatched + 1}` : "WATCH NOW"}
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleBookmark}
                  className={`gap-2 transition-corporate ${
                    isBookmarked(drama.bookId) ? "border-primary text-primary" : ""
                  }`}
                >
                  {isBookmarked(drama.bookId) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                  {isBookmarked(drama.bookId) ? "Saved" : "Save"}
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost"
                  onClick={handleShare}
                  className="gap-2 hover:text-primary transition-corporate"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="container mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Episode List</h2>
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            {episodes.length} EPISODES TOTAL
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {displayedEpisodes.map((episode, index) => (
            <Link key={episode.chapterId} href={`/watch/${drama.bookId}/${index}`}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`w-full aspect-square rounded flex flex-col items-center justify-center text-sm font-bold transition-corporate ${
                  lastWatched === index
                    ? "bg-primary text-white btn-primary-glow"
                    : "bg-muted text-foreground hover:bg-border hover:border-primary border border-transparent"
                }`}
              >
                <span className="text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">EP</span>
                <span className="text-lg">{index + 1}</span>
              </motion.button>
            </Link>
          ))}
        </div>

        {/* Show More Button */}
        {episodes.length > 20 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setEpisodesExpanded(!episodesExpanded)}
              className="gap-2 transition-corporate"
            >
              {episodesExpanded ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show All ({episodes.length} Episodes)
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

// Skeleton Loading State
function DetailSkeleton() {
  return (
    <div className="min-h-screen pb-24">
      <div className="container pt-6 pb-4">
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
      </div>
      <div className="container">
        <div className="grid md:grid-cols-[300px,1fr] gap-8">
          <div className="aspect-[2/3] rounded-md bg-gradient-to-br from-card to-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse w-3/4" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
