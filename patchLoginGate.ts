import fs from 'fs';

const path = 'src/components/UserLoginGate.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import { getAppConfig, isFeatureActive }")) {
  code = code.replace(
    "import { setUserSession, validateUserLogin",
    "import { getAppConfig, isFeatureActive } from '../utils/appConfig';\nimport { setUserSession, validateUserLogin"
  );
}

const loginValidationSuccess = `const validation = validateUserLogin(cleanInput, passwordInput, airmen);

      if (validation.success && validation.airman) {`;
      
const maintenanceCheck = `const validation = validateUserLogin(cleanInput, passwordInput, airmen);

      if (validation.success && validation.airman) {
        const config = getAppConfig();
        const role = validation.detailedUser?.role || 'USER';
        
        if (isFeatureActive(config.maintenance) && role !== 'SUPER_ADMIN') {
          setErrorMsg(config.maintenance.message || 'App is currently undergoing maintenance. Please try again later.');
          setIsLoading(false);
          return;
        }`;

code = code.replace(loginValidationSuccess, maintenanceCheck);

// Also we should display the maintenance message on the login portal directly, above the form, if active.
// Let's find the place to insert it.
const loginHeaderPattern = /<div className="text-center mb-10">\s*<div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-900\/20 rounded-3xl mb-6 shadow-inner">\s*<Shield className="w-10 h-10 text-emerald-600 dark:text-emerald-400" \/>\s*<\/div>/;

const maintenanceNoticeBox = `<div className="text-center mb-10">
          {(() => {
            const config = getAppConfig();
            if (isFeatureActive(config.maintenance)) {
              return (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-900 dark:text-amber-100 flex flex-col items-center gap-3 animate-fadeIn">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-300">Maintenance Mode Active</h3>
                    <p className="text-sm mt-1">{config.maintenance.message || 'The application is currently closed for maintenance.'}</p>
                    <p className="text-xs font-bold mt-2 text-amber-700 dark:text-amber-400">Only Super Admins can login at this time.</p>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl mb-6 shadow-inner">
            <Shield className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>`;

code = code.replace(loginHeaderPattern, maintenanceNoticeBox);

fs.writeFileSync(path, code);
