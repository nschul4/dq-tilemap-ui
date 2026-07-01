document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('game-board');
  const menu = document.getElementById('tile-menu');
  const cancelBtn = document.getElementById('menu-cancel');

  const GRID_COLS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-cols').trim(), 10) || 13;
  const GRID_ROWS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-rows').trim(), 10) || 10;

  let activeTile = null;
  let clickedRow = null;
  let clickedCol = null;
  let clickTimeout = null;

  function initGrid() {
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');

        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', `Unset tile at row ${r + 1}, column ${c + 1}`);

        tile.dataset.row = r;
        tile.dataset.col = c;
        tile.dataset.terrain = 'unset'; // Explicitly set to match CSS styling rules

        fragment.appendChild(tile);
      }
    }
    board.appendChild(fragment);
  }

  function openTileMenu(tile) {
    activeTile = tile;
    clickedRow = tile.dataset.row;
    clickedCol = tile.dataset.col;
    menu.showModal();
  }

  function rotateTile(tile, event) {
    let currentRotation = parseInt(tile.dataset.rotation, 10) || 0;

    if (event.shiftKey || event.ctrlKey) {
      currentRotation -= 90; // Counter-clockwise
    } else {
      currentRotation += 90; // Clockwise
    }

    tile.dataset.rotation = currentRotation;
    tile.style.setProperty('--tile-rotation', `${currentRotation}deg`);
  }

  // Handle Single Left Clicks
  board.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;

    const isSet = !!tile.dataset.variant;

    if (!isSet) {
      // Empty tile: immediately open the menu
      openTileMenu(tile);
    } else {
      // Placed tile: delay execution to differentiate from a double click
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }

      clickTimeout = setTimeout(() => {
        rotateTile(tile, e);
        clickTimeout = null;
      }, 200); // 200ms window for a double-click to register
    }
  });

  // Handle Double Left Clicks (Only on already placed tiles)
  board.addEventListener('dblclick', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;

    const isSet = !!tile.dataset.variant;
    if (isSet) {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      openTileMenu(tile);
    }
  });

  // Right clicking does nothing (Prevents default context menu entirely)
  board.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Keep accessibility sync'd with the new mouse logic
  board.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tile = e.target.closest('.tile');
      if (!tile) return;

      e.preventDefault();
      const isSet = !!tile.dataset.variant;
      
      if (!isSet) {
        openTileMenu(tile);
      } else {
        rotateTile(tile, e);
      }
    }
  });

  menu.addEventListener('close', () => {
    if (!menu.returnValue)
      return;

    const targetTile = document.querySelector(`[data-row="${clickedRow}"][data-col="${clickedCol}"]`);
    const newTerrain = menu.returnValue;

    if (newTerrain === 'unset') {
      targetTile.dataset.terrain = 'unset';
      delete targetTile.dataset.variant;
      delete targetTile.dataset.rotation;
      targetTile.style.backgroundImage = '';
      targetTile.style.removeProperty('--tile-rotation');
    } else {
      delete targetTile.dataset.terrain;
      targetTile.dataset.variant = newTerrain;
      const variantImg = document.querySelector(`button[value="${newTerrain}"] img`);
      targetTile.style.backgroundImage = variantImg ? `url('${variantImg.src}')` : '';
    }
  });

  cancelBtn.addEventListener('click', () => {
    menu.close('');
  });

  initGrid();
});