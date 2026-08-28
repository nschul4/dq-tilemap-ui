import { TILE_LOOKUP } from "./tiles.js";

/**
 * Initializes grid tiles inside the target board container.
 * @param {HTMLElement} [board]
 */
export function initGrid(board = document.getElementById("game-board")) {
  if (!board) return;

  const styles = getComputedStyle(board);
  const GRID_COLS = parseInt(styles.getPropertyValue("--grid-cols"), 10) || 13;
  const GRID_ROWS = parseInt(styles.getPropertyValue("--grid-rows"), 10) || 10;

  const fragment = document.createDocumentFragment();

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute(
        "aria-label",
        `Unset tile at row ${r + 1}, column ${c + 1}`,
      );

      tile.dataset.row = r;
      tile.dataset.col = c;
      tile.dataset.terrain = "unset";

      fragment.appendChild(tile);
    }
  }

  board.replaceChildren(fragment);
}

/**
 * Rotates a tile element by 90 degrees clockwise or counter-clockwise.
 * @param {HTMLElement} tile
 * @param {boolean} [isCCW=false]
 */
export function rotateTile(tile, isCCW = false) {
  if (!tile) return;

  let rotation = parseInt(tile.dataset.rotation, 10) || 0;
  rotation += isCCW ? -90 : 90;

  tile.dataset.rotation = rotation;
  tile.style.setProperty("--tile-rotation", `${rotation}deg`);
}

/**
 * Updates tile datasets, styles, and ARIA labels via direct data indexing.
 * @param {HTMLElement} targetTile
 * @param {string} newTerrain
 */
export function updateTileState(targetTile, newTerrain) {
  if (!targetTile) return;

  const rowNum = parseInt(targetTile.dataset.row, 10) + 1;
  const colNum = parseInt(targetTile.dataset.col, 10) + 1;

  if (newTerrain === "unset") {
    targetTile.dataset.terrain = "unset";
    delete targetTile.dataset.variant;
    delete targetTile.dataset.rotation;
    targetTile.removeAttribute("title");
    targetTile.style.backgroundImage = "";
    targetTile.style.removeProperty("--tile-rotation");
    targetTile.setAttribute(
      "aria-label",
      `Unset tile at row ${rowNum}, column ${colNum}`,
    );
  } else {
    delete targetTile.dataset.terrain;
    targetTile.dataset.variant = newTerrain;

    const tileData = TILE_LOOKUP.get(newTerrain);

    targetTile.style.backgroundImage = tileData ? `url('${tileData.src}')` : "";
    targetTile.title = tileData?.name || "";

    const formattedName = tileData?.name || newTerrain.replace(/-/g, " ");
    targetTile.setAttribute(
      "aria-label",
      `${formattedName} at row ${rowNum}, column ${colNum}`,
    );
  }
}
