const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

// 1. App state
code = code.replace(
    'const navHome = document.getElementById(\'nav-home\');\nconst popoverContainer = document.getElementById(\'icon-popover-container\');\n\n// State\nlet selectedIcon = null;\nlet currentObserver = null;\n\n// Initialize\nfunction init() {',
    `const navHome = document.getElementById('nav-home');
const navSearch = document.getElementById('nav-search');
const navBookmarks = document.getElementById('nav-bookmarks');
const popoverContainer = document.getElementById('icon-popover-container');

// State
let selectedIcon = null;
let currentObserver = null;
let pinnedCollections = JSON.parse(localStorage.getItem('freeico_pins') || '[]');
let savedBookmarks = JSON.parse(localStorage.getItem('freeico_bookmarks') || '[]');
let searchIndexData = null;

// Initialize
function init() {`
);

// 2. Nav logic
code = code.replace(
    `    // Event Listeners
    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        renderHomeView();
        // hide popover if any
        popoverContainer.innerHTML = '';
        selectedIcon = null;
    });

    // Close popover when clicking outside`,
    `    // Event Listeners
    const setActiveNav = (activeEl) => {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if(activeEl) activeEl.classList.add('active');
    };

    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveNav(navHome);
        if (mainSearch) mainSearch.value = '';
        renderHomeView();
        popoverContainer.innerHTML = '';
        selectedIcon = null;
    });

    if (navBookmarks) {
        navBookmarks.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveNav(navBookmarks);
            renderBookmarksView();
            popoverContainer.innerHTML = '';
        });
    }

    if (navSearch) {
        navSearch.addEventListener('click', (e) => {
            e.preventDefault();
            if (mainSearch) {
                mainSearch.focus();
                // scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (mainSearch) {
        mainSearch.addEventListener('focus', () => {
            if (!searchIndexData) {
                const tempScript = document.createElement('script');
                tempScript.src = 'data/search-index.js';
                tempScript.onload = () => { searchIndexData = window.searchIndex; };
                document.body.appendChild(tempScript);
            }
        });

        mainSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.trim() === '') {
                renderHomeView();
                return;
            }
            if (searchIndexData) {
                setActiveNav(navSearch);
                renderSearchResults(query);
            }
        });
    }

    // Close popover when clicking outside`
);

// 3. Render Sidebar
code = code.replace(
    `function renderSidebarCollections() {
    sidebarCollectionsList.innerHTML = collections.map(c => \`
        <a href="#" class="collection-nav-item" data-id="\${c.id}">
            \${c.name}
        </a>
    \`).join('');`,
    `function renderSidebarCollections() {
    const sortedCollections = [...collections].sort((a, b) => {
        const aPinned = pinnedCollections.includes(a.id);
        const bPinned = pinnedCollections.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return a.name.localeCompare(b.name);
    });

    sidebarCollectionsList.innerHTML = sortedCollections.map(c => \`
        <a href="#" class="collection-nav-item" data-id="\${c.id}">
            \${c.name} \${pinnedCollections.includes(c.id) ? '📌' : ''}
        </a>
    \`).join('');`
);

// 4. Pin logic
code = code.replace(
    `<button class="btn btn-primary">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    Pin this collection
                </button>`,
    `<button class="btn btn-primary" id="btn-pin-collection">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    \${pinnedCollections.includes(collection.id) ? 'Unpin Collection' : 'Pin Collection'}
                </button>`
);

code = code.replace(
    `    // Show loading state for grid
    contentArea.className = 'icon-grid';`,
    `    // Pin Logic
    const pinBtn = document.getElementById('btn-pin-collection');
    if (pinBtn) {
        pinBtn.addEventListener('click', (e) => {
            if (pinnedCollections.includes(collection.id)) {
                pinnedCollections = pinnedCollections.filter(id => id !== collection.id);
                e.currentTarget.innerHTML = e.currentTarget.innerHTML.replace('Unpin Collection', 'Pin Collection');
            } else {
                pinnedCollections.push(collection.id);
                e.currentTarget.innerHTML = e.currentTarget.innerHTML.replace('Pin Collection', 'Unpin Collection');
            }
            localStorage.setItem('freeico_pins', JSON.stringify(pinnedCollections));
            renderSidebarCollections();
        });
    }

    // Show loading state for grid
    contentArea.className = 'icon-grid';`
);

// 5. Save buttons
code = code.replace(
    `<button title="Copy SVG"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> copy</button>
                    <button title="Save Icon"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> save</button>`,
    `<button title="Copy SVG" class="quick-copy-svg"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> copy</button>
                    <button title="Save Icon" class="quick-save-svg"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> save</button>`
);

code = code.replace(
    `            // Attach click event for popover to the newly created element
            if (item.classList && item.classList.contains('icon-item')) {
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.icon-quick-actions')) return;`,
    `            // Attach click event for popover to the newly created element
            if (item.classList && item.classList.contains('icon-item')) {
                const saveBtn = item.querySelector('.quick-save-svg');
                const copyBtn = item.querySelector('.quick-copy-svg');
                if (saveBtn) {
                    saveBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const svgHtml = item.querySelector('svg').outerHTML;
                        const iconObj = { 
                            name: file.name, 
                            collection: file.customCollection || collection.name, 
                            content: svgHtml, 
                            author: file.customAuthor || collection.author || 'Unknown', 
                            id: \`\${file.customCollection || collection.name}-\${file.name}\` 
                        };
                        if (!savedBookmarks.some(b => b.id === iconObj.id)) {
                            savedBookmarks.push(iconObj);
                            localStorage.setItem('freeico_bookmarks', JSON.stringify(savedBookmarks));
                            const span = saveBtn.innerHTML;
                            saveBtn.innerHTML = 'saved!';
                            setTimeout(() => saveBtn.innerHTML = span, 1000);
                        }
                    });
                }
                if (copyBtn) {
                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.querySelector('svg').outerHTML);
                        const span = copyBtn.innerHTML;
                        copyBtn.innerHTML = 'copied!';
                        setTimeout(() => copyBtn.innerHTML = span, 1000);
                    });
                }
                
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.icon-quick-actions')) return;`
);

code = code.replace(
    `                        name: item.dataset.filename || 'Unknown Icon',
                        collection: item.dataset.collection,
                        author: item.dataset.author`,
    `                        name: item.dataset.filename || 'Unknown Icon',
                        collection: item.dataset.collection || 'Unknown',
                        author: item.dataset.author || 'Unknown'`
);

// 6. Popover bookmark
code = code.replace(
    `<button title="Bookmark">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" class="css-i6dzq1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        </button>`,
    `<button title="Bookmark" id="popover-btn-bookmark">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" class="css-i6dzq1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        </button>`
);

code += \`

function renderBookmarksView() {
    topSection.innerHTML = \\\`
        <div class="collection-view-header">
            <h1>Your Bookmarks</h1>
            <p>You have \\\${savedBookmarks.length} explicitly saved icons across all collections.</p>
        </div>
    \\\`;
    const dummyCollection = { name: "Bookmarks", author: "You" };
    renderIconsGrid(dummyCollection, savedBookmarks.map(b => ({
        name: b.name,
        content: b.content,
        customCollection: b.collection,
        customAuthor: b.author
    })));
}

async function renderSearchResults(query) {
    // Find up to 150 unique matches to display
    const matches = searchIndexData.filter(item => item.n.includes(query)).slice(0, 150);
    if (matches.length === 0) {
        contentArea.innerHTML = '<div style="padding:40px;text-align:center;">No icons found.</div>';
        return;
    }

    contentArea.innerHTML = '<div style="padding:40px;text-align:center;">Loading matches...</div>';
    
    const renderedMatches = [];
    const groupedByCol = {};
    matches.forEach(m => {
        if (!groupedByCol[m.c]) groupedByCol[m.c] = [];
        groupedByCol[m.c].push(m.n);
    });

    for (const [colId, iconNames] of Object.entries(groupedByCol)) {
        let colData = window.collectionData ? window.collectionData[colId] : null;
        if (!colData) {
            try {
                // Dynamically fetch the collection purely for the search results
                let response = await fetch(\\\`data/\\\${colId}.js\\\`);
                let scriptText = await response.text();
                // Execute to populate window.collectionData
                eval(scriptText.replace('window.onCollectionLoaded("'+colId+'");', ''));
                colData = window.collectionData[colId];
            } catch(e) { }
        }
        
        if (colData) {
            const colInfo = collections.find(c => c.id === colId);
            iconNames.forEach(name => {
                const icon = colData.find(i => i.name === name);
                if (icon) {
                    renderedMatches.push({
                        name: icon.name,
                        content: icon.content,
                        customCollection: colInfo ? colInfo.name : colId,
                        customAuthor: colInfo ? colInfo.author : 'Unknown'
                    });
                }
            });
        }
    }
    
    topSection.innerHTML = \\\`
        <div class="collection-view-header">
            <h1>Search Results</h1>
            <p>Found matches for "\\\${query}"</p>
        </div>
    \\\`;
    renderIconsGrid({ name: "Search Results", author: "Various" }, renderedMatches);
}

// Attach bookmark button globally to popover
document.addEventListener('click', (e) => {
    const btn = e.target.closest('#popover-btn-bookmark');
    if (btn && selectedIcon) {
        const iconObj = { 
            name: selectedIcon.name, 
            collection: selectedIcon.collection, 
            content: selectedIcon.svg, 
            author: selectedIcon.author, 
            id: \\\`\\\${selectedIcon.collection}-\\\${selectedIcon.name}\\\` 
        };
        if (!savedBookmarks.some(b => b.id === iconObj.id)) {
            savedBookmarks.push(iconObj);
            localStorage.setItem('freeico_bookmarks', JSON.stringify(savedBookmarks));
            const iconSvg = btn.innerHTML;
            btn.innerHTML = 'Saved';
            setTimeout(() => btn.innerHTML = iconSvg, 1500);
        }
    }
});
\`;

fs.writeFileSync('script.js', code);
console.log('Update successful');
