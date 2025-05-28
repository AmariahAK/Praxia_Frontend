"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/api/api';
import { toast } from 'react-hot-toast';

interface ChatHeaderProps {
  sessionId?: number;
  title: string;
  onToggleSidebar: () => void;
  onTitleUpdated: (newTitle: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  sessionId, 
  title, 
  onToggleSidebar,
  onTitleUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSaveTitle = async () => {
    if (!sessionId || !newTitle.trim()) return;
    
    try {
      setIsSaving(true);
      await chatApi.updateSessionTitle(sessionId, newTitle);
      onTitleUpdated(newTitle);
      setIsEditing(false);
      toast.success('Chat title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to update chat title');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setNewTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-base border-b border-neutral p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="mr-4 text-text-secondary hover:text-primary md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {isEditing ? (
          <div className="flex items-center">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border border-neutral rounded px-2 py-1 bg-base"
              autoFocus
            />
            <button
              onClick={handleSaveTitle}
              disabled={isSaving}
              className="ml-2 text-primary"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                setNewTitle(title);
                setIsEditing(false);
              }}
              className="ml-1 text-text-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <h1 className="text-lg font-semibold">{title}</h1>
            {sessionId && (
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 text-text-secondary hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div>
        {sessionId && (
          <button
            onClick={() => router.push('/chats')}
            className="text-text-secondary hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
