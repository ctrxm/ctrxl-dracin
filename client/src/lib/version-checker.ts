/**
 * Version Checker - Auto-reload on new deployment
 * Checks for new version and prompts user to reload
 */

const APP_VERSION = "1.0.1"; // Increment this on each deployment
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const STORAGE_KEY = "app_version";

export function getCurrentVersion(): string {
  return APP_VERSION;
}

export function getStoredVersion(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredVersion(version: string): void {
  localStorage.setItem(STORAGE_KEY, version);
}

export function isNewVersionAvailable(): boolean {
  const storedVersion = getStoredVersion();
  if (!storedVersion) {
    setStoredVersion(APP_VERSION);
    return false;
  }
  return storedVersion !== APP_VERSION;
}

export function clearOldCache(): void {
  // Clear localStorage cache items (keep user data)
  const keysToKeep = [
    'bookmarks',
    'watchHistory',
    'lastWatched',
    'videoProgress',
    'app_version'
  ];
  
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (!keysToKeep.some(keep => key.includes(keep))) {
      localStorage.removeItem(key);
    }
  });
}

export function handleVersionUpdate(onNewVersion?: () => void): void {
  if (isNewVersionAvailable()) {
    console.log('New version detected:', APP_VERSION);
    clearOldCache();
    setStoredVersion(APP_VERSION);
    
    if (onNewVersion) {
      onNewVersion();
    } else {
      // Show notification and reload
      if (confirm('A new version is available! Reload to update?')) {
        window.location.reload();
      }
    }
  }
}

export function startVersionCheck(onNewVersion?: () => void): () => void {
  // Check immediately on load
  handleVersionUpdate(onNewVersion);
  
  // Then check periodically
  const intervalId = setInterval(() => {
    handleVersionUpdate(onNewVersion);
  }, VERSION_CHECK_INTERVAL);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}
