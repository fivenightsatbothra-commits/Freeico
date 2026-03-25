const searchInput = document.getElementById('search-input');
const collectionSelect = document.getElementById('collection-select');
const iconGrid = document.getElementById('icon-grid');
const loadingState = document.getElementById('loading-state');
const toast = document.getElementById('toast');

let searchIndexData = null;
let currentCollections = typeof collectionsList !== 'undefined' ? collectionsList : [];

// Initialize Collection Dropdown
function initSelect() {
    // Sort collections alphabetically
    const sorted = [...currentCollections].sort((a,b) => a.name.localeCompare(b.name));
    sorted.forEach(c => {
        // Format names nicely
        const prettyName = c.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = prettyName;
        collectionSelect.appendChild(opt);
    });
}

// Function to load and parse .js data files that use window.variable = [...]
async function loadDataFile(path, variableName) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let text = await response.text();
        
        // 1. Find the occurrence of the specific variable name to avoid catching prefixing code
        // We look for just the basename/property like "collectionData['covid']" or "searchIndex"
        let varPos = text.indexOf(variableName.replace(/\[.*\]/, ''));
        if (varPos === -1) varPos = 0; // Fallback to start of file
        
        // 2. Find the assignment operator '=' after the variable name
        const eqIndex = text.indexOf('=', varPos);
        if (eqIndex === -1) {
            console.error(`Could not find assignment '=' in ${path}`);
            return null;
        }
        
        // 3. Find the first '[' or '{' after the '='
        let jsonStart = text.indexOf('[', eqIndex);
        if (jsonStart === -1 || (text.indexOf('{', eqIndex) !== -1 && text.indexOf('{', eqIndex) < jsonStart)) {
            jsonStart = text.indexOf('{', eqIndex);
        }
        
        // 4. Find the LAST ']' or '}' in the file (most data files consist of one big array)
        let jsonEnd = text.lastIndexOf(']');
        if (jsonEnd === -1 || (text.lastIndexOf('}') !== -1 && text.lastIndexOf('}') > jsonEnd)) {
            jsonEnd = text.lastIndexOf('}');
        }
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            let jsonStr = text.substring(jsonStart, jsonEnd + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (parseError) {
                console.error(`JSON Parse failed for ${path}:`, parseError, "Snippet:", jsonStr.substring(0, 100));
                return null;
            }
        }
        
        console.error(`Could not find JSON bounds in ${path}`);
        return null;
    } catch (e) {
        console.error(`Error loading data file ${path}:`, e);
        return null;
    }
}

// Load Search Index
async function loadIndex(callback) {
    if (searchIndexData) {
        callback();
        return;
    }
    
    loadingState.textContent = 'Preparing icons (this may take a moment)...';
    
    const data = await loadDataFile('data/search-index.js', 'searchIndex');
    if (data) {
        searchIndexData = data;
        loadingState.style.display = 'none';
        callback();
    } else {
        loadingState.textContent = 'Failed to load icon index. Please try reloading the side panel.';
    }
}

// Search Logic
let debounce = null;
function handleSearch() {
    clearTimeout(debounce);
    if (!searchIndexData) return; // Wait for index

    debounce = setTimeout(() => {
        const query = searchInput.value.toLowerCase().trim();
        const selectedCol = collectionSelect.value;

        if (query === '' && selectedCol === 'all') {
            iconGrid.innerHTML = '';
            loadingState.style.display = 'block';
            loadingState.textContent = 'Search to explore 300,000+ icons';
            return;
        }

        iconGrid.innerHTML = '';
        loadingState.style.display = 'block';
        loadingState.textContent = 'Searching...';

        requestAnimationFrame(() => executeSearch(query, selectedCol));
    }, 250);
}

// Function to copy SVG as PNG
async function copyAsPng(svgElement) {
    const clone = svgElement.cloneNode(true);
    clone.setAttribute('width', '512');
    clone.setAttribute('height', '512');
    clone.style.color = 'black'; // Default color for exported icons
    
    const svgData = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 512;
    canvas.height = 512;
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async blob => {
                if (blob) {
                    try {
                        const item = new ClipboardItem({ 'image/png': blob });
                        await navigator.clipboard.write([item]);
                        resolve();
                    } catch (err) {
                        console.error('Clipboard write failed:', err);
                        // Fallback to text if image copy fails for some reason
                        const svgText = svgElement.outerHTML;
                        await navigator.clipboard.writeText(svgText);
                        resolve();
                    }
                } else {
                    reject(new Error('Blob generation failed'));
                }
            }, 'image/png');
        };
        img.onerror = (e) => reject(new Error('Image load failed'));
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    });
}

async function executeSearch(query, selectedCol) {
    if (!searchIndexData) return;
    let matches = [];
    
    // 1. Filter the index
    if (selectedCol !== 'all') {
        matches = searchIndexData.filter(i => i.c === selectedCol && i.n.includes(query));
    } else {
        matches = searchIndexData.filter(i => i.n.includes(query) || i.c.includes(query));
        // Cap large global sets to keep rendering snappy
        if (matches.length > 200) {
            matches = matches.slice(0, 200);
        }
    }

    if (matches.length === 0) {
        loadingState.style.display = 'block';
        loadingState.textContent = 'No icons found.';
        return;
    }

    // 2. Fetch required collections
    if (!window.collectionData) window.collectionData = {};
    
    const grouped = {};
    matches.forEach(m => {
        if (!grouped[m.c]) grouped[m.c] = [];
        grouped[m.c].push(m.n);
    });

    const fetches = Object.entries(grouped).map(async ([colId, icons]) => {
        if (!window.collectionData[colId]) {
            const colData = await loadDataFile(`data/${colId}.js`, `collectionData['${colId}']`);
            if (colData) {
                window.collectionData[colId] = colData;
            }
        }
        
        let colData = window.collectionData[colId];
        if (!colData) return [];
        
        const results = [];
        icons.forEach(name => {
            const icon = colData.find(i => i.name === name);
            if (icon) results.push(icon);
        });
        return results;
    });

    const resultsMatrix = await Promise.all(fetches);
    const finalMatches = resultsMatrix.flat();

    // 3. Render
    loadingState.style.display = 'none';
    iconGrid.innerHTML = finalMatches.map(icon => `
        <div class="icon-item" title="${icon.name}">
            ${icon.content}
        </div>
    `).join('');

    // 4. Attach Copy events
    document.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', async () => {
            const svg = item.querySelector('svg');
            item.style.transform = 'scale(0.95)';
            setTimeout(() => item.style.transform = '', 100);

            try {
                await copyAsPng(svg);
                toast.textContent = 'PNG Copied!';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2000);
            } catch (err) {
                console.error(err);
                toast.textContent = 'Failed to copy PNG';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2000);
            }
        });
    });
}

// Bind Events
searchInput.addEventListener('input', handleSearch);
collectionSelect.addEventListener('change', handleSearch);

// Start
initSelect();
loadIndex(() => {
    loadingState.textContent = 'Search to explore 300,000+ icons';
});
