document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('game-board');
  const menu = document.getElementById('tile-menu');
  const cancelBtn = document.getElementById('menu-cancel');

  const GRID_COLS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-cols').trim(), 10) || 13;
  const GRID_ROWS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-rows').trim(), 10) || 10;

  let activeTile = null;
  let clickedRow = null;
  let clickedCol = null;

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
        tile.dataset.terrain = 'unset';
        tile.dataset.owner = 'none';
        
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

  board.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    openTileMenu(tile);
  });

  // Handle right-click rotation
  board.addEventListener('contextmenu', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile || tile.dataset.terrain === 'unset') return;

    e.preventDefault(); // Block native browser context menu

    let currentRotation = parseInt(tile.dataset.rotation, 10) || 0;

    if (e.shiftKey || e.ctrlKey) {
      currentRotation -= 90; // Counter-clockwise
    } else {
      currentRotation += 90; // Clockwise
    }

    tile.dataset.rotation = currentRotation;
    tile.style.setProperty('--tile-rotation', `${currentRotation}deg`);
  });

  board.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tile = e.target.closest('.tile');
      if (!tile) return;
      
      e.preventDefault(); 
      openTileMenu(tile);
    }
  });

  menu.addEventListener('close', () => {
    if (menu.returnValue) {
      const targetTile = document.querySelector(`[data-row="${clickedRow}"][data-col="${clickedCol}"]`);
      const newTerrain = menu.returnValue;

      if (newTerrain === 'unset') {
        targetTile.dataset.terrain = 'unset';
        delete targetTile.dataset.variant;
        delete targetTile.dataset.rotation;
        targetTile.style.backgroundImage = '';
        targetTile.style.removeProperty('--tile-rotation');
      } else {
        const baseTerrain = newTerrain.replace(/-variant-\d+$/, '');
        targetTile.dataset.terrain = baseTerrain;
        targetTile.dataset.variant = newTerrain;

        const variantImg = document.querySelector(`button[value="${newTerrain}"] img`);
        targetTile.style.backgroundImage = variantImg ? `url('${variantImg.src}')` : '';
      }

      // Update ARIA label and focus
      const r = parseInt(clickedRow, 10) + 1;
      const c = parseInt(clickedCol, 10) + 1;
      const formattedTerrain = targetTile.dataset.terrain === 'unset'
        ? 'Unset'
        : targetTile.dataset.terrain.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
      targetTile.setAttribute('aria-label', `${formattedTerrain} tile at row ${r}, column ${c}`);
      targetTile.focus(); // Return focus to the tile
    }
  });

  cancelBtn.addEventListener('click', () => {
    menu.close('');
  });

  initGrid();
});