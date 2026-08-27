# dq-tilemap-ui

A DOM-driven web engine and interactive board builder for game tiles based on *DungeonQuest* (*Drakborgen*). It renders a customizable, decoupled grid canvas directly in the browser using raw HTML, CSS, and vanilla JavaScript—storing game state directly inside DOM attributes rather than in-memory state arrays.

This site is live at: [https://nschul4.github.io/dq-tilemap-ui/](https://www.google.com/search?q=https://nschul4.github.io/dq-tilemap-ui/)

---

## Key Features

* **DOM-as-State Architecture**: Cell attributes (`data-row`, `data-col`, `data-variant`, `data-rotation`) are stored directly on element nodes.
* **Cursor-Anchored Viewport Zoom**: Smooth map scaling between 0.5x and 4.0x anchored directly to the mouse pointer position.
* **Drag-Panning & Interaction Thresholds**: Built-in 6px drag threshold to separate map navigation from tile selection clicks.
* **Press-and-Hold Tile Rotation**: Continuous tile rotation engine with a 350ms press delay, a 10px movement cancellation threshold, and modifier key support.
* **Interactive Tile Palette**: Native HTML `<dialog>` selection menu with backdrop click-to-dismiss support.
* **12 Dungeon Chamber Types**: Support for standard *DungeonQuest* room layouts and hazards.

---

## Pointer & Mouse Interaction Specifications

The engine enforces strict pointer input rules to prevent gesture collisions between canvas navigation, modal management, and tile editing.

| Action | Input / Trigger | Threshold / Timing | Logic & Behavioral Constraints |
| --- | --- | --- | --- |
| **Zoom Viewport** | `Wheel Scroll` on viewport | $0.5\times$ to $4.0\times$ bounds | Multiplies scale by 1.1x (in) or 0.9x (out) anchored to mouse `clientX`/`clientY` coordinates. |
| **Pan Canvas** | `Left-Click + Drag` on viewport | $> 6\text{px}$ movement (`PAN_THRESHOLD`) | Updates transform translate offset. Flags `didPan = true` to prevent triggering tile clicks upon release. |
| **Open Palette** | `Left Click` on tile | Instant (`click`) | Triggers `<dialog>` modal. Suppressed if the pointer action was a canvas pan or hold-rotation. |
| **Rotate Clockwise** | `Click & Hold` on placed tile | 350ms initial delay, 350ms repeat (`HOLD_DELAY`) | Rotates tile +90° continuously. Applies only to placed tiles containing a `data-variant` attribute. |
| **Rotate Counter-CW** | `Shift` / `Ctrl` + `Click & Hold`<br> | 350ms initial delay, 350ms repeat | Rotates tile -90° continuously while keyboard modifier keys are pressed. |
| **Cancel Rotation** | `Mouse Move` during hold press | $> 10\text{px}$ movement (`MOVE_THRESHOLD`) | Clears the hold rotation timer immediately if the pointer strays. |
| **Dismiss Palette** | `Left Click` outside modal box | Instant (`click`) | Compares click coordinates against `getBoundingClientRect()` to close modal without state changes. |
| **Suppress Context Menu** | `Right Click` on board | Instant (`contextmenu`) | Executes `preventDefault()` to prevent default browser context menus over the grid. |

---

## Constraints for Mobile Porting

When adapting these interactions to touch devices, the following mouse-specific dependencies must be accounted for:

1. **Lack of Hardware Modifiers**: Touch inputs cannot rely on `Shift` or `Ctrl` key modifiers to switch rotation direction to counter-clockwise.
2. **Gesture Ambiguity**: Single-finger drag-panning directly conflicts with the single-finger press-and-hold timer used for tile rotation.
3. **Cursor Anchoring**: Mouse wheel zoom calculates offsets using pointer coordinates (`clientX`/`clientY`), whereas touch zooming must compute the midpoint between two pinch touch targets.

---

## Accessibility & Keyboard Controls

* **Select Tile**: Press `Enter` or `Space` while focused on a tile to open the selection palette.
* **Focus Preservation**: Closing the tile palette explicitly restores focus to the active tile while preventing unwanted page scroll jumps (`preventScroll: true`).

---

## Attribution & Provenance

The assets utilized in this project are derived from community artwork created by **Valnar Nightrunner** on the DakkaDakka forums and DeviantArt. This graphics set modernizes components from the original *DungeonQuest* (published by Games Workshop and Fantasy Flight Games) and *Drakborgen* (1985).

*Note: This repository is an open-source, non-commercial fan implementation. All intellectual property rights belong to their respective trademark holders.*
