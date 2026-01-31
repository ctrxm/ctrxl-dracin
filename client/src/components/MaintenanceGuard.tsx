/**
 * Maintenance Guard - Check if maintenance mode is active
 * If active, show maintenance page to regular users
 * Admin routes are always accessible
 */

import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useLocation } from 'wouter';
import Maintenance from '@/pages/Maintenance';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { settings } = useAdminSettings();
  const [location] = useLocation();
  
  // Check if current route is an admin route
  const isAdminRoute = location.startsWith('/admin');
  
  // If maintenance mode is enabled and not on admin route, show maintenance page
  if (settings.maintenanceMode.enabled && !isAdminRoute) {
    return <Maintenance />;
  }
  
  // Otherwise, render the app normally
  return <>{children}</>;
}
