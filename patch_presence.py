import sys

with open('src/services/presenceService.ts', 'r') as f:
    code = f.read()

target1 = "import { db } from '../firebase';"
replacement1 = "import { db, isTestingEnvironment } from '../firebase';"
if target1 in code:
    code = code.replace(target1, replacement1)
    
target2 = "export const logUserLogin = async (user: any) => {\n  if (isQuotaExceeded()) return;"
replacement2 = "export const logUserLogin = async (user: any) => {\n  if (isQuotaExceeded() || isTestingEnvironment()) return;"
if target2 in code:
    code = code.replace(target2, replacement2)
    
target3 = "export const updatePresence = async (bdNo: string, isLoggingOut = false, page = 'Dashboard') => {\n  if (isQuotaExceeded()) return;"
replacement3 = "export const updatePresence = async (bdNo: string, isLoggingOut = false, page = 'Dashboard') => {\n  if (isQuotaExceeded() || isTestingEnvironment()) return;"
if target3 in code:
    code = code.replace(target3, replacement3)

with open('src/services/presenceService.ts', 'w') as f:
    f.write(code)
print("Patched presence service")
