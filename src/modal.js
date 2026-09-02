import { updateTileState } from "./grid.js";
import { cancelViewportPan } from "./viewport.js";

/**
 * Manages modal dialog events and active tile context state.
 */
export class ModalManager {
  /**
   * @param {HTMLElement} [palette]
   * @param {HTMLElement} [cancelBtn]
   */
  constructor(
    palette = document.getElementById("tile-palette"),
    cancelBtn = document.getElementById("menu-cancel"),
  ) {
    this.palette = palette;
    this.cancelBtn = cancelBtn;
    this.activeTile = null;

    this.init();
  }

  /**
   * Opens tile palette modal for a specific tile element.
   * @param {HTMLElement} tile
   */
  openPalette(tile) {
    if (!tile || !this.palette) return;
    cancelViewportPan();
    this.activeTile = tile;
    this.palette.returnValue = "";
    this.palette.showModal();
  }

  /**
   * Registers event listeners for modal close, backdrop clicks, and cancellation.
   */
  init() {
    if (!this.palette) return;

    this.palette.addEventListener("close", () => {
      if (this.palette.returnValue && this.activeTile) {
        updateTileState(this.activeTile, this.palette.returnValue);
      }

      // Return focus without triggering native scroll jumps on mobile
      if (this.activeTile) {
        this.activeTile.focus({ preventScroll: true });
      }
      this.activeTile = null;
    });

    this.palette.addEventListener("click", (e) => {
      const rect = this.palette.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        this.palette.close("");
      }
    });

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => this.palette.close(""));
    }
  }
}

export let modalManager = null;

export function initModal(palette, cancelBtn) {
  modalManager = new ModalManager(palette, cancelBtn);
  return modalManager;
}

export function openTilePalette(tile) {
  modalManager?.openPalette(tile);
}
