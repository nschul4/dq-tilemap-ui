/**
 * In-memory state store for the tilemap board.
 * Extends EventTarget to emit reactive state change events to subscriber views.
 */
export class BoardState extends EventTarget {
  /**
   * @param {number} [cols=13]
   * @param {number} [rows=10]
   */
  constructor(cols = 13, rows = 10) {
    super();
    this.cols = cols;
    this.rows = rows;
    /** @type {Map<string, {variant: string, rotation: number}>} */
    this.tiles = new Map();
  }

  /**
   * Updates grid dimensions and resets tile data.
   * @param {number} cols
   * @param {number} rows
   */
  setDimensions(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.tiles.clear();
    this.dispatchEvent(new CustomEvent("reset"));
  }

  /**
   * Retrieves tile state at specified grid coordinates.
   * @param {number} row
   * @param {number} col
   * @returns {{variant: string|null, rotation: number}}
   */
  getTile(row, col) {
    const tile = this.tiles.get(`${row}-${col}`);
    return tile ? { ...tile } : { variant: null, rotation: 0 };
  }

  /**
   * Sets or unsets a tile variant at specified grid coordinates.
   * @param {number} row
   * @param {number} col
   * @param {string} variant
   */
  setTileVariant(row, col, variant) {
    const key = `${row}-${col}`;
    const current = this.getTile(row, col);
    const newVariant = variant === "unset" ? null : variant;

    if (!newVariant) {
      this.tiles.delete(key);
      const updated = { variant: null, rotation: 0 };
      this.dispatchEvent(
        new CustomEvent("tilechange", {
          detail: { row, col, state: updated },
        }),
      );
      return;
    }

    const updated = {
      variant: newVariant,
      rotation: current.variant === newVariant ? current.rotation : 0,
    };

    this.tiles.set(key, updated);
    this.dispatchEvent(
      new CustomEvent("tilechange", {
        detail: { row, col, state: updated },
      }),
    );
  }

  /**
   * Rotates a tile at specified coordinates by 90 degrees.
   * @param {number} row
   * @param {number} col
   * @param {boolean} [isCCW=false]
   */
  rotateTile(row, col, isCCW = false) {
    const key = `${row}-${col}`;
    const current = this.getTile(row, col);
    if (!current.variant) return;

    let rotation = (current.rotation || 0) + (isCCW ? -90 : 90);
    const updated = { ...current, rotation };

    this.tiles.set(key, updated);
    this.dispatchEvent(
      new CustomEvent("tilechange", {
        detail: { row, col, state: updated },
      }),
    );
  }

  /**
   * Serializes current grid state to a plain array of JSON-compatible tile objects.
   * @returns {Array<{row: number, col: number, variant: string, rotation: number}>}
   */
  serialize() {
    const result = [];
    for (const [key, tile] of this.tiles.entries()) {
      if (tile.variant) {
        const [row, col] = key.split("-").map(Number);
        result.push({
          row,
          col,
          variant: tile.variant,
          rotation: tile.rotation || 0,
        });
      }
    }
    return result;
  }

  /**
   * Replaces current board state with imported tile state array.
   * @param {Array<{row: number, col: number, variant: string, rotation: number}>} stateData
   */
  deserialize(stateData) {
    this.tiles.clear();
    if (Array.isArray(stateData)) {
      for (const item of stateData) {
        if (
          typeof item.row === "number" &&
          typeof item.col === "number" &&
          item.variant
        ) {
          this.tiles.set(`${item.row}-${item.col}`, {
            variant: item.variant,
            rotation: item.rotation || 0,
          });
        }
      }
    }
    this.dispatchEvent(new CustomEvent("statechange"));
  }
}

export const boardState = new BoardState();
