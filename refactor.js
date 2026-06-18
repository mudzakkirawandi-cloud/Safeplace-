const fs = require('fs');
const path = require('path');

async function replaceColors(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            await replaceColors(path.join(dir, file.name));
        } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts'))) {
            const filePath = path.join(dir, file.name);
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;
            
            // Backgrounds
            newContent = newContent.replace(/bg-\[\#FAFBFF\]/g, 'bg-background');
            newContent = newContent.replace(/bg-\[\#F5F6FA\]/g, 'bg-background');
            newContent = newContent.replace(/bg-\[\#F4F9F6\]/g, 'bg-background');
            newContent = newContent.replace(/bg-\[\#F0F7FC\]/g, 'bg-background');
            newContent = newContent.replace(/bg-\[\#F8F5FC\]/g, 'bg-background');
            newContent = newContent.replace(/bg-\[\#EBF5FB\]/g, 'bg-background');
            newContent = newContent.replace(/bg-gray-50/g, 'bg-muted');
            newContent = newContent.replace(/bg-white/g, 'bg-card');
            
            // Text Primary
            newContent = newContent.replace(/text-\[\#1B4F72\]/g, 'text-primary');
            newContent = newContent.replace(/text-\[\#4A90B8\]/g, 'text-primary');
            newContent = newContent.replace(/text-\[\#5B8A6F\]/g, 'text-primary');
            newContent = newContent.replace(/text-\[\#2C3E6B\]/g, 'text-primary');
            newContent = newContent.replace(/text-\[\#7B5EA7\]/g, 'text-primary');
            newContent = newContent.replace(/text-\[\#1A5276\]/g, 'text-primary');

            // BG Primary (buttons, etc.)
            newContent = newContent.replace(/bg-\[\#1B4F72\]/g, 'bg-primary');
            newContent = newContent.replace(/bg-\[\#4A90B8\]/g, 'bg-primary');
            newContent = newContent.replace(/bg-\[\#5B8A6F\]/g, 'bg-primary');
            newContent = newContent.replace(/bg-\[\#2C3E6B\]/g, 'bg-primary');
            newContent = newContent.replace(/bg-\[\#7B5EA7\]/g, 'bg-primary');
            newContent = newContent.replace(/bg-\[\#1A5276\]/g, 'bg-primary');
            
            // Text grays
            newContent = newContent.replace(/text-gray-800/g, 'text-card-foreground');
            newContent = newContent.replace(/text-gray-900/g, 'text-foreground');
            newContent = newContent.replace(/text-gray-600/g, 'text-muted-foreground');
            newContent = newContent.replace(/text-gray-500/g, 'text-muted-foreground');
            newContent = newContent.replace(/text-gray-400/g, 'text-muted-foreground');
            newContent = newContent.replace(/text-gray-700/g, 'text-card-foreground');
            
            // Borders
            newContent = newContent.replace(/border-gray-100/g, 'border-border');
            newContent = newContent.replace(/border-gray-200/g, 'border-border');
            newContent = newContent.replace(/border-gray-50/g, 'border-border');
            newContent = newContent.replace(/border-white/g, 'border-border');

            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log('Updated ' + filePath);
            }
        }
    }
}
replaceColors('./app');
