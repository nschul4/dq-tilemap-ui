import { updateTileState } from "./grid.js";

let activeTile = null;

export function openTilePalette(
  tile,
  palette = document.getElementById("tile-palette"),
) {
  if (!tile || !palette) return;
  activeTile = tile;
  palette.returnValue = "";
  palette.showModal();
}

export function initModal(
  palette = document.getElementById("tile-palette"),
  cancelBtn = document.getElementById("menu-cancel"),
) {
  if (!palette) return;

  palette.addEventListener("close", () => {
    if (palette.returnValue && activeTile) {
      updateTileState(activeTile, palette.returnValue);
    }

    // Return focus without triggering native scroll jumps on mobile
    if (activeTile) {
      activeTile.focus({ preventScroll: true });
    }
    activeTile = null;
  });

  palette.addEventListener("click", (e) => {
    const rect = palette.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      palette.close("");
    }
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => palette.close(""));
  }
}
