let state = { x: 0, y: 0, scale: 1 };

let isMousePanning = false;
let mouseStartX = 0,
  mouseStartY = 0;
let mouseInitialX = 0,
  mouseInitialY = 0;

let isTouchPanning = false;
let touchStartX = 0,
  touchStartY = 0;
let touchInitialX = 0,
  touchInitialY = 0;

let isPinching = false;
let initialPinchDistance = 0;
let initialScale = 1;
let initialFocalPoint = { x: 0, y: 0 };
let initialCanvasPos = { x: 0, y: 0 };

let didPan = false;
const PAN_THRESHOLD = 6;

export function wasPanning() {
  return didPan;
}

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

  // 2. Mobile Touch Handling
  window.addEventListener(
    "touchstart",
    (e) => {
      if (!viewportEl.contains(e.target)) return;

      if (e.touches.length === 1) {
        isPinching = false;
        isTouchPanning = false;
        didPan = false;

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchInitialX = state.x;
        touchInitialY = state.y;
      } else if (e.touches.length === 2) {
        isTouchPanning = false;
        isPinching = true;
        didPan = true;

        if (e.cancelable) e.preventDefault();
        initialPinchDistance = getPinchDistance(e.touches);
        initialScale = state.scale;
        initialFocalPoint = getPinchMidpoint(e.touches);
        initialCanvasPos = { x: state.x, y: state.y };
      }
    },
    { passive: false },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!viewportEl.contains(e.target) && !isTouchPanning && !isPinching)
        return;

      if (e.touches.length === 1 && !isPinching) {
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
      } else if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();

        if (!isPinching || initialPinchDistance === 0) {
          isPinching = true;
          didPan = true;
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

  window.addEventListener("touchend", (e) => {
    if (e.touches.length === 1) {
      isPinching = false;
      isTouchPanning = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchInitialX = state.x;
      touchInitialY = state.y;
    } else if (e.touches.length === 0) {
      isTouchPanning = false;
      isPinching = false;
    }
  });

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
}

export function getCanvasTransform() {
  return { ...state };
}
