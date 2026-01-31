/**
 * Admin Login Page
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();
  const { login } = useAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(password)) {
      toast.success('Login successful!');
      setLocation('/admin/dashboard');
    } else {
      toast.error('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1628] via-[#0F1E35] to-[#0A1628] p-4 sm:p-6">
      <Card className="w-full max-w-md border-cyan-500/20 bg-[#0A1628]/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-3 sm:space-y-4">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Admin Access
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-400">
            Enter your password to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#0F1E35] border-cyan-500/30 focus:border-cyan-500 text-white"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 sm:h-10 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 active:from-cyan-700 active:to-purple-800 text-white font-semibold touch-manipulation"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
