import { rotateTile } from "./grid.js";
import { openTilePalette } from "./modal.js";
import { wasPanning } from "./viewport.js";
import { boardState } from "./boardState.js";

/**
 * Manages pointer press-and-hold timers, modifier key states, and tile interaction triggers.
 */
export class InteractionManager {
  /**
   * @param {HTMLElement} [board]
   */
  constructor(board = document.getElementById("game-board")) {
    this.board = board;
    this.MOVE_THRESHOLD = 10;
    this.HOLD_DELAY = 350;

    this.currentHoldTile = null;
    this.holdTimer = null;
    this.isHoldAction = false;
    this.isCounterClockwise = false;

    this.pointerStartX = 0;
    this.pointerStartY = 0;

    this.init();
  }

  updateModifierState(e) {
    this.isCounterClockwise = !!(e.shiftKey || e.ctrlKey);
  }

  stopHoldRotation() {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    this.currentHoldTile = null;
  }

  triggerHoldRotation() {
    if (!this.currentHoldTile) return;

    this.isHoldAction = true;
    rotateTile(this.currentHoldTile, this.isCounterClockwise);

    this.holdTimer = setTimeout(
      () => this.triggerHoldRotation(),
      this.HOLD_DELAY,
    );
  }

  onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const tile = e.target.closest(".tile");
    if (!tile) return;

    const row = parseInt(tile.dataset.row, 10);
    const col = parseInt(tile.dataset.col, 10);
    const tileState = boardState.getTile(row, col);

    if (!tileState.variant) return;

    this.currentHoldTile = tile;
    this.isHoldAction = false;
    this.isCounterClockwise = !!(e.ctrlKey || e.shiftKey);
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    this.holdTimer = setTimeout(
      () => this.triggerHoldRotation(),
      this.HOLD_DELAY,
    );
  }

  onPointerMove(e) {
    if (!this.currentHoldTile || !this.holdTimer) return;

    const dx = Math.abs(e.clientX - this.pointerStartX);
    const dy = Math.abs(e.clientY - this.pointerStartY);
    if (dx > this.MOVE_THRESHOLD || dy > this.MOVE_THRESHOLD) {
      this.stopHoldRotation();
    }
  }

  onPointerEnd() {
    this.stopHoldRotation();
  }

  init() {
    if (!this.board) return;

    const onKeyDownUp = (e) => this.updateModifierState(e);
    window.addEventListener("keydown", onKeyDownUp);
    window.addEventListener("keyup", onKeyDownUp);

    window.addEventListener("blur", () => {
      this.isCounterClockwise = false;
      this.stopHoldRotation();
      this.isHoldAction = false;
    });

    this.board.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.board.addEventListener("pointermove", (e) => this.onPointerMove(e));
    this.board.addEventListener("pointerup", () => this.onPointerEnd());
    this.board.addEventListener("pointercancel", () => this.onPointerEnd());

    this.board.addEventListener("click", (e) => {
      const tile = e.target.closest(".tile");
      if (!tile) return;

      if (wasPanning()) {
        return;
      }

      if (this.isHoldAction) {
        this.isHoldAction = false;
        return;
      }

      openTilePalette(tile);
    });

    this.board.addEventListener("contextmenu", (e) => e.preventDefault());

    this.board.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const tile = e.target.closest(".tile");
        if (!tile) return;

        e.preventDefault();
        openTilePalette(tile);
      }
    });
  }
}

export let interactionManager = null;

export function initInteractions(board) {
  interactionManager = new InteractionManager(board);
  return interactionManager;
}
