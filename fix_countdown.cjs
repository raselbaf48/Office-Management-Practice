const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert the Countdown Component at the top (after imports)
const countdownComponent = `
const Countdown = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = React.useState('');
  
  React.useEffect(() => {
    if (!endTime) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;
      
      if (distance < 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        return;
      }
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(\`\${hours}h \${minutes}m \${seconds}s\`);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return <span className="ml-2 font-mono bg-emerald-200 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-[10px] text-emerald-800 dark:text-emerald-300">Remaining: {timeLeft || '...'}</span>;
};
`;

const insertIndex = content.indexOf("const SettingsModal: React.FC<SettingsModalProps> =");
if (insertIndex !== -1 && !content.includes("const Countdown =")) {
  content = content.substring(0, insertIndex) + countdownComponent + "\n" + content.substring(insertIndex);
}

// Add the Countdown to active Notice UI
const targetNoticeLive = `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                Active
                              </span>`;

const newNoticeLive = `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                Active
                              </span>
                              {appConfig.notice.isScheduled && appConfig.notice.endTime && (
                                <Countdown endTime={appConfig.notice.endTime} />
                              )}`;

content = content.replace(targetNoticeLive, newNoticeLive);

// Add the Countdown to active Maintenance UI
const targetMaintLive = `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                Live
                              </span>`;

const newMaintLive = `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                Live
                              </span>
                              {appConfig.maintenance.isScheduled && appConfig.maintenance.endTime && (
                                <Countdown endTime={appConfig.maintenance.endTime} />
                              )}`;
content = content.replace(targetMaintLive, newMaintLive);


fs.writeFileSync(file, content);
console.log("Countdown added!");
