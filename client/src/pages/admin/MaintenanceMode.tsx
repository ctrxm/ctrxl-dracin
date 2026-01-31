/**
 * Maintenance Mode Manager
 */

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenanceMode() {
  const { settings, updateMaintenanceMode } = useAdminSettings();
  const [formData, setFormData] = useState(settings.maintenanceMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMaintenanceMode(formData);
    toast.success('Maintenance mode settings updated');
  };

  const handleToggle = (enabled: boolean) => {
    const newData = { ...formData, enabled };
    setFormData(newData);
    updateMaintenanceMode(newData);
    toast.success(enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Maintenance Mode</h1>
          <p className="text-gray-400">Control site accessibility during maintenance</p>
        </div>

        {/* Status Card */}
        <Card className={`border-2 ${
          formData.enabled 
            ? 'bg-amber-500/10 border-amber-500/50' 
            : 'bg-green-500/10 border-green-500/50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {formData.enabled ? (
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                )}
                <div>
                  <h3 className={`text-xl font-bold ${
                    formData.enabled ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {formData.enabled ? 'Maintenance Mode Active' : 'Site Operational'}
                  </h3>
                  <p className="text-gray-400">
                    {formData.enabled 
                      ? 'Users will see the maintenance page' 
                      : 'Site is accessible to all users'}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.enabled}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Maintenance Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Customize the maintenance page message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0A1628] border-cyan-500/30 text-white"
                  placeholder="Under Maintenance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-300">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-[#0A1628] border-cyan-500/30 text-white min-h-[120px]"
                  placeholder="We are currently performing scheduled maintenance..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedEnd" className="text-gray-300">
                  Estimated End Time (optional)
                </Label>
                <Input
                  id="estimatedEnd"
                  type="datetime-local"
                  value={formData.estimatedEnd || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedEnd: e.target.value })}
                  className="bg-[#0A1628] border-cyan-500/30 text-white"
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Preview</CardTitle>
            <CardDescription className="text-gray-400">
              How the maintenance page will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0A1628] rounded-lg p-8 text-center border border-cyan-500/20">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{formData.title}</h2>
              <p className="text-gray-400 mb-4 max-w-md mx-auto">{formData.message}</p>
              {formData.estimatedEnd && (
                <p className="text-sm text-cyan-400">
                  Expected to be back: {new Date(formData.estimatedEnd).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        {formData.enabled && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-400 mb-1">Warning</h4>
                  <p className="text-sm text-gray-300">
                    Maintenance mode is currently active. All users will see the maintenance page 
                    and won't be able to access the app. Remember to disable it when maintenance is complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
