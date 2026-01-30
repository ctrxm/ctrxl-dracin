/**
 * CTRXL DRACIN API Service
 * Design: Neo-Noir Cinema
 * 
 * Multi-Source Support: DramaBox, ReelShort, NetShort, Melolo, FlickReels, FreeReels
 */

const API_BASE = "https://api.sansekai.my.id/api";

// Available sources
export type SourceType = 'dramabox' | 'reelshort' | 'netshort' | 'melolo' | 'flickreels' | 'freereels';

export const SOURCES = {
  dramabox: {
    id: 'dramabox',
    name: 'DramaBox',
    description: 'Premium Chinese Drama',
    icon: '🎬',
    color: 'from-amber-500 to-orange-600'
  },
  reelshort: {
    id: 'reelshort',
    name: 'ReelShort',
    description: 'Short Drama Series',
    icon: '🎞️',
    color: 'from-purple-500 to-pink-600'
  },
  netshort: {
    id: 'netshort',
    name: 'NetShort',
    description: 'Network Short Videos',
    icon: '📺',
    color: 'from-blue-500 to-cyan-600'
  },
  melolo: {
    id: 'melolo',
    name: 'Melolo',
    description: 'Melodrama Collection',
    icon: '💝',
    color: 'from-rose-500 to-red-600'
  },
  flickreels: {
    id: 'flickreels',
    name: 'FlickReels',
    description: 'Quick Flick Stories',
    icon: '⚡',
    color: 'from-yellow-500 to-amber-600'
  },
  freereels: {
    id: 'freereels',
    name: 'FreeReels',
    description: 'Free Drama Content',
    icon: '🎪',
    color: 'from-green-500 to-emerald-600'
  }
} as const;

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
  source?: SourceType;
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

// Simple cache for better performance
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

// Generic function to fetch from any source
async function fetchFromSource<T>(source: SourceType, endpoint: string): Promise<T> {
  const url = `${API_BASE}/${source}/${endpoint}`;
  return fetchWithCache<T>(url);
}

// DramaBox API
export async function getTrending(source: SourceType = 'dramabox'): Promise<Drama[]> {
  const data = await fetchFromSource<Drama[]>(source, 'trending');
  return data.map(d => ({ ...d, source }));
}

export async function getLatest(source: SourceType = 'dramabox'): Promise<Drama[]> {
  const data = await fetchFromSource<Drama[]>(source, 'latest');
  return data.map(d => ({ ...d, source }));
}

export async function getForYou(source: SourceType = 'dramabox'): Promise<Drama[]> {
  const data = await fetchFromSource<Drama[]>(source, 'foryou');
  return data.map(d => ({ ...d, source }));
}

export async function getPopularSearch(source: SourceType = 'dramabox'): Promise<Drama[]> {
  const data = await fetchFromSource<Drama[]>(source, 'populersearch');
  return data.map(d => ({ ...d, source }));
}

export async function getDubIndo(source: SourceType = 'dramabox'): Promise<Drama[]> {
  const data = await fetchFromSource<Drama[]>(source, 'dubindo');
  return data.map(d => ({ ...d, source }));
}

export async function getRandomDrama(source: SourceType = 'dramabox'): Promise<Drama[]> {
  const data = await fetchFromSource<Drama[]>(source, 'randomdrama');
  return data.map(d => ({ ...d, source }));
}

export async function searchDrama(query: string, source: SourceType = 'dramabox'): Promise<Drama[]> {
  if (!query.trim()) return [];
  const data = await fetchFromSource<Drama[]>(source, `search?query=${encodeURIComponent(query)}`);
  return data.map(d => ({ ...d, source }));
}

export async function getDramaDetail(bookId: string, source: SourceType = 'dramabox'): Promise<DramaDetail> {
  const data = await fetchFromSource<DramaDetail>(source, `detail?bookId=${bookId}`);
  return { ...data, source };
}

export async function getAllEpisodes(bookId: string, source: SourceType = 'dramabox'): Promise<Episode[]> {
  return fetchFromSource<Episode[]>(source, `allepisode?bookId=${bookId}`);
}

// Multi-source: Get content from all sources
export async function getAllSourcesTrending(): Promise<Drama[]> {
  const sources: SourceType[] = ['dramabox', 'reelshort', 'netshort', 'melolo', 'flickreels', 'freereels'];
  const promises = sources.map(source => 
    getTrending(source).catch(() => [] as Drama[])
  );
  const results = await Promise.all(promises);
  return results.flat();
}

export async function getAllSourcesLatest(): Promise<Drama[]> {
  const sources: SourceType[] = ['dramabox', 'reelshort', 'netshort', 'melolo', 'flickreels', 'freereels'];
  const promises = sources.map(source => 
    getLatest(source).catch(() => [] as Drama[])
  );
  const results = await Promise.all(promises);
  return results.flat();
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

// Get API info
export function getAPIInfo() {
  return {
    apiBase: API_BASE,
    provider: "Sansekai Multi-Source API",
    sources: Object.values(SOURCES),
    version: "2.0.0"
  };
}

// Get source info
export function getSourceInfo(source: SourceType) {
  return SOURCES[source];
}
