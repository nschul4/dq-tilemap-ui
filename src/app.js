import { renderTileMenu } from "./menuRenderer.js";
import { initGrid } from "./grid.js";
import { initModal } from "./modal.js";
import { initInteractions } from "./interactions.js";

const version = "v1.0.0";
const projectUrl = "https://github.com/nschul4/dq-tilemap-ui";
const SHOW_VERSION_BADGE = true; // Toggle true/false to turn badge on/off

/**
 * Dynamically creates and injects a floating version badge into the top-right corner.
 * @param {string} ver - The version string to display.
 */
function initVersionBadge(ver) {
  if (!SHOW_VERSION_BADGE) return;

  const badge = document.createElement("div");
  badge.id = "version-badge";
  badge.textContent = ver;

  Object.assign(badge.style, {
    position: "fixed",
    top: "12px",
    right: "12px",
    background: "rgba(30, 30, 36, 0.75)",
    color: "#a0a0b0",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontFamily: "monospace",
    pointerEvents: "none",
    zIndex: "10000",
    backdropFilter: "blur(4px)",
    webkitBackdropFilter: "blur(4px)",
  });

  document.body.appendChild(badge);
}

console.log(`dq-tilemap-ui ${version} - ${projectUrl}`);

document.addEventListener("DOMContentLoaded", () => {
  initVersionBadge(version);
  renderTileMenu();
  initGrid();
  initModal();
  initInteractions();
});
