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

import BottomNav from "./components/BottomNav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/drama/:source/:id" component={DramaDetail} />
      <Route path="/watch/:id/:episode?" component={Watch} />
      <Route path="/search" component={Search} />
      <Route path="/bookmarks" component={Bookmarks} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
          <div className="min-h-screen bg-background film-grain">
            <Router />
            <BottomNav />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
