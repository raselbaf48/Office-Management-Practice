const ALL_DISPOSAL_OPTIONS = ['Total Strength', 'Det/Tdy', 'Leave'];
const historicalCustomCats = ['Leave'];
const customColumns = [];
const formSavedDisposals = ['Total Strength'];
console.log(Array.from(new Set([...ALL_DISPOSAL_OPTIONS, ...historicalCustomCats, ...customColumns])).filter(opt => !formSavedDisposals.includes(opt)));
