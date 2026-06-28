document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('game-board');
  const menu = document.getElementById('tile-menu');
  const cancelBtn = document.getElementById('menu-cancel');

  const GRID_SIZE = parseInt(getComputedStyle(board).getPropertyValue('--grid-size').trim(), 10) || 20;

  let activeTile = null;

  function initGrid() {
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
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
    menu.showModal();
  }

  board.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    openTileMenu(tile);
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
    const targetTile = activeTile;

    if (menu.returnValue && targetTile) {
      const oldTerrain = targetTile.dataset.terrain;
      const newTerrain = menu.returnValue;

      if (oldTerrain !== newTerrain) {
        targetTile.dataset.terrain = newTerrain;
        
        const r = parseInt(targetTile.dataset.row, 10) + 1;
        const c = parseInt(targetTile.dataset.col, 10) + 1;

        // In the menu.addEventListener('close') function:
        const formattedTerrain = newTerrain === 'unset'
        ? 'Unset'
        : newTerrain.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        targetTile.setAttribute('aria-label', `${formattedTerrain} tile at row ${r}, column ${c}`);
      }
    }
    
    if (targetTile) {
      targetTile.focus();
    }

    activeTile = null;
    menu.returnValue = '';
  });

  cancelBtn.addEventListener('click', () => {
    menu.close(''); 
  });

  initGrid();
});