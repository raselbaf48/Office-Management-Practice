const fs = require('fs');
let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const handleSaveLogoImpl = `  const handleSaveLogo = () => {
    if (customLogo) {
      localStorage.setItem('baf_custom_logo', customLogo);
      setLogoSuccess('Logo URL updated successfully.');
      window.dispatchEvent(new CustomEvent('baf_logo_updated', { detail: { logoUrl: customLogo } }));
    }
  };
`;

current = current.replace('  const handleResetLogo = () => {', handleSaveLogoImpl + '\n  const handleResetLogo = () => {');

fs.writeFileSync('src/components/SettingsModal.tsx', current);
