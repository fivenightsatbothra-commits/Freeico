const fs = require('fs');
const path = require('path');

const dataPath = path.resolve('../svg-Collections');
const destDir = path.resolve('./data');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

const dirs = fs.readdirSync(dataPath).filter(f => fs.statSync(path.join(dataPath, f)).isDirectory());
const colorPool = ['var(--col-peach)', 'var(--col-blue)', 'var(--col-green)', 'var(--col-peach-alt)', 'var(--col-yellow)', 'var(--col-purple)', 'var(--col-mint)'];

const collectionsList = dirs.map(d => {
    const p = path.join(dataPath, d);
    const files = fs.readdirSync(p).filter(f => f.endsWith('.svg'));
    const color = colorPool[Math.floor(Math.random() * colorPool.length)];
    
    // Read up to 6 previews from the collection
    const previews = files.slice(0, 6).map(f => {
        try {
            return fs.readFileSync(path.join(p, f), 'utf-8');
        } catch (e) {
            return '';
        }
    });

    console.log(`Processing collection: ${d} (${files.length} icons)`);
    
    // Create the per-collection JS file with all icons
    const iconData = files.map(f => {
        let content = '';
        try {
            content = fs.readFileSync(path.join(p, f), 'utf-8');
        } catch(e) {}
        
        return {
            name: f.replace('.svg', ''),
            content: content
        };
    });

    // Make it available as a global object on load
    const jsContent = `
window.collectionData = window.collectionData || {};
window.collectionData["${d}"] = ${JSON.stringify(iconData)};
if (typeof window.onCollectionLoaded === "function") window.onCollectionLoaded("${d}");
`;
    // Write out the individual collection file
    fs.writeFileSync(path.join(destDir, `${d}.js`), jsContent);

    return {
        id: d,
        name: d,
        count: files.length,
        color: color,
        author: d,
        previewSvgs: previews
    };
});

// Write the main list of all collections
fs.writeFileSync('collections-list.js', 'const collectionsList = ' + JSON.stringify(collectionsList) + ';');
console.log('Build complete. Generated individual collection files inside Site/data/');
