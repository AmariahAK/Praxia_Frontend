"use client";

import { useState, useEffect } from 'react';
import { authApi } from '@/api/api';
import { UserSession } from '@/types/user';
import { toast } from 'react-hot-toast';

interface SessionManagerProps {
  onClose: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await authApi.getSessions();
      setSessions(response.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (sessionKey: string) => {
    try {
      await authApi.terminateSession(sessionKey);
      toast.success('Session terminated successfully');
      loadSessions(); // Reload sessions
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return '📱';
    if (userAgent.includes('Tablet')) return '📱';
    return '💻';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Active Sessions</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-4 text-text-secondary">No active sessions</div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.session_key}
                className={`border rounded-lg p-4 ${
                  session.is_current ? 'border-primary bg-primary/10' : 'border-neutral'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getDeviceIcon(session.user_agent)}</span>
                      <span className="font-medium">
                        {session.is_current ? 'Current Session' : 'Other Device'}
                      </span>
                    </div>
                    <div className="text-sm text-text-secondary space-y-1">
                      <div>IP: {session.ip_address}</div>
                      <div>Created: {formatDate(session.created_at)}</div>
                      <div>Last Activity: {formatDate(session.last_activity)}</div>
                      {session.device_info && (
                        <div>Device: {session.device_info}</div>
                      )}
                    </div>
                  </div>
                  {!session.is_current && (
                    <button
                      onClick={() => terminateSession(session.session_key)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Terminate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManager;
