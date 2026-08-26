import { TILES_DATA } from './tiles.js';

/**
 * Reads TILES_DATA and populates category and variant buttons into the menu container.
 * @param {string} containerId - DOM ID of the options wrapper element.
 */
export function renderTileMenu(containerId = 'options-container') {
    const container = document.getElementById(containerId);
    if (!container || !TILES_DATA) return;

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