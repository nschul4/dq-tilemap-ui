import { updateTileState } from './grid.js';

let activeTile = null;
let clickedRow = null;
let clickedCol = null;

let savedScrollX = 0;
let savedScrollY = 0;

function restoreScrollPosition() {
    window.scrollTo(savedScrollX, savedScrollY);
}

/**
 * Opens the tile selection modal dialog and locks body scroll position.
 * @param {HTMLElement} tile - Target tile DOM element.
 * @param {HTMLDialogElement} [menu] - Modal dialog element.
 */
export function openTileMenu(tile, menu = document.getElementById('tile-menu')) {
    if (!tile || !menu) return;

    savedScrollX = window.scrollX || window.pageXOffset;
    savedScrollY = window.scrollY || window.pageYOffset;

    activeTile = tile;
    clickedRow = tile.dataset.row;
    clickedCol = tile.dataset.col;
    menu.returnValue = '';

    menu.showModal();

    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = `-${savedScrollX}px`;
    document.body.style.width = '100%';
}

/**
 * Initializes modal event listeners for dialog closure and cancel action.
 * @param {HTMLDialogElement} [menu] - Modal dialog element.
 * @param {HTMLElement} [cancelBtn] - Cancel button element.
 */
export function initModal(
    menu = document.getElementById('tile-menu'),
    cancelBtn = document.getElementById('menu-cancel')
) {
    if (!menu) return;

    menu.addEventListener('close', () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';

        restoreScrollPosition();
        setTimeout(restoreScrollPosition, 0);

        const targetTile = document.querySelector(`[data-row="${clickedRow}"][data-col="${clickedCol}"]`);
        if (targetTile) {
            targetTile.focus({ preventScroll: true });
        }

        if (!menu.returnValue) return;

        updateTileState(targetTile, menu.returnValue, clickedRow, clickedCol);
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            menu.close('');
        });
    }
}