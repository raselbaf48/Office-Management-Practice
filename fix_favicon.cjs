const fs = require('fs');
let code = fs.readFileSync('src/components/Logo155UASU.tsx', 'utf8');

const effectBlock = `  useEffect(() => {
    const handleLogoUpdated = (e: any) => {
      const newLogo = e?.detail?.logoUrl !== undefined ? e.detail.logoUrl : localStorage.getItem('baf_custom_logo');
      setLogoSrc(newLogo || '/new-logo.png');
    };
    window.addEventListener('baf_logo_updated', handleLogoUpdated);
    return () => window.removeEventListener('baf_logo_updated', handleLogoUpdated);
  }, []);`;

const newEffectBlock = `  useEffect(() => {
    const updateFavicon = (url: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
    };

    // Update initially
    const stored = localStorage.getItem('baf_custom_logo');
    updateFavicon(stored || '/new-logo.png');

    const handleLogoUpdated = (e: any) => {
      const newLogo = e?.detail?.logoUrl !== undefined ? e.detail.logoUrl : localStorage.getItem('baf_custom_logo');
      const finalLogo = newLogo || '/new-logo.png';
      setLogoSrc(finalLogo);
      updateFavicon(finalLogo);
    };

    window.addEventListener('baf_logo_updated', handleLogoUpdated);
    return () => window.removeEventListener('baf_logo_updated', handleLogoUpdated);
  }, []);`;

code = code.replace(effectBlock, newEffectBlock);
fs.writeFileSync('src/components/Logo155UASU.tsx', code);
