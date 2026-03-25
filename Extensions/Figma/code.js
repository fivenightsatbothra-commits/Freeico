figma.showUI(__html__, { width: 400, height: 600, themeColors: true });

figma.ui.onmessage = msg => {
  if (msg.type === 'insert-svg') {
    // Create new node from the SVG string
    const node = figma.createNodeFromSvg(msg.svg);
    node.name = msg.name || "Icon";
    
    // Position it in the center of the viewport
    node.x = figma.viewport.center.x - (node.width / 2);
    node.y = figma.viewport.center.y - (node.height / 2);
    
    // Add to current page and select it
    figma.currentPage.appendChild(node);
    figma.currentPage.selection = [node];
    
    // Notify user of success
    figma.notify('Freeico: SVG inserted successfully!');
  }
};
