"use client";

import React, { useState, useEffect } from 'react';
import { XRayAnalysis, isXRayProcessing } from '@/types/user';
import { xrayApi } from '@/api/api';
import { toast } from 'react-hot-toast';

interface XRayAnalysisViewProps {
  initialAnalysis: XRayAnalysis;
}

const XRayAnalysisView: React.FC<XRayAnalysisViewProps> = ({ initialAnalysis }) => {
  const [analysis, setAnalysis] = useState<XRayAnalysis>(initialAnalysis);
  const [polling, setPolling] = useState<boolean>(isXRayProcessing(initialAnalysis));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const pollForResults = async () => {
      if (!polling || !isMounted) return;

      try {
        const result = await xrayApi.getAnalysis(analysis.id);
        
        if (isMounted) {
          setAnalysis(result);
          
          // Check if processing is complete
          if (result.analysis_result !== "Processing...") {
            setPolling(false);
            toast.success("X-ray analysis complete!");
          } else {
            // Continue polling after a delay
            setTimeout(pollForResults, 2000);
          }
        }
      } catch  {
        if (isMounted) {
          setError("Error retrieving analysis results. Please try again later.");
          setPolling(false);
          toast.error("Failed to retrieve analysis results");
        }
      }
    };

    if (polling) {
      pollForResults();
    }

    return () => {
      isMounted = false;
    };
  }, [analysis.id, polling]);

  const formatContent = (content: string) => {
    try {
        // Attempt to parse and format JSON content
        if (content !== "Processing...") {
            const parsed = JSON.parse(content);
            
            // Handle different response formats
            if (typeof parsed === 'string') {
                try {
                    return JSON.parse(parsed);
                } catch {
                    return parsed;
                }
            }
            
            return parsed;
        }
        return content;
    } catch (error) {
        console.error("Error parsing content:", error);
        return content;
    }
  };

  const renderAnalysisResult = () => {
    if (polling) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Processing your X-ray...</p>
          <p className="text-sm text-text-secondary">This may take a minute or two.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      );
    }

    const content = formatContent(analysis.analysis_result);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* X-ray image */}
          <div className="md:w-1/3">
            <div className="bg-black p-1 rounded-lg">
              <img
                src={analysis.image_url}
                alt="X-ray"
                className="w-full h-auto rounded"
              />
            </div>
          </div>

          {/* Analysis results */}
          <div className="md:w-2/3 space-y-4">
            <h2 className="text-xl font-bold">Analysis Results</h2>
            
            {/* Display confidence scores */}
            <div className="bg-neutral p-4 rounded-lg">
              <h3 className="font-medium mb-2">Confidence Scores</h3>
              <div className="space-y-2">
                {Object.entries(analysis.confidence_scores).map(([condition, score]) => (
                  <div key={condition} className="flex items-center">
                    <span className="capitalize w-24">{condition}:</span>
                    <div className="flex-1 bg-base rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full ${
                          score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 w-12 text-right">{score.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Display detected conditions */}
            <div className="bg-neutral p-4 rounded-lg">
              <h3 className="font-medium mb-2">Detected Conditions</h3>
              {Object.keys(analysis.detected_conditions).length > 0 ? (
                <ul className="list-disc list-inside">
                  {Object.entries(analysis.detected_conditions).map(([condition, confidence]) => (
                    <li key={condition} className="capitalize">
                      {condition}: <span className="font-medium">{String(confidence)}</span> confidence
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No specific conditions detected.</p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed analysis */}
        {typeof content === 'object' && content.detailed_analysis && (
          <div className="bg-neutral p-4 rounded-lg">
            <h3 className="font-medium mb-2">Detailed Analysis</h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(content.detailed_analysis, null, 2)}</pre>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm">
          <p><strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">X-Ray Analysis</h1>
      {renderAnalysisResult()}
    </div>
  );
};

export default XRayAnalysisView;
