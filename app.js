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

  // Pointer tracking for touch/mouse
  let pointerStartX = 0;
  let pointerStartY = 0;
  const MOVE_THRESHOLD = 10; // pixels

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

  // preserve scroll & focus while a native <dialog> is open (helps Android)
  let __savedScroll = { x: 0, y: 0 };
  let __previouslyFocused = null;

  function lockBodyScroll() {
    __savedScroll.x = window.scrollX || window.pageXOffset || 0;
    __savedScroll.y = window.scrollY || window.pageYOffset || 0;
    // Fix the body in place and offset it to preserve visual position
    document.body.style.position = 'fixed';
    document.body.style.top = `-${__savedScroll.y}px`;
    document.body.style.left = `-${__savedScroll.x}px`;
    document.body.style.right = '0';
  }

  function unlockBodyScroll() {
    // Remove the fixed positioning
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    // Restore the previous scroll position after a tick (helps on Android)
    const { x, y } = __savedScroll;
    setTimeout(() => {
      window.scrollTo(x, y);
    }, 0);
  }

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

    // save currently focused element so we can restore focus later
    __previouslyFocused = document.activeElement;

    // lock background scroll before opening dialog (prevents content shift on mobile)
    lockBodyScroll();

    menu.showModal();

    // focus something inside the dialog without scrolling if possible
    const focusable = menu.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable && focusable.focus) {
      try { focusable.focus({ preventScroll: true }); } catch (err) { focusable.focus(); }
    } else {
      try { menu.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
    }
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
    // Pass the stored modifier state for direction
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

  // Pointer-based handling (works for mouse, touch, stylus)
  function onPointerDown(e) {
    // Only primary button for mice; allow touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const tile = e.target.closest('.tile');
    if (!tile || !tile.dataset.variant) return;

    currentHoldTile = tile;
    isHoldAction = false;
    // maintain keyboard modifiers if present
    isCounterClockwise = !!(e.ctrlKey || e.shiftKey) || isCounterClockwise;

    pointerStartX = e.clientX;
    pointerStartY = e.clientY;

    // Capture pointer so we keep receiving events for this pointer
    if (e.pointerId != null && board.setPointerCapture) {
      try { board.setPointerCapture(e.pointerId); } catch (err) {}
    }

    holdTimer = setTimeout(triggerHoldRotation, HOLD_DELAY);
  }

  function onPointerMove(e) {
    if (!currentHoldTile || !holdTimer) return;

    const dx = Math.abs(e.clientX - pointerStartX);
    const dy = Math.abs(e.clientY - pointerStartY);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      // cancel hold if user moved finger
      stopHoldRotation();
    }
  }

  function onPointerUp(e) {
    // Release capture
    if (e.pointerId != null && board.releasePointerCapture) {
      try { board.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    stopHoldRotation();
  }

  function onPointerCancel() {
    stopHoldRotation();
    isHoldAction = false;
  }

  board.addEventListener('pointerdown', onPointerDown);
  board.addEventListener('pointermove', onPointerMove);
  board.addEventListener('pointerup', onPointerUp);
  board.addEventListener('pointercancel', onPointerCancel);
  board.addEventListener('pointerleave', onPointerCancel);

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
    // Always unlock body scroll even if returnValue is empty (cancel)
    unlockBodyScroll();

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

    // restore focus to the element that had it before the dialog opened
    if (__previouslyFocused && __previouslyFocused.focus) {
      try { __previouslyFocused.focus({ preventScroll: true }); } catch (err) { __previouslyFocused.focus(); }
    }
  });

  cancelBtn.addEventListener('click', () => {
    menu.close('');
  });

  initGrid();
});
