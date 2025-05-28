"use client";

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ChatInputProps {
  onSendMessage: (message: string, xrayFile?: File) => Promise<void>;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.includes('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setXrayFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-suggest a message about X-ray analysis
      if (message.trim() === '') {
        setMessage("Please analyze this X-ray image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !xrayFile) || isLoading) return;
    
    const messageToSend = message || (xrayFile ? "Please analyze this X-ray image." : "");
    setMessage('');
    
    try {
      
      await onSendMessage(messageToSend, xrayFile || undefined);
      
      // Clear the file input and preview after sending
      setXrayFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeImage = () => {
    setXrayFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t border-neutral bg-base p-4">
      <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
        {/* Image preview area */}
        {preview && (
          <div className="mb-3 p-2 border border-neutral rounded-lg bg-neutral flex items-center">
            <div className="h-16 w-16 bg-black p-1 rounded overflow-hidden mr-2">
              <img 
                src={preview} 
                alt="X-ray preview" 
                className="h-full w-full object-cover" 
              />
            </div>
            <div className="flex-1">
              <p className="text-sm truncate">{xrayFile?.name}</p>
              <p className="text-xs text-text-secondary">
                {(xrayFile?.size && (xrayFile.size / 1024 / 1024).toFixed(2)) || 0} MB
              </p>
            </div>
            <button 
              type="button" 
              onClick={removeImage}
              className="text-text-secondary hover:text-red-500 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={xrayFile ? "Add a message about this X-ray..." : "Type your message here..."}
            className="w-full p-4 pr-28 border border-neutral rounded-lg resize-none bg-base"
            rows={1}
            disabled={isLoading}
          />
          
          {/* Attachment button */}
          <label 
            className={`absolute right-16 bottom-3 p-2 rounded-full cursor-pointer ${
              isLoading ? 'text-text-disabled' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>
          
          {/* Send button */}
          <button
            type="submit"
            disabled={(!message.trim() && !xrayFile) || isLoading}
            className={`absolute right-3 bottom-3 p-2 rounded-full hover:scale-110 transition-transform ${
              (!message.trim() && !xrayFile) || isLoading
                ? 'bg-neutral text-text-secondary'
                : 'bg-primary text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
