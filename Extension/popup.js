document.getElementById('downloadBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Execute the auto-loading script
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: autoLoadAndFindSVGs
    });
});

// This function runs IN the context of the webpage
function autoLoadAndFindSVGs() {
    alert("Auto-loading icons... Please stay on this page. It will download when finished.");

    // 1. Function to find and click the button
    function clickLoadMore() {
        // Looks for any button or link containing the words "load" or "show more"
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const loadMoreBtn = buttons.find(btn => {
            const text = btn.innerText ? btn.innerText.toLowerCase() : '';
            return text.includes('load more') || text.includes('show more');
        });

        // If the button exists and isn't hidden/disabled, click it
        if (loadMoreBtn && loadMoreBtn.offsetParent !== null && !loadMoreBtn.disabled) {
            loadMoreBtn.click();
            // Scroll to bottom to help trigger lazy-loaded images
            window.scrollTo(0, document.body.scrollHeight);
            return true;
        }
        return false; // Button not found or no longer clickable
    }

    // 2. Loop to keep clicking until everything is loaded
    let attempts = 0;
    const maxAttempts = 100; // Safeguard: stop after 100 clicks to prevent infinite loops

    function attemptLoad() {
        if (clickLoadMore() && attempts < maxAttempts) {
            attempts++;
            console.log(`Clicked load more (${attempts}). Waiting for new icons...`);
            // Wait 2.5 seconds for the network to fetch and render the new icons, then try again
            setTimeout(attemptLoad, 2500);
        } else {
            console.log("Finished loading all pages! Extracting SVGs...");
            extractAndDownload();
        }
    }

    // 3. The extraction logic (runs after all loading is done)
    function extractAndDownload() {
        const svgElements = document.querySelectorAll('img[src$=".svg"], a[href$=".svg"]');
        const urls = new Set();

        svgElements.forEach(el => {
            let url = el.src || el.href;
            if (url) urls.add(url);
        });

        const urlArray = Array.from(urls);

        if (urlArray.length === 0) {
            alert("No SVGs found on this page!");
            return;
        }

        alert(`Success! Found ${urlArray.length} SVGs. Starting download...`);
        chrome.runtime.sendMessage({ action: "downloadSVGs", urls: urlArray });
    }

    // Start the automated loop
    attemptLoad();
}