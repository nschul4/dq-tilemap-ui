# dq-tilemap-ui

A DOM-driven web engine and interactive board builder for game tiles based on _DungeonQuest_ (_Drakborgen_). It renders a customizable, decoupled grid canvas directly in the browser using raw HTML, CSS, and vanilla JavaScript—storing game state directly inside DOM attributes rather than in-memory state arrays.

This site is live at: [https://nschul4.github.io/dq-tilemap-ui/](https://nschul4.github.io/dq-tilemap-ui/)

---

## Key Features

- **DOM-as-State Architecture**: Cell attributes (`data-row`, `data-col`, `data-variant`, `data-rotation`) are stored directly on element nodes.
- **Cursor-Anchored & Control-Driven Viewport Zoom**: Smooth map scaling between 0.5x and 4.0x anchored to mouse pointer position or via floating UI buttons (`+`, `-`, `100%`).
- **Drag & Touch Panning**: Dual desktop drag-panning and single-finger touch-panning with a built-in 6px drag threshold (`PAN_THRESHOLD`) to separate map navigation from tile selection clicks.
- **Press-and-Hold Tile Rotation**: Continuous tile rotation engine with a 350ms press delay, a 10px movement cancellation threshold, and modifier key support.
- **Interactive Tile Palette**: Native HTML `<dialog>` selection menu with backdrop click-to-dismiss support.
- **Extensible Tile Categories**: Dynamic rendering of room layouts, hazards, passages, and structural features configured through `TILES_DATA`.
- **Configurable Version Indicator**: Top-right floating version badge driven by `SHOW_VERSION_BADGE` configuration.

---

## Pointer & Interaction Specifications

The engine enforces strict pointer input rules to prevent gesture collisions between canvas navigation, modal management, and tile editing.

| Action                    | Input / Trigger                                                   | Threshold / Timing                               | Logic & Behavioral Constraints                                                                                                                              |
| :------------------------ | :---------------------------------------------------------------- | :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zoom Viewport**         | `Wheel Scroll` on viewport or Floating Buttons (`+`, `-`, `100%`) | 0.5x to 4.0x bounds                              | Wheel multiplies scale by 1.1x (in) or 0.9x (out) anchored to mouse `clientX`/`clientY`. Floating buttons scale relative to screen center or reset to 1.0x. |
| **Pan Canvas**            | `Left-Click + Drag` or Single-Touch Drag on viewport              | > 6px movement (`PAN_THRESHOLD`)                 | Updates transform translate offset. Flags `didPan = true` to prevent triggering tile clicks upon release.                                                   |
| **Open Palette**          | `Left Click` or `Tap` on tile                                     | Instant (`click`)                                | Triggers `<dialog>` modal. Suppressed if the pointer action was a canvas pan or hold-rotation.                                                              |
| **Rotate Clockwise**      | `Click & Hold` on placed tile                                     | 350ms initial delay, 350ms repeat (`HOLD_DELAY`) | Rotates tile +90° continuously. Applies only to placed tiles containing a `data-variant` attribute.                                                         |
| **Rotate Counter-CW**     | `Shift` / `Ctrl` + `Click & Hold`                                 | 350ms initial delay, 350ms repeat                | Rotates tile -90° continuously while keyboard modifier keys are pressed.                                                                                    |
| **Cancel Rotation**       | `Mouse Move` during hold press                                    | > 10px movement (`MOVE_THRESHOLD`)               | Clears the hold rotation timer immediately if the pointer strays.                                                                                           |
| **Dismiss Palette**       | `Left Click` outside modal box                                    | Instant (`click`)                                | Compares click coordinates against `getBoundingClientRect()` to close modal without state changes.                                                          |
| **Suppress Context Menu** | `Right Click` on board                                            | Instant (`contextmenu`)                          | Executes `preventDefault()` to prevent default browser context menus over the grid.                                                                         |

---

## Mobile & Touch Interactions

While single-finger touch-panning is functional, the following mobile constraints and planned feature enhancements should be noted for ongoing development:

1. **Unsupported Touch Pinch-Zoom (Future Work)**: During testing, multi-touch pinch zooming could not be reliably integrated alongside single-finger viewport interactions. Zooming on touch screens is currently handled via the floating screen controls (`+`, `-`, `100%`). Implementing robust multi-touch pinch calculations remains planned future work.
2. **Lack of Hardware Modifiers**: Touch inputs cannot rely on physical `Shift` or `Ctrl` keys to reverse continuous rotation direction to counter-clockwise.
3. **Gesture Disambiguation**: Single-finger drag-panning shares input triggers with the single-finger press-and-hold timer used for tile rotation. Movement beyond `PAN_THRESHOLD` explicitly flags panning to avoid accidental rotation triggers.

---

## Accessibility & Keyboard Controls

- **Select Tile**: Press `Enter` or `Space` while focused on a tile to open the selection palette.
- **Focus Preservation**: Closing the tile palette explicitly restores focus to the active tile while preventing unwanted page scroll jumps (`preventScroll: true`).

---

## Attribution & Provenance

The assets utilized in this project are derived from community artwork created by **Valnar Nightrunner** on the DakkaDakka forums and DeviantArt. This graphics set modernizes components from the original _DungeonQuest_ (published by Games Workshop and Fantasy Flight Games) and _Drakborgen_ (1985).

_Note: This repository is an open-source, non-commercial fan implementation. All intellectual property rights belong to their respective trademark holders._
