/**
 * Local Storage Hooks for CTRXL DRACIN
 * Design: Neo-Noir Cinema
 * 
 * Handles bookmarks, watch history, and continue watching
 */

import { useState, useEffect, useCallback } from "react";

// Generic localStorage hook
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Bookmark types
export interface BookmarkedDrama {
  bookId: string;
  bookName: string;
  coverWap: string;
  addedAt: number;
}

// Watch history types
export interface WatchHistoryItem {
  bookId: string;
  bookName: string;
  coverWap: string;
  episodeIndex: number;
  episodeName: string;
  progress: number; // 0-100 percentage
  watchedAt: number;
}

// Bookmarks hook
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkedDrama[]>("ctrxl-bookmarks", []);

  const addBookmark = useCallback((drama: { bookId: string; bookName: string; coverWap?: string; cover?: string }) => {
    setBookmarks(prev => {
      if (prev.some(b => b.bookId === drama.bookId)) return prev;
      return [...prev, {
        bookId: drama.bookId,
        bookName: drama.bookName,
        coverWap: drama.coverWap || drama.cover || "",
        addedAt: Date.now()
      }];
    });
  }, [setBookmarks]);

  const removeBookmark = useCallback((bookId: string) => {
    setBookmarks(prev => prev.filter(b => b.bookId !== bookId));
  }, [setBookmarks]);

  const isBookmarked = useCallback((bookId: string) => {
    return bookmarks.some(b => b.bookId === bookId);
  }, [bookmarks]);

  const toggleBookmark = useCallback((drama: { bookId: string; bookName: string; coverWap?: string; cover?: string }) => {
    if (isBookmarked(drama.bookId)) {
      removeBookmark(drama.bookId);
      return false;
    } else {
      addBookmark(drama);
      return true;
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}

// Watch history hook
export function useWatchHistory() {
  const [history, setHistory] = useLocalStorage<WatchHistoryItem[]>("ctrxl-history", []);

  const updateHistory = useCallback((item: Omit<WatchHistoryItem, "watchedAt">) => {
    setHistory(prev => {
      const filtered = prev.filter(h => !(h.bookId === item.bookId && h.episodeIndex === item.episodeIndex));
      return [{
        ...item,
        watchedAt: Date.now()
      }, ...filtered].slice(0, 50); // Keep last 50 items
    });
  }, [setHistory]);

  const getLastWatched = useCallback((bookId: string): WatchHistoryItem | undefined => {
    return history.find(h => h.bookId === bookId);
  }, [history]);

  const getContinueWatching = useCallback(() => {
    // Get unique dramas, most recent first
    const seen = new Set<string>();
    return history.filter(h => {
      if (seen.has(h.bookId)) return false;
      seen.add(h.bookId);
      return true;
    }).slice(0, 10);
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return { history, updateHistory, getLastWatched, getContinueWatching, clearHistory };
}

// Last watched episode for a specific drama
export function useLastWatchedEpisode(bookId: string = "") {
  const [lastEpisode, setLastEpisode] = useLocalStorage<number>(`ctrxl-last-ep-${bookId}`, 0);
  return [lastEpisode, setLastEpisode] as const;
}

// Video progress for a specific episode
export function useVideoProgress(bookId: string, episodeIndex: number = 0) {
  const [progress, setProgress] = useLocalStorage<number>(`ctrxl-progress-${bookId}-${episodeIndex}`, 0);
  return [progress, setProgress] as const;
}
