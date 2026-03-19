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

// Load Search Index
function loadIndex(callback) {
    if (searchIndexData) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = 'data/search-index.js';
    script.onload = () => {
        searchIndexData = window.searchIndex;
        loadingState.style.display = 'none';
        callback();
    };
    document.body.appendChild(script);
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
        loadingState.textContent = 'No icons found.';
        return;
    }

    // 2. Fetch required collections
    const grouped = {};
    matches.forEach(m => {
        if (!grouped[m.c]) grouped[m.c] = [];
        grouped[m.c].push(m.n);
    });

    const fetches = Object.entries(grouped).map(async ([colId, icons]) => {
        if (!window.collectionData || !window.collectionData[colId]) {
            try {
                const scriptId = 'script-' + colId;
                if (!document.getElementById(scriptId)) {
                    await new Promise((resolve, reject) => {
                        const s = document.createElement('script');
                        s.id = scriptId;
                        s.src = `data/${colId}.js`;
                        s.onload = resolve;
                        s.onerror = reject;
                        document.body.appendChild(s);
                    });
                } else {
                    let retries = 0;
                    while ((!window.collectionData || !window.collectionData[colId]) && retries < 100) {
                        await new Promise(r => setTimeout(r, 20));
                        retries++;
                    }
                }
            } catch(e) {}
        }
        
        let colData = window.collectionData ? window.collectionData[colId] : null;
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
