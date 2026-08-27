let state = { x: 0, y: 0, scale: 1 };

let isMousePanning = false;
let mouseStartX = 0,
  mouseStartY = 0;
let mouseInitialX = 0,
  mouseInitialY = 0;

let isTouchPanning = false;
let isViewportTouchActive = false;
let touchStartX = 0,
  touchStartY = 0;
let touchInitialX = 0,
  touchInitialY = 0;

let didPan = false;
const PAN_THRESHOLD = 6;

export function wasPanning() {
  return didPan;
}

/**
 * Zooms the viewport relative to the center of the screen.
 * @param {number} factor - Scale multiplier (e.g., 1.25 for zoom in, 0.8 for zoom out)
 */
export function zoomViewportBy(factor) {
  const canvasEl = document.getElementById("map-canvas");
  if (!canvasEl) return;

  const oldScale = state.scale;
  const newScale = Math.min(Math.max(0.5, oldScale * factor), 4.0);

  const focalX = window.innerWidth / 2;
  const focalY = window.innerHeight / 2;

  state.x = focalX - (focalX - state.x) * (newScale / oldScale);
  state.y = focalY - (focalY - state.y) * (newScale / oldScale);
  state.scale = newScale;

  canvasEl.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
}

/**
 * Resets scale to 1.0x and recenters canvas offset.
 */
export function resetViewport() {
  const canvasEl = document.getElementById("map-canvas");
  if (!canvasEl) return;

  state.x = 0;
  state.y = 0;
  state.scale = 1.0;

  canvasEl.style.transform = `translate(0px, 0px) scale(1.0)`;
}

export function initMapViewport(
  viewportEl = document.getElementById("map-viewport"),
  canvasEl = document.getElementById("map-canvas"),
) {
  if (!viewportEl || !canvasEl) return;

  const applyTransform = () => {
    canvasEl.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
  };

  // 1. Desktop Mouse Wheel Zoom (Cursor-Anchored)
  viewportEl.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const oldScale = state.scale;
      const newScale = Math.min(Math.max(0.5, oldScale * zoomFactor), 4.0);

      const focalX = e.clientX;
      const focalY = e.clientY;

      state.x = focalX - (focalX - state.x) * (newScale / oldScale);
      state.y = focalY - (focalY - state.y) * (newScale / oldScale);
      state.scale = newScale;

      applyTransform();
    },
    { passive: false },
  );

  // 2. Mobile Single-Finger Touch Panning
  viewportEl.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        isViewportTouchActive = true;
        isTouchPanning = false;
        didPan = false;

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchInitialX = state.x;
        touchInitialY = state.y;
      }
    },
    { passive: false },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isViewportTouchActive) return;

      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;

        if (!isTouchPanning && Math.hypot(dx, dy) > PAN_THRESHOLD) {
          isTouchPanning = true;
          didPan = true;
        }

        if (isTouchPanning) {
          if (e.cancelable) e.preventDefault();
          state.x = touchInitialX + dx;
          state.y = touchInitialY + dy;
          applyTransform();
        }
      }
    },
    { passive: false },
  );

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      isTouchPanning = false;
      isViewportTouchActive = false;
    }
  };

  window.addEventListener("touchend", handleTouchEnd);
  window.addEventListener("touchcancel", handleTouchEnd);

  // 3. Desktop Mouse Drag Panning
  viewportEl.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;

    isMousePanning = false;
    didPan = false;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    mouseInitialX = state.x;
    mouseInitialY = state.y;
  });

  window.addEventListener("mousemove", (e) => {
    if (e.buttons !== 1) {
      isMousePanning = false;
      return;
    }

    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;

    if (!isMousePanning && Math.hypot(dx, dy) > PAN_THRESHOLD) {
      isMousePanning = true;
      didPan = true;
    }

    if (isMousePanning) {
      state.x = mouseInitialX + dx;
      state.y = mouseInitialY + dy;
      applyTransform();
    }
  });

  window.addEventListener("mouseup", () => {
    isMousePanning = false;
  });

  // 4. Attach On-Screen Floating Controls
  document
    .getElementById("zoom-in-btn")
    ?.addEventListener("click", () => zoomViewportBy(1.25));
  document
    .getElementById("zoom-out-btn")
    ?.addEventListener("click", () => zoomViewportBy(0.8));
  document
    .getElementById("zoom-reset-btn")
    ?.addEventListener("click", resetViewport);
}
