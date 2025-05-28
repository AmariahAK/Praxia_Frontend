"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/api/api';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import ChatSidebar from '@/components/chats/ChatSidebar';
import ChatHeader from '@/components/chats/ChatHeader';

export default function ChatsPage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    const sessionKey = localStorage.getItem('session_key');
    
    if (!token || !sessionKey) {
      router.push('/auth/login');
      return;
    }
    
    setIsLoading(false);
  }, [router]);

  const handleCreateSession = async () => {
    try {
      setIsCreating(true);
      const session = await chatApi.createSession();
      router.push(`/chats/sessions/${session.id}`);
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to create new chat');
      
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized')
      )) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('session_key');
        router.push('/auth/login');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - hidden on mobile */}
        <div className={`hidden md:block md:w-64 h-full`}>
          <ChatSidebar
            onCreateSession={handleCreateSession}
          />
        </div>
        
        {/* Mobile sidebar */}
        {showSidebar && (
          <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
            <div className="h-full w-64">
              <ChatSidebar
                onCreateSession={handleCreateSession}
                isMobile
                onClose={() => setShowSidebar(false)}
              />
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <ChatHeader
            title="Chats"
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            onTitleUpdated={() => {}}
          />
          
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">Welcome to Praxia Chat</h2>
              <p className="text-text-secondary mb-6">
                Start a new conversation with Praxia, your AI healthcare assistant. 
                Ask about symptoms, get health advice, or discuss medical topics.
              </p>
              <button
                onClick={handleCreateSession}
                disabled={isCreating}
                className="px-6 py-3 bg-primary text-white rounded-md"
              >
                {isCreating ? 'Creating...' : 'Start a New Chat'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
