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

/**
 * Serializes current grid state into a plain array of JSON objects.
 * @param {HTMLElement} [board]
 * @returns {Array<{row: number, col: number, variant: string|null, rotation: number}>}
 */
export function serializeBoardState(
  board = document.getElementById("game-board"),
) {
  if (!board) return [];

  const tiles = Array.from(board.querySelectorAll(".tile"));
  return tiles.map((tile) => ({
    row: parseInt(tile.dataset.row, 10),
    col: parseInt(tile.dataset.col, 10),
    variant: tile.dataset.variant || null,
    rotation: parseInt(tile.dataset.rotation, 10) || 0,
  }));
}

/**
 * Restores grid board layout from an array of tile state objects.
 * @param {Array<{row: number, col: number, variant: string|null, rotation: number}>} stateData
 * @param {HTMLElement} [board]
 */
export function deserializeBoardState(
  stateData,
  board = document.getElementById("game-board"),
) {
  if (!board || !Array.isArray(stateData)) return;

  const stateMap = new Map(
    stateData.map((item) => [`${item.row}-${item.col}`, item]),
  );

  const tiles = board.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    const r = parseInt(tile.dataset.row, 10);
    const c = parseInt(tile.dataset.col, 10);
    const savedItem = stateMap.get(`${r}-${c}`);

    if (savedItem && savedItem.variant) {
      updateTileState(tile, savedItem.variant);
      if (savedItem.rotation) {
        tile.dataset.rotation = savedItem.rotation;
        tile.style.setProperty("--tile-rotation", `${savedItem.rotation}deg`);
      }
    } else {
      updateTileState(tile, "unset");
    }
  });
}
