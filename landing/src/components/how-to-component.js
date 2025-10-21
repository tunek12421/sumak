/**
 * How To Install Component
 * Genera la sección de instrucciones de instalación
 */

import { CONTENT } from '../data/content.js';

function renderSteps(steps) {
    return steps.map(step => `
        <div class="step">
            <div class="step-number">${step.number}</div>
            <div class="step-content">
                <h3>${step.title}</h3>
                <p>${step.description}</p>
            </div>
        </div>
    `).join('');
}

export function renderHowTo() {
    const { howTo } = CONTENT;

    const tabsHTML = howTo.tabs.map(tab => `
        <button class="tab-btn ${tab.active ? 'active' : ''}" data-tab="${tab.id}">
            ${tab.icon} ${tab.label}
        </button>
    `).join('');

    return `
        <section class="how-to">
            <div class="container">
                <h2 class="section-title">${howTo.title}</h2>

                <div class="install-tabs">
                    ${tabsHTML}
                </div>

                <div class="tab-content active" id="android">
                    <div class="steps">
                        ${renderSteps(howTo.android.steps)}
                    </div>
                </div>

                <div class="tab-content" id="ios">
                    <div class="steps">
                        ${renderSteps(howTo.ios.steps)}
                    </div>
                </div>

                <div class="tab-content" id="desktop">
                    <div class="steps">
                        ${renderSteps(howTo.desktop.steps)}
                    </div>
                </div>
            </div>
        </section>
    `;
}
