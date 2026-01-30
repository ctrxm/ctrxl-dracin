/**
 * CTRXL DRACIN API - Cloudflare Workers
 * Aggregate multiple drama API sources with fallback support
 * 
 * Features:
 * - Multiple API sources (Sansekai, Dramabos)
 * - Automatic fallback
 * - Caching
 * - Admin panel
 */

export interface Env {
  API_CACHE: KVNamespace;
  ADMIN_PASSWORD: string;
}

// API Sources Configuration
const API_SOURCES = {
  sansekai: {
    name: 'Sansekai Dramabox',
    baseUrl: 'https://api.sansekai.my.id/api/dramabox',
    enabled: true,
    priority: 1,
  },
  dramabos_dramabox: {
    name: 'Dramabos Dramabox',
    baseUrl: 'https://dramabos.asia/api/dramabox',
    enabled: true,
    priority: 2,
  },
  dramabos_reelshort: {
    name: 'Dramabos ReelShort',
    baseUrl: 'https://dramabos.asia/api/reelshort',
    enabled: false,
    priority: 3,
  },
  dramabos_meloshort: {
    name: 'Dramabos MeloShort',
    baseUrl: 'https://dramabos.asia/api/meloshort',
    enabled: false,
    priority: 4,
  },
};

// Cache TTL (Time To Live)
const CACHE_TTL = {
  trending: 300, // 5 minutes
  latest: 300,
  detail: 600, // 10 minutes
  episodes: 600,
  search: 180, // 3 minutes
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Admin routes
      if (path.startsWith('/admin')) {
        return handleAdmin(request, env, corsHeaders);
      }

      // API routes
      if (path.startsWith('/api')) {
        return handleAPI(request, env, ctx, corsHeaders);
      }

      // Root - API info
      return new Response(JSON.stringify({
        name: 'CTRXL DRACIN API',
        version: '1.0.0',
        endpoints: {
          trending: '/api/trending',
          latest: '/api/latest',
          foryou: '/api/foryou',
          search: '/api/search?query=<query>',
          detail: '/api/detail?bookId=<bookId>',
          episodes: '/api/allepisode?bookId=<bookId>',
          admin: '/admin',
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function handleAPI(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const query = url.searchParams.get('query');
  const bookId = url.searchParams.get('bookId');

  // Generate cache key
  const cacheKey = `api:${path}:${url.search}`;

  // Try cache first
  const cached = await env.API_CACHE?.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      },
    });
  }

  // Get enabled sources sorted by priority
  const sources = Object.entries(API_SOURCES)
    .filter(([_, config]) => config.enabled)
    .sort((a, b) => a[1].priority - b[1].priority);

  let lastError: Error | null = null;

  // Try each source
  for (const [sourceId, config] of sources) {
    try {
      const apiUrl = buildAPIUrl(config.baseUrl, path, url.searchParams);
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'CTRXL-DRACIN/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.text();

      // Cache the response
      const ttl = getCacheTTL(path);
      if (ttl > 0 && env.API_CACHE) {
        ctx.waitUntil(env.API_CACHE.put(cacheKey, data, { expirationTtl: ttl }));
      }

      return new Response(data, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'X-Source': sourceId,
        },
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Source ${sourceId} failed:`, lastError.message);
      continue;
    }
  }

  // All sources failed
  return new Response(JSON.stringify({
    error: 'All API sources failed',
    message: lastError?.message || 'Unknown error',
  }), {
    status: 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAdmin(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Authentication
  const authHeader = request.headers.get('Authorization');
  const password = authHeader?.replace('Bearer ', '');

  if (password !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Admin endpoints
  if (path === '/admin/sources') {
    return new Response(JSON.stringify(API_SOURCES), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (path === '/admin/cache/clear') {
    // Clear cache would require listing all keys, which is not efficient
    // Instead, we return success and let cache expire naturally
    return new Response(JSON.stringify({ success: true, message: 'Cache will expire naturally' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (path === '/admin/stats') {
    // Return basic stats
    return new Response(JSON.stringify({
      sources: Object.keys(API_SOURCES).length,
      enabled: Object.values(API_SOURCES).filter(s => s.enabled).length,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildAPIUrl(baseUrl: string, path: string, params: URLSearchParams): string {
  const url = new URL(path, baseUrl);
  params.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

function getCacheTTL(path: string): number {
  if (path.includes('trending')) return CACHE_TTL.trending;
  if (path.includes('latest')) return CACHE_TTL.latest;
  if (path.includes('detail')) return CACHE_TTL.detail;
  if (path.includes('episode')) return CACHE_TTL.episodes;
  if (path.includes('search')) return CACHE_TTL.search;
  return 300; // default 5 minutes
}
