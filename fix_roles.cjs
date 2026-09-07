const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace explicit string checks
    content = content.replace(/role === 'SUPER_ADMIN' \|\| role === 'ADMIN'/g, "role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN'");
    content = content.replace(/role === 'ADMIN' \|\| role === 'SUPER_ADMIN'/g, "role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER'");
    
    // Some places use session?.assignedRole
    content = content.replace(/session\?\.assignedRole === 'SUPER_ADMIN'/g, "(session?.assignedRole === 'SUPER_ADMIN' || session?.assignedRole === 'OWNER')");
    content = content.replace(/userSessionRole === 'SUPER_ADMIN' \|\| userSessionRole === 'ADMIN'/g, "userSessionRole === 'SUPER_ADMIN' || userSessionRole === 'OWNER' || userSessionRole === 'ADMIN'");

    // Specifically for role === 'SUPER_ADMIN' where it's used standalone
    // But be careful not to match when we already replaced it in the OR clause
    // Actually, a safer regex: 
    // find "role === 'SUPER_ADMIN'" and if it's not followed by " || role === 'OWNER'", add it.
    content = content.replace(/role === 'SUPER_ADMIN'(?! \|\| role === 'OWNER')/g, "(role === 'SUPER_ADMIN' || role === 'OWNER')");
    // Remove redundant parens if we created them
    content = content.replace(/\(\(role === 'SUPER_ADMIN' \|\| role === 'OWNER'\)\)/g, "(role === 'SUPER_ADMIN' || role === 'OWNER')");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
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
            replaceInFile(fullPath);
        }
    }
}

walkDir('./src');
console.log('Done');
