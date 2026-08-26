import { rotateTile } from "./grid.js";
import { openTileMenu } from "./modal.js";

const MOVE_THRESHOLD = 10;
const HOLD_DELAY = 350;

let currentHoldTile = null;
let holdTimer = null;
let isHoldAction = false;
let isCounterClockwise = false;

let pointerStartX = 0;
let pointerStartY = 0;

function updateModifierState(e) {
  isCounterClockwise = !!(e.shiftKey || e.ctrlKey);
}

function stopHoldRotation() {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  currentHoldTile = null;
}

function triggerHoldRotation() {
  if (!currentHoldTile) return;

  isHoldAction = true;
  rotateTile(currentHoldTile, { ctrlKey: isCounterClockwise });

  holdTimer = setTimeout(triggerHoldRotation, HOLD_DELAY);
}

function onPointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  const tile = e.target.closest(".tile");
  if (!tile || !tile.dataset.variant) return;

  currentHoldTile = tile;
  isHoldAction = false;
  isCounterClockwise = !!(e.ctrlKey || e.shiftKey) || isCounterClockwise;

  pointerStartX = e.clientX;
  pointerStartY = e.clientY;

  if (e.pointerId != null && tile.setPointerCapture) {
    try {
      tile.setPointerCapture(e.pointerId);
    } catch (err) {}
  }

  holdTimer = setTimeout(triggerHoldRotation, HOLD_DELAY);
}

function onPointerMove(e) {
  if (!currentHoldTile || !holdTimer) return;

  const dx = Math.abs(e.clientX - pointerStartX);
  const dy = Math.abs(e.clientY - pointerStartY);
  if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
    stopHoldRotation();
  }
}

function onPointerUp(e) {
  if (
    currentHoldTile &&
    e.pointerId != null &&
    currentHoldTile.releasePointerCapture
  ) {
    try {
      currentHoldTile.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }
  stopHoldRotation();
}

function onPointerCancel() {
  stopHoldRotation();
  isHoldAction = false;
}

/**
 * Attaches pointer, click, keydown, and window event listeners for grid tile interactions.
 * @param {HTMLElement} [board] - Target grid board element.
 */
export function initInteractions(
  board = document.getElementById("game-board"),
) {
  if (!board) return;

  window.addEventListener("keydown", updateModifierState);
  window.addEventListener("keyup", updateModifierState);

  window.addEventListener("blur", () => {
    isCounterClockwise = false;
    stopHoldRotation();
    isHoldAction = false;
  });

  board.addEventListener("pointerdown", onPointerDown);
  board.addEventListener("pointermove", onPointerMove);
  board.addEventListener("pointerup", onPointerUp);
  board.addEventListener("pointercancel", onPointerCancel);

  board.addEventListener("click", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;

    if (isHoldAction) {
      isHoldAction = false;
      return;
    }

    openTileMenu(tile);
  });

  board.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  board.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const tile = e.target.closest(".tile");
      if (!tile) return;

      e.preventDefault();
      openTileMenu(tile);
    }
  });
}
