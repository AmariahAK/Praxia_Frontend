"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { chatApi, xrayApi } from '@/api/api';
import { ChatSession as ChatSessionType, ChatMessage as ChatMessageType } from '@/types/user';
import { toast } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import ChatSidebar from '@/components/chats/ChatSidebar';
import ChatHeader from '@/components/chats/ChatHeader';
import ChatMessage from '@/components/chats/ChatMessage';
import ChatInput from '@/components/chats/ChatInput';

export default function ChatSessionPage() {
  const { id } = useParams();
  const sessionId = parseInt(id as string);
  
  const [session, setSession] = useState<ChatSessionType | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervals = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Memoize fetchSession with useCallback
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatApi.getSession(sessionId);
      setSession(data);
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching chat session:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
    
    // Cleanup polling intervals on unmount
    const intervals = pollingIntervals.current;
    return () => {
      intervals.forEach(interval => clearInterval(interval));
      intervals.clear();
    };
  }, [sessionId, fetchSession]);

  const startPollingForXrayResults = async (xrayAnalysisId: number, messageId: number) => {
    try {
      // Clear any existing interval for this analysis
      const existingInterval = pollingIntervals.current.get(xrayAnalysisId);
      if (existingInterval) {
        clearInterval(existingInterval);
      }

      let attempts = 0;
      const maxAttempts = 30; // 5 minutes with 10-second intervals
      
      const interval = setInterval(async () => {
        try {
          attempts++;
          
          // Get the latest X-ray analysis
          const analysis = await xrayApi.getAnalysis(xrayAnalysisId);
          
          // Check if analysis is complete
          if (analysis.analysis_result !== "Processing...") {
            // Analysis is complete, update the message
            setMessages(prevMessages => {
              return prevMessages.map(msg => {
                if (msg.id === messageId) {
                  try {
                    const content = JSON.parse(msg.content);
                    const updatedContent = {
                      ...content,
                      status: 'completed',
                      xray_analysis_result: analysis
                    };
                    return {
                      ...msg,
                      content: JSON.stringify(updatedContent)
                    };
                  } catch  {
                    return msg;
                  }
                }
                return msg;
              });
            });
            
            clearInterval(interval);
            pollingIntervals.current.delete(xrayAnalysisId);
            toast.success("X-ray analysis complete!");
          } else if (attempts >= maxAttempts) {
            // Timeout reached
            clearInterval(interval);
            pollingIntervals.current.delete(xrayAnalysisId);
            toast.error("X-ray analysis is taking longer than expected. Please check back later.");
          }
        } catch (error) {
          console.error('Error polling for X-ray results:', error);
          attempts++;
          
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            pollingIntervals.current.delete(xrayAnalysisId);
            toast.error("Error checking X-ray analysis status.");
          }
        }
      }, 10000); // Poll every 10 seconds
      
      pollingIntervals.current.set(xrayAnalysisId, interval);
    } catch (error) {
      console.error('Error starting X-ray polling:', error);
    }
  };

  const handleSendMessage = async (content: string, xrayFile?: File) => {
    try {
      setSending(true);
      
      const tempThinkingMessage: ChatMessageType = {
        id: Date.now(), // temporary ID
        role: 'assistant',
        content: xrayFile ? 'Processing X-ray image...' : 'Analyzing your message...',
        created_at: new Date().toISOString()
      };
      
      const tempUserMessage: ChatMessageType = {
        id: Date.now() + 1,
        role: 'user', 
        content: content,
        created_at: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, tempUserMessage, tempThinkingMessage]);
      
      const response = await chatApi.sendMessage(sessionId, content, xrayFile);
      
      // Replace the temporary messages with real ones
      setMessages(prevMessages => {
        const withoutTemp = prevMessages.slice(0, -2); 
        return [
          ...withoutTemp,
          response.user_message,
          response.ai_message
        ];
      });
      
      // Check if this is an X-ray analysis that needs polling
      if (xrayFile && response.ai_message.content) {
        try {
          const contentObj = JSON.parse(response.ai_message.content);
          if (contentObj.status === 'processing' && contentObj.xray_analysis_id) {
            startPollingForXrayResults(contentObj.xray_analysis_id, response.ai_message.id);
          }
        } catch (error) {
          console.error('Error parsing message content:', error);
        }
      }
    } catch (error) {
      // Remove any temporary messages on error
      setMessages(prevMessages => {
        if (prevMessages.length >= 2 && 
            prevMessages[prevMessages.length - 1].content.includes('Processing') ||
            prevMessages[prevMessages.length - 1].content.includes('Analyzing')) {
          return prevMessages.slice(0, -2);
        }
        return prevMessages;
      });
      
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const newSession = await chatApi.createSession();
      window.location.href = `/chats/sessions/${newSession.id}`;
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
        window.location.href = '/auth/login';
      }
    }
  };

  const handleTitleUpdate = (newTitle: string) => {
    if (session) {
      setSession({
        ...session,
        title: newTitle
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block md:w-64 h-full">
          <ChatSidebar
            activeSessionId={sessionId}
            onCreateSession={handleCreateSession}
          />
        </div>
        
        {/* Mobile sidebar */}
        {showSidebar && (
          <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
            <div className="h-full w-64">
              <ChatSidebar
                activeSessionId={sessionId}
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
            sessionId={sessionId}
            title={session?.title || 'Loading...'}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            onTitleUpdated={handleTitleUpdate}
          />
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-text-secondary">Loading your conversation...</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                      <h2 className="text-xl font-bold mb-2">Start a conversation with Praxia</h2>
                      <p className="text-text-secondary mb-4">
                        Ask about symptoms, get health advice, or discuss medical topics. 
                        You can also upload X-ray images for analysis.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              <ChatInput onSendMessage={handleSendMessage} isLoading={sending} />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
