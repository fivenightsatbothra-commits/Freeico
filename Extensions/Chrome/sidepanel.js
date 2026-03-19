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
        let text = await response.text();
        
        // Extract the JSON part after "window.XXXX = "
        // This handles window.searchIndex = [...] and window.collectionData['col'] = [...]
        const regex = new RegExp(`window\\.${variableName.replace(/\[.*\]/, '')}(?:\\[['"].*?['"]\\])?\\s*=\\s*([\\s\\S]*);?`);
        const match = text.match(regex);
        
        if (match && match[1]) {
            let jsonStr = match[1].trim();
            if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
            return JSON.parse(jsonStr);
        }
        
        // Fallback for searchIndex which might not have quotes in the variableName check
        if (variableName === 'searchIndex') {
             const fallbackMatch = text.match(/window\.searchIndex\s*=\s*([\s\S]*);?/);
             if (fallbackMatch && fallbackMatch[1]) {
                 let jsonStr = fallbackMatch[1].trim();
                 if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
                 return JSON.parse(jsonStr);
             }
        }

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
    
    loadingState.textContent = 'Loading index (this might take a second)...';
    
    const data = await loadDataFile('data/search-index.js', 'searchIndex');
    if (data) {
        searchIndexData = data;
        loadingState.style.display = 'none';
        callback();
    } else {
        loadingState.textContent = 'Failed to load icon index.';
    }
}

// Search Logic
let debounce = null;
function handleSearch() {
    clearTimeout(debounce);
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

async function executeSearch(query, selectedCol) {
    let matches = [];
    
    // 1. Filter the index
    if (selectedCol !== 'all') {
        matches = searchIndexData.filter(i => i.c === selectedCol && i.n.includes(query));
    } else {
        matches = searchIndexData.filter(i => i.n.includes(query) || i.c.includes(query));
        // Cap large global sets to keep rendering snappy
        if (matches.length > 200) {
            const step = matches.length / 200;
            matches = Array.from({length: 200}, (_, i) => matches[Math.floor(i * step)]);
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
        item.addEventListener('click', () => {
            const svgStr = item.querySelector('svg').outerHTML;
            navigator.clipboard.writeText(svgStr).then(() => {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2000);
            });
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
    // optionally prefill a generic search like "user" just to show the grid
    searchInput.value = 'fire'; 
    handleSearch();
});
