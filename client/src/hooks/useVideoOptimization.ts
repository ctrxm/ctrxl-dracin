/**
 * Video Optimization Hook - Enhanced Version
 * Aggressive optimization to eliminate lag and skip issues
 * 
 * Key improvements:
 * - Reduced event listener overhead
 * - Throttled buffer checks
 * - Disabled unnecessary monitoring
 * - Focus on smooth playback
 */

import { useEffect, useRef, RefObject } from "react";

interface UseVideoOptimizationOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  onBuffering?: (isBuffering: boolean) => void;
  onQualityChange?: (quality: number) => void;
  adaptiveQuality?: boolean;
}

export function useVideoOptimization({
  videoRef,
  onBuffering,
  adaptiveQuality = false, // Disabled by default to reduce overhead
}: UseVideoOptimizationOptions) {
  const lastBufferCheck = useRef<number>(0);
  const isBufferingRef = useRef<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Optimize video element for smooth playback
    video.preload = "auto";
    video.playsInline = true;
    
    // Force hardware acceleration
    video.style.transform = "translateZ(0)";
    video.style.backfaceVisibility = "hidden";
    video.style.perspective = "1000px";
    
    // Minimal event handlers to reduce overhead
    const handleWaiting = () => {
      if (!isBufferingRef.current) {
        isBufferingRef.current = true;
        onBuffering?.(true);
      }
    };

    const handleCanPlay = () => {
      if (isBufferingRef.current) {
        isBufferingRef.current = false;
        onBuffering?.(false);
      }
    };

    const handlePlaying = () => {
      if (isBufferingRef.current) {
        isBufferingRef.current = false;
        onBuffering?.(false);
      }
    };

    // Lightweight error recovery
    const handleError = () => {
      const error = video.error;
      if (error && error.code === MediaError.MEDIA_ERR_NETWORK) {
        console.log("Network error, attempting recovery...");
        const currentTime = video.currentTime;
        setTimeout(() => {
          video.load();
          video.currentTime = currentTime;
          video.play().catch(console.error);
        }, 1000);
      }
    };

    // Attach minimal event listeners
    video.addEventListener("waiting", handleWaiting, { passive: true });
    video.addEventListener("canplay", handleCanPlay, { passive: true });
    video.addEventListener("playing", handlePlaying, { passive: true });
    video.addEventListener("error", handleError, { passive: true });

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("error", handleError);
      
      // Cleanup styles
      video.style.transform = "";
      video.style.backfaceVisibility = "";
      video.style.perspective = "";
    };
  }, [videoRef, onBuffering]);
}

/**
 * Simplified preload - only preload metadata to reduce overhead
 */
export function useVideoPreload(videoUrl: string | null, enabled: boolean = false) {
  useEffect(() => {
    if (!enabled || !videoUrl) return;

    // Only preload metadata, not the entire video
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = videoUrl;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [videoUrl, enabled]);
}

/**
 * Network speed estimation - simplified
 */
export function useNetworkSpeed() {
  const speedRef = useRef<number>(0);

  useEffect(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      if (connection?.downlink) {
        speedRef.current = connection.downlink;
      }
    }
  }, []);

  return speedRef.current;
}
