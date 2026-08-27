import { updateTileState } from "./grid.js";

let activeTile = null;

/**
 * Opens the tile selection modal dialog.
 * @param {HTMLElement} tile
 * @param {HTMLDialogElement} [menu]
 */
export function openTileMenu(
  tile,
  menu = document.getElementById("tile-menu"),
) {
  if (!tile || !menu) return;

  activeTile = tile;
  menu.returnValue = "";
  menu.showModal();
}

/**
 * Initializes modal event listeners for dialog closure and cancel action.
 * @param {HTMLDialogElement} [menu]
 * @param {HTMLElement} [cancelBtn]
 */
export function initModal(
  menu = document.getElementById("tile-menu"),
  cancelBtn = document.getElementById("menu-cancel"),
) {
  if (!menu) return;

  menu.addEventListener("close", () => {
    if (activeTile) {
      activeTile.focus({ preventScroll: true });
    }

    if (menu.returnValue && activeTile) {
      updateTileState(activeTile, menu.returnValue);
    }

    activeTile = null;
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      menu.close("");
    });
  }
}
