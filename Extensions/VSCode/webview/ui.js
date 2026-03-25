const vscode = acquireVsCodeApi();

const searchInput = document.getElementById('search-input');
const collectionSelect = document.getElementById('collection-select');
const iconGrid = document.getElementById('icon-grid');
const loadingState = document.getElementById('loading-state');
const toast = document.getElementById('toast');

let searchIndexData = null;
let currentCollections = typeof collectionsList !== 'undefined' ? collectionsList : [];

// Initialize Collection Dropdown
function initSelect() {
    const sorted = [...currentCollections].sort((a,b) => a.name.localeCompare(b.name));
    sorted.forEach(c => {
        const prettyName = c.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = prettyName;
        collectionSelect.appendChild(opt);
    });
}

// Robust JSON extraction using the injected DATA_BASE_URI
async function loadDataFile(filename, variableName) {
    // Construct the proper VS Code Webview URI
    const path = `${window.DATA_BASE_URI}/${filename}`;
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let text = await response.text();
        
        // 1. Find the occurrence of the specific variable name to avoid catching prefixing code
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
        
        // 4. Find the LAST ']' or '}' in the file
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
    
    const data = await loadDataFile('search-index.js', 'searchIndex');
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
    if (!searchIndexData) return;

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
    if (!searchIndexData) return;
    let matches = [];
    
    if (selectedCol !== 'all') {
        matches = searchIndexData.filter(i => i.c === selectedCol && i.n.includes(query));
    } else {
        matches = searchIndexData.filter(i => i.n.includes(query) || i.c.includes(query));
        if (matches.length > 200) {
            matches = matches.slice(0, 200);
        }
    }

    if (matches.length === 0) {
        loadingState.style.display = 'block';
        loadingState.textContent = 'No icons found.';
        return;
    }

    if (!window.collectionData) window.collectionData = {};
    
    const grouped = {};
    matches.forEach(m => {
        if (!grouped[m.c]) grouped[m.c] = [];
        grouped[m.c].push(m.n);
    });

    const fetches = Object.entries(grouped).map(async ([colId, icons]) => {
        if (!window.collectionData[colId]) {
            const colData = await loadDataFile(`${colId}.js`, `collectionData['${colId}']`);
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

    loadingState.style.display = 'none';
    iconGrid.innerHTML = finalMatches.map(icon => `
        <div class="icon-item" title="${icon.name}">
            ${icon.content}
        </div>
    `).join('');

    // Attach Insert events
    document.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => {
            const svg = item.querySelector('svg');
            const svgStr = svg.outerHTML;

            item.style.transform = 'scale(0.95)';
            setTimeout(() => item.style.transform = '', 100);

            // POST MESSAGE TO VS CODE HOST
            vscode.postMessage({
                command: 'insert-icon',
                svgCode: svgStr
            });

            toast.textContent = 'Code inserted!';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
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
