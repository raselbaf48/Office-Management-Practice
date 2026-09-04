const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

const targetStr = `  const handleDeleteHistory = (id: string) => {
    const history = deleteAppConfigHistoryItem(id);
    setAppConfigHistory(history);
  };`;

const replacementStr = `  const handleDeleteHistory = (id: string) => {
    const itemToDelete = appConfigHistory.find(item => item.id === id);
    if (itemToDelete) {
      if (itemToDelete.type === 'NOTICE' && appConfig.notice.isActive && appConfig.notice.message === itemToDelete.message) {
         const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false } };
         saveAppConfig(updatedConfig);
         setAppConfig(updatedConfig);
      }
      if (itemToDelete.type === 'MAINTENANCE' && appConfig.maintenance.isActive && appConfig.maintenance.message === itemToDelete.message) {
         const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false } };
         saveAppConfig(updatedConfig);
         setAppConfig(updatedConfig);
      }
    }
    const history = deleteAppConfigHistoryItem(id);
    setAppConfigHistory(history);
  };`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
