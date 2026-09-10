const fs = require('fs');
const file = 'src/components/ParadeStateFormattedView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `const ALL_DISPOSAL_OPTIONS = [{"code":"TDY","label":"Det/ Tdy"},{"code":"LEAVE","label":"Leave"},{"code":"ESSN","label":"Essn"},{"code":"CMH","label":"BNS/BSH/ CMH"},{"code":"SICK_REPORT","label":"Sick Report"},{"code":"CANTEEN","label":"Canteen"},{"code":"DUTY_OFF","label":"Guard Duty On/Off"},{"code":"BAKE_N_BITE","label":"Bake & Bite"},{"code":"RECEPTION","label":"K/O & Reception"},{"code":"ADMIN_ORDER","label":"Admin Order"},{"code":"CLASS_TRG","label":"Class/ Trg"},{"code":"AIRPORT","label":"Airfield Duty"},{"code":"GAMES","label":"G/H & Games"},{"code":"ABSENT","label":"Absent"},{"code":"OTHERS","label":"✨ Custom..."}];`;
const targetReplace = `const ALL_DISPOSAL_OPTIONS = [{"code":"TDY","label":"TDY"},{"code":"LEAVE","label":"Leave"},{"code":"ESSN","label":"Essn"},{"code":"CMH","label":"CMH"},{"code":"SICK_REPORT","label":"Sick Report"},{"code":"CANTEEN","label":"Canteen"},{"code":"DUTY_OFF","label":"Duty Off"},{"code":"BAKE_N_BITE","label":"Bake & Bite"},{"code":"RECEPTION","label":"K/O & Reception"},{"code":"ADMIN_ORDER","label":"Admin Order"},{"code":"CLASS_TRG","label":"Class / Trg"},{"code":"AIRPORT","label":"Airfield"},{"code":"GAMES","label":"G/H & Games"},{"code":"ABSENT","label":"Absent"},{"code":"OTHERS","label":"✨ Custom..."}];`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched ALL_DISPOSAL_OPTIONS");
