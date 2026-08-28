import { renderTileMenu } from "./menuRenderer.js";
import {
  initGrid,
  serializeBoardState,
  deserializeBoardState,
} from "./grid.js";
import { initModal } from "./modal.js";
import { initInteractions } from "./interactions.js";
import { initMapViewport } from "./viewport.js";

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
  badge.className = "version-badge";
  badge.textContent = ver;

  document.body.appendChild(badge);
}

/**
 * Initializes JSON save/load toolbar controls.
 */
function initStorageControls() {
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFileInput = document.getElementById("import-file-input");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const state = serializeBoardState();
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `dq-tilemap-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (importBtn && importFileInput) {
    importBtn.addEventListener("click", () => {
      importFileInput.value = "";
      importFileInput.click();
    });

    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedState = JSON.parse(event.target.result);
          deserializeBoardState(parsedState);
        } catch (err) {
          alert("Failed to load map state: Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    });
  }
}

console.log(`dq-tilemap-ui ${version} - ${projectUrl}`);

document.addEventListener("DOMContentLoaded", () => {
  initVersionBadge(version);
  initMapViewport();
  renderTileMenu();
  initGrid();
  initModal();
  initInteractions();
  initStorageControls();
});
