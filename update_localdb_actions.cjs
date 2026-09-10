const fs = require('fs');
const file = 'src/services/localDatabase.ts';
let content = fs.readFileSync(file, 'utf8');

// Inside addAirman
const addAirmanFind = `this.db.airmen.push(newAirman);
    this.saveToStorage();`;
const addAirmanReplace = `this.db.airmen.push(newAirman);
    this.logSystemAction(newAirman.id, \`\${newAirman.rank} \${newAirman.name}\`, 'Added new airman to Nominal Roll');
    this.saveToStorage();`;
content = content.replace(addAirmanFind, addAirmanReplace);

// Inside updateAirman
const updateAirmanFind = `this.db.airmen[idx] = {
      ...this.db.airmen[idx],
      ...data,
      id,
    };
    this.saveToStorage();`;
const updateAirmanReplace = `const previous = this.db.airmen[idx];
    this.db.airmen[idx] = {
      ...previous,
      ...data,
      id,
    };
    
    if (previous.active && !data.active) {
      this.logSystemAction(id, \`\${previous.rank} \${previous.name}\`, 'Posted out / Marked inactive from Nominal Roll');
    } else if (!previous.active && data.active) {
      this.logSystemAction(id, \`\${previous.rank} \${previous.name}\`, 'Reactivated in Nominal Roll');
    }

    this.saveToStorage();`;
content = content.replace(updateAirmanFind, updateAirmanReplace);

// Inside deleteAirman
const deleteAirmanFind = `const initialCount = this.db.airmen.length;
    this.db.airmen = this.db.airmen.filter((a) => a.id !== id);
    if (this.db.airmen.length === initialCount) return false;`;
const deleteAirmanReplace = `const initialCount = this.db.airmen.length;
    const target = this.db.airmen.find((a) => a.id === id);
    if (target) {
        this.logSystemAction(id, \`\${target.rank} \${target.name}\`, 'Permanently deleted from Nominal Roll');
    }
    this.db.airmen = this.db.airmen.filter((a) => a.id !== id);
    if (this.db.airmen.length === initialCount) return false;`;
content = content.replace(deleteAirmanFind, deleteAirmanReplace);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched localDatabase to log Nominal Roll actions!");
