const fs = require('fs');
let file = fs.readFileSync('src/components/NominalRoll.tsx', 'utf8');

if (!file.includes('useEffect') || (file.includes('useEffect') && !file.match(/import\s+.*useEffect.*from\s+['"]react['"]/))) {
    // If not imported, let's fix the React import
    file = file.replace(/import\s+React\s*,\s*\{\s*useState\s*,\s*useMemo\s*\}\s*from\s+['"]react['"];?/, "import React, { useState, useMemo, useEffect } from 'react';");
    
    // In case it's imported differently
    if (!file.includes('useEffect } from')) {
        file = file.replace(/import\s+\{\s*useState\s*,\s*useMemo\s*\}\s*from\s+['"]react['"];?/, "import { useState, useMemo, useEffect } from 'react';");
    }
    
    fs.writeFileSync('src/components/NominalRoll.tsx', file);
    console.log('Fixed imports in NominalRoll.tsx');
} else {
    console.log('useEffect seems to be imported already, or something else is wrong');
}
