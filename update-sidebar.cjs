const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const target = `  const handleSelectTab = (tab: SidebarTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };`;

const replacement = `  const handleSelectTab = (tab: SidebarTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
    setCollapsed(true);
  };`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Sidebar.tsx', content);
console.log("Updated handleSelectTab to setCollapsed(true)");
