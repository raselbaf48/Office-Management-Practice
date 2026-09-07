const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file contains <table but not overflow-x-auto
  if (content.includes('<table') && !content.includes('overflow-x-auto')) {
    console.log(`${file} has tables but no overflow-x-auto!`);
  }
}
