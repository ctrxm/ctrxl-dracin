/**
 * Watch Page - Dracin Style
 * Design: Portrait mode dengan video di atas dan episode list di bawah
 * 
 * OPTIMIZATIONS:
 * - Minimal re-renders using refs and memo
 * - Debounced state updates
 * - Hardware acceleration
 * - Auto scroll to next episode when ended
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Play, Pause, Loader2,
  Volume2, VolumeX, Maximize, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBanner } from "@/components/AdDisplay";
import { 
  getDramaDetail, getAllEpisodes, getVideoUrl,
  type DramaDetail, type Episode 
} from "@/lib/api";
import { useSupabaseWatchHistory } from "@/hooks/useSupabaseWatchHistory";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Watch() {
  const { source, id, episode: episodeParam } = useParams<{ source: string; id: string; episode?: string }>();
  const [, setLocation] = useLocation();
  const episodeIndex = parseInt(episodeParam || "0", 10);
  
  const [drama, setDrama] = useState<DramaDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality] = useState(720);
  
  // Use refs for frequently updated values
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const [displayTime, setDisplayTime] = useState({ current: 0, duration: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const episodeListRef = useRef<HTMLDivElement>(null);
  const nextEpisodeRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { user } = useAuth();
  const { updateWatchHistory, getEpisodeProgress } = useSupabaseWatchHistory();
  const savedProgressData = getEpisodeProgress(source || 'dramacool', id || '', episodeIndex || '0');
  const [savedProgress, setSavedProgress] = useState(savedProgressData?.progress || 0);

  // Fetch drama and episodes
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        const [dramaData, episodesData] = await Promise.all([
          getDramaDetail(id, source as any),
          getAllEpisodes(id, source as any),
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
  }, [id, episodeIndex, quality, source]);

  // Cleanup on unmount
  useEffect(() => {
    const video = videoRef.current;
    
    return () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
    };
  }, []);

  // Throttled progress save
  const saveProgress = useCallback(async () => {
    if (!drama || !currentEpisode || durationRef.current === 0 || !user) return;
    
    const currentTime = Math.round(currentTimeRef.current);
    const duration = Math.round(durationRef.current);
    
    setSavedProgress(currentTime);
    
    await updateWatchHistory(
      source as 'dramacool' | 'kissasian',
      drama.bookId,
      drama.bookName,
      episodeIndex,
      currentTime,
      duration,
      drama.coverWap || undefined
    );
  }, [drama, currentEpisode, episodeIndex, source, user, updateWatchHistory]);

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

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime;
      currentTimeRef.current = newTime;
      
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
    // Auto scroll to next episode
    if (episodeIndex < episodes.length - 1 && nextEpisodeRef.current) {
      toast("Episode selesai, scroll ke bawah untuk episode berikutnya");
      
      // Smooth scroll to next episode
      setTimeout(() => {
        nextEpisodeRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    } else {
      toast("Episode terakhir selesai");
    }
  }, [episodeIndex, episodes.length]);

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

  const toggleFullscreen = useCallback(() => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const goToEpisode = useCallback((index: number) => {
    // Scroll to top when changing episode
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLocation(`/watch/${source}/${id}/${index}`);
  }, [id, setLocation, source]);

  // Optimize video element setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Memuat video...</p>
        </div>
      </div>
    );
  }

  if (error || !drama || !videoUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      {/* Video Container - Fixed aspect ratio */}
      <div 
        className="relative w-full bg-black"
        style={{ aspectRatio: '9/16', maxHeight: '100vh' }}
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
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          onContextMenu={(e) => e.preventDefault()}
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
                
                <div className="w-10" /> {/* Spacer for centering */}
              </div>

              {/* Center Play/Pause */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drama Info & Episodes List */}
      <div className="container py-6 space-y-6">
        {/* Ad Banner */}
        <TopBanner />

        {/* Drama Info */}
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">
            {drama.bookName}
          </h1>
          <p className="text-muted-foreground line-clamp-3">
            {drama.introduction}
          </p>
        </div>

        {/* Episodes Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Daftar Episode ({episodes.length})
          </h2>
          
          <div 
            ref={episodeListRef}
            className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2"
          >
            {episodes.map((ep, idx) => {
              const isCurrentEpisode = ep.chapterIndex === episodeIndex;
              const isNextEpisode = ep.chapterIndex === episodeIndex + 1;
              
              return (
                <div
                  key={ep.chapterId}
                  ref={isNextEpisode ? nextEpisodeRef : null}
                >
                  <button
                    onClick={() => goToEpisode(ep.chapterIndex)}
                    className={`
                      relative w-full aspect-square rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${isCurrentEpisode 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'bg-secondary text-foreground hover:bg-secondary/80 hover:scale-105'
                      }
                    `}
                  >
                    <span className="absolute inset-0 flex items-center justify-center">
                      {ep.chapterIndex + 1}
                    </span>
                    {isCurrentEpisode && (
                      <Check className="absolute top-1 right-1 w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
