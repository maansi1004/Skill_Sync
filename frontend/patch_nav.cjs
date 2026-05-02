const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'browse-teams.html');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if nav-links exists
    if (content.includes('class="nav-links"')) {
        // Find teams.html line and insert browse-teams.html before it if not already there
        if (!content.includes('/browse-teams.html')) {
            const teamLinkTarget = '<li><a href="/teams.html">Teams & Invites</a></li>';
            const teamLinkTargetActive = '<li class="active"><a href="/teams.html">Teams & Invites</a></li>';
            
            const insertString = '<li><a href="/browse-teams.html">Browse Teams</a></li>\n      ';
            
            if (content.includes(teamLinkTarget)) {
                content = content.replace(teamLinkTarget, insertString + teamLinkTarget);
            } else if (content.includes(teamLinkTargetActive)) {
                content = content.replace(teamLinkTargetActive, insertString + teamLinkTargetActive);
            }
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
}
console.log('Done!');
