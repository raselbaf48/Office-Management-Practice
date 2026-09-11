import { getStoredDutyMatrix, getFlightDutyQuotaForDate } from './src/data/officialDutyRatioMatrix';

const m = getStoredDutyMatrix();
console.log('Matrix tables count:', m.length);
m.forEach(t => console.log(t.dutyCode, t.isDisabled));
