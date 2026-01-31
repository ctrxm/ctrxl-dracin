/**
 * Settings Page - General app settings
 */

import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Database, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cache? This will not affect user data.')) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      toast.success('Cache cleared successfully');
    }
  };

  const handleExportData = () => {
    const data = {
      settings: localStorage.getItem('admin_settings'),
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
      localStorage.removeItem('admin_settings');
      toast.success('Settings reset successfully');
      window.location.reload();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage app configuration and data</p>
        </div>

        {/* Cache Management */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Cache Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Clear cached data to free up space
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#0A1628] border border-cyan-500/10">
              <div>
                <h4 className="text-white font-medium">Clear Application Cache</h4>
                <p className="text-sm text-gray-400">Remove all cached files and data</p>
              </div>
              <Button
                onClick={handleClearCache}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Export or reset your settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#0A1628] border border-cyan-500/10">
              <div>
                <h4 className="text-white font-medium">Export Settings</h4>
                <p className="text-sm text-gray-400">Download all settings as JSON</p>
              </div>
              <Button
                onClick={handleExportData}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div>
                <h4 className="text-white font-medium">Reset All Settings</h4>
                <p className="text-sm text-gray-400">Restore default configuration</p>
              </div>
              <Button
                onClick={handleResetSettings}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">System Information</CardTitle>
            <CardDescription className="text-gray-400">
              Current app version and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">App Version</span>
              <span className="text-white font-mono">1.0.1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Environment</span>
              <span className="text-white font-mono">Production</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Last Updated</span>
              <span className="text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
