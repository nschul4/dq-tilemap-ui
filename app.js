document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('game-board');
  const menu = document.getElementById('tile-menu');
  const cancelBtn = document.getElementById('menu-cancel');

  const GRID_SIZE = parseInt(getComputedStyle(board).getPropertyValue('--grid-size').trim(), 10) || 20;

  const countsUI = {
    grass: document.getElementById('count-grass'),
    water: document.getElementById('count-water'),
    mountain: document.getElementById('count-mountain')
  };

  const metrics = { grass: 0, water: 0, mountain: 0 };
  let activeTile = null;

  function initGrid() {
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', `Grass terrain tile at row ${r + 1}, column ${c + 1}`);
        
        tile.dataset.row = r;
        tile.dataset.col = c;
        tile.dataset.terrain = 'grass';
        tile.dataset.owner = 'none';
        
        metrics.grass++;
        fragment.appendChild(tile);
      }
    }
    board.appendChild(fragment);
    renderMetrics();
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
        
        const formattedTerrain = newTerrain.charAt(0).toUpperCase() + newTerrain.slice(1);
        targetTile.setAttribute('aria-label', `${formattedTerrain} terrain tile at row ${r}, column ${c}`);
        
        metrics[oldTerrain]--;
        metrics[newTerrain]++;
        renderMetrics();
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

  function renderMetrics() {
    countsUI.grass.textContent = metrics.grass;
    countsUI.water.textContent = metrics.water;
    countsUI.mountain.textContent = metrics.mountain;
  }

  initGrid();
});