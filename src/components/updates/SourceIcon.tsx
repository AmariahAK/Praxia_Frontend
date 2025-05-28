import React from 'react';
import Image from 'next/image';
import { HealthSource } from '@/types/user';

interface SourceIconProps {
  source: HealthSource;
  size?: 'small' | 'medium' | 'large';
}

const SourceIcon: React.FC<SourceIconProps> = ({ source, size = 'small' }) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  };
  
  const pixelSize = sizeMap[size];
  
  const getIconPath = (iconName: string) => {
    const cleanIconName = iconName.replace(/\.(svg|png|jpg|jpeg)$/i, '');
    return `/icons/${cleanIconName}.png`; 
  };
  
  const [iconError, setIconError] = React.useState(false);
  const iconPath = iconError ? '/icons/source-icon.png' : getIconPath(source.icon); 
  
  return (
    <div className="inline-flex items-center" title={source.name}>
      <div className="relative" style={{ width: pixelSize, height: pixelSize }}>
        <Image 
          src={iconPath}
          alt={source.name}
          width={pixelSize}
          height={pixelSize}
          className="rounded-full"
          onError={() => setIconError(true)}
        />
      </div>
      {size !== 'small' && (
        <span className="ml-1 text-xs text-text-secondary">{source.name}</span>
      )}
    </div>
  );
};

export default SourceIcon;
