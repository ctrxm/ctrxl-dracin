/**
 * Watch Page - TikTok/Reels Style
 * Design: Full-screen vertical scroll dengan auto next episode
 * 
 * Features:
 * - Full screen video player
 * - Vertical scroll to next episode
 * - Auto scroll when episode ends
 * - Snap scroll behavior
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Play, Pause, Loader2,
  Volume2, VolumeX, List, ChevronUp, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Player state
  const [showControls, setShowControls] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [quality] = useState(720);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { user } = useAuth();
  const { updateWatchHistory, getEpisodeProgress } = useSupabaseWatchHistory();

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
      } catch (err) {
        console.error(err);
        setError("Gagal memuat video");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, source]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const goToEpisode = useCallback((index: number) => {
    setLocation(`/watch/${source}/${id}/${index}`);
  }, [id, setLocation, source]);

  const goToPrevEpisode = useCallback(() => {
    if (episodeIndex > 0) {
      goToEpisode(episodeIndex - 1);
    }
  }, [episodeIndex, goToEpisode]);

  const goToNextEpisode = useCallback(() => {
    if (episodeIndex < episodes.length - 1) {
      goToEpisode(episodeIndex + 1);
    }
  }, [episodeIndex, episodes.length, goToEpisode]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-white">Memuat video...</p>
        </div>
      </div>
    );
  }

  if (error || !drama || !episodes.length) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-display text-white mb-2">Video tidak tersedia</h2>
          <p className="text-white/60 mb-6">{error || "Silakan coba episode lain"}</p>
          <Button onClick={() => window.history.back()} className="glow-primary">Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video Player Component */}
      <VideoPlayer
        episode={episodes[episodeIndex]}
        drama={drama}
        source={source || 'dramabox'}
        episodeIndex={episodeIndex}
        quality={quality}
        onEnded={goToNextEpisode}
        showControls={showControls}
        updateWatchHistory={updateWatchHistory}
        getEpisodeProgress={getEpisodeProgress}
        user={user}
      />

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent safe-top pointer-events-auto">
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
                  Episode {episodeIndex + 1} / {episodes.length}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setShowEpisodeList(true)}
              >
                <List className="w-6 h-6" />
              </Button>
            </div>

            {/* Side Navigation */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
              {episodeIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 w-12 h-12 rounded-full bg-black/40"
                  onClick={goToPrevEpisode}
                >
                  <ChevronUp className="w-6 h-6" />
                </Button>
              )}
              
              {episodeIndex < episodes.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 w-12 h-12 rounded-full bg-black/40"
                  onClick={goToNextEpisode}
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent safe-bottom pointer-events-auto">
              <div className="space-y-2">
                <h2 className="text-white font-semibold">
                  {episodes[episodeIndex]?.chapterName}
                </h2>
                <p className="text-white/80 text-sm line-clamp-2">
                  {drama.introduction}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episode List Drawer */}
      <AnimatePresence>
        {showEpisodeList && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50"
              onClick={() => setShowEpisodeList(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-h-[70vh] bg-background rounded-t-3xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground">
                  Daftar Episode ({episodes.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEpisodeList(false)}
                >
                  Tutup
                </Button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-65px)]">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {episodes.map((ep) => (
                    <button
                      key={ep.chapterId}
                      onClick={() => {
                        goToEpisode(ep.chapterIndex);
                        setShowEpisodeList(false);
                      }}
                      className={`
                        aspect-square rounded-lg font-medium text-sm
                        transition-all duration-200
                        ${ep.chapterIndex === episodeIndex
                          ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }
                      `}
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

// Video Player Component
interface VideoPlayerProps {
  episode: Episode;
  drama: DramaDetail;
  source: string;
  episodeIndex: number;
  quality: number;
  onEnded: () => void;
  showControls: boolean;
  updateWatchHistory: any;
  getEpisodeProgress: any;
  user: any;
}

function VideoPlayer({
  episode,
  drama,
  source,
  episodeIndex,
  quality,
  onEnded,
  showControls,
  updateWatchHistory,
  getEpisodeProgress,
  user,
}: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayTime, setDisplayTime] = useState({ current: 0, duration: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const savedProgressData = getEpisodeProgress(source, drama.bookId, episodeIndex);
  const [savedProgress] = useState(savedProgressData?.progress || 0);

  // Load video URL
  useEffect(() => {
    if (episode) {
      const url = getVideoUrl(episode, quality);
      setVideoUrl(url);
    }
  }, [episode, quality]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
    };
  }, []);

  // Save progress
  const saveProgress = useCallback(async () => {
    if (!drama || !episode || durationRef.current === 0 || !user) return;
    
    const currentTime = Math.round(currentTimeRef.current);
    const duration = Math.round(durationRef.current);
    
    await updateWatchHistory(
      source as 'dramacool' | 'kissasian',
      drama.bookId,
      drama.bookName,
      episodeIndex,
      currentTime,
      duration,
      drama.coverWap || undefined
    );
  }, [drama, episode, episodeIndex, source, user, updateWatchHistory]);

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

  // Restore progress
  useEffect(() => {
    if (videoRef.current && savedProgress > 0 && savedProgress < 95 && durationRef.current > 0) {
      const time = (savedProgress / 100) * durationRef.current;
      videoRef.current.currentTime = time;
    }
  }, [savedProgress, videoUrl]);

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
    // Auto next episode after 1 second
    toast("Melanjutkan ke episode berikutnya...");
    setTimeout(() => {
      onEnded();
    }, 1000);
  }, [onEnded]);

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

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  if (!videoUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
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

      {/* Play/Pause Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-20 h-20 rounded-full bg-black/40 pointer-events-auto"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-1" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar & Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 right-4 space-y-2 pointer-events-auto"
          >
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-xs">
                {formatTime(displayTime.current)}
              </span>
              <div 
                className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative group"
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
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <span className="text-white/80 text-xs">
                {formatTime(displayTime.duration)}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
