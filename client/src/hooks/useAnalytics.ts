/**
 * Analytics Hook
 * Track user events and page views
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsEvent {
  event_type: string;
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const { user } = useAuth();

  // Track event
  const trackEvent = async (eventType: string, metadata?: Record<string, any>) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        user_id: user?.id || null,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  // Track page view
  const trackPageView = async (page: string, metadata?: Record<string, any>) => {
    await trackEvent('page_view', { page, ...metadata });
  };

  // Track drama view
  const trackDramaView = async (dramaId: string, dramaTitle: string, source: string) => {
    await trackEvent('drama_view', { drama_id: dramaId, drama_title: dramaTitle, source });
  };

  // Track episode watch
  const trackEpisodeWatch = async (
    dramaId: string,
    dramaTitle: string,
    episode: string,
    source: string
  ) => {
    await trackEvent('episode_watch', {
      drama_id: dramaId,
      drama_title: dramaTitle,
      episode,
      source,
    });
  };

  // Track search
  const trackSearch = async (query: string, resultsCount: number) => {
    await trackEvent('search', { query, results_count: resultsCount });
  };

  // Track bookmark
  const trackBookmark = async (dramaId: string, dramaTitle: string, action: 'add' | 'remove') => {
    await trackEvent('bookmark', { drama_id: dramaId, drama_title: dramaTitle, action });
  };

  return {
    trackEvent,
    trackPageView,
    trackDramaView,
    trackEpisodeWatch,
    trackSearch,
    trackBookmark,
  };
}

// Hook to track page view on mount
export function usePageView(page: string, metadata?: Record<string, any>) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(page, metadata);
  }, [page]);
}
