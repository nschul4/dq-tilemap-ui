# dq-tilemap-ui

A DOM-driven web engine and interactive board builder for game tiles based on _DungeonQuest_ (_Drakborgen_). It renders a customizable, decoupled grid canvas directly in the browser using raw HTML, CSS, and vanilla JavaScript—storing game state directly inside DOM attributes rather than in-memory state arrays.

This site is live at: https://nschul4.github.io/dq-tilemap-ui/

---

## Key Features

- **DOM-as-State Architecture**: Stores cell variables (terrain, variant, rotation angle) directly on element `data-*` attributes (`data-row`, `data-col`, `data-variant`, `data-rotation`).
- **Interactive Tile Editing**: Left-click empty cells to open a native HTML `<dialog>` tile selection palette complete with visual icon previews grouped by chamber category.
- **Rotation Mechanics**: Click and hold placed tiles to rotate them clockwise (+90° increments), or hold `Shift` / `Ctrl` while clicking and holding to rotate counter-clockwise.
- **12 Dungeon Chamber Types**: Full support for standard _DungeonQuest_ chamber types (Dungeon Rooms, Bottomless Pits, Catacomb Entrances, Trap Rooms, Chambers of Darkness, Treasure Chambers, Corridors, Chasms, Cave-ins, Bridges, and Rotating Rooms).
- **Decoupled Background Layout**: CSS Grid overlay system allowing pixel-accurate nudging (`--grid-nudge-x`, `--grid-nudge-y`) over a static board background.
- **Asset Automation Scripts**: Integrated Bash and ImageMagick scripts to automatically process, crop, and slice full-page asset sheets into individual sprite directories.

---

## Controls & Usage

| Action                       | Input                             | Description                                                                   |
| ---------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| **Place / Modify Tile**      | `Single Click` (Any tile)         | Opens the tile selection modal menu.                                          |
| **Rotate Clockwise**         | `Click & Hold` (Placed tile)      | Presses and holds left-click to rotate the tile +90° continuously.            |
| **Rotate Counter-Clockwise** | `Shift` / `Ctrl` + `Click & Hold` | Holds `Shift` or `Ctrl` while holding left-click to rotate -90° continuously. |
| **Accessibility Menu**       | `Enter` / `Space`                 | Triggers the tile selection menu on the currently focused tile.               |

---

## Attribution & Provenance

The assets utilized in this project are derived from community artwork created by **Valnar Nightrunner** on the DakkaDakka forums and DeviantArt. This graphics set modernizes components from the original _DungeonQuest_ (published by Games Workshop and Fantasy Flight Games) and _Drakborgen_ (1985).

_Note: This repository is an open-source, non-commercial fan implementation. All intellectual property rights belong to their respective trademark holders._
