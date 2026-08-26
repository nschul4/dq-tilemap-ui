/**
 * Initializes the grid tiles inside the target board container.
 * @param {HTMLElement} [board] - The grid board DOM element.
 */
export function initGrid(board = document.getElementById('game-board')) {
    if (!board) return;

    const GRID_COLS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-cols').trim(), 10) || 13;
    const GRID_ROWS = parseInt(getComputedStyle(board).getPropertyValue('--grid-size-rows').trim(), 10) || 10;

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

            fragment.appendChild(tile);
        }
    }

    board.appendChild(fragment);
}

/**
 * Rotates a tile element by 90 degrees clockwise or counter-clockwise.
 * @param {HTMLElement} tile - Target tile DOM element.
 * @param {Object|boolean} [options={}] - Event object or boolean indicating CCW rotation.
 */
export function rotateTile(tile, options = {}) {
    if (!tile) return;

    let currentRotation = parseInt(tile.dataset.rotation, 10) || 0;
    const isCounterClockwise = typeof options === 'boolean'
        ? options
        : !!(options.shiftKey || options.ctrlKey);

    if (isCounterClockwise) {
        currentRotation -= 90;
    } else {
        currentRotation += 90;
    }

    tile.dataset.rotation = currentRotation;
    tile.style.setProperty('--tile-rotation', `${currentRotation}deg`);
}

/**
 * Updates tile datasets, styles, title, and ARIA labels based on menu selection.
 * @param {HTMLElement} targetTile - Target tile DOM element.
 * @param {string} newTerrain - Selected variant value or 'unset'.
 * @param {string|number} clickedRow - Row index of target tile.
 * @param {string|number} clickedCol - Column index of target tile.
 */
export function updateTileState(targetTile, newTerrain, clickedRow, clickedCol) {
    if (!targetTile) return;

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
}