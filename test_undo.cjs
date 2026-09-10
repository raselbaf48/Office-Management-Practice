const list = [
  { airmanId: '1', date: '2023-01-01', dutyCode: 'GD' }
];

const prev = { airmanId: '1', date: '2023-01-01' };

const existingIdx = list.findIndex((a) => a.airmanId === prev.airmanId && a.date === prev.date);

if (prev.dutyCode) {
  // restore
} else {
  if (existingIdx >= 0) list.splice(existingIdx, 1);
}

console.log(list);
