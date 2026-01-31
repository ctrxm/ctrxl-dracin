/**
 * Supabase Bookmarks Hook
 * Sync bookmarks between localStorage and Supabase
 */

import { useEffect, useState } from 'react';
import { supabase, Bookmark } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useSupabaseBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch bookmarks from Supabase
  const fetchBookmarks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add bookmark
  const addBookmark = async (
    dramaSource: 'dramacool' | 'kissasian',
    dramaId: string,
    dramaTitle: string,
    dramaImage?: string
  ) => {
    if (!user) {
      toast.error('Please login to bookmark dramas');
      return false;
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          drama_source: dramaSource,
          drama_id: dramaId,
          drama_title: dramaTitle,
          drama_image: dramaImage,
        });

      if (error) {
        // Check if already bookmarked
        if (error.code === '23505') {
          toast.info('Already bookmarked');
          return false;
        }
        throw error;
      }

      toast.success('Added to bookmarks');
      await fetchBookmarks();
      return true;
    } catch (error: any) {
      toast.error('Failed to add bookmark: ' + error.message);
      return false;
    }
  };

  // Remove bookmark
  const removeBookmark = async (dramaSource: string, dramaId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('drama_source', dramaSource)
        .eq('drama_id', dramaId);

      if (error) throw error;

      toast.success('Removed from bookmarks');
      await fetchBookmarks();
      return true;
    } catch (error: any) {
      toast.error('Failed to remove bookmark: ' + error.message);
      return false;
    }
  };

  // Check if drama is bookmarked
  const isBookmarked = (dramaSource: string, dramaId: string) => {
    return bookmarks.some(
      b => b.drama_source === dramaSource && b.drama_id === dramaId
    );
  };

  // Toggle bookmark
  const toggleBookmark = async (
    dramaSource: 'dramacool' | 'kissasian',
    dramaId: string,
    dramaTitle: string,
    dramaImage?: string
  ) => {
    if (isBookmarked(dramaSource, dramaId)) {
      return await removeBookmark(dramaSource, dramaId);
    } else {
      return await addBookmark(dramaSource, dramaId, dramaTitle, dramaImage);
    }
  };

  // Load bookmarks when user logs in
  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    refreshBookmarks: fetchBookmarks,
  };
}
