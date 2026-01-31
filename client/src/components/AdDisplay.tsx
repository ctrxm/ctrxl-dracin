/**
 * Ad Display Component
 * Renders advertisements based on type and placement
 */

import { useEffect, useState } from 'react';
import { useAdminSettings, AdConfig } from '@/hooks/useAdminSettings';
import { useLocation } from 'wouter';

interface AdDisplayProps {
  placement: 'top' | 'bottom' | 'sidebar' | 'inline';
  className?: string;
}

export default function AdDisplay({ placement, className = '' }: AdDisplayProps) {
  const { settings } = useAdminSettings();
  const [location] = useLocation();
  const [currentAd, setCurrentAd] = useState<AdConfig | null>(null);

  // Get current page name from location
  const getCurrentPage = (): string => {
    if (location === '/') return 'home';
    if (location.startsWith('/drama/')) return 'detail';
    if (location.startsWith('/watch/')) return 'watch';
    if (location.startsWith('/search') || location.startsWith('/browse')) return 'browse';
    if (location.startsWith('/bookmarks')) return 'bookmarks';
    return 'home';
  };

  useEffect(() => {
    const now = new Date();
    const currentPage = getCurrentPage();

    // Filter ads based on criteria
    const eligibleAds = settings.ads.filter((ad) => {
      // Check if ad is enabled
      if (!ad.enabled) return false;

      // Check placement
      if (ad.placement !== placement) return false;

      // Check if ad should show on current page
      if (ad.pages && ad.pages.length > 0 && !ad.pages.includes(currentPage)) {
        return false;
      }

      // Check start date
      if (ad.startDate) {
        const startDate = new Date(ad.startDate);
        if (now < startDate) return false;
      }

      // Check end date
      if (ad.endDate) {
        const endDate = new Date(ad.endDate);
        if (now > endDate) return false;
      }

      return true;
    });

    // Sort by priority (highest first)
    eligibleAds.sort((a, b) => b.priority - a.priority);

    // Select the first eligible ad (highest priority)
    if (eligibleAds.length > 0) {
      setCurrentAd(eligibleAds[0]);
    } else {
      setCurrentAd(null);
    }
  }, [settings.ads, placement, location]);

  if (!currentAd) return null;

  const handleAdClick = () => {
    if (currentAd.linkUrl) {
      window.open(currentAd.linkUrl, '_blank');
    }
  };

  return (
    <div className={`ad-container ${className}`}>
      {/* HTML/Script Ad */}
      {currentAd.type === 'html' && currentAd.htmlCode && (
        <div
          className="ad-html"
          dangerouslySetInnerHTML={{ __html: currentAd.htmlCode }}
        />
      )}

      {/* Image Ad */}
      {currentAd.type === 'image' && currentAd.imageUrl && (
        <div
          className={`ad-image ${currentAd.linkUrl ? 'cursor-pointer' : ''}`}
          onClick={handleAdClick}
        >
          <img
            src={currentAd.imageUrl}
            alt={currentAd.name}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Text Ad */}
      {currentAd.type === 'text' && currentAd.textContent && (
        <div
          className={`ad-text p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 ${
            currentAd.linkUrl ? 'cursor-pointer hover:border-cyan-500/40 transition-colors' : ''
          }`}
          onClick={handleAdClick}
        >
          <p className="text-gray-300 text-sm leading-relaxed">{currentAd.textContent}</p>
          {currentAd.linkUrl && (
            <p className="text-cyan-400 text-xs mt-2">Click to learn more →</p>
          )}
        </div>
      )}
    </div>
  );
}

// Specific placement components for easier use

export function TopBanner({ className = '' }: { className?: string }) {
  return (
    <AdDisplay
      placement="top"
      className={`top-banner mb-4 sm:mb-6 ${className}`}
    />
  );
}

export function BottomBanner({ className = '' }: { className?: string }) {
  return (
    <AdDisplay
      placement="bottom"
      className={`bottom-banner mt-4 sm:mt-6 ${className}`}
    />
  );
}

export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <AdDisplay
      placement="sidebar"
      className={`sidebar-ad sticky top-4 ${className}`}
    />
  );
}

export function InlineAd({ className = '' }: { className?: string }) {
  return (
    <AdDisplay
      placement="inline"
      className={`inline-ad my-4 sm:my-6 ${className}`}
    />
  );
}
