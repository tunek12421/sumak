// Configuration
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : `${window.location.protocol}//${window.location.hostname}/api`;

// State
let selectedPhoto = null;
let currentLocation = null;
let map = null;
let marker = null;
let currentLocationMethod = 'auto'; // 'auto' or 'map'

// DOM Elements
const photoInput = document.getElementById('photoInput');
const cameraBtn = document.getElementById('cameraBtn');
const photoPreview = document.getElementById('photoPreview');
const previewImage = document.getElementById('previewImage');
const removePhotoBtn = document.getElementById('removePhoto');
const description = document.getElementById('description');

// Location method buttons
const autoLocationBtn = document.getElementById('autoLocationBtn');
const mapLocationBtn = document.getElementById('mapLocationBtn');

// Location containers
const autoLocationContainer = document.getElementById('autoLocationContainer');
const mapLocationContainer = document.getElementById('mapLocationContainer');

// Location elements
const getLocationBtn = document.getElementById('getLocationBtn');
const locationStatus = document.getElementById('locationStatus');
const mapStatus = document.getElementById('mapStatus');

const submitBtn = document.getElementById('submitBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const message = document.getElementById('message');
const reportsList = document.getElementById('reportsList');
const refreshBtn = document.getElementById('refreshBtn');

// PWA Install
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const dismissInstallBtn = document.getElementById('dismissInstall');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadReports();
    checkValidation();
});

function initializeApp() {
    // Camera button
    cameraBtn.addEventListener('click', () => {
        photoInput.click();
    });

    // Photo selection
    photoInput.addEventListener('change', handlePhotoSelect);

    // Remove photo
    removePhotoBtn.addEventListener('click', removePhoto);

    // Location method selection
    autoLocationBtn.addEventListener('click', () => switchLocationMethod('auto'));
    mapLocationBtn.addEventListener('click', () => switchLocationMethod('map'));

    // Location button
    getLocationBtn.addEventListener('click', getCurrentLocation);

    // Description input
    description.addEventListener('input', checkValidation);

    // Submit button
    submitBtn.addEventListener('click', handleSubmit);

    // Refresh button
    refreshBtn.addEventListener('click', loadReports);

    // PWA Install
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installPrompt.style.display = 'block';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            installPrompt.style.display = 'none';
        }
    });

    dismissInstallBtn.addEventListener('click', () => {
        installPrompt.style.display = 'none';
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Photo handling
function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Por favor selecciona una imagen válida', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('La imagen no debe superar los 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        selectedPhoto = event.target.result;
        previewImage.src = selectedPhoto;
        photoPreview.style.display = 'block';
        cameraBtn.textContent = '📷 Cambiar Foto';
        checkValidation();
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    selectedPhoto = null;
    photoInput.value = '';
    photoPreview.style.display = 'none';
    previewImage.src = '';
    cameraBtn.textContent = '📷 Tomar Foto';
    checkValidation();
}

// Location method switching
function switchLocationMethod(method) {
    currentLocationMethod = method;

    // Update button states
    autoLocationBtn.classList.remove('active');
    mapLocationBtn.classList.remove('active');

    // Hide all containers
    autoLocationContainer.style.display = 'none';
    mapLocationContainer.style.display = 'none';

    // Show selected container and update button
    switch (method) {
        case 'auto':
            autoLocationBtn.classList.add('active');
            autoLocationContainer.style.display = 'block';
            break;
        case 'map':
            mapLocationBtn.classList.add('active');
            mapLocationContainer.style.display = 'block';
            initializeMap();
            break;
    }
}

// Initialize map
function initializeMap() {
    if (map) {
        map.remove();
    }

    // Default center (Cochabamba, Bolivia)
    let defaultLat = -17.3895;
    let defaultLng = -66.1568;
    let defaultZoom = 14;

    // If we already have a location, use it
    if (currentLocation) {
        defaultLat = currentLocation.latitude;
        defaultLng = currentLocation.longitude;
        defaultZoom = 15;
    }

    // Create map
    map = L.map('map').setView([defaultLat, defaultLng], defaultZoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Add marker if location exists
    if (currentLocation) {
        marker = L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map);
    }

    // Handle map clicks
    map.on('click', function(e) {
        // Remove old marker
        if (marker) {
            map.removeLayer(marker);
        }

        // Add new marker
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

        // Update location
        currentLocation = {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
        };

        // Show status
        showMapStatus(
            `✓ Ubicación seleccionada: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
            'success'
        );

        checkValidation();
    });

    // Try to get user's current location and center map (without requesting permission)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                map.setView([userLat, userLng], 15);
            },
            () => {
                // Silently fail - map will stay at default location
            },
            { maximumAge: 60000, timeout: 5000 } // Use cached location if available
        );
    }
}

function showMapStatus(text, type) {
    mapStatus.textContent = text;
    mapStatus.className = `location-status ${type}`;
}

// Location handling
async function getCurrentLocation() {
    if (!navigator.geolocation) {
        showLocationStatus('La geolocalización no está disponible en este navegador', 'error');
        return;
    }

    getLocationBtn.disabled = true;
    getLocationBtn.textContent = '📍 Obteniendo ubicación...';

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        showLocationStatus(
            `✓ Ubicación obtenida: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
            'success'
        );

        checkValidation();
    } catch (error) {
        let errorMessage = 'Error al obtener la ubicación';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Permiso denegado. En iOS: Ajustes > Safari > Ubicación > Permitir. O usa el mapa.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Ubicación no disponible. Usa el mapa para seleccionar manualmente.';
                break;
            case error.TIMEOUT:
                errorMessage = 'Tiempo agotado. Intenta con el mapa.';
                break;
        }

        showLocationStatus(errorMessage, 'error');
        currentLocation = null;
        checkValidation();
    } finally {
        getLocationBtn.disabled = false;
        getLocationBtn.textContent = '📍 Obtener Ubicación Automática';
    }
}

function showLocationStatus(text, type) {
    locationStatus.textContent = text;
    locationStatus.className = `location-status ${type}`;
}

// Validation
function checkValidation() {
    const hasPhoto = selectedPhoto !== null;
    const hasDescription = description.value.trim().length > 0;
    const hasLocation = currentLocation !== null;

    submitBtn.disabled = !(hasPhoto && hasDescription && hasLocation);
}

// Submit
async function handleSubmit() {
    if (!selectedPhoto || !description.value.trim() || !currentLocation) {
        showMessage('Por favor completa todos los campos requeridos', 'error');
        return;
    }

    // Show loading
    submitBtn.disabled = true;
    loadingIndicator.style.display = 'block';
    message.style.display = 'none';

    try {
        const reportData = {
            description: description.value.trim(),
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            photo: selectedPhoto
        };

        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al enviar el reporte');
        }

        const result = await response.json();
        console.log('Report created:', result);

        showMessage('✓ Reporte enviado exitosamente', 'success');

        // Reset form
        resetForm();

        // Reload reports
        setTimeout(() => {
            loadReports();
        }, 1000);

    } catch (error) {
        console.error('Error submitting report:', error);
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        loadingIndicator.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function resetForm() {
    // Reset photo
    removePhoto();

    // Reset description
    description.value = '';

    // Reset location
    currentLocation = null;
    latitude.value = '';
    longitude.value = '';
    locationStatus.textContent = '';
    locationStatus.className = 'location-status';

    // Reset validation
    checkValidation();
}

// Load reports
async function loadReports() {
    reportsList.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Cargando reportes...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/reports`);

        if (!response.ok) {
            throw new Error('Error al cargar los reportes');
        }

        const reports = await response.json();

        if (reports.length === 0) {
            reportsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No hay reportes todavía</p>
                </div>
            `;
            return;
        }

        reportsList.innerHTML = reports.map(report => createReportCard(report)).join('');

    } catch (error) {
        console.error('Error loading reports:', error);
        reportsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Error al cargar los reportes</p>
                <p style="font-size: 0.85rem; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

function createReportCard(report) {
    const date = new Date(report.created_at);
    const formattedDate = date.toLocaleString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const mapsUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

    return `
        <div class="report-card">
            <img src="${report.photo_url}" alt="Foto del reporte" class="report-image" loading="lazy">
            <div class="report-content">
                <p class="report-description">${escapeHtml(report.description)}</p>
                <div class="report-meta">
                    <div class="report-location">
                        📍 <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
                            ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
                        </a>
                    </div>
                    <div class="report-date">
                        🕒 ${formattedDate}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Utilities
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle online/offline status
window.addEventListener('online', () => {
    showMessage('✓ Conexión restaurada', 'success');
    loadReports();
});

window.addEventListener('offline', () => {
    showMessage('⚠️ Sin conexión a internet', 'error');
});
