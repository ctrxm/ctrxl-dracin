/**
 * Admin Panel - API Management
 * Manage API sources, view stats, and monitor performance
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, RefreshCw, Database, Activity, Settings,
  CheckCircle, XCircle, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface APISource {
  name: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
}

interface Stats {
  sources: number;
  enabled: number;
  timestamp: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Record<string, APISource>>({});
  const [stats, setStats] = useState<Stats | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev';

  const handleLogin = async () => {
    if (!password) {
      toast.error("Password required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/sources`, {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSources(data);
        setIsAuthenticated(true);
        localStorage.setItem('admin_token', password);
        toast.success("Login successful");
        loadStats(password);
      } else {
        toast.error("Invalid password");
      }
    } catch (error) {
      toast.error("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleClearCache = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/cache/clear`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Cache cleared successfully");
      } else {
        toast.error("Failed to clear cache");
      }
    } catch (error) {
      toast.error("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      handleLogin();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setPassword(token);
      handleLogin();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-width-md"
        >
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">Admin Panel</CardTitle>
              <CardDescription>Enter password to access API management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">API Management & Monitoring</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Total Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.sources || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">API endpoints available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                Enabled Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats?.enabled || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : '-'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">System time</p>
            </CardContent>
          </Card>
        </div>

        {/* API Sources */}
        <Card>
          <CardHeader>
            <CardTitle>API Sources</CardTitle>
            <CardDescription>Manage and monitor API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sources).map(([id, source]) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    {source.enabled ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-xs text-muted-foreground">{source.baseUrl}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={source.enabled ? "default" : "secondary"}>
                      Priority {source.priority}
                    </Badge>
                    <Badge variant={source.enabled ? "default" : "outline"}>
                      {source.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage cache and system operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleClearCache}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear API Cache
            </Button>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-amber-500">Note</div>
                <div className="text-muted-foreground">
                  Source configuration changes require redeployment of the API worker.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
