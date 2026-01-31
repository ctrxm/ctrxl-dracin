/**
 * Admin Settings Hook - Manage app-wide settings
 */

import { useState, useEffect } from 'react';

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
  featuredDramas: string[]; // Drama IDs
  analytics: {
    totalViews: number;
    totalUsers: number;
    activeUsers: number;
  };
}

const SETTINGS_KEY = 'admin_settings';

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
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse admin settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const updateMaintenanceMode = (config: Partial<MaintenanceConfig>) => {
    const newSettings = {
      ...settings,
      maintenanceMode: { ...settings.maintenanceMode, ...config },
    };
    saveSettings(newSettings);
  };

  const addPopup = (popup: PopupConfig) => {
    const newSettings = {
      ...settings,
      popups: [...settings.popups, popup],
    };
    saveSettings(newSettings);
  };

  const updatePopup = (id: string, updates: Partial<PopupConfig>) => {
    const newSettings = {
      ...settings,
      popups: settings.popups.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    };
    saveSettings(newSettings);
  };

  const deletePopup = (id: string) => {
    const newSettings = {
      ...settings,
      popups: settings.popups.filter((p) => p.id !== id),
    };
    saveSettings(newSettings);
  };

  const updateAnalytics = (analytics: Partial<AppSettings['analytics']>) => {
    const newSettings = {
      ...settings,
      analytics: { ...settings.analytics, ...analytics },
    };
    saveSettings(newSettings);
  };

  return {
    settings,
    updateMaintenanceMode,
    addPopup,
    updatePopup,
    deletePopup,
    updateAnalytics,
    saveSettings,
  };
}
