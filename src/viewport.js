let state = { x: 0, y: 0, scale: 1 };
let isPanning = false;
let startX = 0,
  startY = 0;

export function initMapViewport(
  viewportEl = document.getElementById("map-viewport"),
  canvasEl = document.getElementById("map-canvas"),
) {
  if (!viewportEl || !canvasEl) return;

  const applyTransform = () => {
    canvasEl.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
  };

  // Prevent default touch behaviors (native browser zooming)
  viewportEl.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );

  // Handle programmatic panning with single pointer
  viewportEl.addEventListener("pointerdown", (e) => {
    // Only pan if clicking backdrop, not tiles directly
    if (e.target.classList.contains("tile")) return;
    isPanning = true;
    startX = e.clientX - state.x;
    startY = e.clientY - state.y;
    viewportEl.setPointerCapture(e.pointerId);
  });

  viewportEl.addEventListener("pointermove", (e) => {
    if (!isPanning) return;
    state.x = e.clientX - startX;
    state.y = e.clientY - startY;
    applyTransform();
  });

  const stopPan = (e) => {
    if (isPanning) {
      isPanning = false;
      try {
        viewportEl.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  viewportEl.addEventListener("pointerup", stopPan);
  viewportEl.addEventListener("pointercancel", stopPan);
}

export function getCanvasTransform() {
  return { ...state };
}
