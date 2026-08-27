// src/viewport.js
let state = { x: 0, y: 0, scale: 1 };

let isMousePanning = false;
let mouseStartX = 0,
  mouseStartY = 0;

let isTouchPanning = false;
let touchStartX = 0,
  touchStartY = 0;
let initialPinchDistance = 0;
let initialScale = 1;
let initialFocalPoint = { x: 0, y: 0 };
let initialCanvasPos = { x: 0, y: 0 };

function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function getPinchMidpoint(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

export function initMapViewport(
  viewportEl = document.getElementById("map-viewport"),
  canvasEl = document.getElementById("map-canvas"),
) {
  if (!viewportEl || !canvasEl) return;

  const applyTransform = () => {
    canvasEl.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
  };

  const resetPinch = () => {
    initialPinchDistance = 0;
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

  // 2. Mobile Touch Start
  viewportEl.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        isTouchPanning = true;
        touchStartX = e.touches[0].clientX - state.x;
        touchStartY = e.touches[0].clientY - state.y;
        resetPinch();
      } else if (e.touches.length === 2) {
        isTouchPanning = false;
        if (e.cancelable) e.preventDefault();
        initialPinchDistance = getPinchDistance(e.touches);
        initialScale = state.scale;
        initialFocalPoint = getPinchMidpoint(e.touches);
        initialCanvasPos = { x: state.x, y: state.y };
      }
    },
    { passive: false },
  );

  // 3. Global Touch Move (Prevents gesture drop mid-pinch on Android)
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1 && isTouchPanning) {
        if (e.cancelable) e.preventDefault();
        state.x = e.touches[0].clientX - touchStartX;
        state.y = e.touches[0].clientY - touchStartY;
        applyTransform();
      } else if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();

        // Fallback initialization if Android skipped 2-finger touchstart
        if (initialPinchDistance === 0) {
          initialPinchDistance = getPinchDistance(e.touches);
          initialScale = state.scale;
          initialFocalPoint = getPinchMidpoint(e.touches);
          initialCanvasPos = { x: state.x, y: state.y };
          return;
        }

        const currentDistance = getPinchDistance(e.touches);
        const currentFocal = getPinchMidpoint(e.touches);

        if (initialPinchDistance > 0 && currentDistance > 0) {
          const newScale = Math.min(
            Math.max(
              0.5,
              initialScale * (currentDistance / initialPinchDistance),
            ),
            4.0,
          );

          const scaleRatio = newScale / initialScale;
          state.x =
            currentFocal.x - (initialFocal.x - initialCanvasPos.x) * scaleRatio;
          state.y =
            currentFocal.y - (initialFocal.y - initialCanvasPos.y) * scaleRatio;
          state.scale = newScale;

          applyTransform();
        }
      }
    },
    { passive: false },
  );

  // 4. Global Touch End & Cancel
  const handleTouchEnd = (e) => {
    if (e.touches.length === 1) {
      isTouchPanning = true;
      touchStartX = e.touches[0].clientX - state.x;
      touchStartY = e.touches[0].clientY - state.y;
      resetPinch();
    } else if (e.touches.length === 0) {
      isTouchPanning = false;
      resetPinch();
    }
  };

  window.addEventListener("touchend", handleTouchEnd);
  window.addEventListener("touchcancel", handleTouchEnd);

  // 5. Desktop Mouse Drag Panning
  viewportEl.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;

    isMousePanning = true;
    mouseStartX = e.clientX - state.x;
    mouseStartY = e.clientY - state.y;
    viewportEl.setPointerCapture(e.pointerId);
  });

  viewportEl.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !isMousePanning) return;
    state.x = e.clientX - mouseStartX;
    state.y = e.clientY - mouseStartY;
    applyTransform();
  });

  const stopMousePan = (e) => {
    if (e.pointerType === "mouse" && isMousePanning) {
      isMousePanning = false;
      try {
        viewportEl.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  viewportEl.addEventListener("pointerup", stopMousePan);
  viewportEl.addEventListener("pointercancel", stopMousePan);
}

export function getCanvasTransform() {
  return { ...state };
}
