/**
 * Footer Component
 * Genera el pie de página
 */

import { CONTENT } from '../data/content.js';

export function renderFooter() {
    const { footer } = CONTENT;

    const linksHTML = footer.links.map(link =>
        `<a href="${link.url}">${link.label}</a>`
    ).join(' • ');

    return `
        <footer>
            <div class="container">
                <p>${footer.copyright}</p>
                <p class="footer-links">
                    ${linksHTML}
                </p>
            </div>
        </footer>
    `;
}
