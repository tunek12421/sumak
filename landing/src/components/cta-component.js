/**
 * CTA Component
 * Genera la sección de llamada a la acción
 */

import { CONTENT } from '../data/content.js';

export function renderCTA() {
    const { cta, urls } = CONTENT;

    return `
        <section class="cta-section">
            <div class="container">
                <h2>${cta.title}</h2>
                <p>${cta.description}</p>
                <div class="cta-buttons-large">
                    <a href="${urls.app}" class="btn btn-primary btn-large">
                        ${cta.buttons.primary}
                    </a>
                    <button id="installBtnLarge" class="btn btn-secondary btn-large" style="display: none;">
                        ${cta.buttons.secondary}
                    </button>
                </div>
            </div>
        </section>
    `;
}
