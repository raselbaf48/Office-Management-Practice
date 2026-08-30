const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/components');

files.forEach(file => {
  if (file.includes('DateNavigator')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // We want to replace <input type="date" ... /> 
  // Let's use a very targeted regex replacement or string manipulation.
  
  const regex = /<input[^>]*type="date"[^>]*\/>/g;
  
  let hasChanges = false;
  
  content = content.replace(regex, (match) => {
    // extract value
    const valueMatch = match.match(/value=\{([^}]+)\}/);
    if (!valueMatch) return match;
    const valueVar = valueMatch[1];
    
    // extract onChange
    const onChangeMatch = match.match(/onChange=\{([^}]+)\}/);
    
    // extract className
    const classMatch = match.match(/className=(["'][^"']+["']|\{[^}]+\})/);
    
    // extract other properties
    let rest = match.replace(/<input/, '').replace(/\/>$/, '').trim();
    rest = rest.replace(/type="date"/, '');
    if (valueMatch) rest = rest.replace(valueMatch[0], '');
    if (onChangeMatch) rest = rest.replace(onChangeMatch[0], '');
    if (classMatch) rest = rest.replace(classMatch[0], '');
    
    let onChangeCode = '';
    if (onChangeMatch) {
        onChangeCode = onChangeMatch[1];
        // check if it's like (e) => setDate(e.target.value)
        const simpleArrow = onChangeCode.match(/^\(e\)\s*=>\s*(set[A-Za-z0-9_]+)\(e\.target\.value\)$/);
        if (simpleArrow) {
            onChangeCode = `(val) => ${simpleArrow[1]}(val)`;
        } else {
            // we will pass the value directly instead of an event, so we must mock the event
            // wait, our DateNavigator already mocks the event if onChange is provided!
            // BUT wait, in fix_datepickers.cjs we changed it back.
        }
    }
    
    // Let's just wrap the whole <input> tag with ChevronLeft and ChevronRight!
    // We need to parse the value attribute from the input to know which state variable to update.
    
    // Actually, wrapping is much safer than modifying the <input> attributes.
    
    const setterNameMatch = match.match(/onChange=\{\(e\)\s*=>\s*\{?\s*(set[A-Za-z0-9_]+)\(/);
    const complexSetterNameMatch = match.match(/onChange=\{\(e\)\s*=>\s*\{[^\}]*(set[A-Za-z0-9_]+)\(e\.target\.value\)/);
    
    let wrapperCode = '';
    
    if (setterNameMatch) {
       // We can wrap it
    }
    
    return match; // fallback
  });
  
});
