"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { profileApi } from '@/api/api';
import { usePathname } from 'next/navigation';

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Skip profile fetch on auth pages
        if (pathname?.startsWith('/auth')) {
          setLoading(false);
          return;
        }

        // Only fetch if we have tokens (user is logged in)
        const token = localStorage.getItem('access_token');
        if (token) {
          const data = await profileApi.getProfile();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Don't show error here as it might be called when user is not logged in
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [pathname]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};
