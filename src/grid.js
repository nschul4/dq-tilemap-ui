import { TILE_LOOKUP } from "./tiles.js";
import { boardState } from "./boardState.js";

/**
 * Renders state updates to a single tile DOM element.
 * @param {HTMLElement} tileElement
 * @param {{ variant: string|null, rotation: number }} tileState
 */
export function renderTileElement(tileElement, tileState) {
  if (!tileElement) return;

  const row = parseInt(tileElement.dataset.row, 10);
  const col = parseInt(tileElement.dataset.col, 10);
  const rowNum = row + 1;
  const colNum = col + 1;

  if (!tileState || !tileState.variant) {
    tileElement.dataset.terrain = "unset";
    delete tileElement.dataset.variant;
    delete tileElement.dataset.rotation;
    tileElement.removeAttribute("title");
    tileElement.style.backgroundImage = "";
    tileElement.style.removeProperty("--tile-rotation");
    tileElement.setAttribute(
      "aria-label",
      `Unset tile at row ${rowNum}, column ${colNum}`,
    );
  } else {
    delete tileElement.dataset.terrain;
    tileElement.dataset.variant = tileState.variant;
    tileElement.dataset.rotation = tileState.rotation;

    const tileData = TILE_LOOKUP.get(tileState.variant);

    tileElement.style.backgroundImage = tileData
      ? `url('${tileData.src}')`
      : "";
    tileElement.style.setProperty(
      "--tile-rotation",
      `${tileState.rotation || 0}deg`,
    );
    tileElement.title = tileData?.name || "";

    const formattedName =
      tileData?.name || tileState.variant.replace(/-/g, " ");
    tileElement.setAttribute(
      "aria-label",
      `${formattedName} at row ${rowNum}, column ${colNum}`,
    );
  }
}

/**
 * Synchronizes entire board DOM view with current board state model.
 * @param {HTMLElement} [board]
 */
export function syncBoardView(board = document.getElementById("game-board")) {
  if (!board) return;

  const tiles = board.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    const r = parseInt(tile.dataset.row, 10);
    const c = parseInt(tile.dataset.col, 10);
    const tileState = boardState.getTile(r, c);
    renderTileElement(tile, tileState);
  });
}

/**
 * Initializes grid DOM elements and registers board state reactive event listeners.
 * @param {HTMLElement} [board]
 */
export function initGrid(board = document.getElementById("game-board")) {
  if (!board) return;

  const styles = getComputedStyle(board);
  const GRID_COLS = parseInt(styles.getPropertyValue("--grid-cols"), 10) || 13;
  const GRID_ROWS = parseInt(styles.getPropertyValue("--grid-rows"), 10) || 10;

  boardState.setDimensions(GRID_COLS, GRID_ROWS);

  const fragment = document.createDocumentFragment();

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");

      tile.dataset.row = r;
      tile.dataset.col = c;

      const tileState = boardState.getTile(r, c);
      renderTileElement(tile, tileState);

      fragment.appendChild(tile);
    }
  }

  board.replaceChildren(fragment);

  // Subscribe view updates to in-memory state changes
  boardState.addEventListener("tilechange", (e) => {
    const { row, col, state } = e.detail;
    const tileElement = board.querySelector(
      `.tile[data-row="${row}"][data-col="${col}"]`,
    );
    if (tileElement) {
      renderTileElement(tileElement, state);
    }
  });

  boardState.addEventListener("statechange", () => {
    syncBoardView(board);
  });

  boardState.addEventListener("reset", () => {
    syncBoardView(board);
  });
}

/**
 * Delegates tile rotation to the in-memory board state.
 * @param {HTMLElement} tile
 * @param {boolean} [isCCW=false]
 */
export function rotateTile(tile, isCCW = false) {
  if (!tile) return;
  const row = parseInt(tile.dataset.row, 10);
  const col = parseInt(tile.dataset.col, 10);
  boardState.rotateTile(row, col, isCCW);
}

/**
 * Delegates tile variant updates to the in-memory board state.
 * @param {HTMLElement} targetTile
 * @param {string} newTerrain
 */
export function updateTileState(targetTile, newTerrain) {
  if (!targetTile) return;
  const row = parseInt(targetTile.dataset.row, 10);
  const col = parseInt(targetTile.dataset.col, 10);
  boardState.setTileVariant(row, col, newTerrain);
}

/**
 * Returns serialized board JSON array directly from the state model.
 * @returns {Array<{row: number, col: number, variant: string, rotation: number}>}
 */
export function serializeBoardState() {
  return boardState.serialize();
}

/**
 * Restores grid state into the in-memory board state store.
 * @param {Array<{row: number, col: number, variant: string|null, rotation: number}>} stateData
 */
export function deserializeBoardState(stateData) {
  boardState.deserialize(stateData);
}
