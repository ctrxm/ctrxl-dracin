/**
 * Ad Manager - Create and manage advertisements
 * Supports HTML code, images, and text ads
 */

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminSettings, AdConfig } from '@/hooks/useAdminSettings';
import { Plus, Edit, Trash2, Eye, EyeOff, Code, Image as ImageIcon, Type } from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const AD_PAGES = [
  { value: 'home', label: 'Homepage' },
  { value: 'detail', label: 'Drama Detail' },
  { value: 'watch', label: 'Watch Page' },
  { value: 'browse', label: 'Browse' },
  { value: 'bookmarks', label: 'Bookmarks' },
];

export default function AdManager() {
  const { settings, addAd, updateAd, deleteAd } = useAdminSettings();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdConfig>>({
    name: '',
    type: 'image',
    placement: 'top',
    enabled: true,
    priority: 1,
    pages: ['home'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter ad name');
      return;
    }

    // Validate based on type
    if (formData.type === 'html' && !formData.htmlCode) {
      toast.error('Please enter HTML code');
      return;
    }

    if (formData.type === 'image' && !formData.imageUrl) {
      toast.error('Please enter image URL');
      return;
    }

    if (formData.type === 'text' && !formData.textContent) {
      toast.error('Please enter text content');
      return;
    }

    if (editingId) {
      updateAd(editingId, formData);
      toast.success('Ad updated successfully');
      setEditingId(null);
    } else {
      const newAd: AdConfig = {
        id: nanoid(),
        name: formData.name!,
        type: formData.type || 'image',
        placement: formData.placement || 'top',
        enabled: formData.enabled ?? true,
        priority: formData.priority || 1,
        htmlCode: formData.htmlCode,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        textContent: formData.textContent,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pages: formData.pages || ['home'],
      };
      addAd(newAd);
      toast.success('Ad created successfully');
    }

    setFormData({
      name: '',
      type: 'image',
      placement: 'top',
      enabled: true,
      priority: 1,
      pages: ['home'],
    });
    setIsCreating(false);
  };

  const handleEdit = (ad: AdConfig) => {
    setFormData(ad);
    setEditingId(ad.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteAd(id);
      toast.success('Ad deleted successfully');
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    updateAd(id, { enabled });
    toast.success(enabled ? 'Ad enabled' : 'Ad disabled');
  };

  const handlePageToggle = (page: string, checked: boolean) => {
    const currentPages = formData.pages || [];
    const newPages = checked
      ? [...currentPages, page]
      : currentPages.filter((p) => p !== page);
    setFormData({ ...formData, pages: newPages });
  };

  const getTypeIcon = (type: AdConfig['type']) => {
    switch (type) {
      case 'html':
        return <Code className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Ad Manager</h1>
            <p className="text-sm sm:text-base text-gray-400">
              Manage advertisements across your site
            </p>
          </div>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 active:from-cyan-700 active:to-purple-800 touch-manipulation"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ad
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="bg-[#0F1E35] border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">
                {editingId ? 'Edit Ad' : 'Create New Ad'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure your advertisement settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Ad Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                      placeholder="e.g., Homepage Top Banner"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300">
                      Ad Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="bg-[#0A1628] border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML/Script (AdSense, etc)</SelectItem>
                        <SelectItem value="image">Image Banner</SelectItem>
                        <SelectItem value="text">Text Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ad Content based on type */}
                {formData.type === 'html' && (
                  <div className="space-y-2">
                    <Label htmlFor="htmlCode" className="text-gray-300">
                      HTML Code *
                    </Label>
                    <Textarea
                      id="htmlCode"
                      value={formData.htmlCode}
                      onChange={(e) => setFormData({ ...formData, htmlCode: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white font-mono text-sm min-h-[150px]"
                      placeholder="<script>...</script> or <ins>...</ins>"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Paste your Google AdSense code or custom HTML here
                    </p>
                  </div>
                )}

                {formData.type === 'image' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-gray-300">
                        Image URL *
                      </Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="bg-[#0A1628] border-cyan-500/30 text-white"
                        placeholder="https://... or /banner.png"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkUrl" className="text-gray-300">
                        Link URL (optional)
                      </Label>
                      <Input
                        id="linkUrl"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                        className="bg-[#0A1628] border-cyan-500/30 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'text' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="textContent" className="text-gray-300">
                        Text Content *
                      </Label>
                      <Textarea
                        id="textContent"
                        value={formData.textContent}
                        onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                        className="bg-[#0A1628] border-cyan-500/30 text-white min-h-[100px]"
                        placeholder="Your ad text here..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkUrl" className="text-gray-300">
                        Link URL (optional)
                      </Label>
                      <Input
                        id="linkUrl"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                        className="bg-[#0A1628] border-cyan-500/30 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}

                {/* Placement & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="placement" className="text-gray-300">
                      Placement
                    </Label>
                    <Select
                      value={formData.placement}
                      onValueChange={(value: any) => setFormData({ ...formData, placement: value })}
                    >
                      <SelectTrigger className="bg-[#0A1628] border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top Banner</SelectItem>
                        <SelectItem value="bottom">Bottom Banner</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="inline">Inline (Random)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-gray-300">
                      Priority (1-10)
                    </Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                      }
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                    />
                    <p className="text-xs text-gray-500">Higher priority shows first</p>
                  </div>
                </div>

                {/* Pages Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Show on Pages</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AD_PAGES.map((page) => (
                      <div key={page.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`page-${page.value}`}
                          checked={formData.pages?.includes(page.value)}
                          onCheckedChange={(checked) =>
                            handlePageToggle(page.value, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`page-${page.value}`}
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {page.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-300">
                      Start Date (optional)
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-gray-300">
                      End Date (optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-[#0A1628] border-cyan-500/30 text-white"
                    />
                  </div>
                </div>

                {/* Enable Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label htmlFor="enabled" className="text-gray-300">
                    Enable immediately
                  </Label>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 active:from-cyan-700 active:to-purple-800 touch-manipulation"
                  >
                    {editingId ? 'Update Ad' : 'Create Ad'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                      setFormData({
                        name: '',
                        type: 'image',
                        placement: 'top',
                        enabled: true,
                        priority: 1,
                        pages: ['home'],
                      });
                    }}
                    className="w-full sm:w-auto border-cyan-500/30 text-white hover:bg-white/5 active:bg-white/10 touch-manipulation"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Ads List */}
        <Card className="bg-[#0F1E35] border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Active Ads</CardTitle>
            <CardDescription className="text-gray-400">
              {settings.ads.length} ad{settings.ads.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings.ads.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No ads created yet. Click "New Ad" to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {settings.ads
                  .sort((a, b) => b.priority - a.priority)
                  .map((ad) => (
                    <div
                      key={ad.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-[#0A1628] border border-cyan-500/10"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(ad.type)}
                          <h3 className="text-white font-semibold">{ad.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                            {ad.placement}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                            Priority: {ad.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {ad.type === 'html' && 'HTML/Script Ad'}
                          {ad.type === 'image' && `Image: ${ad.imageUrl}`}
                          {ad.type === 'text' && ad.textContent}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pages: {ad.pages?.join(', ') || 'All'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggle(ad.id, !ad.enabled)}
                          className="text-gray-400 hover:text-white"
                        >
                          {ad.enabled ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(ad)}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
