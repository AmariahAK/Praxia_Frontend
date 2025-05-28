"use client";

import React, { useState } from 'react';
import { HealthReference } from '@/types/user';
import Image from 'next/image';

interface SourceReferencesProps {
  sources: HealthReference[];
}

const SourceReferences: React.FC<SourceReferencesProps> = ({ sources }) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const getIconPath = (iconName: string) => {
    const cleanIconName = iconName.replace(/\.(svg|png|jpg|jpeg)$/i, '');
    return `/icons/${cleanIconName}.png`; 
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  return (
    <div className="mt-4 border-t border-neutral pt-4">
      <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sources ({sources.length})
      </h4>
      
      <div className="space-y-2">
        {sources.map((source, index) => {
          const hasImageError = imageErrors.has(index);
          const iconPath = hasImageError ? '/icons/source-icon.png' : getIconPath(source.source.icon); // Changed fallback to .png
          
          return (
            <div key={index} className="flex items-start p-3 bg-neutral rounded-lg hover:bg-base transition-colors">
              <div className="flex-shrink-0 mr-3">
                <Image
                  src={iconPath}
                  alt={source.source.name}
                  width={24}
                  height={24}
                  className="rounded"
                  onError={() => handleImageError(index)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <span className="text-xs font-medium text-primary">{source.source.name}</span>
                  {source.date && (
                    <span className="text-xs text-text-secondary ml-2">{source.date}</span>
                  )}
                </div>
                
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span className="text-sm font-medium">{source.title}</span>
                )}
                
                {source.description && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {source.description}
                  </p>
                )}
              </div>
              
              {source.url && (
                <div className="flex-shrink-0 ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SourceReferences;
