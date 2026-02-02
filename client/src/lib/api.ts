/**
 * CTRXL DRACIN API Service
 * Design: Neo-Noir Cinema
 * 
 * Multi-Source Support: DramaBox, NetShort, ReelShort, Melolo, FlickReels, FreeReels
 * With graceful fallback for missing endpoints
 */

import { decryptData } from "./crypto";

const API_BASE = "https://api.sansekai.my.id/api";

// Available sources
export type SourceType = 'dramabox' | 'netshort' | 'reelshort' | 'melolo' | 'flickreels' | 'freereels';

export const SOURCES = {
  dramabox: {
    id: 'dramabox',
    name: 'DramaBox',
    description: 'Premium Chinese Drama',
    icon: '🎬',
    color: 'from-amber-500 to-orange-600',
    endpoints: {
      trending: '/trending',
      latest: '/latest',
      foryou: '/foryou',
      search: '/search',
      detail: '/detail',
      allepisode: '/allepisode'
    }
  },

  netshort: {
    id: 'netshort',
    name: 'NetShort',
    description: 'Network Short Videos',
    icon: '📺',
    color: 'from-blue-500 to-cyan-600',
    endpoints: {
      trending: '/theaters',
      latest: '/foryou',
      foryou: '/foryou',
      search: '/search',
      detail: null,
      allepisode: '/allepisode'
    }
  },

  reelshort: {
    id: 'reelshort',
    name: 'ReelShort',
    description: 'Short Drama Reels',
    icon: '🎥',
    color: 'from-pink-500 to-rose-600',
    endpoints: {
      trending: '/homepage',
      latest: '/homepage',
      foryou: '/homepage',
      search: '/search',
      detail: '/detail',
      allepisode: null
    }
  },

  melolo: {
    id: 'melolo',
    name: 'Melolo',
    description: 'Melodrama Collection',
    icon: '🎭',
    color: 'from-purple-500 to-indigo-600',
    endpoints: {
      trending: '/latest',
      latest: '/latest',
      foryou: '/latest',
      search: '/search',
      detail: '/detail',
      allepisode: null
    }
  },

  flickreels: {
    id: 'flickreels',
    name: 'FlickReels',
    description: 'Quick Flick Stories',
    icon: '⚡',
    color: 'from-green-500 to-emerald-600',
    endpoints: {
      trending: '/hotrank',
      latest: '/latest',
      foryou: '/foryou',
      search: '/search',
      detail: '/detail',
      allepisode: null
    }
  },

  freereels: {
    id: 'freereels',
    name: 'FreeReels',
    description: 'Free Drama Reels',
    icon: '🎬',
    color: 'from-teal-500 to-cyan-600',
    endpoints: {
      trending: '/home',
      latest: '/home',
      foryou: '/foryou',
      search: '/search',
      detail: '/detail',
      allepisode: null
    }
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

async function fetchWithCache<T>(url: string, source?: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const json = await response.json();
  
  // Handle encrypted responses from SANSEKAI API
  let data: T;
  if (json.data && typeof json.data === "string") {
    try {
      data = decryptData<T>(json.data);
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      data = json as T;
    }
  } else {
    data = json as T;
  }
  
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// Generic function to fetch from any source with endpoint mapping
async function fetchFromSource<T>(
  source: SourceType, 
  endpointType: 'trending' | 'latest' | 'foryou' | 'search' | 'detail' | 'allepisode',
  params?: string
): Promise<T> {
  const sourceConfig = SOURCES[source];
  const endpoint = sourceConfig.endpoints[endpointType];
  
  // If endpoint not available for this source, return empty array
  if (!endpoint) {
    console.warn(`Endpoint '${endpointType}' not available for source '${source}'`);
    return [] as unknown as T;
  }
  
  const url = `${API_BASE}/${source}${endpoint}${params || ''}`;
  return fetchWithCache<T>(url, source);
}

// Transform ReelShort response format to Drama format
function transformReelShortData(data: any): Drama[] {
  if (!data || !data.data || !data.data.lists) return [];
  
  const dramas: Drama[] = [];
  const lists = data.data.lists;
  
  for (const list of lists) {
    if (list.episodes && Array.isArray(list.episodes)) {
      for (const item of list.episodes) {
        dramas.push({
          bookId: item.episode_id || item.id || '',
          bookName: item.name || '',
          coverWap: item.cover || '',
          cover: item.cover || '',
          chapterCount: item.total_episode || 0,
          introduction: item.desc || '',
          tags: item.tags || [],
          playCount: item.play_count || '',
          rankVo: item.is_hot ? {
            rankType: 1,
            hotCode: item.play_count || '',
            sort: 0
          } : undefined
        });
      }
    }
  }
  
  return dramas;
}

// Transform Melolo response format to Drama format
function transformMeloloData(data: any): Drama[] {
  if (!data || typeof data !== 'object') return [];
  
  const books = data.books || [];
  if (!Array.isArray(books)) return [];
  
  return books.map((book: any) => {
    // Convert HEIC URLs to WebP for better browser compatibility
    let thumbUrl = book.thumb_url || '';
    if (thumbUrl.includes('.heic')) {
      thumbUrl = thumbUrl.replace('.heic', '.webp');
    }
    
    return {
      bookId: book.book_id || book.media_id || '',
      bookName: book.book_name || '',
      coverWap: thumbUrl,
      cover: thumbUrl,
      chapterCount: book.serial_count || book.last_chapter_index || 0,
      introduction: book.abstract || book.sub_abstract || '',
      tags: book.stat_infos || [],
      playCount: book.read_count || '',
      rankVo: book.is_hot ? {
        rankType: 1,
        hotCode: book.read_count || '',
        sort: 0
      } : undefined
    };
  });
}

// Transform NetShort response format to Drama format
function transformNetShortData(data: any[]): Drama[] {
  if (!Array.isArray(data)) return [];
  
  const dramas: Drama[] = [];
  
  for (const group of data) {
    if (group.contentInfos && Array.isArray(group.contentInfos)) {
      for (const item of group.contentInfos) {
        dramas.push({
          bookId: item.shortPlayId || item.id || '',
          bookName: item.shortPlayName || '',
          coverWap: item.shortPlayCover || item.groupShortPlayCover || '',
          cover: item.shortPlayCover || item.groupShortPlayCover || '',
          chapterCount: item.episodeCount || 0,
          introduction: item.shortPlayLabels || '',
          tags: item.labelArray || [],
          playCount: item.heatScoreShow || '',
          rankVo: item.heatScore ? {
            rankType: 1,
            hotCode: item.heatScoreShow || '',
            sort: 0
          } : undefined
        });
      }
    }
  }
  
  return dramas;
}

// Transform FlickReels response format to Drama format
function transformFlickReelsData(data: any): Drama[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map((item: any) => ({
    bookId: item.id || item.drama_id || '',
    bookName: item.title || item.name || '',
    coverWap: item.poster || item.cover || '',
    cover: item.poster || item.cover || '',
    chapterCount: item.episode_count || 0,
    introduction: item.description || '',
    tags: item.tags || [],
    playCount: item.views || '',
    rankVo: item.rank ? {
      rankType: 1,
      hotCode: item.views || '',
      sort: item.rank
    } : undefined
  }));
}

// Transform FreeReels response format to Drama format
function transformFreeReelsData(data: any): Drama[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map((item: any) => ({
    bookId: item.id || item.video_id || '',
    bookName: item.title || '',
    coverWap: item.thumbnail || item.cover || '',
    cover: item.thumbnail || item.cover || '',
    chapterCount: item.episodes || 0,
    introduction: item.desc || '',
    tags: item.categories || [],
    playCount: item.play_count || '',
    rankVo: item.is_popular ? {
      rankType: 1,
      hotCode: item.play_count || '',
      sort: 0
    } : undefined
  }));
}

// Main API functions with source-specific transformations
export async function getTrending(source: SourceType = 'dramabox'): Promise<Drama[]> {
  try {
    const data = await fetchFromSource<any>(source, 'trending');
    
    // Apply source-specific transformations
    if (source === 'netshort') {
      const transformed = transformNetShortData(data);
      const result = transformed.map(d => ({ ...d, source }));
      result.forEach(drama => {
        localStorage.setItem(`drama_${source}_${drama.bookId}`, JSON.stringify(drama));
      });
      return result;
    }
    
    if (source === 'reelshort') {
      const transformed = transformReelShortData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'melolo') {
      const transformed = transformMeloloData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'flickreels') {
      const transformed = transformFlickReelsData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'freereels') {
      const transformed = transformFreeReelsData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    return Array.isArray(data) ? data.map(d => ({ ...d, source })) : [];
  } catch (error) {
    console.error(`Error fetching trending for ${source}:`, error);
    return [];
  }
}

export async function getLatest(source: SourceType = 'dramabox'): Promise<Drama[]> {
  try {
    const data = await fetchFromSource<any>(source, 'latest');
    
    // Apply source-specific transformations
    if (source === 'netshort') {
      const transformed = transformNetShortData(data);
      const result = transformed.map(d => ({ ...d, source }));
      result.forEach(drama => {
        localStorage.setItem(`drama_${source}_${drama.bookId}`, JSON.stringify(drama));
      });
      return result;
    }
    
    if (source === 'reelshort') {
      const transformed = transformReelShortData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'melolo') {
      const transformed = transformMeloloData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'flickreels') {
      const transformed = transformFlickReelsData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'freereels') {
      const transformed = transformFreeReelsData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    return Array.isArray(data) ? data.map(d => ({ ...d, source })) : [];
  } catch (error) {
    console.error(`Error fetching latest for ${source}:`, error);
    return [];
  }
}

export async function getForYou(source: SourceType = 'dramabox'): Promise<Drama[]> {
  try {
    const data = await fetchFromSource<any>(source, 'foryou');
    
    // Apply source-specific transformations
    if (source === 'netshort') {
      const transformed = transformNetShortData(data);
      const result = transformed.map(d => ({ ...d, source }));
      result.forEach(drama => {
        localStorage.setItem(`drama_${source}_${drama.bookId}`, JSON.stringify(drama));
      });
      return result;
    }
    
    if (source === 'reelshort') {
      const transformed = transformReelShortData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'flickreels') {
      const transformed = transformFlickReelsData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    if (source === 'freereels') {
      const transformed = transformFreeReelsData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    return Array.isArray(data) ? data.map(d => ({ ...d, source })) : [];
  } catch (error) {
    console.error(`Error fetching foryou for ${source}:`, error);
    return [];
  }
}

export async function getPopularSearch(source: SourceType = 'dramabox'): Promise<Drama[]> {
  try {
    const data = await fetchFromSource<Drama[]>(source, 'search', '?query=popular');
    return Array.isArray(data) ? data.map(d => ({ ...d, source })) : [];
  } catch (error) {
    console.error(`Error fetching popular search for ${source}:`, error);
    return [];
  }
}

export async function getDubIndo(source: SourceType = 'dramabox'): Promise<Drama[]> {
  // Only available for DramaBox
  if (source !== 'dramabox') return [];
  
  try {
    const url = `${API_BASE}/dramabox/dubindo`;
    const data = await fetchWithCache<Drama[]>(url);
    return Array.isArray(data) ? data.map(d => ({ ...d, source })) : [];
  } catch (error) {
    console.error('Error fetching dub indo:', error);
    return [];
  }
}

export async function getRandomDrama(source: SourceType = 'dramabox'): Promise<Drama[]> {
  // Only available for DramaBox
  if (source !== 'dramabox') return [];
  
  try {
    const url = `${API_BASE}/dramabox/randomdrama`;
    const data = await fetchWithCache<Drama[]>(url);
    return Array.isArray(data) ? data.map(d => ({ ...d, source })) : [];
  } catch (error) {
    console.error('Error fetching random drama:', error);
    return [];
  }
}

export async function searchDrama(query: string, source: SourceType = 'dramabox'): Promise<Drama[]> {
  if (!query.trim()) return [];
  
  try {
    const data = await fetchFromSource<Drama[]>(source, 'search', `?query=${encodeURIComponent(query)}`);
    return Array.isArray(data) ? data.map(d => ({ ...d, source })) : [];
  } catch (error) {
    console.error(`Error searching drama for ${source}:`, error);
    return [];
  }
}

export async function getDramaDetail(bookId: string, source: SourceType = 'dramabox'): Promise<DramaDetail | null> {
  try {
    // NetShort doesn't have detail endpoint, try to get from localStorage cache
    if (source === 'netshort') {
      console.warn('NetShort does not have detail endpoint, using cached data');
      const cached = localStorage.getItem(`drama_${source}_${bookId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    }
    
    const data = await fetchFromSource<DramaDetail>(source, 'detail', `?bookId=${bookId}`);
    return data ? { ...data, source } : null;
  } catch (error) {
    console.error(`Error fetching drama detail for ${source}:`, error);
    return null;
  }
}

export async function getAllEpisodes(bookId: string, source: SourceType = 'dramabox'): Promise<Episode[]> {
  try {
    const data = await fetchFromSource<Episode[]>(source, 'allepisode', `/${bookId}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching episodes for ${source}:`, error);
    return [];
  }
}

// Helper function to get cover URL with fallback
export function getCoverUrl(drama: Drama): string {
  return drama.coverWap || drama.cover || '/placeholder-drama.jpg';
}

// Helper function to get video URL from episode
export function getVideoUrl(episode: Episode): string {
  if (!episode.cdnList || episode.cdnList.length === 0) {
    return '';
  }
  
  const cdn = episode.cdnList.find(c => c.isDefault === 1) || episode.cdnList[0];
  if (!cdn.videoPathList || cdn.videoPathList.length === 0) {
    return '';
  }
  
  const video = cdn.videoPathList.find(v => v.isDefault === 1) || cdn.videoPathList[0];
  return `${cdn.cdnDomain}${video.videoPath}`;
}
