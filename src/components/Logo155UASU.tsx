import React, { useState, useEffect } from 'react';
import officialCrestImg from '../assets/images/155_uasu_official_crest.png';

interface LogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  customLogoUrl?: string | null;
}

export const Logo155UASU: React.FC<LogoProps> = ({
  className = 'w-12 h-14',
  size,
  customLogoUrl,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    if (customLogoUrl) return customLogoUrl;
    const stored = localStorage.getItem('baf_custom_logo');
    return stored || officialCrestImg;
  });

  useEffect(() => {
    if (customLogoUrl !== undefined && customLogoUrl !== null) {
      setLogoSrc(customLogoUrl);
    } else {
      const stored = localStorage.getItem('baf_custom_logo');
      setLogoSrc(stored || officialCrestImg);
    }
  }, [customLogoUrl]);

  useEffect(() => {
    const handleLogoUpdated = (e: any) => {
      const newLogo = e?.detail?.logoUrl !== undefined ? e.detail.logoUrl : localStorage.getItem('baf_custom_logo');
      setLogoSrc(newLogo || officialCrestImg);
    };

    window.addEventListener('baf_logo_updated', handleLogoUpdated);
    return () => window.removeEventListener('baf_logo_updated', handleLogoUpdated);
  }, []);

  let sizeStyle: React.CSSProperties = {};

  if (typeof size === 'number') {
    sizeStyle = { width: size, height: size };
  }

  const getSizeClass = () => {
    if (typeof size === 'number') return '';
    if (size === 'sm') return 'w-8 h-8';
    if (size === 'md') return 'w-12 h-12';
    if (size === 'lg') return 'w-18 h-18';
    if (size === 'xl') return 'w-24 h-24';
    return className;
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-visible ${getSizeClass()}`}
      style={sizeStyle}
    >
      <img
        src={logoSrc}
        alt="155 UASU BAF Crest"
        className="w-full h-full object-contain drop-shadow-md"
        onError={(e) => {
          // Fallback if custom upload fails
          if (logoSrc !== officialCrestImg) {
            setLogoSrc(officialCrestImg);
          }
        }}
      />
    </div>
  );
};

