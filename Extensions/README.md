# Freeico Ecosystem Guides

Welcome to the Freeico extensions directory. All of these plugins are designed using a lightweight, hyper-scalable "Webview Wrapper" architecture. Instead of duplicating logic 4 different times, every plugin simply embeds the *live* Freeico web application (`fivenightsatbothra-commits.github.io`) and establishes a cross-origin `postMessage` pipeline!

Whenever a user clicks "Copy SVG" or "Save Icon" in the UI, the web app intelligently broadcasts the SVGs directly to the plugin wrapper, which then handles native insertion (into Figma layers, VS Code files, etc.).

---

## 🎨 1. Figma Plugin

### How to use without the Desktop App
Currently, Figma strictly requires the **Figma Desktop App** to load *local, unpublished* plugins from a `manifest.json` file. While web users can run *published* plugins flawlessly, developers need the desktop client to test them.

**To test it:**
1. Download the Figma Desktop app (it's free).
2. Right-click the canvas -> **Plugins** -> **Development** -> **Import plugin from manifest...**
3. Select `Extensions/Figma/manifest.json`.
4. Run it! The SVG layers will be natively inserted into your active frame.
5. Once you confirm it works, you can hit **Publish** to release it to the global Figma Community, allowing you (and everyone else) to use it from the Web browser forever!

---

## 💻 2. VS Code Extension

1. Open the `Extensions/VSCode` folder directly in VS Code.
2. Open a terminal and run `npm install`.
3. Press **`F5`** on your keyboard. This opens an "Extension Development Host" window.
4. In the new window, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac).
5. Search for and enter **`Freeico: Open Icons`**.
6. The panel will open. Click any SVG in the list, and it will instantly paste into your active code file!

---

## 🖼️ 3. Framer Plugin

Framer plugins are modern React applications. 

**To test it:**
1. Open a terminal to `Extensions/Framer/`.
2. Run `npm install` then `npm run dev`.
3. Open a Framer project in your web browser.
4. Go to **Menu** -> **Plugins** -> **Plugin Development** -> **Connect Local Plugin**.
5. The local server will beam the UI into your Framer canvas. Clicking any SVG will spawn an SVG primitive right onto your website canvas!

---

## 🌐 4. Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Turn on **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left.
4. Select the `Extensions/Chrome` folder.
5. Pin the Freeico extension to your toolbar. Click it, and it will open an instantly-accessible side panel containing the entire application!
