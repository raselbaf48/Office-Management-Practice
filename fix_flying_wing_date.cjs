const fs = require('fs');
const files = ['src/components/FlyingWingStateView.tsx', 'src/components/PrintableFlyingWingModal.tsx'];

for(const file of files) {
  if(!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /year: 'numeric'/g,
    "year: '2-digit'"
  );
  fs.writeFileSync(file, content);
}
console.log("Fixed date format in FlyingWingStateView");
