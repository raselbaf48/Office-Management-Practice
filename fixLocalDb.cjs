const fs = require('fs');
let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

const oldCheck = `if (!parsedResult.dates || parsedResult.dates.length === 0) {
      throw new Error('Could not identify any duty dates or airman assignments from the provided input. Please verify that your file or text contains dates (e.g. 01 Aug) and duty columns.');
    }`;

const newCheck = `if (!parsedResult.dates || parsedResult.dates.length === 0 || parsedResult.totalAssignmentsCount === 0) {
      throw new Error('Could not identify any duty dates or airman assignments from the provided input. Please verify that your file or text contains dates (e.g. 01 Aug) and duty columns.');
    }`;

if (code.includes(oldCheck)) {
    code = code.replace(oldCheck, newCheck);
    fs.writeFileSync('src/services/localDatabase.ts', code);
    console.log("Updated error check in localDatabase");
} else {
    console.log("Could not find error check in localDatabase");
}
