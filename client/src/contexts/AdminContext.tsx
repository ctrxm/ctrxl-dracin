/**
 * Admin Context - Authentication and Authorization
 * Now uses Supabase AuthContext for role-based access
 */

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, profile, signIn, signOut } = useAuth();

  const isAdmin = profile?.role === 'admin';
  const isAuthenticated = !!user && isAdmin;

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await signIn(email, password);
    if (error) return false;
    
    // Check if user is admin after login
    // Profile will be fetched automatically by AuthContext
    return true;
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
