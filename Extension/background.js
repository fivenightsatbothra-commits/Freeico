chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadSVGs") {
        request.urls.forEach((url, i) => {
            let filename = '';
            
            if (url.startsWith('data:image/svg+xml')) {
                // Handle Inline SVGs (Data URLs)
                const timestamp = new Date().getTime();
                const index = request.index !== undefined ? request.index : i;
                filename = `inline_svg_${timestamp}_${index}.svg`;
            } else {
                // Handle External URLs
                try {
                    const urlObj = new URL(url);
                    filename = urlObj.pathname.substring(urlObj.pathname.lastIndexOf('/') + 1);
                    
                    // Fallback if filename is empty or doesn't end in .svg
                    if (!filename || !filename.toLowerCase().endsWith('.svg')) {
                        filename = `scraped_svg_${new Date().getTime()}_${i}.svg`;
                    }
                } catch (e) {
                    filename = `scraped_svg_${new Date().getTime()}_${i}.svg`;
                }
            }

            chrome.downloads.download({
                url: url,
                filename: `SVG_Scraper/${filename}`,
                conflictAction: "uniquify"
            }, (downloadId) => {
                if (chrome.runtime.lastError) {
                    console.error("Download failed for " + url + ": ", chrome.runtime.lastError.message);
                }
            });
        });
    }
});