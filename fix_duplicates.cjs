const fs = require('fs');
const path = require('path');

function fixSyntax(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/ \|\| role === 'OWNER' \|\| role === 'OWNER'/g, " || role === 'OWNER'");
    content = content.replace(/ \|\| userSessionRole === 'OWNER' \|\| userSessionRole === 'OWNER'/g, " || userSessionRole === 'OWNER'");
    
    // Fix UserManagementTab.tsx sort logic
    content = content.replace(/b\.role !== 'SUPER_ADMIN'\) return -1/g, "b.role !== 'SUPER_ADMIN' && b.role !== 'OWNER') return -1");
    content = content.replace(/a\.role !== 'SUPER_ADMIN' && \(/g, "a.role !== 'SUPER_ADMIN' && a.role !== 'OWNER' && (");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed duplicates in ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            fixSyntax(fullPath);
        }
    }
}

walkDir('./src');
console.log('Done fixing duplicates');
