'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
} | null;

interface AdminAuthContextType {
  adminUser: AdminUser;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false));
  }, []);

  // Login function
  async function login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setAdminUser(data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  // Logout function
  async function logout(): Promise<void> {
    try {
      await fetch('/api/admin-logout');
      setAdminUser(null);
      router.push('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Check authentication status
  async function checkAuth(): Promise<boolean> {
    try {
      const response = await fetch('/api/admin-auth');
      const data = await response.json();

      if (data.authenticated) {
        setAdminUser(data.user);
        return true;
      } else {
        setAdminUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAdminUser(null);
      return false;
    }
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, isLoading, login, logout, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
