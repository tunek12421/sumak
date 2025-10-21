/**
 * Hero Component
 * Genera la sección hero
 */

import { CONTENT } from '../data/content.js';

export function renderHero() {
    const { hero, urls } = CONTENT;

    return `
        <section class="hero">
            <div class="container">
                <div class="hero-content grid-hero">
                    <div class="hero-text">
                        <h1 class="hero-title">
                            <span class="icon">${hero.icon}</span>
                            ${hero.title}
                        </h1>
                        <p class="hero-subtitle">${hero.subtitle}</p>
                        <p class="hero-description">${hero.description}</p>

                        <div class="cta-buttons">
                            <a href="${urls.app}" class="btn btn-primary">
                                ${hero.buttons.primary}
                            </a>
                            <button id="installBtn" class="btn btn-secondary" style="display: none;">
                                ${hero.buttons.secondary}
                            </button>
                        </div>

                        <div class="install-instructions">
                            <p class="small-text" id="platform-hint">
                                ${hero.hint}
                            </p>
                        </div>
                    </div>

                    <div class="hero-image">
                        <div class="phone-mockup">
                            <div class="phone-screen">
                                <video autoplay loop muted playsinline class="app-video">
                                    <source src="public/videos/phone-video.mp4" type="video/mp4">
                                </video>
                            </div>
                        </div>

                        <div class="qr-section">
                            <div class="qr-card">
                                <p class="qr-title">${hero.qr.title}</p>
                                <div id="qrcode"></div>
                                <p class="qr-url">${urls.qrDisplay}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}
