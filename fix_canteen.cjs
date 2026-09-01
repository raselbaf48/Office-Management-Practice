const fs = require('fs');
let typesFile = fs.readFileSync('src/types.ts', 'utf-8');
if (!typesFile.includes("'CANTEEN'")) {
  typesFile = typesFile.replace(
    /export type DutyCategoryCode =\n([^;]+);/m,
    function(match, p1) {
      return match.replace("'BSH' |", "'BSH' |\n  'CANTEEN' |");
    }
  );
  fs.writeFileSync('src/types.ts', typesFile, 'utf-8');
}

let dutyTypesFile = fs.readFileSync('src/data/dutyTypes.ts', 'utf-8');
if (!dutyTypesFile.includes("code: 'CANTEEN'")) {
  dutyTypesFile = dutyTypesFile.replace(
    /];/,
    `  {
    code: 'CANTEEN',
    name: 'Canteen',
    shortName: 'CAN',
    category: 'Special',
    color: 'bg-amber-600 text-white',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700',
    badgeText: 'text-amber-800 dark:text-amber-300',
    isCountedAsDuty: false,
    description: 'Canteen Attachment',
  },
];`
  );
  fs.writeFileSync('src/data/dutyTypes.ts', dutyTypesFile, 'utf-8');
}
console.log('Canteen added');
