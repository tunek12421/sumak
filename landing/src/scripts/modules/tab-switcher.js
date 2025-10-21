/**
 * Tab Switcher Module
 * Sistema de navegación por pestañas
 */

import { APP_CONFIG } from '../config/app-config.js';

class TabSwitcher {
    constructor() {
        this.tabButtons = [];
        this.tabContents = [];
        this.init();
    }

    /**
     * Inicializa el sistema de tabs
     */
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Configura los event listeners
     */
    setup() {
        this.tabButtons = document.querySelectorAll(APP_CONFIG.tabs.buttonSelector);
        this.tabContents = document.querySelectorAll(APP_CONFIG.tabs.contentSelector);

        if (this.tabButtons.length === 0) {
            console.warn('⚠️ No tab buttons found');
            return;
        }

        // Agregar event listeners a cada botón
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.currentTarget));
        });

        console.log(`✅ Tab switcher initialized with ${this.tabButtons.length} tabs`);
    }

    /**
     * Cambia de tab
     * @param {HTMLElement} clickedButton - Botón clickeado
     */
    switchTab(clickedButton) {
        const targetTab = clickedButton.dataset.tab;

        if (!targetTab) {
            console.warn('⚠️ Tab button missing data-tab attribute');
            return;
        }

        // Remover clase active de todos los botones y contenidos
        this.tabButtons.forEach(btn => btn.classList.remove(APP_CONFIG.tabs.activeClass));
        this.tabContents.forEach(content => content.classList.remove(APP_CONFIG.tabs.activeClass));

        // Agregar clase active al botón clickeado
        clickedButton.classList.add(APP_CONFIG.tabs.activeClass);

        // Agregar clase active al contenido correspondiente
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
            targetContent.classList.add(APP_CONFIG.tabs.activeClass);
        }
    }

    /**
     * Selecciona un tab programáticamente
     * @param {string} tabId - ID del tab a seleccionar
     */
    selectTab(tabId) {
        const button = document.querySelector(`[data-tab="${tabId}"]`);
        if (button) {
            this.switchTab(button);
        }
    }
}

// Exportar instancia única (Singleton)
export const tabSwitcher = new TabSwitcher();
