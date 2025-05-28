"use client";

import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/user';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import SourceReferences from '@/components/updates/SourceReferences';
import XRayAnalysisView from '@/components/xrays/XRayAnalysisView'; 
import { toast } from 'react-hot-toast';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  
  const isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  // Enhanced formatting of JSON content to readable text
  const formatContent = (content: string) => {
    try {
        const parsed = JSON.parse(content);
        
        if (parsed.diagnosis) {
            let formattedText = '';
            
            if (parsed.medical_topic) {
                formattedText += `**Medical Topic:** ${parsed.medical_topic}\n\n`;
            }
            
            if (typeof parsed.diagnosis.advice === 'string') {
                formattedText += parsed.diagnosis.advice + '\n\n';
            }
            
            // Handle conditions properly - ensure they're strings
            if (parsed.diagnosis.conditions && Array.isArray(parsed.diagnosis.conditions)) {
                if (parsed.diagnosis.conditions.length > 0 && 
                    !parsed.diagnosis.conditions.includes("Unable to analyze symptoms at this time")) {
                    formattedText += '**Potential conditions to consider:**\n';
                    parsed.diagnosis.conditions.forEach((condition: string | Record<string, unknown>) => {
                        // Convert objects to strings if necessary
                        const conditionText = typeof condition === 'object' ? 
                            JSON.stringify(condition) : String(condition);
                        formattedText += `- ${conditionText}\n`;
                    });
                    formattedText += '\n';
                }
            }
            
            // Handle next_steps properly
            if (parsed.diagnosis.next_steps && Array.isArray(parsed.diagnosis.next_steps)) {
                formattedText += '**Recommended next steps:**\n';
                parsed.diagnosis.next_steps.forEach((step: string | Record<string, unknown>) => {
                    const stepText = typeof step === 'object' ? 
                        JSON.stringify(step) : String(step);
                    formattedText += `- ${stepText}\n`;
                });
                formattedText += '\n';
            }
            
            // Handle urgent warnings
            if (parsed.diagnosis.urgent && Array.isArray(parsed.diagnosis.urgent) && parsed.diagnosis.urgent.length > 0) {
                formattedText += '⚠️ **Important:**\n';
                parsed.diagnosis.urgent.forEach((item: string | Record<string, unknown>) => {
                    const itemText = typeof item === 'object' ? 
                        JSON.stringify(item) : String(item);
                    formattedText += `- ${itemText}\n`;
                });
                formattedText += '\n';
            }
            
            // Handle clarification questions
            if (parsed.diagnosis.clarification && Array.isArray(parsed.diagnosis.clarification) && parsed.diagnosis.clarification.length > 0) {
                formattedText += '**I\'d like to clarify:**\n';
                parsed.diagnosis.clarification.forEach((question: string | Record<string, unknown>) => {
                    const questionText = typeof question === 'object' ? 
                        JSON.stringify(question) : String(question);
                    formattedText += `- ${questionText}\n`;
                });
            }
            
            if (parsed.disclaimer) {
                formattedText += `\n_${parsed.disclaimer}_`;
            }
            
            if (parsed.search_queries_used && parsed.search_queries_used.length > 0) {
                formattedText += `\n_Search queries used: ${parsed.search_queries_used.join(', ')}_\n`;
            }
            
            return formattedText || "I'm having trouble processing your request. Could you please try rephrasing your question?";
        }
        
        if (parsed.error) {
            return `I apologize, but I encountered an issue: ${parsed.error}. Please try again.`;
        }
        
        return content;
    } catch {
        return content;
    }
  };

  const getXRayAnalysis = (content: string) => {
    if (isJson(content)) {
      try {
        const parsed = JSON.parse(content);
        
        // If it's a completed X-ray analysis with results
        if (parsed.status === 'completed' && parsed.xray_analysis_result) {
          return {
            id: parsed.xray_analysis_id,
            image_url: parsed.xray_analysis_result.image_url || "",
            analysis_result: JSON.stringify(parsed.xray_analysis_result),
            detected_conditions: parsed.xray_analysis_result.detected_conditions || {},
            confidence_scores: parsed.xray_analysis_result.confidence_scores || {},
            created_at: message.created_at
          };
        }
        
        // Handle error cases where analysis wasn't successful
        if (parsed.error && parsed.message) {
          toast.error(parsed.message);
          return null;
        }
        
        return null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const isProcessingXRay = (content: string) => {
    if (isJson(content)) {
      try {
        const parsed = JSON.parse(content);
        return parsed.status === 'processing' && parsed.xray_analysis_id;
      } catch {
        return false;
      }
    }
    return false;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const xrayAnalysis = getXRayAnalysis(message.content);
  const isProcessing = isProcessingXRay(message.content);

  return (
    <div className={`py-4 ${message.role === 'assistant' ? 'bg-soft-bg' : ''}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-start">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
            message.role === 'assistant' ? 'bg-primary text-white' : 'bg-neutral'
          }`}>
            {message.role === 'assistant' ? 'P' : 'Y'}
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">
                {message.role === 'assistant' ? 'Praxia' : 'You'}
              </span>
              <span className="text-xs text-text-secondary">{formattedDate}</span>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {/* Regular content */}
              <ReactMarkdown
                components={{
                  code({inline, className, children, ...props}: {inline?: boolean; className?: string; children?: React.ReactNode; [key: string]: unknown}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative">
                        <div className="absolute right-2 top-2">
                          <button
                            onClick={copyToClipboard}
                            className="text-xs px-2 py-1 rounded bg-neutral hover:bg-primary hover:text-white transition-colors"
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {formatContent(message.content)}
              </ReactMarkdown>
              
              {/* X-ray analysis processing indicator */}
              {isProcessing && (
                <div className="mt-4 bg-neutral p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="mr-3 w-6 h-6 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                    <p className="text-sm">Processing X-ray image. This may take a minute or two.</p>
                  </div>
                </div>
              )}
              
              {/* X-ray analysis results */}
              {xrayAnalysis && (
                <div className="mt-4">
                  <XRayAnalysisView initialAnalysis={xrayAnalysis} />
                </div>
              )}
              
              {/* Add source references if available */}
              {message.sources && message.sources.length > 0 && (
                <SourceReferences sources={message.sources} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
