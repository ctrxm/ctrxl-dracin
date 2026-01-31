/**
 * Analytics Page - Detailed statistics
 */

import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWatchHistory } from '@/hooks/useLocalStorage';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function Analytics() {
  const { history } = useWatchHistory();

  // Calculate analytics
  const totalViews = history.length;
  const uniqueDramas = new Set(history.map(h => h.bookId)).size;
  const avgProgress = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + (h.progress || 0), 0) / history.length)
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Detailed insights and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#0F1E35] border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalViews}</div>
              <p className="text-sm text-green-400 flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4" />
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1E35] border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Unique Dramas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{uniqueDramas}</div>
              <p className="text-sm text-cyan-400 flex items-center gap-1 mt-2">
                <BarChart3 className="w-4 h-4" />
                Watched
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1E35] border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Avg Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{avgProgress}%</div>
              <p className="text-sm text-purple-400 flex items-center gap-1 mt-2">
                <Clock className="w-4 h-4" />
                Per video
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">
              Latest watch history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-[#0A1628] border border-cyan-500/10">
                    <img
                      src={item.coverWap}
                      alt={item.bookName}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.bookName}</h4>
                      <p className="text-sm text-gray-400">{item.episodeName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-cyan-400">{item.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No activity data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
