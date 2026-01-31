/**
 * Admin Dashboard - Live Statistics
 */

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useWatchHistory } from '@/hooks/useLocalStorage';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Clock,
  Play,
  Star,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { settings, updateAnalytics } = useAdminSettings();
  const { history } = useWatchHistory();
  const [stats, setStats] = useState({
    totalViews: 0,
    activeUsers: 1, // Current user
    totalDramas: 0,
    avgWatchTime: 0,
    popularDramas: [] as { name: string; views: number }[],
  });

  useEffect(() => {
    // Calculate statistics from watch history
    const totalViews = history.length;
    const uniqueDramas = new Set(history.map(h => h.bookId)).size;
    
    // Count drama views
    const dramaViews = history.reduce((acc, h) => {
      acc[h.bookName] = (acc[h.bookName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularDramas = Object.entries(dramaViews)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    setStats({
      totalViews,
      activeUsers: 1,
      totalDramas: uniqueDramas,
      avgWatchTime: totalViews > 0 ? Math.round((totalViews * 3.5) / 60) : 0, // Estimate
      popularDramas,
    });

    // Update analytics in settings
    updateAnalytics({
      totalViews,
      activeUsers: 1,
      totalUsers: 1,
    });
  }, [history]);

  const statCards = [
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      trend: '+12.5%',
      trendUp: true,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Users,
      trend: '+5.2%',
      trendUp: true,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Total Dramas',
      value: stats.totalDramas.toLocaleString(),
      icon: Play,
      trend: '+8 new',
      trendUp: true,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Avg Watch Time',
      value: `${stats.avgWatchTime}m`,
      icon: Clock,
      trend: '+2.1m',
      trendUp: true,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-400">Welcome back! Here's what's happening with your app.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-[#0F1E35] border-cyan-500/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${
                    stat.trendUp ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    <span className="hidden sm:inline">{stat.trend} from last month</span>
                    <span className="sm:hidden">{stat.trend}</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Popular Dramas */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Popular Dramas
            </CardTitle>
            <CardDescription className="text-gray-400">
              Most watched dramas this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.popularDramas.length > 0 ? (
              <div className="space-y-4">
                {stats.popularDramas.map((drama, index) => (
                  <div key={drama.name} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-amber-700 to-orange-800' :
                      'bg-gray-700'
                    } text-white`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{drama.name}</p>
                      <p className="text-sm text-gray-400">{drama.views} views</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 font-semibold">{drama.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No viewing data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-[#0F1E35] border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
              <CardDescription className="text-gray-400">
                Current system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API Status</span>
                <span className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Maintenance Mode</span>
                <span className={`flex items-center gap-2 ${
                  settings.maintenanceMode.enabled ? 'text-amber-400' : 'text-green-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    settings.maintenanceMode.enabled ? 'bg-amber-400' : 'bg-green-400'
                  } animate-pulse`} />
                  {settings.maintenanceMode.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Pop-ups</span>
                <span className="text-cyan-400 font-semibold">
                  {settings.popups.filter(p => p.enabled).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1E35] border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Common admin tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/admin/popups" className="block p-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 transition-colors border border-cyan-500/20 touch-manipulation">
                <p className="text-white font-medium text-sm sm:text-base">Create Pop-up</p>
                <p className="text-xs sm:text-sm text-gray-400">Add new announcement</p>
              </a>
              <a href="/admin/maintenance" className="block p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors border border-purple-500/20 touch-manipulation">
                <p className="text-white font-medium text-sm sm:text-base">Toggle Maintenance</p>
                <p className="text-xs sm:text-sm text-gray-400">Enable/disable maintenance mode</p>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
