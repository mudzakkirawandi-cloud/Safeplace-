const fs = require('fs');

const layouts = [
  { path: './app/[locale]/(dashboard)/admin/layout.tsx', role: 'admin' },
  { path: './app/[locale]/(dashboard)/consultant/layout.tsx', role: 'konsultan' },
  { path: './app/[locale]/(dashboard)/operator/layout.tsx', role: 'operator' },
  { path: './app/[locale]/(dashboard)/satgas/layout.tsx', role: 'satgas' },
  { path: './app/[locale]/(dashboard)/peer-consultant/layout.tsx', role: 'konsultan' }
];

layouts.forEach(({path, role}) => {
  let content = fs.readFileSync(path, 'utf8');
  if (!content.includes(`data-role="${role}"`)) {
    content = content.replace(/className="flex h-screen bg-background overflow-hidden"/, `data-role="${role}" className="flex h-screen bg-background text-foreground overflow-hidden"`);
    // Fallback if bg-background wasn't replaced properly or had different spacing
    content = content.replace(/<div className="flex h-screen/, `<div data-role="${role}" className="flex h-screen`);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated ' + path);
  }
});
