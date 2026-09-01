const fs = require('fs');
let file = fs.readFileSync('src/services/presenceService.ts', 'utf-8');

if (!file.includes('let quotaExceeded = false;')) {
  file = file.replace(/export const logUserLogin/, `let quotaExceeded = false;\n\nexport const logUserLogin`);
  
  // Add quota check to logUserLogin
  file = file.replace(/export const logUserLogin = async \(user: any\) => {/, `export const logUserLogin = async (user: any) => {\n  if (quotaExceeded) return;`);
  
  // Add quota check to updatePresence
  file = file.replace(/export const updatePresence = async \(bdNo: string, isLoggingOut = false\) => {/, `export const updatePresence = async (bdNo: string, isLoggingOut = false) => {\n  if (quotaExceeded) return;`);
  
  // Update catch block in logUserLogin
  file = file.replace(/} catch \(error\) {[^}]*console\.error\('Error logging user login:', error\);[^}]*}/, `} catch (error: any) {
    if (error?.message?.includes('Quota') || error?.message?.includes('resource-exhausted') || error?.code === 'resource-exhausted') {
       quotaExceeded = true;
       console.warn('Firebase quota exceeded. Presence sync disabled.');
    } else {
       console.error('Error logging user login:', error);
    }
  }`);
  
  // Update catch block in updatePresence
  file = file.replace(/} catch \(err\) {[^}]*console\.error\(err\);[^}]*}/, `} catch (err: any) {
    if (err?.message?.includes('Quota') || err?.message?.includes('resource-exhausted') || err?.code === 'resource-exhausted') {
       quotaExceeded = true;
       console.warn('Firebase quota exceeded. Presence sync disabled.');
    } else {
       console.error(err);
    }
  }`);

  fs.writeFileSync('src/services/presenceService.ts', file, 'utf-8');
  console.log('Presence service patched.');
} else {
  console.log('Already patched.');
}
