import { rotateTile } from "./grid.js";
import { openTilePalette } from "./modal.js";

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
  rotateTile(currentHoldTile, isCounterClockwise);

  holdTimer = setTimeout(triggerHoldRotation, HOLD_DELAY);
}

function onPointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  const tile = e.target.closest(".tile");
  if (!tile || !tile.dataset.variant) return;

  currentHoldTile = tile;
  isHoldAction = false;
  isCounterClockwise = !!(e.ctrlKey || e.shiftKey);
  pointerStartX = e.clientX;
  pointerStartY = e.clientY;

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

function onPointerEnd() {
  stopHoldRotation();
}

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
  board.addEventListener("pointerup", onPointerEnd);
  board.addEventListener("pointercancel", onPointerEnd);

  board.addEventListener("click", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;

    if (isHoldAction) {
      isHoldAction = false;
      return;
    }

    openTilePalette(tile);
  });

  board.addEventListener("contextmenu", (e) => e.preventDefault());

  board.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const tile = e.target.closest(".tile");
      if (!tile) return;

      e.preventDefault();
      openTilePalette(tile);
    }
  });
}
