const fs = require('fs');
const path = require('path');

const microservicesDir = path.join(__dirname, '../microservices');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('index.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('../../shared')) {
                console.log('Fixing paths in:', filePath);
                content = content.replace(/\.\.\/\.\.\/shared/g, '../shared');
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
}

walkDir(microservicesDir);
console.log('✓ All shared path imports updated successfully!');
