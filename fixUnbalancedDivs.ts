import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const badString = `
        </div>
      </div>

      {/* Calendar Edit Modal */}`;

if (code.includes(badString)) {
  code = code.replace(badString, "\n      {/* Calendar Edit Modal */}");
  fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
  console.log("Fixed unbalanced divs");
} else {
  console.log("Bad string not found");
}
