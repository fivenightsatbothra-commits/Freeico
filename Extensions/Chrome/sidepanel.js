document.addEventListener('DOMContentLoaded', () => {
    const frame = document.getElementById('app-frame');
    if (frame) {
        // Enforce cache-busting to bypass aggressive Chrome Sidepanel iframe edge caching
        frame.src = "https://fivenightsatbothra-commits.github.io/Freeico/index.html?minimal=true&v=" + new Date().getTime();
    }

    // Optional event listener bridging for copying SVGs
    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "INSERT_SVG") {
            navigator.clipboard.writeText(event.data.svg).then(() => {
                console.log("SVG natively copied to clipboard by Chrome Sidepanel bridge.");
            });
        }
    });
});
