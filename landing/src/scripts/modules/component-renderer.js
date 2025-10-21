/**
 * Component Renderer Module
 * Renderiza componentes dinámicamente en el DOM
 */

import { renderHero } from '../../components/hero-component.js';
import { renderFeatures } from '../../components/features-component.js';
import { renderHowTo } from '../../components/how-to-component.js';
import { renderCTA } from '../../components/cta-component.js';
import { renderFooter } from '../../components/footer-component.js';

/**
 * Renderiza todos los componentes en el DOM
 */
export function renderAllComponents() {
    const app = document.getElementById('app');

    if (!app) {
        console.error('❌ #app container not found');
        return;
    }

    console.log('🎨 Rendering components...');

    // Renderizar todos los componentes
    const componentsHTML = `
        ${renderHero()}
        ${renderFeatures()}
        ${renderHowTo()}
        ${renderCTA()}
        ${renderFooter()}
    `;

    // Insertar en el DOM
    app.innerHTML = componentsHTML;

    console.log('✅ Components rendered successfully');
}

/**
 * Renderiza un componente específico
 * @param {string} componentName - Nombre del componente
 * @param {string} containerId - ID del contenedor
 */
export function renderComponent(componentName, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`❌ Container #${containerId} not found`);
        return;
    }

    const components = {
        hero: renderHero,
        features: renderFeatures,
        howTo: renderHowTo,
        cta: renderCTA,
        footer: renderFooter
    };

    const renderFunction = components[componentName];

    if (!renderFunction) {
        console.error(`❌ Component "${componentName}" not found`);
        return;
    }

    container.innerHTML = renderFunction();
    console.log(`✅ Component "${componentName}" rendered in #${containerId}`);
}

export default {
    renderAllComponents,
    renderComponent
};
