const BASE_DATA_URL = "https://cdn.jsdelivr.net/gh/fivenightsatbothra-commits/Freeico@main/Data";

const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const iconGrid = document.getElementById("iconGrid");
const toast = document.getElementById("toast");
let searchIndexData = null;
let currentCollections = typeof collectionsList !== 'undefined' ? collectionsList : [
    "academicons", "akar-icons", "ant-design", "arcticons", "basil", "bootstrap", "boxicons", 
    "carbon", "clarity", "circum", "coreui", "dashicons", "entypo", "eva", "feather", "flat-color-icons", 
    "fluent", "fluent-emoji", "font-awesome", "game-icons", "heroicons", "iconamoon", "iconoir", 
    "ionicons", "jam", "lucide", "material-design-icons", "octicons", "phosphor", "radix", "remix", 
    "simple-icons", "tabler", "typicons", "unicons", "weather-icons", "zondicons", "hugeicons"
];

// Populate Native Dropdown
function initSelect() {
    const sorted = [...currentCollections].sort((a,b) => a.localeCompare(b));
    sorted.forEach(c => {
        const titleCase = c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const option = document.createElement("option");
        option.value = c;
        option.textContent = titleCase;
        categorySelect.appendChild(option);
    });
}

// Data Fetcher
// Data files look like: collectionData['feather'] = [{...}];
// We must find the '[' AFTER the '=' sign, not the first '[' in the subscript accessor.
async function fetchSafeJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) { console.error("HTTP Error:", res.status, url); return null; }
        const text = await res.text();
        // Find the assignment operator '=' first, then look for '[' after it
        const eqIndex = text.indexOf('=');
        if (eqIndex === -1) return null;
        const arrayStart = text.indexOf('[', eqIndex);
        const arrayEnd = text.lastIndexOf(']');
        if (arrayStart !== -1 && arrayEnd > arrayStart) {
            return JSON.parse(text.slice(arrayStart, arrayEnd + 1));
        }
        return null;
    } catch(err) {
        console.error("fetchSafeJSON Error:", err);
        return null;
    }
}

// Load Index
async function loadSearchIndex() {
    iconGrid.innerHTML = `<div class="loadingState">Downloading comprehensive search index...</div>`;
    searchIndexData = await fetchSafeJSON(`${BASE_DATA_URL}/search-index.js`);
    if (searchIndexData) {
        iconGrid.innerHTML = `<div class="loadingState">Ready. Explore 300,000+ freeico icons.</div>`;
    } else {
        iconGrid.innerHTML = `<div class="loadingState">Failed to establish connection.</div>`;
    }
}

// Core Execution
let searchTimeout;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = searchInput.value.toLowerCase().trim();
        const cat = categorySelect.value;
        if (!query && cat === 'all') {
            iconGrid.innerHTML = `<div class="loadingState">Ready. Explore 300,000+ freeico icons.</div>`;
            return;
        }
        executeSearch(query, cat);
    }, 250); // slight debounce
}

async function executeSearch(query, category) {
    if (!searchIndexData) return;
    iconGrid.innerHTML = `<div class="loadingState">Searching databases...</div>`;

    // Filter Indexed Nodes
    let matches = [];
    if (category !== 'all') {
        matches = searchIndexData.filter(i => i.c === category && i.n.includes(query));
    } else {
        matches = searchIndexData.filter(i => i.n.includes(query) || i.c.includes(query));
        if (matches.length > 150) matches = matches.slice(0, 150); // Hard cutoff for super large subsets
    }

    if (matches.length === 0) {
        iconGrid.innerHTML = `<div class="loadingState">No results located.</div>`;
        return;
    }

    // Prepare Collections Matrix
    if (!window.liveCollectionMatrix) window.liveCollectionMatrix = {};
    const groupedDemands = {};
    matches.forEach(m => {
        if (!groupedDemands[m.c]) groupedDemands[m.c] = [];
        groupedDemands[m.c].push(m.n);
    });

    const resolutionMap = Object.entries(groupedDemands).map(async ([colId, names]) => {
        if (!window.liveCollectionMatrix[colId]) {
            const data = await fetchSafeJSON(`${BASE_DATA_URL}/${colId}.js`);
            if (data) window.liveCollectionMatrix[colId] = data;
        }
        const cluster = window.liveCollectionMatrix[colId];
        if (!cluster) return [];
        return names.map(n => cluster.find(i => i.name === n)).filter(Boolean);
    });

    const finalizedClusters = await Promise.all(resolutionMap);
    const validIcons = finalizedClusters.flat();

    // Render
    iconGrid.innerHTML = validIcons.map(icon => `
        <div class="icon-card" title="${icon.name}">
            ${icon.content}
        </div>
    `).join('');

    // Attach click-to-copy handlers
    document.querySelectorAll('.icon-card').forEach(item => {
        item.addEventListener('click', () => {
            const svgContent = item.innerHTML.trim();
            navigator.clipboard.writeText(svgContent).then(() => {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 1500);
            });
        });
    });
}

// Bind 
searchInput.addEventListener('input', handleSearch);
categorySelect.addEventListener('change', handleSearch);

// Boot sequence
initSelect();
loadSearchIndex();
