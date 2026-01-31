/**
 * Popup Display - Show active popups to users
 * Handles popup scheduling, display logic, and user dismissal
 */

import { useEffect, useState } from 'react';
import { useAdminSettings, PopupConfig } from '@/hooks/useAdminSettings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const DISMISSED_POPUPS_KEY = 'dismissed_popups';

export default function PopupDisplay() {
  const { settings } = useAdminSettings();
  const [currentPopup, setCurrentPopup] = useState<PopupConfig | null>(null);
  const [dismissedPopups, setDismissedPopups] = useState<string[]>([]);

  // Load dismissed popups from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_POPUPS_KEY);
    if (stored) {
      try {
        setDismissedPopups(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse dismissed popups:', error);
      }
    }
  }, []);

  // Check for active popups
  useEffect(() => {
    const checkPopups = () => {
      const now = new Date();
      
      // Find the first active popup that hasn't been dismissed
      const activePopup = settings.popups.find((popup) => {
        // Check if popup is enabled
        if (!popup.enabled) return false;
        
        // Check if popup has been dismissed
        if (dismissedPopups.includes(popup.id)) return false;
        
        // Check start date
        if (popup.startDate) {
          const startDate = new Date(popup.startDate);
          if (now < startDate) return false;
        }
        
        // Check end date
        if (popup.endDate) {
          const endDate = new Date(popup.endDate);
          if (now > endDate) return false;
        }
        
        return true;
      });
      
      if (activePopup && !currentPopup) {
        setCurrentPopup(activePopup);
      }
    };
    
    checkPopups();
    
    // Check every minute for scheduled popups
    const interval = setInterval(checkPopups, 60000);
    
    return () => clearInterval(interval);
  }, [settings.popups, dismissedPopups, currentPopup]);

  const handleDismiss = () => {
    if (currentPopup) {
      // Add to dismissed list
      const newDismissed = [...dismissedPopups, currentPopup.id];
      setDismissedPopups(newDismissed);
      localStorage.setItem(DISMISSED_POPUPS_KEY, JSON.stringify(newDismissed));
      
      // Close popup
      setCurrentPopup(null);
    }
  };

  const handleButtonClick = () => {
    if (currentPopup?.buttonLink) {
      window.open(currentPopup.buttonLink, '_blank');
    }
    handleDismiss();
  };

  // Get icon based on popup type
  const getIcon = (type: PopupConfig['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-6 h-6 text-cyan-400" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Info className="w-6 h-6 text-cyan-400" />;
    }
  };

  // Get color scheme based on popup type
  const getColorScheme = (type: PopupConfig['type']) => {
    switch (type) {
      case 'info':
        return 'from-cyan-500 to-blue-600';
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'warning':
        return 'from-amber-500 to-orange-600';
      case 'error':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-cyan-500 to-blue-600';
    }
  };

  if (!currentPopup) return null;

  return (
    <Dialog open={!!currentPopup} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="bg-[#0F1E35] border-cyan-500/30 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColorScheme(currentPopup.type)} bg-opacity-20 flex items-center justify-center`}>
              {getIcon(currentPopup.type)}
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {currentPopup.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
            {currentPopup.message}
          </DialogDescription>
        </DialogHeader>

        {/* Optional Image */}
        {currentPopup.imageUrl && (
          <div className="my-4">
            <img
              src={currentPopup.imageUrl}
              alt={currentPopup.title}
              className="w-full rounded-lg border border-cyan-500/20"
            />
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleButtonClick}
            className={`w-full bg-gradient-to-r ${getColorScheme(currentPopup.type)} hover:opacity-90 transition-opacity`}
          >
            {currentPopup.buttonText || 'OK'}
          </Button>
          {currentPopup.buttonLink && (
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full border-cyan-500/30 text-white hover:bg-white/5"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
