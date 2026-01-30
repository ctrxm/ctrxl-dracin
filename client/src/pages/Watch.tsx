/**
 * Watch Page - Pure Cinema Mode
 * Design: Neo-Noir Cinema
 * 
 * Features:
 * - Black cinematic UI
 * - Minimal distraction
 * - Auto next episode
 * - Episode switcher drawer
 * - Mobile first controls
 * - Remember last watched
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ChevronUp, ChevronDown, List, Play, Pause,
  SkipForward, Volume2, VolumeX, Maximize, Settings,
  ChevronLeft, ChevronRight, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
// Using a simple progress bar instead of Slider to avoid infinite loop issues
import { 
  getDramaDetail, getAllEpisodes, getVideoUrl,
  type DramaDetail, type Episode 
} from "@/lib/api";
import { useWatchHistory, useLastWatchedEpisode, useVideoProgress } from "@/hooks/useLocalStorage";
import { useVideoOptimization, useVideoPreload } from "@/hooks/useVideoOptimization";
import { toast } from "sonner";

export default function Watch() {
  const { id, episode: episodeParam } = useParams<{ id: string; episode?: string }>();
  const [, setLocation] = useLocation();
  const episodeIndex = parseInt(episodeParam || "0", 10);
  
  const [drama, setDrama] = useState<DramaDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [quality, setQuality] = useState(720);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { updateHistory } = useWatchHistory();
  const [, setLastWatched] = useLastWatchedEpisode(id || "");
  const [savedProgress, setSavedProgress] = useVideoProgress(id || "", episodeIndex);

  // Video optimization
  useVideoOptimization({
    videoRef,
    onBuffering: setIsBuffering,
    adaptiveQuality: true,
  });

  // Preload next episode
  const nextEpisode = episodes[episodeIndex + 1];
  const nextVideoUrl = nextEpisode ? getVideoUrl(nextEpisode, quality) : null;
  useVideoPreload(nextVideoUrl, isPlaying && episodeIndex < episodes.length - 1);

  // Fetch drama and episodes
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
        
        const ep = episodesData[episodeIndex];
        if (ep) {
          setCurrentEpisode(ep);
          const url = getVideoUrl(ep, quality);
          setVideoUrl(url);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat video");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, episodeIndex, quality]);

  // Update last watched
  useEffect(() => {
    if (id && currentEpisode) {
      setLastWatched(episodeIndex);
    }
  }, [id, episodeIndex, currentEpisode, setLastWatched]);

  // Save progress periodically
  useEffect(() => {
    if (!drama || !currentEpisode || duration === 0) return;
    
    const progress = Math.round((currentTime / duration) * 100);
    setSavedProgress(progress);
    
    updateHistory({
      bookId: drama.bookId,
      bookName: drama.bookName,
      coverWap: drama.coverWap || "",
      episodeIndex,
      episodeName: currentEpisode.chapterName,
      progress,
    });
  }, [currentTime, duration, drama, currentEpisode, episodeIndex, updateHistory, setSavedProgress]);

  // Restore progress on load
  useEffect(() => {
    if (videoRef.current && savedProgress > 0 && savedProgress < 95 && duration > 0) {
      const time = (savedProgress / 100) * duration;
      videoRef.current.currentTime = time;
    }
  }, [savedProgress, duration]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoLoading(false);
    }
  };

  const handleEnded = () => {
    // Auto next episode
    if (episodeIndex < episodes.length - 1) {
      toast("Melanjutkan ke episode berikutnya...");
      setTimeout(() => {
        setLocation(`/watch/${id}/${episodeIndex + 1}`);
      }, 2000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const goToEpisode = (index: number) => {
    setShowEpisodeDrawer(false);
    setLocation(`/watch/${id}/${index}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !drama || !videoUrl) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-bold mb-2">Video tidak tersedia</h2>
          <p className="text-white/60 mb-4">{error || "Silakan coba episode lain"}</p>
          <Button onClick={() => window.history.back()}>Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video Player */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        preload="auto"
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setVideoLoading(true)}
        onCanPlay={() => setVideoLoading(false)}
        onClick={togglePlay}
      />

      {/* Loading overlay */}
      {(videoLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-white/80 text-sm">Buffering...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-top">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              
              <div className="flex-1 text-center px-4">
                <h1 className="text-white font-medium text-sm line-clamp-1">
                  {drama.bookName}
                </h1>
                <p className="text-white/60 text-xs">
                  {currentEpisode?.chapterName}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setShowEpisodeDrawer(true)}
              >
                <List className="w-6 h-6" />
              </Button>
            </div>

            {/* Center Controls */}
            <div className="absolute inset-0 flex items-center justify-center gap-8">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-12 h-12"
                onClick={() => skip(-10)}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-20 h-20 rounded-full bg-white/10"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 fill-current" />
                ) : (
                  <Play className="w-10 h-10 fill-current ml-1" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-12 h-12"
                onClick={() => skip(10)}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 safe-bottom">
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-xs w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                <div 
                  className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    const newTime = percent * (duration || 100);
                    handleSeek([newTime]);
                  }}
                >
                  <div 
                    className="h-full bg-primary rounded-full relative"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-white/80 text-xs w-12">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Episode */}
                  {episodeIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 gap-1"
                      onClick={() => goToEpisode(episodeIndex - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Button>
                  )}
                  
                  {/* Next Episode */}
                  {episodeIndex < episodes.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 gap-1"
                      onClick={() => goToEpisode(episodeIndex + 1)}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episode Drawer */}
      <AnimatePresence>
        {showEpisodeDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowEpisodeDrawer(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-card z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground">Daftar Episode</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEpisodeDrawer(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                <div className="grid grid-cols-4 gap-2">
                  {episodes.map((ep) => (
                    <button
                      key={ep.chapterId}
                      onClick={() => goToEpisode(ep.chapterIndex)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        ep.chapterIndex === episodeIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {ep.chapterIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
