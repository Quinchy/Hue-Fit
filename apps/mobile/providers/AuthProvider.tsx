// src/providers/AuthProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: boolean | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<boolean | null>(null); // Replace with actual user data in a real app

  const login = () => setUser(true); // Replace with actual login logic
  const logout = () => setUser(null); // Replace with actual logout logic

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
