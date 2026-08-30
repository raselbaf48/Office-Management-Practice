import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  customLogoUrl?: string | null;
}

export const Logo155UASU: React.FC<LogoProps> = ({
  className = 'h-14 w-14',
  size,
  customLogoUrl,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    if (customLogoUrl) return customLogoUrl;
    const stored = localStorage.getItem('baf_custom_logo');
    return stored || '/app-logo-v2.png';
  });

  useEffect(() => {
    if (customLogoUrl !== undefined && customLogoUrl !== null) {
      setLogoSrc(customLogoUrl);
    } else {
      const stored = localStorage.getItem('baf_custom_logo');
      setLogoSrc(stored || '/app-logo-v2.png');
    }
  }, [customLogoUrl]);

  useEffect(() => {
    const handleLogoUpdated = (e: any) => {
      const newLogo = e?.detail?.logoUrl !== undefined ? e.detail.logoUrl : localStorage.getItem('baf_custom_logo');
      setLogoSrc(newLogo || '/app-logo-v2.png');
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
    if (size === 'sm') return 'h-8 w-8';
    if (size === 'md') return 'h-12 w-12';
    if (size === 'lg') return 'h-20 w-20';
    if (size === 'xl') return 'h-24 w-24';
    return className;
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-visible aspect-square ${getSizeClass()}`}
      style={sizeStyle}
    >
      <img
        src={logoSrc}
        alt="155 UASU BAF Crest"
        className="h-full w-full aspect-square object-contain drop-shadow-md"
        onError={(e) => {
          // Fallback if custom upload fails
          if (logoSrc !== '/app-logo-v2.png') {
            setLogoSrc('/app-logo-v2.png');
          }
        }}
      />
    </div>
  );
};

