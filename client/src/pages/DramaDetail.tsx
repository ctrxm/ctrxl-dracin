/**
 * Drama Detail Page - Movie Poster Feel
 * Design: Neo-Noir Cinema
 * 
 * Features:
 * - Full poster background with glass overlay
 * - Smooth scroll reveal
 * - Lazy loaded episode list
 * - Sticky CTA on mobile
 */

import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Bookmark, BookmarkCheck, Share2, ChevronDown, ChevronUp, 
  Clock, Film, Star, ArrowLeft, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getDramaDetail, getAllEpisodes, getCoverUrl,
  type DramaDetail as DramaDetailType, type Episode 
} from "@/lib/api";
import { useBookmarks, useLastWatchedEpisode } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

export default function DramaDetail() {
  const { id } = useParams<{ id: string }>();
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
        const [dramaData, episodesData] = await Promise.all([
          getDramaDetail(id),
          getAllEpisodes(id),
        ]);
        setDrama(dramaData);
        setEpisodes(episodesData);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat detail drama");
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
    toast(added ? "Ditambahkan ke daftar simpan" : "Dihapus dari daftar simpan");
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
      toast("Link disalin ke clipboard");
    }
  };

  const displayedEpisodes = episodesExpanded ? episodes : episodes.slice(0, 12);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!drama) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-bold mb-2">Drama tidak ditemukan</h2>
          <Button onClick={() => setLocation("/")}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 md:pb-24">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={getCoverUrl(drama)}
          alt=""
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/60" />
        <div className="absolute inset-0 backdrop-blur-xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 safe-top">
        <div className="container py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-foreground hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:bg-white/10"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:bg-white/10"
              onClick={handleBookmark}
            >
              {isBookmarked(drama.bookId) ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container">
        {/* Poster and Info */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 pt-4">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 mx-auto md:mx-0"
          >
            <div className="relative w-40 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <img
                src={getCoverUrl(drama)}
                alt={drama.bookName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-white/10 rounded-xl" />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              {drama.bookName}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              {drama.chapterCount && (
                <div className="flex items-center gap-1">
                  <Film className="w-4 h-4" />
                  {drama.chapterCount} Episode
                </div>
              )}
              {drama.rankVo && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  {drama.rankVo.hotCode} views
                </div>
              )}
            </div>

            {/* Tags */}
            {drama.tags && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {drama.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
              {drama.introduction}
            </p>

            {/* Desktop Actions */}
            <div className="hidden md:flex gap-3">
              <Link href={`/watch/${drama.bookId}/${lastWatched || 0}`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 glow-crimson">
                  <Play className="w-5 h-5 fill-current" />
                  {lastWatched > 0 ? "Lanjutkan" : "Tonton Sekarang"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Episodes Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-foreground">
              Daftar Episode
            </h2>
            <span className="text-sm text-muted-foreground">
              {episodes.length} Episode
            </span>
          </div>

          {/* Episode Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            <AnimatePresence>
              {displayedEpisodes.map((episode, index) => (
                <motion.div
                  key={episode.chapterId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link href={`/watch/${drama.bookId}/${episode.chapterIndex}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        episode.chapterIndex === lastWatched
                          ? "bg-primary text-primary-foreground glow-crimson"
                          : episode.isCharge === 1
                          ? "bg-secondary/50 text-muted-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {episode.chapterIndex + 1}
                      {episode.isCharge === 1 && (
                        <Lock className="absolute top-1 right-1 w-3 h-3 text-amber-500" />
                      )}
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Show More */}
          {episodes.length > 12 && (
            <Button
              variant="ghost"
              className="w-full mt-4 text-muted-foreground hover:text-foreground"
              onClick={() => setEpisodesExpanded(!episodesExpanded)}
            >
              {episodesExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Tampilkan Lebih Sedikit
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Tampilkan Semua ({episodes.length} Episode)
                </>
              )}
            </Button>
          )}
        </motion.section>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 md:hidden safe-bottom z-40">
        <div className="glass-card rounded-2xl p-3">
          <Link href={`/watch/${drama.bookId}/${lastWatched || 0}`}>
            <Button className="w-full bg-primary hover:bg-primary/90 gap-2 h-14 text-lg glow-crimson">
              <Play className="w-6 h-6 fill-current" />
              {lastWatched > 0 ? `Lanjutkan EP ${lastWatched + 1}` : "Tonton Sekarang"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen pb-24">
      <div className="fixed inset-0 -z-10 skeleton" />
      <header className="container py-4">
        <div className="w-10 h-10 rounded-full skeleton" />
      </header>
      <main className="container">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 pt-4">
          <div className="w-40 md:w-56 aspect-[2/3] rounded-xl skeleton mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <div className="h-10 w-3/4 skeleton rounded mx-auto md:mx-0" />
            <div className="h-4 w-1/2 skeleton rounded mx-auto md:mx-0" />
            <div className="flex gap-2 justify-center md:justify-start">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-16 skeleton rounded-full" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-2/3 skeleton rounded" />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <div className="h-8 w-40 skeleton rounded mb-4" />
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
