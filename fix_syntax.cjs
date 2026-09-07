const fs = require('fs');
const path = require('path');

function fixSyntax(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix a.(role === 'SUPER_ADMIN' || role === 'OWNER') -> a.role === 'SUPER_ADMIN' || a.role === 'OWNER'
    content = content.replace(/a\.\(role === 'SUPER_ADMIN' \|\| role === 'OWNER'\)/g, "(a.role === 'SUPER_ADMIN' || a.role === 'OWNER')");
    content = content.replace(/b\.\(role === 'SUPER_ADMIN' \|\| role === 'OWNER'\)/g, "(b.role === 'SUPER_ADMIN' || b.role === 'OWNER')");
    content = content.replace(/user\.\(role === 'SUPER_ADMIN' \|\| role === 'OWNER'\)/g, "(user.role === 'SUPER_ADMIN' || user.role === 'OWNER')");
    content = content.replace(/selectedUser\.\(role === 'SUPER_ADMIN' \|\| role === 'OWNER'\)/g, "(selectedUser.role === 'SUPER_ADMIN' || selectedUser.role === 'OWNER')");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
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
console.log('Done fixing syntax');
