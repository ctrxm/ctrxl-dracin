/**
 * Supabase Watch History Hook
 * Sync watch history and progress with Supabase
 */

import { useEffect, useState } from 'react';
import { supabase, WatchHistory } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useSupabaseWatchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch watch history
  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update or create watch history entry
  const updateWatchHistory = async (
    dramaSource: 'dramacool' | 'kissasian',
    dramaId: string,
    dramaTitle: string,
    episode: string,
    progress: number,
    duration: number,
    dramaImage?: string
  ) => {
    if (!user) return false;

    try {
      // Try to update existing entry
      const { data: existing } = await supabase
        .from('watch_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('drama_source', dramaSource)
        .eq('drama_id', dramaId)
        .eq('episode', episode)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('watch_history')
          .update({
            progress,
            duration,
            last_watched_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('watch_history')
          .insert({
            user_id: user.id,
            drama_source: dramaSource,
            drama_id: dramaId,
            drama_title: dramaTitle,
            drama_image: dramaImage,
            episode,
            progress,
            duration,
          });

        if (error) throw error;
      }

      await fetchHistory();
      return true;
    } catch (error: any) {
      console.error('Failed to update watch history:', error);
      return false;
    }
  };

  // Get progress for specific episode
  const getEpisodeProgress = (
    dramaSource: string,
    dramaId: string,
    episode: string
  ) => {
    const entry = history.find(
      h =>
        h.drama_source === dramaSource &&
        h.drama_id === dramaId &&
        h.episode === episode
    );
    return entry ? { progress: entry.progress, duration: entry.duration } : null;
  };

  // Get continue watching list
  const getContinueWatching = () => {
    // Group by drama and get latest episode for each
    const dramaMap = new Map<string, WatchHistory>();
    
    history.forEach(entry => {
      const key = `${entry.drama_source}-${entry.drama_id}`;
      const existing = dramaMap.get(key);
      
      if (!existing || new Date(entry.last_watched_at) > new Date(existing.last_watched_at)) {
        dramaMap.set(key, entry);
      }
    });

    return Array.from(dramaMap.values())
      .filter(entry => entry.progress < entry.duration * 0.9) // Not finished
      .slice(0, 10);
  };

  // Delete watch history entry
  const deleteHistoryEntry = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchHistory();
      return true;
    } catch (error: any) {
      console.error('Failed to delete history entry:', error);
      return false;
    }
  };

  // Clear all watch history
  const clearHistory = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory([]);
      return true;
    } catch (error: any) {
      console.error('Failed to clear history:', error);
      return false;
    }
  };

  // Load history when user logs in
  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  return {
    history,
    loading,
    updateWatchHistory,
    getEpisodeProgress,
    getContinueWatching,
    deleteHistoryEntry,
    clearHistory,
    refreshHistory: fetchHistory,
  };
}
