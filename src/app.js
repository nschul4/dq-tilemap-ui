import { renderTileMenu } from './menuRenderer.js';
import { initGrid } from './grid.js';
import { initModal } from './modal.js';
import { initInteractions } from './interactions.js';

console.log('dq-tilemap-ui v1.0.0 - https://github.com/nschul4/dq-tilemap-ui');

document.addEventListener('DOMContentLoaded', () => {
  renderTileMenu();
  initGrid();
  initModal();
  initInteractions();
});