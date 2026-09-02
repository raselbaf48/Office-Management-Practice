import fs from 'fs';
let code = fs.readFileSync('src/utils/appConfig.ts', 'utf8');

code = code.replace(
  "export interface AppNotice {\n  isActive: boolean;\n  message: string;",
  "export interface AppNotice {\n  isActive: boolean;\n  heading?: string;\n  message: string;"
);

code = code.replace(
  "export interface AppConfigHistoryItem {\n  id: string;\n  type: 'NOTICE' | 'MAINTENANCE';\n  message: string;",
  "export interface AppConfigHistoryItem {\n  id: string;\n  type: 'NOTICE' | 'MAINTENANCE';\n  heading?: string;\n  message: string;"
);

code = code.replace(
  "  notice: {\n    isActive: false,\n    message: '',",
  "  notice: {\n    isActive: false,\n    heading: 'Important Notice',\n    message: '',"
);

fs.writeFileSync('src/utils/appConfig.ts', code);
