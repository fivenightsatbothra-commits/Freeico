"use strict";
(() => {
  // code.ts
  figma.showUI(__html__, { width: 350, height: 600 });
  figma.ui.onmessage = (msg) => {
    if (msg.type === "insert-svg") {
      const node = figma.createNodeFromSvg(msg.svg);
      node.name = msg.name;
      node.x = figma.viewport.center.x - node.width / 2;
      node.y = figma.viewport.center.y - node.height / 2;
      figma.currentPage.appendChild(node);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      figma.notify(`Inserted ${msg.name}`);
    }
  };
})();
