/**
 * Admin Settings Hook - Supabase Backend
 * Manages app-wide settings with Supabase sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PopupConfig {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  estimatedEnd?: string;
}

export interface AppSettings {
  maintenanceMode: MaintenanceConfig;
  popups: PopupConfig[];
  featuredDramas: string[];
  analytics: {
    totalViews: number;
    totalUsers: number;
    activeUsers: number;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  maintenanceMode: {
    enabled: false,
    title: 'Under Maintenance',
    message: 'We are currently performing scheduled maintenance. Please check back soon!',
  },
  popups: [],
  featuredDramas: [],
  analytics: {
    totalViews: 0,
    totalUsers: 0,
    activeUsers: 0,
  },
};

export function useAdminSettings() {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Fetch settings from Supabase
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;

      // Convert array of key-value pairs to settings object
      const settingsObj: any = { ...DEFAULT_SETTINGS };
      
      data?.forEach((item) => {
        if (item.key === 'maintenance_mode') {
          settingsObj.maintenanceMode = item.value;
        } else if (item.key === 'popups') {
          settingsObj.popups = item.value;
        } else if (item.key === 'featured_dramas') {
          settingsObj.featuredDramas = item.value;
        } else if (item.key === 'analytics') {
          settingsObj.analytics = item.value;
        }
      });

      setSettings(settingsObj);
    } catch (error: any) {
      console.error('Error fetching admin settings:', error);
      // Fallback to default settings
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  // Save settings to Supabase
  const saveSettings = async (key: string, value: any) => {
    if (!isAdmin) {
      toast.error('Only admins can modify settings');
      return false;
    }

    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('admin_settings')
          .update({
            value,
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq('key', key);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('admin_settings')
          .insert({
            key,
            value,
            updated_by: user?.id,
          });

        if (error) throw error;
      }

      // Refresh settings
      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings: ' + error.message);
      return false;
    }
  };

  // Update maintenance mode
  const updateMaintenanceMode = async (config: Partial<MaintenanceConfig>) => {
    const newConfig = { ...settings.maintenanceMode, ...config };
    const success = await saveSettings('maintenance_mode', newConfig);
    
    if (success) {
      setSettings({ ...settings, maintenanceMode: newConfig });
      toast.success('Maintenance mode updated');
    }
  };

  // Add popup
  const addPopup = async (popup: PopupConfig) => {
    const newPopups = [...settings.popups, popup];
    const success = await saveSettings('popups', newPopups);
    
    if (success) {
      setSettings({ ...settings, popups: newPopups });
      toast.success('Popup added');
    }
  };

  // Update popup
  const updatePopup = async (id: string, updates: Partial<PopupConfig>) => {
    const newPopups = settings.popups.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    const success = await saveSettings('popups', newPopups);
    
    if (success) {
      setSettings({ ...settings, popups: newPopups });
    }
  };

  // Delete popup
  const deletePopup = async (id: string) => {
    const newPopups = settings.popups.filter((p) => p.id !== id);
    const success = await saveSettings('popups', newPopups);
    
    if (success) {
      setSettings({ ...settings, popups: newPopups });
      toast.success('Popup deleted');
    }
  };

  // Update analytics
  const updateAnalytics = async (analytics: Partial<AppSettings['analytics']>) => {
    const newAnalytics = { ...settings.analytics, ...analytics };
    const success = await saveSettings('analytics', newAnalytics);
    
    if (success) {
      setSettings({ ...settings, analytics: newAnalytics });
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    fetchSettings();

    // Subscribe to changes
    const subscription = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings',
        },
        () => {
          // Refresh settings when changed
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    settings,
    loading,
    updateMaintenanceMode,
    addPopup,
    updatePopup,
    deletePopup,
    updateAnalytics,
    refreshSettings: fetchSettings,
  };
}
