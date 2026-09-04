const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldEffect = `  useEffect(() => {
    setAppConfig(getAppConfig());
    const handleConfigChange = (e: any) => setAppConfig(e.detail);
    window.addEventListener('baf_app_config_changed', handleConfigChange);
    return () => window.removeEventListener('baf_app_config_changed', handleConfigChange);
  }, []);`;

const newEffect = `  useEffect(() => {
    // Clear old notices as requested
    if (!localStorage.getItem('baf_cleared_notices_v2')) {
      localStorage.removeItem('baf_app_config');
      localStorage.removeItem('baf_app_config_history');
      localStorage.setItem('baf_cleared_notices_v2', 'true');
    }

    setAppConfig(getAppConfig());
    const handleConfigChange = (e: any) => setAppConfig(e.detail);
    window.addEventListener('baf_app_config_changed', handleConfigChange);
    return () => window.removeEventListener('baf_app_config_changed', handleConfigChange);
  }, []);`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync('src/App.tsx', code);
