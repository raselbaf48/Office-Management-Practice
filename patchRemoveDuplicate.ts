import fs from 'fs';
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const badBlock = `  const handleSaveMaintenance = () => {
    saveAppConfig(appConfig);
    if (appConfig.maintenance.isActive) {
      const history = addAppConfigHistory({
        type: 'MAINTENANCE',
        message: appConfig.maintenance.message,
        startTime: appConfig.maintenance.isScheduled ? appConfig.maintenance.startTime : undefined,
        endTime: appConfig.maintenance.isScheduled ? appConfig.maintenance.endTime : undefined,
        isActive: true
      });
      setAppConfigHistory(history);
    }
  };`;

// replace ONLY the last occurrence or just normal string replace since the first one looks totally different (uses maintDraft).
code = code.replace(badBlock, "");
fs.writeFileSync('src/components/SettingsModal.tsx', code);
