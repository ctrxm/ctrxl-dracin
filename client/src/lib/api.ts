/**
 * CTRXL DRACIN API Service
 * Design: Neo-Noir Cinema
 * 
 * All data fetched from https://api.sansekai.my.id/api/dramabox
 */

const API_BASE = "https://api.sansekai.my.id/api/dramabox";

export interface Drama {
  bookId: string;
  bookName: string;
  coverWap?: string;
  cover?: string;
  chapterCount?: number;
  introduction?: string;
  tags?: string[];
  tagV3s?: Array<{ tagId: number; tagName: string; tagEnName?: string }>;
  protagonist?: string;
  playCount?: string;
  rankVo?: { rankType: number; hotCode: string; sort?: number; recCopy?: string };
  corner?: { cornerType: number; name: string; color: string };
  shelfTime?: string;
}

export interface Episode {
  chapterId: string;
  chapterIndex: number;
  chapterName: string;
  isCharge: number;
  cdnList?: Array<{
    cdnDomain: string;
    isDefault: number;
    videoPathList: Array<{
      quality: number;
      videoPath: string;
      isDefault: number;
    }>;
  }>;
}

export interface DramaDetail extends Drama {
  bookShelfStatus?: number;
  reserveStatus?: number;
  isEntry?: number;
}

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

export async function getTrending(): Promise<Drama[]> {
  return fetchWithCache<Drama[]>(`${API_BASE}/trending`);
}

export async function getLatest(): Promise<Drama[]> {
  return fetchWithCache<Drama[]>(`${API_BASE}/latest`);
}

export async function getForYou(): Promise<Drama[]> {
  return fetchWithCache<Drama[]>(`${API_BASE}/foryou`);
}

export async function getPopularSearch(): Promise<Drama[]> {
  return fetchWithCache<Drama[]>(`${API_BASE}/populersearch`);
}

export async function searchDrama(query: string): Promise<Drama[]> {
  if (!query.trim()) return [];
  const url = `${API_BASE}/search?query=${encodeURIComponent(query)}`;
  return fetchWithCache<Drama[]>(url);
}

export async function getDramaDetail(bookId: string): Promise<DramaDetail> {
  const url = `${API_BASE}/detail?bookId=${bookId}`;
  return fetchWithCache<DramaDetail>(url);
}

export async function getAllEpisodes(bookId: string): Promise<Episode[]> {
  const url = `${API_BASE}/allepisode?bookId=${bookId}`;
  return fetchWithCache<Episode[]>(url);
}

export async function getRandomDrama(): Promise<Drama[]> {
  return fetchWithCache<Drama[]>(`${API_BASE}/randomdrama`);
}

export async function getDubIndo(): Promise<Drama[]> {
  return fetchWithCache<Drama[]>(`${API_BASE}/dubindo`);
}

// Helper to get cover image URL
export function getCoverUrl(drama: Drama): string {
  return drama.coverWap || drama.cover || "/images/placeholder.jpg";
}

// Helper to get video URL from episode
export function getVideoUrl(episode: Episode, preferredQuality: number = 720): string | null {
  if (!episode.cdnList || episode.cdnList.length === 0) return null;
  
  const cdn = episode.cdnList.find(c => c.isDefault === 1) || episode.cdnList[0];
  if (!cdn.videoPathList || cdn.videoPathList.length === 0) return null;
  
  // Try to find preferred quality, fallback to default or first available
  const video = cdn.videoPathList.find(v => v.quality === preferredQuality) 
    || cdn.videoPathList.find(v => v.isDefault === 1)
    || cdn.videoPathList[0];
  
  return video?.videoPath || null;
}

// Clear cache (useful for manual refresh)
export function clearCache(): void {
  cache.clear();
}
