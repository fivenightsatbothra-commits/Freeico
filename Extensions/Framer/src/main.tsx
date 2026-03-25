import { framer } from "framer-plugin";

framer.showUI({
  position: "top right",
  width: 320,
  height: 520,
});

// Intercept messages from our GitHub Pages site embed
window.addEventListener("message", async (e) => {
    // Basic safety check
    if (e.origin !== "https://fivenightsatbothra-commits.github.io") return;
    
    const msg = e.data?.pluginMessage;
    if (msg && msg.type === "insert-svg") {
        try {
            await framer.addSVG({
                svg: msg.svg,
                name: msg.name || "Freeico SVG"
            });
            framer.notify("⚡ Freeico: SVG layer inserted!");
        } catch(err) {
            framer.notify("Error inserting SVG. Try dragging instead.", { variant: "error" });
        }
    }
});

function App() {
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <iframe 
                src="https://fivenightsatbothra-commits.github.io/Freeico/index.html?minimal=true" 
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
        </div>
    );
}
