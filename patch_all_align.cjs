const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Change <table className="...text-left..." to text-center
  if (content.match(/<table[^>]*className="[^"]*text-left[^"]*"[^>]*>/g)) {
    content = content.replace(/(<table[^>]*className="[^"]*)(text-left)([^"]*"[^>]*>)/g, '$1text-center$3');
    changed = true;
  }

  // Check for th and td with text-left
  if (content.match(/<(th|td)[^>]*className="[^"]*text-left[^"]*"[^>]*>/g)) {
    content = content.replace(/(<(th|td)[^>]*className="[^"]*)(text-left)([^"]*"[^>]*>)/g, '$1text-center$4');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
  }
}
