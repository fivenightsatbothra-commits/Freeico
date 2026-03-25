// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 350, height: 600 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  if (msg.type === 'insert-svg') {
    // 1. Create the SVG node
    const node = figma.createNodeFromSvg(msg.svg);
    node.name = msg.name;

    // 2. Position it exactly where the user is looking
    node.x = figma.viewport.center.x - (node.width / 2);
    node.y = figma.viewport.center.y - (node.height / 2);

    // 3. Add it to the current page
    figma.currentPage.appendChild(node);
    
    // 4. Select the new node and zoom to it
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);

    // Optional: Notify the user in the Figma UI
    figma.notify(`Inserted ${msg.name}`);
  }
};
