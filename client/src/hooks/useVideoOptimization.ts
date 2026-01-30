/**
 * Video Optimization Hook
 * Handles video buffering, preloading, and quality adaptation
 * to prevent lag and skipping issues
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
  onQualityChange,
  adaptiveQuality = true,
}: UseVideoOptimizationOptions) {
  const bufferCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBufferCheck = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Optimize video element attributes for better streaming
    video.preload = "auto";
    video.playsInline = true;
    
    // Add buffer monitoring
    const checkBuffer = () => {
      if (!video) return;
      
      try {
        const buffered = video.buffered;
        if (buffered.length > 0) {
          const currentTime = video.currentTime;
          const bufferedEnd = buffered.end(buffered.length - 1);
          const bufferAhead = bufferedEnd - currentTime;
          
          // If buffer is less than 5 seconds ahead, notify buffering
          if (bufferAhead < 5 && !video.paused) {
            onBuffering?.(true);
          } else {
            onBuffering?.(false);
          }
          
          lastBufferCheck.current = bufferAhead;
        }
      } catch (e) {
        console.warn("Buffer check failed:", e);
      }
    };

    // Monitor buffering state
    const handleWaiting = () => {
      onBuffering?.(true);
    };

    const handleCanPlay = () => {
      onBuffering?.(false);
    };

    const handlePlaying = () => {
      onBuffering?.(false);
    };

    // Adaptive quality based on network conditions
    const handleProgress = () => {
      if (!adaptiveQuality) return;
      checkBuffer();
    };

    // Error recovery
    const handleError = (e: Event) => {
      console.error("Video error:", e);
      const error = video.error;
      
      if (error) {
        // Try to recover from network errors
        if (error.code === MediaError.MEDIA_ERR_NETWORK) {
          console.log("Network error detected, attempting recovery...");
          const currentTime = video.currentTime;
          setTimeout(() => {
            video.load();
            video.currentTime = currentTime;
            video.play().catch(console.error);
          }, 1000);
        }
      }
    };

    // Stalled detection and recovery
    const handleStalled = () => {
      console.log("Video stalled, attempting recovery...");
      onBuffering?.(true);
      
      // Try to resume playback
      setTimeout(() => {
        if (video.paused) {
          video.play().catch(console.error);
        }
      }, 500);
    };

    // Attach event listeners
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("error", handleError);
    video.addEventListener("stalled", handleStalled);

    // Start buffer monitoring
    bufferCheckInterval.current = setInterval(checkBuffer, 1000);

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("error", handleError);
      video.removeEventListener("stalled", handleStalled);
      
      if (bufferCheckInterval.current) {
        clearInterval(bufferCheckInterval.current);
      }
    };
  }, [videoRef, onBuffering, onQualityChange, adaptiveQuality]);
}

/**
 * Preload next episode for seamless transition
 */
export function useVideoPreload(videoUrl: string | null, enabled: boolean = false) {
  useEffect(() => {
    if (!enabled || !videoUrl) return;

    // Create a hidden video element to preload
    const preloadVideo = document.createElement("video");
    preloadVideo.src = videoUrl;
    preloadVideo.preload = "metadata";
    preloadVideo.style.display = "none";
    document.body.appendChild(preloadVideo);

    return () => {
      document.body.removeChild(preloadVideo);
    };
  }, [videoUrl, enabled]);
}

/**
 * Network speed estimation for adaptive quality
 */
export function useNetworkSpeed() {
  const speedRef = useRef<number>(0);

  useEffect(() => {
    // Use Network Information API if available
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      
      const updateSpeed = () => {
        if (connection.downlink) {
          speedRef.current = connection.downlink; // Mbps
        }
      };

      updateSpeed();
      connection.addEventListener("change", updateSpeed);

      return () => {
        connection.removeEventListener("change", updateSpeed);
      };
    }
  }, []);

  return speedRef.current;
}
