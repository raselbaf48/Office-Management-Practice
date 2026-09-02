import fs from 'fs';
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const oldStateCode = `  const [appConfig, setAppConfig] = useState<AppConfig>(getAppConfig());
  const [appConfigHistory, setAppConfigHistory] = useState<AppConfigHistoryItem[]>([]);
  
  useEffect(() => {
    setAppConfigHistory(getAppConfigHistory());
  }, []);
  
  const handleSaveNotice = () => {
    saveAppConfig(appConfig);
    if (appConfig.notice.isActive) {
      const history = addAppConfigHistory({
        type: 'NOTICE',
        message: appConfig.notice.message,
        startTime: appConfig.notice.isScheduled ? appConfig.notice.startTime : undefined,
        endTime: appConfig.notice.isScheduled ? appConfig.notice.endTime : undefined,
        isActive: true
      });
      setAppConfigHistory(history);
    }
  };
  
  const handleSaveMaintenance = () => {
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

const newStateCode = `  const [appConfig, setAppConfig] = useState<AppConfig>(getAppConfig());
  const [appConfigHistory, setAppConfigHistory] = useState<AppConfigHistoryItem[]>([]);
  
  // Draft states for forms
  const formatDateForInput = (date: Date) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };
  
  const [noticeDraft, setNoticeDraft] = useState({
    message: '',
    isScheduled: false,
    startTime: formatDateForInput(new Date()),
    endTime: ''
  });
  
  const [maintDraft, setMaintDraft] = useState({
    message: '',
    isScheduled: false,
    startTime: formatDateForInput(new Date()),
    endTime: ''
  });
  
  useEffect(() => {
    setAppConfigHistory(getAppConfigHistory());
  }, []);
  
  const applyTimePreset = (setter: any, currentDraft: any, minutes: number) => {
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60000);
    setter({
      ...currentDraft,
      isScheduled: true,
      startTime: formatDateForInput(start),
      endTime: formatDateForInput(end)
    });
  };
  
  const handleSaveNotice = () => {
    const updatedConfig = {
      ...appConfig,
      notice: {
        isActive: true,
        message: noticeDraft.message,
        isScheduled: noticeDraft.isScheduled,
        startTime: noticeDraft.isScheduled ? noticeDraft.startTime : undefined,
        endTime: noticeDraft.isScheduled ? noticeDraft.endTime : undefined,
      }
    };
    saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    
    const history = addAppConfigHistory({
      type: 'NOTICE',
      message: noticeDraft.message,
      startTime: noticeDraft.isScheduled ? noticeDraft.startTime : undefined,
      endTime: noticeDraft.isScheduled ? noticeDraft.endTime : undefined,
      isActive: true
    });
    setAppConfigHistory(history);
    
    // Reset draft
    setNoticeDraft({
      message: '',
      isScheduled: false,
      startTime: formatDateForInput(new Date()),
      endTime: ''
    });
    alert('Notice activated and saved to history!');
  };
  
  const handleSaveMaintenance = () => {
    const updatedConfig = {
      ...appConfig,
      maintenance: {
        isActive: true,
        message: maintDraft.message,
        isScheduled: maintDraft.isScheduled,
        startTime: maintDraft.isScheduled ? maintDraft.startTime : undefined,
        endTime: maintDraft.isScheduled ? maintDraft.endTime : undefined,
      }
    };
    saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    
    const history = addAppConfigHistory({
      type: 'MAINTENANCE',
      message: maintDraft.message,
      startTime: maintDraft.isScheduled ? maintDraft.startTime : undefined,
      endTime: maintDraft.isScheduled ? maintDraft.endTime : undefined,
      isActive: true
    });
    setAppConfigHistory(history);
    
    // Reset draft
    setMaintDraft({
      message: '',
      isScheduled: false,
      startTime: formatDateForInput(new Date()),
      endTime: ''
    });
    alert('Maintenance mode activated and saved to history!');
  };
  
  const handleStopFeature = (type: 'NOTICE' | 'MAINTENANCE', historyId: string) => {
    if (type === 'NOTICE') {
      const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false } };
      saveAppConfig(updatedConfig);
      setAppConfig(updatedConfig);
    } else {
      const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false } };
      saveAppConfig(updatedConfig);
      setAppConfig(updatedConfig);
    }
    const history = updateAppConfigHistoryItemActiveStatus(historyId, false);
    setAppConfigHistory(history);
  };
  
  const handleDeleteHistory = (id: string) => {
    const history = deleteAppConfigHistoryItem(id);
    setAppConfigHistory(history);
  };`;

code = code.replace(oldStateCode, newStateCode);
fs.writeFileSync('src/components/SettingsModal.tsx', code);
