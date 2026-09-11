'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserItem } from '@/lib/types';

interface AuthContextType {
  currentUser: UserItem | null;
  users: UserItem[];
  setCurrentUser: (user: UserItem) => void;
  isManager: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  users: [],
  setCurrentUser: () => {},
  isManager: true,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUserState] = useState<UserItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data: UserItem[] = await res.json();
          setUsers(data);

          // Restore saved user or default to Manager (Priya Sharma)
          const savedId = localStorage.getItem('ez_hub_current_user_id');
          const matched = data.find((u) => u.id === savedId);
          if (matched) {
            setCurrentUserState(matched);
          } else {
            const defaultManager = data.find((u) => u.role === 'MANAGER') || data[0];
            setCurrentUserState(defaultManager || null);
          }
        }
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const setCurrentUser = (user: UserItem) => {
    setCurrentUserState(user);
    localStorage.setItem('ez_hub_current_user_id', user.id);
  };

  const isManager = currentUser?.role === 'MANAGER';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        isManager,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
