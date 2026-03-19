const fs = require('fs');
const path = require('path');
const https = require('https');

const collections = [
    "fluent", "material-symbols-light", "material-symbols", "arcticons", "ic", "ph", "mdi", "solar", "tabler", "hugeicons", "openmoji", "game-icons", "noto", "twemoji", "simple-icons", "fluent-emoji-flat", "ri", "fluent-emoji", "mingcute", "streamline", "icon-park-outline", "icon-park", "mynaui", "carbon", "noto-v1", "tdesign", "whh", "bi", "healthicons", "streamline-color", "token-branded", "streamline-ultimate", "fa7-solid", "icon-park-solid", "icon-park-twotone", "logos", "emojione", "iconamoon", "token", "fluent-mdl2", "iconoir", "lucide", "fluent-emoji-high-contrast", "la", "lets-icons", "streamline-sharp", "streamline-flex", "streamline-plump", "cbi", "ix", "emojione-monotone", "fa6-solid", "vscode-icons", "streamline-logos", "ion", "famicons", "heroicons", "pepicons-pop", "pepicons-print", "pepicons-pencil", "emojione-v1", "f7", "si", "uil", "teenyicons", "dinkie-icons", "material-icon-theme", "clarity", "line-md", "mage", "fxemoji", "fa-solid", "streamline-freehand", "streamline-plump-color", "streamline-freehand-color", "streamline-flex-color", "streamline-sharp-color", "streamline-ultimate-color", "stash", "devicon", "jam", "file-icons", "garden", "fluent-color", "ant-design", "cib", "picon", "bx", "si-glyph", "streamline-emojis", "zmdi", "majesticons", "qlementine-icons", "flowbite", "gravity-ui", "lsicon", "gg", "devicon-plain", "fa", "octicon", "bxs", "streamline-pixel", "catppuccin", "memory", "vaadin", "grommet-icons", "circle-flags", "fontisto", "lineicons", "marketeq", "cil", "fa7-brands", "flag", "temaki", "proicons", "roentgen", "streamline-cyber", "streamline-cyber-color", "codicon", "fa6-brands", "basil", "icomoon-free", "eva", "pixelarticons", "cryptocurrency", "cryptocurrency-color", "ps", "fa-brands", "akar-icons", "pixel", "meteocons", "ci", "oui", "system-uicons", "pepicons", "pajamas", "streamline-kameleon-color", "skill-icons", "lucide-lab", "ooui", "gis", "guidance", "ls", "dashicons", "typcn", "radix-icons", "flat-color-icons", "meteor-icons", "entypo", "prime", "subway", "el", "streamline-block", "uim", "zondicons", "ep", "circum", "feather", "mdi-light", "foundation", "fa7-regular", "humbleicons", "raphael", "charm", "fe", "flagpack", "eos-icons", "bitcoin-icons", "nrk", "icons8", "heroicons-outline", "heroicons-solid", "sidekickicons", "oi", "wi", "uit", "maki", "uiw", "rivet-icons", "gridicons", "streamline-stickies-color", "wpf", "cif", "uis", "simple-line-icons", "cuida", "mi", "mono-icons", "map", "fa6-regular", "weui", "vs", "academicons", "bxl", "fad", "fa-regular", "formkit", "medical-icon", "covid", "quill", "nimbus", "bpmn", "iwwa", "bytesize", "et", "flat-ui", "duo-icons", "topcoat", "websymbol", "il", "codex", "entypo-social", "ei", "nonicons", "unjs", "gala", "svg-spinners", "brandico", "fontelico", "geo"
];

const BASE_DIR = path.join(__dirname, 'svg-collections');

if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
}

async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        throw new Error(`Fetch failed for ${url}: ${e.message}`);
    }
}

function generateSVG(name, iconData, commonData = {}) {
    const width = iconData.width || commonData.width || 24;
    const height = iconData.height || commonData.height || 24;
    const left = iconData.left || commonData.left || 0;
    const top = iconData.top || commonData.top || 0;
    
    const viewBox = `${left} ${top} ${width} ${height}`;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">${iconData.body}</svg>`;
}

async function downloadCollection(prefix) {
    console.log(`\n--- Starting: ${prefix} ---`);
    // Using GitHub Raw instead of Iconify API for full collection JSON
    const url = `https://raw.githubusercontent.com/iconify/icon-sets/master/json/${prefix}.json`;
    const targetFolder = path.join(BASE_DIR, prefix);
    
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    try {
        const collection = await fetchJSON(url);
        
        if (!collection || !collection.icons) {
            console.error(`Skipping ${prefix}: No icons found in response.`);
            return;
        }

        const icons = collection.icons;
        const commonData = {
            width: collection.width,
            height: collection.height,
            left: collection.left,
            top: collection.top
        };

        const iconNames = Object.keys(icons);
        console.log(`Found ${iconNames.length} icons in ${prefix}`);

        let count = 0;
        for (const name of iconNames) {
            try {
                const svgContent = generateSVG(name, icons[name], commonData);
                // Ensure name is safe for Windows filesystem
                const safeName = name.replace(/[:/\\?%*|"<>]/g, '_');
                const filePath = path.join(targetFolder, `${safeName}.svg`);
                fs.writeFileSync(filePath, svgContent);
                count++;
            } catch (err) {
                // console.error(`  Error saving icon ${name} in ${prefix}: ${err.message}`);
            }
        }

        // Handle Aliases
        if (collection.aliases) {
            const aliasNames = Object.keys(collection.aliases);
            // console.log(`Adding ${aliasNames.length} aliases...`);
            for (const aliasName of aliasNames) {
                try {
                    const alias = collection.aliases[aliasName];
                    const baseIcon = icons[alias.parent];
                    if (baseIcon) {
                        const svgContent = generateSVG(aliasName, { ...baseIcon, ...alias }, commonData);
                        const safeName = aliasName.replace(/[:/\\?%*|"<>]/g, '_');
                        const filePath = path.join(targetFolder, `${safeName}.svg`);
                        fs.writeFileSync(filePath, svgContent);
                        count++;
                    }
                } catch (err) {
                    // console.error(`  Error saving alias ${aliasName} in ${prefix}: ${err.message}`);
                }
            }
        }

        console.log(`Completed: ${prefix} (${count} files total)`);
    } catch (e) {
        console.error(`Error processing ${prefix}: ${e.message}`);
    }
}

async function start() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    for (const prefix of collections) {
        await downloadCollection(prefix);
        // Small delay to prevent rate limiting and let the OS breathe
        await new Promise(r => setTimeout(r, 2000));
    }
    console.log("\nALL DOWNLOADS FINISHED!");
}

start();
