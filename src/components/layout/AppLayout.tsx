"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi } from '@/api/api';
import { toast } from 'react-hot-toast';
import { useProfile } from '@/components/contexts/ProfileContext';
import UserProfile from '@/components/user/UserProfile';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile } = useProfile();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_key');
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const ProfileAvatar = () => {
    if (profile?.profile_picture) {
      return (
        <div className="relative w-8 h-8">
          <Image 
            src={profile.profile_picture} 
            alt="Profile" 
            className="rounded-full object-cover"
            fill
            sizes="32px"
          />
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-neutral flex items-center justify-center">
        {profile?.username ? (
          <span className="text-sm text-primary font-medium">
            {profile.username.charAt(0).toUpperCase()}
          </span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-base border-b border-neutral">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold primary-text">
                Praxia
              </div>
              
              <div className="hidden md:flex ml-10 space-x-8">
                <Link href="/chats" className="text-text-secondary hover:primary-text transition-colors">
                  Chats
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="relative p-1 rounded-full hover:bg-neutral transition-colors"
              >
                <ProfileAvatar />
              </button>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-md border border-neutral text-text-secondary hover:bg-neutral transition-colors"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base border-t border-neutral">
        <div className="flex justify-around">
          <Link href="/chats" className="flex flex-col items-center py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs text-text-secondary">Chats</span>
          </Link>
          
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex flex-col items-center py-2"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <ProfileAvatar />
            </div>
            <span className="text-xs text-text-secondary">Profile</span>
          </button>
        </div>
      </div>
      
      {/* User profile modal */}
      {showProfileModal && (
        <UserProfile onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default AppLayout;
