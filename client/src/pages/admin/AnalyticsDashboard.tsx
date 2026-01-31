/**
 * Admin Analytics Dashboard
 * Real-time analytics from Supabase
 */

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  Users,
  Eye,
  Play,
  Search,
  Bookmark,
  TrendingUp,
  Clock,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AnalyticsStats {
  totalUsers: number;
  totalEvents: number;
  pageViews: number;
  dramaViews: number;
  episodeWatches: number;
  searches: number;
  bookmarks: number;
  activeUsers24h: number;
  topDramas: Array<{ drama_title: string; count: number }>;
  recentEvents: Array<{ event_type: string; created_at: string; metadata: any }>;
}

export default function AnalyticsDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    totalEvents: 0,
    pageViews: 0,
    dramaViews: 0,
    episodeWatches: 0,
    searches: 0,
    bookmarks: 0,
    activeUsers24h: 0,
    topDramas: [],
    recentEvents: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total events
      const { count: totalEvents } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true });

      // Get page views
      const { count: pageViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view');

      // Get drama views
      const { count: dramaViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'drama_view');

      // Get episode watches
      const { count: episodeWatches } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'episode_watch');

      // Get searches
      const { count: searches } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'search');

      // Get bookmarks
      const { count: bookmarks } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true });

      // Get active users in last 24h
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: activeUsersData } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('created_at', twentyFourHoursAgo)
        .not('user_id', 'is', null);

      const uniqueActiveUsers = new Set(activeUsersData?.map(e => e.user_id) || []).size;

      // Get top dramas
      const { data: topDramasData } = await supabase
        .from('analytics_events')
        .select('metadata')
        .eq('event_type', 'drama_view')
        .order('created_at', { ascending: false })
        .limit(100);

      const dramaCount: Record<string, number> = {};
      topDramasData?.forEach((event) => {
        const title = event.metadata?.drama_title;
        if (title) {
          dramaCount[title] = (dramaCount[title] || 0) + 1;
        }
      });

      const topDramas = Object.entries(dramaCount)
        .map(([drama_title, count]) => ({ drama_title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get recent events
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('event_type, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        pageViews: pageViews || 0,
        dramaViews: dramaViews || 0,
        episodeWatches: episodeWatches || 0,
        searches: searches || 0,
        bookmarks: bookmarks || 0,
        activeUsers24h: uniqueActiveUsers,
        topDramas,
        recentEvents: recentEvents || [],
      });

      toast.success('Analytics refreshed');
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Real-time insights and statistics</p>
          </div>
          <Button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value={stats.totalUsers}
            color="cyan"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Total Events"
            value={stats.totalEvents}
            color="purple"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Active (24h)"
            value={stats.activeUsers24h}
            color="green"
          />
          <StatCard
            icon={<Bookmark className="w-6 h-6" />}
            title="Total Bookmarks"
            value={stats.bookmarks}
            color="amber"
          />
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Eye className="w-5 h-5" />}
            title="Page Views"
            value={stats.pageViews}
            color="blue"
            small
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Drama Views"
            value={stats.dramaViews}
            color="indigo"
            small
          />
          <StatCard
            icon={<Play className="w-5 h-5" />}
            title="Episode Watches"
            value={stats.episodeWatches}
            color="pink"
            small
          />
          <StatCard
            icon={<Search className="w-5 h-5" />}
            title="Searches"
            value={stats.searches}
            color="orange"
            small
          />
        </div>

        {/* Top Dramas */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Top Dramas
            </CardTitle>
            <CardDescription className="text-gray-400">Most viewed dramas</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topDramas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {stats.topDramas.map((drama, index) => (
                  <div
                    key={drama.drama_title}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">{drama.drama_title}</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">{drama.count} views</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Recent Events
            </CardTitle>
            <CardDescription className="text-gray-400">Latest user activity</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628] text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <EventIcon type={event.event_type} />
                      <div>
                        <p className="text-white font-medium capitalize">
                          {event.event_type.replace('_', ' ')}
                        </p>
                        {event.metadata?.page && (
                          <p className="text-gray-400 text-xs">{event.metadata.page}</p>
                        )}
                        {event.metadata?.drama_title && (
                          <p className="text-gray-400 text-xs">{event.metadata.drama_title}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

// Stat Card Component
function StatCard({
  icon,
  title,
  value,
  color,
  small = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  small?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    indigo: 'text-indigo-400',
    pink: 'text-pink-400',
    orange: 'text-orange-400',
  };

  return (
    <Card className="bg-[#0F1E35] border-cyan-500/20">
      <CardContent className={small ? 'p-4' : 'p-6'}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className={`${small ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>
              {value.toLocaleString()}
            </p>
          </div>
          <div className={colorClasses[color]}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Event Icon Component
function EventIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    page_view: <Eye className="w-4 h-4 text-blue-400" />,
    drama_view: <TrendingUp className="w-4 h-4 text-indigo-400" />,
    episode_watch: <Play className="w-4 h-4 text-pink-400" />,
    search: <Search className="w-4 h-4 text-orange-400" />,
    bookmark: <Bookmark className="w-4 h-4 text-amber-400" />,
  };

  return icons[type] || <BarChart3 className="w-4 h-4 text-gray-400" />;
}
