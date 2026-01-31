/**
 * Pop-up Manager - Create and manage pop-ups
 */

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminSettings, PopupConfig } from '@/hooks/useAdminSettings';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

export default function PopupManager() {
  const { settings, addPopup, updatePopup, deletePopup } = useAdminSettings();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PopupConfig>>({
    title: '',
    message: '',
    type: 'info',
    enabled: true,
    buttonText: 'OK',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId) {
      updatePopup(editingId, formData);
      toast.success('Pop-up updated successfully');
      setEditingId(null);
    } else {
      const newPopup: PopupConfig = {
        id: nanoid(),
        title: formData.title!,
        message: formData.message!,
        type: formData.type || 'info',
        enabled: formData.enabled ?? true,
        buttonText: formData.buttonText || 'OK',
        imageUrl: formData.imageUrl,
        buttonLink: formData.buttonLink,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      addPopup(newPopup);
      toast.success('Pop-up created successfully');
    }

    setFormData({
      title: '',
      message: '',
      type: 'info',
      enabled: true,
      buttonText: 'OK',
    });
    setIsCreating(false);
  };

  const handleEdit = (popup: PopupConfig) => {
    setFormData(popup);
    setEditingId(popup.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this pop-up?')) {
      deletePopup(id);
      toast.success('Pop-up deleted successfully');
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    updatePopup(id, { enabled });
    toast.success(enabled ? 'Pop-up enabled' : 'Pop-up disabled');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pop-up Manager</h1>
            <p className="text-gray-400">Create and manage announcements and notifications</p>
          </div>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Pop-up
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="bg-[#0F1E35] border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">
                {editingId ? 'Edit Pop-up' : 'Create New Pop-up'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fill in the details for your pop-up announcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                      placeholder="Enter pop-up title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="bg-[#0A1628] border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-[#0A1628] border-cyan-500/30 text-white min-h-[100px]"
                    placeholder="Enter pop-up message"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buttonText" className="text-gray-300">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                      placeholder="OK"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonLink" className="text-gray-300">Button Link (optional)</Label>
                    <Input
                      id="buttonLink"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-300">Start Date (optional)</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-gray-300">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label htmlFor="enabled" className="text-gray-300">Enable immediately</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    {editingId ? 'Update Pop-up' : 'Create Pop-up'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                      setFormData({
                        title: '',
                        message: '',
                        type: 'info',
                        enabled: true,
                        buttonText: 'OK',
                      });
                    }}
                    className="border-cyan-500/30 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pop-ups List */}
        <div className="space-y-4">
          {settings.popups.length === 0 ? (
            <Card className="bg-[#0F1E35] border-cyan-500/20">
              <CardContent className="text-center py-12">
                <Plus className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">No pop-ups created yet</p>
                <Button
                  onClick={() => setIsCreating(true)}
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  Create Your First Pop-up
                </Button>
              </CardContent>
            </Card>
          ) : (
            settings.popups.map((popup) => (
              <Card key={popup.id} className="bg-[#0F1E35] border-cyan-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{popup.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          popup.type === 'info' ? 'bg-cyan-500/20 text-cyan-400' :
                          popup.type === 'success' ? 'bg-green-500/20 text-green-400' :
                          popup.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {popup.type}
                        </span>
                        {popup.enabled ? (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <Eye className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-3">{popup.message}</p>
                      {(popup.startDate || popup.endDate) && (
                        <div className="flex gap-4 text-xs text-gray-500">
                          {popup.startDate && <span>Start: {new Date(popup.startDate).toLocaleString()}</span>}
                          {popup.endDate && <span>End: {new Date(popup.endDate).toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={popup.enabled}
                        onCheckedChange={(checked) => handleToggle(popup.id, checked)}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(popup)}
                        className="text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(popup.id)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
