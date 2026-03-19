// The `collectionsList` variable is now globally available from collections-list.js 
const collections = collectionsList;

// DOM Elements
const sidebarCollectionsList = document.getElementById('sidebar-collections-list');
const contentArea = document.getElementById('content-area');
const topSection = document.getElementById('top-section');
const mainSearch = document.getElementById('main-search');
const navHome = document.getElementById('nav-home');
const popoverContainer = document.getElementById('icon-popover-container');

// State
let selectedIcon = null;
let currentObserver = null;

// Initialize
function init() {
    renderSidebarCollections();
    renderHomeView();
    
    // Event Listeners
    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        renderHomeView();
        // hide popover if any
        popoverContainer.innerHTML = '';
        selectedIcon = null;
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.icon-item') && !e.target.closest('.icon-popover-wrapper')) {
            popoverContainer.innerHTML = '';
            document.querySelectorAll('.icon-item').forEach(el => el.classList.remove('selected'));
            selectedIcon = null;
        }
    });
}

function renderSidebarCollections() {
    sidebarCollectionsList.innerHTML = collections.map(c => `
        <a href="#" class="collection-nav-item" data-id="${c.id}">
            ${c.name}
        </a>
    `).join('');

    sidebarCollectionsList.querySelectorAll('.collection-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const colId = e.currentTarget.dataset.id;
            const collection = collections.find(c => c.id === colId);
            renderCollectionView(collection);
        });
    });
}

function renderHomeView() {
    // Reset top section to default home view
    topSection.innerHTML = `
        <div class="header-text" id="header-text-container">
            <h1>freeico Search</h1>
            <p>Open Source Icons: Search Fast. Edit Freely.<br>Download Instantly.</p>
            <div class="action-buttons">
                <button class="btn btn-primary">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    Search icons
                </button>
                <button class="btn btn-secondary">Unlock Pro Features</button>
            </div>
            <div class="social-proof">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none" class="heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                Used by 500K+ professionals worldwide
                <div class="company-logos">
                    <span class="company-tag"><b>F</b> Framer</span>
                    <span class="company-tag">Midjourney</span>
                    <span class="company-tag"><b>F</b> Figma</span>
                    <span class="company-tag"><b>M</b> Mobbin</span>
                    <span class="company-tag"><b>G</b> Google</span>
                    <span class="company-tag">Microsoft</span>
                    <span class="company-tag">cohere</span>
                    <span class="company-tag"><b>$</b> CashApp</span>
                </div>
            </div>
        </div>
        <div class="promo-banner">
            <div class="promo-content">
                <div class="promo-logo">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="#fff" stroke-width="2" fill="none"><path d="M5 3l14 9-14 9V3z"></path></svg>
                </div>
                <div class="promo-text-wrap">
                    <h3>SuperDev Pro</h3>
                    <span class="promo-badge">#1 Chrome Extension</span>
                </div>
            </div>
            <div class="stars">★★★★★ 4.7 · 9k+ users</div>
            <p>32+ tools in 1 browser extension for chrome & firefox</p>
            <button class="btn-promo">Install for free ↗</button>
        </div>
    `;

    // Render grid of collections
    contentArea.className = 'collections-grid';
    contentArea.innerHTML = collections.map(c => {
        const previews = c.previewSvgs || [];
        return `
        <a href="#" class="collection-card" style="background-color: ${c.color}" data-id="${c.id}">
            <div class="collection-header">
                <div class="collection-title">${c.name}</div>
                <div class="collection-count">${c.count.toLocaleString()}</div>
            </div>
            <div class="collection-icons-preview">
                ${previews.map(svg => `<div class="preview-icon-box">${svg}</div>`).join('')}
            </div>
        </a>
    `}).join('');

    // Attach events
    contentArea.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const colId = e.currentTarget.dataset.id;
            const collection = collections.find(c => c.id === colId);
            renderCollectionView(collection);
        });
    });
}

function renderCollectionView(collection) {
    // Update Header
    topSection.innerHTML = `
        <div class="collection-view-header">
            <h1>${collection.name}</h1>
            <p>Discover ${collection.count.toLocaleString()} high-quality icons in the ${collection.name} collection, crafted by ${collection.author}. Licensed under Apache 2.0, perfect for web, app, and design projects.</p>
            <div class="action-buttons-alt">
                <button class="btn btn-primary">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    Pin this collection
                </button>
                <button class="btn btn-secondary">Unlock All Features</button>
            </div>
        </div>
        <div class="promo-banner" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); width: 280px; padding: 20px;">
            <div class="promo-content">
                <div class="promo-logo" style="background: #10b981; width: 40px; height: 40px; border-radius: 8px;">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="#fff" stroke-width="2" fill="none"><path d="M5 3l14 9-14 9V3z"></path></svg>
                </div>
                <div class="promo-text-wrap">
                    <h3 style="font-size: 1rem;">SuperDev Pro</h3>
                    <span class="promo-badge" style="font-size: 0.6rem;">#1 Chrome Extension</span>
                </div>
            </div>
            <div class="stars" style="font-size: 0.7rem; margin-bottom: 8px;">★★★★★ 4.7 · 9k+ users</div>
            <p style="font-size: 0.8rem; margin-bottom: 12px;">32+ tools in 1 browser extension for chrome & firefox</p>
            <button class="btn-promo" style="padding: 10px; font-size: 0.85rem;">Install for free ↗</button>
        </div>
    `;

    // Show loading state for grid
    contentArea.className = 'icon-grid';
    contentArea.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary);">Loading icons...</div>';

    // Lazy load the specific collection Data
    if (window.collectionData && window.collectionData[collection.id]) {
        renderIconsGrid(collection, window.collectionData[collection.id]);
    } else {
        window.onCollectionLoaded = function(loadedId) {
            if (loadedId === collection.id) {
                renderIconsGrid(collection, window.collectionData[collection.id]);
            }
        };
        const scriptId = 'script-' + collection.id;
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `data/${collection.id}.js`;
            script.onerror = () => {
                contentArea.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: red;">Failed to load icons for this collection.</div>';
            };
            document.body.appendChild(script);
        }
    }
}

function renderIconsGrid(collection, files) {
    if (currentObserver) {
        currentObserver.disconnect();
        currentObserver = null;
    }
    
    contentArea.className = 'icon-grid';
    contentArea.innerHTML = '';
    
    // Add sentinel element for infinite scrolling
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.gridColumn = '1 / -1';
    sentinel.style.height = '40px';
    contentArea.appendChild(sentinel);

    const CHUNK_SIZE = 100;
    let currentIndex = 0;

    const renderChunk = () => {
        const chunk = files.slice(currentIndex, Math.min(currentIndex + CHUNK_SIZE, files.length));
        if (chunk.length === 0) return;

        const html = chunk.map((file, idx) => `
            <div class="icon-item" data-id="icon-${currentIndex + idx}" data-filename="${file.name}" data-collection="${collection.name}" data-author="${collection.author}">
                ${file.content}
                <div class="icon-quick-actions">
                    <button title="Copy SVG"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> copy</button>
                    <button title="Save Icon"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> save</button>
                </div>
            </div>
        `).join('');

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        while (tempDiv.firstChild) {
            const item = tempDiv.firstChild;
            
            // Attach click event for popover to the newly created element
            if (item.classList && item.classList.contains('icon-item')) {
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.icon-quick-actions')) return;
                    
                    e.stopPropagation();
                    
                    // clear selection
                    document.querySelectorAll('.icon-item').forEach(el => el.classList.remove('selected'));
                    
                    // set selection
                    item.classList.add('selected');
                    selectedIcon = {
                        svg: item.querySelector('svg') ? item.querySelector('svg').outerHTML : '',
                        name: item.dataset.filename || 'Unknown Icon',
                        collection: item.dataset.collection,
                        author: item.dataset.author
                    };
        
                    showPopover(selectedIcon);
                });
            }
            
            // Insert the item before the sentinel
            contentArea.insertBefore(item, sentinel);
        }

        currentIndex += CHUNK_SIZE;

        if (currentIndex >= files.length) {
            sentinel.style.display = 'none';
            if (currentObserver) {
                currentObserver.disconnect();
            }
        }
    };

    // Setting up the observer
    currentObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            renderChunk();
        }
    }, { rootMargin: '200px' });

    currentObserver.observe(sentinel);

    // Initial render
    renderChunk();
}

function showPopover(icon) {
    popoverContainer.innerHTML = `
        <div class="icon-popover-wrapper">
            <div class="popover-icon-preview" style="color: #000000;">
                ${icon.svg}
            </div>
            <div class="popover-details">
                <div class="popover-header">
                    <div class="popover-title-area">
                        <h3>${icon.name}</h3>
                        <p>By ${icon.author} in <a href="#">${icon.collection}</a></p>
                    </div>
                    <div class="popover-actions-top">
                        <button title="Open in new tab">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </button>
                        <button title="Bookmark">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" class="css-i6dzq1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        </button>
                        <button class="close-popover" title="Close">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <div class="popover-controls">
                    <select class="select-wrapper" id="popover-size-select">
                        <option value="16">16px</option>
                        <option value="24">24px</option>
                        <option value="32">32px</option>
                        <option value="48">48px</option>
                        <option value="512" selected>512px</option>
                    </select>
                    
                    <div class="color-input-wrapper">
                        <input type="text" id="popover-color-input" value="#000000">
                        <input type="color" id="popover-color-picker" value="#000000" style="opacity:0; position:absolute; width:20px; height:20px; cursor:pointer;" title="Choose color">
                        <div class="color-swatch" id="popover-color-swatch" style="background-color: #000000; pointer-events: none;"></div>
                    </div>
                    
                    <button class="btn-icon" id="popover-reset-btn" title="Reset details">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    </button>
                </div>

                <div class="popover-downloads">
                    <button class="dl-btn primary" id="popover-dl-svg">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> 
                        <span>SVG</span>
                    </button>
                    <button class="dl-btn primary" id="popover-dl-png">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> 
                        <span>PNG</span>
                    </button>
                    <button class="dl-btn secondary" id="popover-copy-svg">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 
                        <span>SVG</span>
                    </button>
                    <button class="dl-btn secondary" id="popover-copy-png">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 
                        <span>PNG</span>
                    </button>
                    <button class="dl-btn secondary" id="popover-copy-react">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 
                        <span>React</span>
                    </button>
                    <button class="dl-btn secondary" id="popover-copy-tsx">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 
                        <span>TypeScript</span>
                    </button>
                    <button class="dl-btn secondary" id="popover-copy-cdn">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> 
                        <span>CDN</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // DOM Elements for bindings
    const svgContainer = popoverContainer.querySelector('.popover-icon-preview');
    const sizeSelect = document.getElementById('popover-size-select');
    const colorInput = document.getElementById('popover-color-input');
    const colorPicker = document.getElementById('popover-color-picker');
    const colorSwatch = document.getElementById('popover-color-swatch');
    const resetBtn = document.getElementById('popover-reset-btn');

    // Make initial SVG scale properly within the preview box
    const previewSvgEl = svgContainer.querySelector('svg');
    if (previewSvgEl) {
        previewSvgEl.style.width = '64px';
        previewSvgEl.style.height = '64px';
    }

    // Function to apply colors to preview
    const applyColor = (hex) => {
        colorInput.value = hex;
        colorPicker.value = hex;
        colorSwatch.style.backgroundColor = hex;
        svgContainer.style.color = hex;
        
        if (previewSvgEl) {
            previewSvgEl.style.color = hex;
            previewSvgEl.querySelectorAll('[stroke]:not([stroke="none"])').forEach(el => el.setAttribute('stroke', hex));
            previewSvgEl.querySelectorAll('[fill]:not([fill="none"])').forEach(el => {
                const fillVal = el.getAttribute('fill');
                if (fillVal !== '#fff' && fillVal !== 'white' && fillVal !== 'transparent') {
                    el.setAttribute('fill', hex);
                }
            });
            previewSvgEl.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse').forEach(el => {
                if (!el.hasAttribute('fill') && !el.hasAttribute('stroke')) {
                    el.setAttribute('fill', hex);
                }
            });
        }
    };

    // Color events
    colorInput.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) applyColor(e.target.value);
    });
    colorPicker.addEventListener('input', (e) => applyColor(e.target.value));

    // Reset details
    resetBtn.addEventListener('click', () => {
        sizeSelect.value = "512";
        applyColor("#000000");
    });

    // Helper: generate the final SVG string with correct size and colors for export
    const getFinalSVGString = () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = icon.svg;
        const svgEl = tempDiv.querySelector('svg');
        const size = sizeSelect.value;
        const hex = colorInput.value;
        
        if (svgEl) {
            svgEl.setAttribute('width', size);
            svgEl.setAttribute('height', size);
            svgEl.style.removeProperty('width');
            svgEl.style.removeProperty('height');
            
            svgEl.querySelectorAll('[stroke]:not([stroke="none"])').forEach(el => el.setAttribute('stroke', hex));
            svgEl.querySelectorAll('[fill]:not([fill="none"])').forEach(el => {
                const fillVal = el.getAttribute('fill');
                if (fillVal !== '#fff' && fillVal !== 'white' && fillVal !== 'transparent') {
                    el.setAttribute('fill', hex);
                }
            });
            svgEl.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse').forEach(el => {
                if (!el.hasAttribute('fill') && !el.hasAttribute('stroke')) {
                    el.setAttribute('fill', hex);
                }
            });
            svgEl.style.color = hex;
        }
        
        return tempDiv.innerHTML;
    };

    // Helper: update button text temporarily
    const updateBtnText = (btn, text) => {
        const span = btn.querySelector('span');
        const orig = span.innerHTML;
        span.innerHTML = text;
        setTimeout(() => span.innerHTML = orig, 1500);
    };

    // Download SVG
    document.getElementById('popover-dl-svg').addEventListener('click', () => {
        const blob = new Blob([getFinalSVGString()], {type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${icon.name}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Download PNG
    document.getElementById('popover-dl-png').addEventListener('click', () => {
        const canvas = document.createElement("canvas");
        const size = parseInt(sizeSelect.value);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            const a = document.createElement("a");
            a.download = `${icon.name}.png`;
            a.href = canvas.toDataURL("image/png");
            a.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(getFinalSVGString())));
    });

    // Copy SVG Code
    document.getElementById('popover-copy-svg').addEventListener('click', (e) => {
        navigator.clipboard.writeText(getFinalSVGString());
        updateBtnText(e.currentTarget, 'Copied!');
    });

    // Copy PNG Image
    document.getElementById('popover-copy-png').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const canvas = document.createElement("canvas");
        const size = parseInt(sizeSelect.value);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            canvas.toBlob(blob => {
                if (navigator.clipboard.write) {
                    navigator.clipboard.write([new ClipboardItem({"image/png": blob})]).then(() => {
                        updateBtnText(btn, 'Copied!');
                    }).catch(() => updateBtnText(btn, 'Failed'));
                } else {
                    updateBtnText(btn, 'Failed');
                }
            });
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(getFinalSVGString())));
    });

    // Copy React
    document.getElementById('popover-copy-react').addEventListener('click', (e) => {
        let svgStr = getFinalSVGString();
        const size = sizeSelect.value;
        const jsxStr = svgStr
            .replace(/class=/g, "className=")
            .replace(/stroke-width=/g, "strokeWidth=")
            .replace(/stroke-linecap=/g, "strokeLinecap=")
            .replace(/stroke-linejoin=/g, "strokeLinejoin=")
            .replace(/fill-rule=/g, "fillRule=")
            .replace(/clip-rule=/g, "clipRule=")
            .replace(`width="${size}"`, `width={${size}}`)
            .replace(`height="${size}"`, `height={${size}}`);
            
        const cleanName = icon.name.replace(/[^a-zA-Z0-9]/g, '');
        const componentName = cleanName ? (cleanName.charAt(0).toUpperCase() + cleanName.slice(1)) : 'Icon';
        const finalJsx = jsxStr.replace(/<svg([^>]+)>/, '<svg$1 {...props}>');
        const out = `const ${componentName} = (props) => (\n  ${finalJsx}\n);\nexport default ${componentName};`;
        navigator.clipboard.writeText(out);
        updateBtnText(e.currentTarget, 'Copied!');
    });

    // Copy TypeScript
    document.getElementById('popover-copy-tsx').addEventListener('click', (e) => {
        let svgStr = getFinalSVGString();
        const size = sizeSelect.value;
        const jsxStr = svgStr
            .replace(/class=/g, "className=")
            .replace(/stroke-width=/g, "strokeWidth=")
            .replace(/stroke-linecap=/g, "strokeLinecap=")
            .replace(/stroke-linejoin=/g, "strokeLinejoin=")
            .replace(/fill-rule=/g, "fillRule=")
            .replace(/clip-rule=/g, "clipRule=")
            .replace(`width="${size}"`, `width={${size}}`)
            .replace(`height="${size}"`, `height={${size}}`);
            
        const cleanName = icon.name.replace(/[^a-zA-Z0-9]/g, '');
        const componentName = cleanName ? (cleanName.charAt(0).toUpperCase() + cleanName.slice(1)) : 'Icon';
        const finalJsx = jsxStr.replace(/<svg([^>]+)>/, '<svg$1 {...props}>');
        const out = `import React from 'react';\n\nconst ${componentName} = (props: React.SVGProps<SVGSVGElement>) => (\n  ${finalJsx}\n);\nexport default ${componentName};`;
        navigator.clipboard.writeText(out);
        updateBtnText(e.currentTarget, 'Copied!');
    });

    // Copy CDN link
    document.getElementById('popover-copy-cdn').addEventListener('click', (e) => {
        const baseUrl = window.location.href;
        const size = sizeSelect.value;
        const color = encodeURIComponent(colorInput.value);
        const link = new URL(`../svg-Collections/${icon.collection}/${icon.name}.svg?size=${size}&color=${color}`, baseUrl).href;
        navigator.clipboard.writeText(link);
        updateBtnText(e.currentTarget, 'Copied!');
    });

    // Close button functionality
    popoverContainer.querySelector('.close-popover').addEventListener('click', () => {
        popoverContainer.innerHTML = '';
        document.querySelectorAll('.icon-item').forEach(el => el.classList.remove('selected'));
        selectedIcon = null;
    });
}

// Start
init();
