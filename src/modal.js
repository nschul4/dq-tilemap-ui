import { updateTileState } from "./grid.js";

let activeTile = null;

export function openTileMenu(
  tile,
  menu = document.getElementById("tile-menu"),
) {
  if (!tile || !menu) return;

  activeTile = tile;
  menu.returnValue = "";
  menu.showModal();
}

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

  menu.addEventListener("click", (e) => {
    const rect = menu.getBoundingClientRect();
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;

    if (isOutside) {
      menu.close("");
    }
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      menu.close("");
    });
  }
}
