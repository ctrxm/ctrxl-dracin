/**
 * CTRXL DRACIN - Main App
 * Design: Neo-Noir Cinema
 * 
 * A premium Chinese Drama streaming platform with cinematic UI
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DramaDetail from "./pages/DramaDetail";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import Bookmarks from "./pages/Bookmarks";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import PopupManager from "./pages/admin/PopupManager";
import MaintenanceMode from "./pages/admin/MaintenanceMode";
import Analytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";

import BottomNav from "./components/BottomNav";
import MaintenanceGuard from "./components/MaintenanceGuard";
import PopupDisplay from "./components/PopupDisplay";
import { AdminProvider } from "./contexts/AdminContext";
import { useEffect } from "react";
import { startVersionCheck } from "./lib/version-checker";
import { toast } from "sonner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/drama/:source/:id" component={DramaDetail} />
      <Route path="/watch/:source/:id/:episode?" component={Watch} />
      <Route path="/search" component={Search} />
      <Route path="/bookmarks" component={Bookmarks} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/popups" component={PopupManager} />
      <Route path="/admin/maintenance" component={MaintenanceMode} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/settings" component={AdminSettings} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Version checking for cache busting
  useEffect(() => {
    const cleanup = startVersionCheck(() => {
      toast.info("New version available!", {
        description: "Reloading to get the latest updates...",
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    });
    
    return cleanup;
  }, []);

  return (
    <ErrorBoundary>
      <AdminProvider>
        <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(0.12 0.005 285 / 0.95)",
                border: "1px solid oklch(0.2 0.005 285)",
                color: "oklch(0.97 0.005 285)",
                backdropFilter: "blur(20px)",
              },
            }}
          />
          <MaintenanceGuard>
            <div className="min-h-screen bg-background film-grain">
              <Router />
              <BottomNav />
            </div>
          </MaintenanceGuard>
          <PopupDisplay />
        </TooltipProvider>
        </ThemeProvider>
      </AdminProvider>
    </ErrorBoundary>
  );
}

export default App;
