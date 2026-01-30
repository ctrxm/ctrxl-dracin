/**
 * CTRXL DRACIN API Service
 * Design: Neo-Noir Cinema
 * 
 * Multi-Source Support: DramaBox, NetShort, Melolo
 * With graceful fallback for missing endpoints
 */

const API_BASE = "https://api.sansekai.my.id/api";

// Available sources
export type SourceType = 'dramabox' | 'netshort' | 'melolo';

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
      trending: '/theaters', // NetShort uses theaters for trending
      latest: '/foryou', // NetShort uses foryou for latest
      foryou: '/foryou',
      search: '/search',
      detail: '/detail',
      allepisode: '/allepisode'
    }
  },
  melolo: {
    id: 'melolo',
    name: 'Melolo',
    description: 'Melodrama Collection',
    icon: '💝',
    color: 'from-rose-500 to-red-600',
    endpoints: {
      trending: '/trending',
      latest: '/latest',
      foryou: null, // Not available
      search: '/search',
      detail: '/detail',
      allepisode: '/stream'
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
  return fetchWithCache<T>(url);
}

// Transform Melolo response format to Drama format
function transformMeloloData(data: any): Drama[] {
  if (!data || typeof data !== 'object') return [];
  
  const books = data.books || [];
  if (!Array.isArray(books)) return [];
  
  return books.map((book: any) => ({
    bookId: book.book_id || book.media_id || '',
    bookName: book.book_name || '',
    coverWap: book.thumb_url || '',
    cover: book.thumb_url || '',
    chapterCount: book.serial_count || book.last_chapter_index || 0,
    introduction: book.abstract || book.sub_abstract || '',
    tags: book.stat_infos || [],
    playCount: book.read_count || '',
    rankVo: book.is_hot ? {
      rankType: 1,
      hotCode: book.read_count || '',
      sort: 0
    } : undefined
  }));
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

// DramaBox API with graceful fallback
export async function getTrending(source: SourceType = 'dramabox'): Promise<Drama[]> {
  try {
    const data = await fetchFromSource<any>(source, 'trending');
    
    // NetShort has different response format
    if (source === 'netshort') {
      const transformed = transformNetShortData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    // Melolo has different response format
    if (source === 'melolo') {
      const transformed = transformMeloloData(data);
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
    
    // NetShort has different response format
    if (source === 'netshort') {
      const transformed = transformNetShortData(data);
      return transformed.map(d => ({ ...d, source }));
    }
    
    // Melolo has different response format
    if (source === 'melolo') {
      const transformed = transformMeloloData(data);
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
    
    // NetShort has different response format
    if (source === 'netshort') {
      const transformed = transformNetShortData(data);
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
    const data = await fetchFromSource<DramaDetail>(source, 'detail', `?bookId=${bookId}`);
    return data ? { ...data, source } : null;
  } catch (error) {
    console.error(`Error fetching drama detail for ${source}:`, error);
    return null;
  }
}

export async function getAllEpisodes(bookId: string, source: SourceType = 'dramabox'): Promise<Episode[]> {
  try {
    const data = await fetchFromSource<Episode[]>(source, 'allepisode', `?bookId=${bookId}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching episodes for ${source}:`, error);
    return [];
  }
}

// Multi-source: Get content from all sources
export async function getAllSourcesTrending(): Promise<Drama[]> {
  const sources: SourceType[] = ['dramabox', 'netshort', 'melolo'];
  const promises = sources.map(source => getTrending(source));
  const results = await Promise.all(promises);
  return results.flat();
}

export async function getAllSourcesLatest(): Promise<Drama[]> {
  const sources: SourceType[] = ['dramabox', 'netshort', 'melolo'];
  const promises = sources.map(source => getLatest(source));
  const results = await Promise.all(promises);
  return results.flat();
}

// Helper to check if endpoint is available for source
export function isEndpointAvailable(source: SourceType, endpoint: keyof typeof SOURCES.dramabox.endpoints): boolean {
  return SOURCES[source].endpoints[endpoint] !== null;
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
    version: "2.1.0"
  };
}

// Get source info
export function getSourceInfo(source: SourceType) {
  return SOURCES[source];
}
