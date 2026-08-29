/**
 * Manages viewport panning, zooming transforms, and input gesture listeners.
 */
export class ViewportManager {
  /**
   * @param {HTMLElement} [viewportEl]
   * @param {HTMLElement} [canvasEl]
   */
  constructor(
    viewportEl = document.getElementById("map-viewport"),
    canvasEl = document.getElementById("map-canvas"),
  ) {
    this.viewportEl = viewportEl;
    this.canvasEl = canvasEl;

    this.state = { x: 0, y: 0, scale: 1 };

    this.isMousePanning = false;
    this.mouseStartX = 0;
    this.mouseStartY = 0;
    this.mouseInitialX = 0;
    this.mouseInitialY = 0;

    this.isTouchPanning = false;
    this.isViewportTouchActive = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchInitialX = 0;
    this.touchInitialY = 0;

    this.didPan = false;
    this.PAN_THRESHOLD = 6;

    this.init();
  }

  /**
   * Indicates whether a pan gesture occurred during the most recent user interaction.
   * @returns {boolean}
   */
  wasPanning() {
    return this.didPan;
  }

  /**
   * Applies current scale and translation offsets to the DOM canvas.
   */
  applyTransform() {
    if (!this.canvasEl) return;
    this.canvasEl.style.transform = `translate(${this.state.x}px, ${this.state.y}px) scale(${this.state.scale})`;
  }

  /**
   * Zooms the viewport relative to the center of the screen.
   * @param {number} factor - Scale multiplier
   */
  zoomBy(factor) {
    if (!this.canvasEl) return;

    const oldScale = this.state.scale;
    const newScale = Math.min(Math.max(0.5, oldScale * factor), 4.0);

    const focalX = window.innerWidth / 2;
    const focalY = window.innerHeight / 2;

    this.state.x = focalX - (focalX - this.state.x) * (newScale / oldScale);
    this.state.y = focalY - (focalY - this.state.y) * (newScale / oldScale);
    this.state.scale = newScale;

    this.applyTransform();
  }

  /**
   * Resets scale to 1.0x and recenters canvas offsets.
   */
  reset() {
    if (!this.canvasEl) return;

    this.state.x = 0;
    this.state.y = 0;
    this.state.scale = 1.0;

    this.canvasEl.style.transform = `translate(0px, 0px) scale(1.0)`;
  }

  /**
   * Registers event listeners for mouse wheel, drag, and touch interactions.
   */
  init() {
    if (!this.viewportEl || !this.canvasEl) return;

    // 1. Desktop Mouse Wheel Zoom (Cursor-Anchored)
    this.viewportEl.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const oldScale = this.state.scale;
        const newScale = Math.min(Math.max(0.5, oldScale * zoomFactor), 4.0);

        const focalX = e.clientX;
        const focalY = e.clientY;

        this.state.x = focalX - (focalX - this.state.x) * (newScale / oldScale);
        this.state.y = focalY - (focalY - this.state.y) * (newScale / oldScale);
        this.state.scale = newScale;

        this.applyTransform();
      },
      { passive: false },
    );

    // 2. Mobile Single-Finger Touch Panning
    this.viewportEl.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          this.isViewportTouchActive = true;
          this.isTouchPanning = false;
          this.didPan = false;

          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
          this.touchInitialX = this.state.x;
          this.touchInitialY = this.state.y;
        }
      },
      { passive: false },
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!this.isViewportTouchActive) return;

        if (e.touches.length === 1) {
          const dx = e.touches[0].clientX - this.touchStartX;
          const dy = e.touches[0].clientY - this.touchStartY;

          if (!this.isTouchPanning && Math.hypot(dx, dy) > this.PAN_THRESHOLD) {
            this.isTouchPanning = true;
            this.didPan = true;
          }

          if (this.isTouchPanning) {
            if (e.cancelable) e.preventDefault();
            this.state.x = this.touchInitialX + dx;
            this.state.y = this.touchInitialY + dy;
            this.applyTransform();
          }
        }
      },
      { passive: false },
    );

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        this.isTouchPanning = false;
        this.isViewportTouchActive = false;
      }
    };

    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    // 3. Desktop Mouse Drag Panning
    this.viewportEl.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;

      this.isMousePanning = false;
      this.didPan = false;
      this.mouseStartX = e.clientX;
      this.mouseStartY = e.clientY;
      this.mouseInitialX = this.state.x;
      this.mouseInitialY = this.state.y;
    });

    window.addEventListener("mousemove", (e) => {
      if (e.buttons !== 1) {
        this.isMousePanning = false;
        return;
      }

      const dx = e.clientX - this.mouseStartX;
      const dy = e.clientY - this.mouseStartY;

      if (!this.isMousePanning && Math.hypot(dx, dy) > this.PAN_THRESHOLD) {
        this.isMousePanning = true;
        this.didPan = true;
      }

      if (this.isMousePanning) {
        this.state.x = this.mouseInitialX + dx;
        this.state.y = this.mouseInitialY + dy;
        this.applyTransform();
      }
    });

    window.addEventListener("mouseup", () => {
      this.isMousePanning = false;
    });

    // 4. Attach On-Screen Floating Controls
    document
      .getElementById("zoom-in-btn")
      ?.addEventListener("click", () => this.zoomBy(1.25));
    document
      .getElementById("zoom-out-btn")
      ?.addEventListener("click", () => this.zoomBy(0.8));
    document
      .getElementById("zoom-reset-btn")
      ?.addEventListener("click", () => this.reset());
  }
}

export let viewportManager = null;

export function initMapViewport(viewportEl, canvasEl) {
  viewportManager = new ViewportManager(viewportEl, canvasEl);
  return viewportManager;
}

export function wasPanning() {
  return viewportManager ? viewportManager.wasPanning() : false;
}

export function zoomViewportBy(factor) {
  viewportManager?.zoomBy(factor);
}

export function resetViewport() {
  viewportManager?.reset();
}
