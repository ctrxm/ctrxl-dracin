/**
 * Watch Page - Premium Streaming Experience
 * Design: Modern, Clean, Netflix-inspired
 * 
 * OPTIMIZATIONS:
 * - Minimal re-renders using refs and memo
 * - Debounced state updates
 * - Hardware acceleration
 * - Reduced event listeners
 * - Throttled progress saves
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, List, Play, Pause,
  ChevronLeft, ChevronRight, X, Loader2,
  Volume2, VolumeX, Maximize
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getDramaDetail, getAllEpisodes, getVideoUrl,
  type DramaDetail, type Episode 
} from "@/lib/api";
import { useWatchHistory, useLastWatchedEpisode, useVideoProgress } from "@/hooks/useLocalStorage";
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
  const [error, setError] = useState<string | null>(null);
  
  // Player state - using refs to avoid re-renders
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [quality] = useState(720);
  
  // Use refs for frequently updated values to prevent re-renders
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const [displayTime, setDisplayTime] = useState({ current: 0, duration: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { updateHistory } = useWatchHistory();
  const [, setLastWatched] = useLastWatchedEpisode(id || "");
  const [savedProgress, setSavedProgress] = useVideoProgress(id || "", episodeIndex);

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

  // Throttled progress save - only save every 5 seconds
  const saveProgress = useCallback(() => {
    if (!drama || !currentEpisode || durationRef.current === 0) return;
    
    const progress = Math.round((currentTimeRef.current / durationRef.current) * 100);
    setSavedProgress(progress);
    
    updateHistory({
      bookId: drama.bookId,
      bookName: drama.bookName,
      coverWap: drama.coverWap || "",
      episodeIndex,
      episodeName: currentEpisode.chapterName,
      progress,
    });
  }, [drama, currentEpisode, episodeIndex, updateHistory, setSavedProgress]);

  // Debounced progress save
  useEffect(() => {
    if (progressSaveTimerRef.current) {
      clearTimeout(progressSaveTimerRef.current);
    }
    
    progressSaveTimerRef.current = setTimeout(saveProgress, 5000);
    
    return () => {
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
    };
  }, [currentTimeRef.current, saveProgress]);

  // Restore progress on load
  useEffect(() => {
    if (videoRef.current && savedProgress > 0 && savedProgress < 95 && durationRef.current > 0) {
      const time = (savedProgress / 100) * durationRef.current;
      videoRef.current.currentTime = time;
    }
  }, [savedProgress, videoUrl]);

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

  // Video event handlers - optimized with refs
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime;
      currentTimeRef.current = newTime;
      
      // Only update display every 1 second to reduce re-renders
      if (Math.floor(newTime) !== Math.floor(displayTime.current)) {
        setDisplayTime({ current: newTime, duration: durationRef.current });
      }
    }
  }, [displayTime.current]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      durationRef.current = videoRef.current.duration;
      setDisplayTime({ current: 0, duration: videoRef.current.duration });
    }
  }, []);

  const handleEnded = useCallback(() => {
    // Auto next episode
    if (episodeIndex < episodes.length - 1) {
      toast("Melanjutkan ke episode berikutnya...");
      setTimeout(() => {
        setLocation(`/watch/${id}/${episodeIndex + 1}`);
      }, 2000);
    }
  }, [episodeIndex, episodes.length, id, setLocation]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleSeek = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      currentTimeRef.current = value;
      setDisplayTime({ current: value, duration: durationRef.current });
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = newTime;
      currentTimeRef.current = newTime;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const goToEpisode = useCallback((index: number) => {
    setShowEpisodeDrawer(false);
    setLocation(`/watch/${id}/${index}`);
  }, [id, setLocation]);

  // Optimize video element setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force hardware acceleration
    video.style.transform = "translateZ(0)";
    video.style.backfaceVisibility = "hidden";
    video.style.willChange = "transform";
    
    return () => {
      video.style.transform = "";
      video.style.backfaceVisibility = "";
      video.style.willChange = "auto";
    };
  }, [videoUrl]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Memuat video...</p>
        </div>
      </div>
    );
  }

  if (error || !drama || !videoUrl) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-display text-foreground mb-2">Video tidak tersedia</h2>
          <p className="text-muted-foreground mb-6">{error || "Silakan coba episode lain"}</p>
          <Button onClick={() => window.history.back()} className="glow-primary">Kembali</Button>
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
      {/* Video Player - Optimized */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        // Prevent context menu
        onContextMenu={(e) => e.preventDefault()}
        // Disable picture-in-picture to save resources
        disablePictureInPicture
      />

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-top pointer-events-auto">
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
            <div className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-auto">
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
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 safe-bottom pointer-events-auto">
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-xs w-12 text-right">
                  {formatTime(displayTime.current)}
                </span>
                <div 
                  className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    const newTime = percent * displayTime.duration;
                    handleSeek(newTime);
                  }}
                >
                  <div 
                    className="h-full bg-primary rounded-full relative"
                    style={{ width: `${displayTime.duration ? (displayTime.current / displayTime.duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-white/80 text-xs w-12">
                  {formatTime(displayTime.duration)}
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
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-card/95 backdrop-blur-xl z-50 overflow-hidden border-l border-border"
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
                      className={`episode-btn aspect-square text-sm ${
                        ep.chapterIndex === episodeIndex ? "active" : ""
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
