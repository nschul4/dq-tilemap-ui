function renderTileMenu() {
  const container = document.getElementById('options-container');
  if (!container || typeof TILES_DATA === 'undefined') return;

  const fragment = document.createDocumentFragment();

  TILES_DATA.forEach(group => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tile-category';

    const title = document.createElement('h4');
    title.textContent = group.category;
    categoryDiv.appendChild(title);

    const variantsDiv = document.createElement('div');
    variantsDiv.className = 'tile-variants';

    group.variants.forEach(variant => {
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.name = 'terrain';
      btn.className = 'tile-option';

      btn.value = variant.name.toLowerCase().replace(/\s+/g, '-');
      btn.title = variant.name;

      const img = document.createElement('img');
      img.src = variant.src;
      img.alt = variant.name;

      btn.appendChild(img);
      variantsDiv.appendChild(btn);
    });

    categoryDiv.appendChild(variantsDiv);
    fragment.appendChild(categoryDiv);
  });

  container.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', renderTileMenu);

document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('game-board');
  const menu = document.getElementById('tile-menu');
  const cancelBtn = document.getElementById('menu-cancel');

  const GRID_COLS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-cols').trim(), 10) || 13;
  const GRID_ROWS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-rows').trim(), 10) || 10;

  let activeTile = null;
  let clickedRow = null;
  let clickedCol = null;

  let currentHoldTile = null;
  let holdTimer = null;
  let isHoldAction = false;
  let isCounterClockwise = false;

  const HOLD_DELAY = 350;

  function updateModifierState(e) {
    isCounterClockwise = !!(e.shiftKey || e.ctrlKey);
  }

  window.addEventListener('keydown', updateModifierState);
  window.addEventListener('keyup', updateModifierState);

  window.addEventListener('blur', () => {
    isCounterClockwise = false;
    stopHoldRotation();
    isHoldAction = false;
  });

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
    menu.returnValue = '';
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

  function triggerHoldRotation() {
    if (!currentHoldTile) return;

    isHoldAction = true;
    rotateTile(currentHoldTile, { ctrlKey: isCounterClockwise });

    holdTimer = setTimeout(triggerHoldRotation, HOLD_DELAY);
  }

  function stopHoldRotation() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    currentHoldTile = null;
  }

  board.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Left click only

    const tile = e.target.closest('.tile');
    if (!tile || !tile.dataset.variant) return;

    currentHoldTile = tile;
    isHoldAction = false;
    isCounterClockwise = e.ctrlKey || e.shiftKey;

    holdTimer = setTimeout(triggerHoldRotation, HOLD_DELAY);
  });

  board.addEventListener('mouseup', stopHoldRotation);
  board.addEventListener('mouseleave', () => {
    stopHoldRotation();
    isHoldAction = false;
  });

  // Handle Left Clicks (Open Selection Menu)
  board.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;

    if (isHoldAction) {
      isHoldAction = false;
      return;
    }

    openTileMenu(tile);
  });

  // Right clicking does nothing (Prevents default context menu entirely)
  board.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Keep accessibility sync'd with interaction logic
  board.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tile = e.target.closest('.tile');
      if (!tile) return;

      e.preventDefault();
      openTileMenu(tile);
    }
  });

  menu.addEventListener('close', () => {
    if (!menu.returnValue)
      return;

    const targetTile = document.querySelector(`[data-row="${clickedRow}"][data-col="${clickedCol}"]`);
    const newTerrain = menu.returnValue;
    const rowNum = parseInt(clickedRow, 10) + 1;
    const colNum = parseInt(clickedCol, 10) + 1;

    if (newTerrain === 'unset') {
      targetTile.dataset.terrain = 'unset';
      delete targetTile.dataset.variant;
      delete targetTile.dataset.rotation;
      targetTile.removeAttribute('title');
      targetTile.style.backgroundImage = '';
      targetTile.style.removeProperty('--tile-rotation');
      targetTile.setAttribute('aria-label', `Unset tile at row ${rowNum}, column ${colNum}`);
    } else {
      delete targetTile.dataset.terrain;
      targetTile.dataset.variant = newTerrain;
      const variantBtn = document.querySelector(`button[value="${newTerrain}"]`);
      const variantImg = variantBtn ? variantBtn.querySelector('img') : null;

      targetTile.style.backgroundImage = variantImg ? `url('${variantImg.src}')` : '';
      targetTile.title = variantBtn ? variantBtn.title : '';

      const formattedName = newTerrain.replace(/-/g, ' ');
      targetTile.setAttribute('aria-label', `${formattedName} at row ${rowNum}, column ${colNum}`);
    }
  });

  cancelBtn.addEventListener('click', () => {
    menu.close('');
  });

  initGrid();
});