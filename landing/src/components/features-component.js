/**
 * Features Component
 * Genera la sección de características
 */

import { CONTENT } from '../data/content.js';

export function renderFeatures() {
    const { features } = CONTENT;

    const featuresHTML = features.items.map(feature => `
        <div class="feature-card">
            <div class="feature-icon">${feature.icon}</div>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
        </div>
    `).join('');

    return `
        <section class="features">
            <div class="container">
                <h2 class="section-title">${features.title}</h2>
                <div class="features-grid">
                    ${featuresHTML}
                </div>
            </div>
        </section>
    `;
}
