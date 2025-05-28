"use client";

import { useState, useEffect } from 'react';
import { chatApi } from '@/api/api';
import { ChatSessionList } from '@/types/user';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ChatSidebarProps {
  activeSessionId?: number;
  onCreateSession: () => Promise<void>;
  isMobile?: boolean;
  onClose?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  activeSessionId, 
  onCreateSession, 
  isMobile = false,
  onClose 
}) => {
  const [sessions, setSessions] = useState<ChatSessionList[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTitle = (session: ChatSessionList) => {
    setEditingSessionId(session.id);
    setNewTitle(session.title);
  };

  const handleSaveTitle = async (sessionId: number) => {
    try {
      await chatApi.updateSessionTitle(sessionId, newTitle);
      setSessions(sessions.map(session => 
        session.id === sessionId ? { ...session, title: newTitle } : session
      ));
      setEditingSessionId(null);
      toast.success('Chat title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to update chat title');
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      await chatApi.deleteSession(sessionId);
      setSessions(sessions.filter(session => session.id !== sessionId));
      
      if (sessionId === activeSessionId) {
        router.push('/chats');
      }
      
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast.error('Failed to delete chat');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Add message preview handling for better sidebar clarity
  const formatPreview = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      // If it's a diagnosis response
      if (parsed.diagnosis && parsed.diagnosis.advice) {
        return parsed.diagnosis.advice.slice(0, 40) + '...';
      }
      // If it's a message response
      if (parsed.message) {
        return parsed.message.slice(0, 40) + '...';
      }
      // If it's an X-ray analysis
      if (parsed.status === 'processing') {
        return 'Processing X-ray...';
      }
      if (parsed.status === 'completed') {
        return 'X-ray analysis complete';
      }
      // Default case - show first 40 chars
      return content.slice(0, 40) + '...';
    } catch {
      // If not JSON, just show the first 40 chars
      return content.slice(0, 40) + (content.length > 40 ? '...' : '');
    }
  };

  return (
    <div className={`bg-base border-r border-neutral h-full flex flex-col ${isMobile ? 'w-full' : 'w-64'}`}>
      <div className="p-4 border-b border-neutral flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Chats</h2>
        {isMobile && (
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-4">
        <button
          onClick={onCreateSession}
          className="w-full py-2 px-4 bg-primary text-white rounded-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-6 text-text-secondary">
            <p>No chats yet</p>
            <p className="text-sm mt-2">Start a new conversation with Praxia</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral">
            {sessions.map(session => (
              <li key={session.id} className={`hover:bg-neutral transition-colors ${activeSessionId === session.id ? 'bg-neutral' : ''}`}>
                {editingSessionId === session.id ? (
                  <div className="p-3 flex items-center">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-1 p-1 border border-neutral rounded bg-base"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveTitle(session.id)}
                      className="ml-2 text-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingSessionId(null)}
                      className="ml-1 text-text-secondary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <Link 
                    href={`/chats/sessions/${session.id}`}
                    className="block p-3"
                    onClick={isMobile && onClose ? onClose : undefined}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{session.title}</h3>
                        <p className="text-xs text-text-secondary mt-1 truncate">
                          {session.last_message ? (
                            session.last_message.role === 'user' ? 'You: ' : 'Praxia: '
                          ) : ''}
                          {session.last_message?.content ? formatPreview(session.last_message.content) : 'No messages yet'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className="text-xs text-text-secondary">{formatDate(session.updated_at)}</span>
                        <div className="flex mt-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditTitle(session);
                            }}
                            className="text-text-secondary hover:text-primary"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                                                        onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="ml-2 text-text-secondary hover:text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
