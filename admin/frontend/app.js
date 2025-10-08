// Configuration
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8081/api'
    : `${window.location.protocol}//${window.location.hostname}/admin-api`;

// State
let map = null;
let heatmapLayer = null;
let markersLayer = null;
let currentMode = 'heatmap';
let authHeader = null;

// Get credentials from localStorage or prompt
function getAuthHeader() {
    if (authHeader) return authHeader;

    const stored = localStorage.getItem('adminAuth');
    if (stored) {
        authHeader = stored;
        return authHeader;
    }

    const username = prompt('Usuario admin:');
    const password = prompt('Contraseña:');

    if (!username || !password) {
        alert('Credenciales requeridas');
        window.location.reload();
        return null;
    }

    authHeader = 'Basic ' + btoa(username + ':' + password);
    localStorage.setItem('adminAuth', authHeader);
    return authHeader;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadData();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('heatmapBtn').addEventListener('click', () => switchMode('heatmap'));
    document.getElementById('markersBtn').addEventListener('click', () => switchMode('markers'));
    document.getElementById('refreshBtn').addEventListener('click', loadData);
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function logout() {
    localStorage.removeItem('adminAuth');
    authHeader = null;
    alert('Sesión cerrada');
    window.location.reload();
}

function initializeMap() {
    // Center on Cochabamba, Bolivia
    map = L.map('map').setView([-17.3895, -66.1568], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    // Initialize layers
    markersLayer = L.layerGroup().addTo(map);
}

async function loadData() {
    const auth = getAuthHeader();
    if (!auth) return;

    try {
        // Load stats
        const statsResponse = await fetch(`${API_URL}/stats`, {
            headers: { 'Authorization': auth }
        });

        if (statsResponse.status === 401) {
            localStorage.removeItem('adminAuth');
            alert('Credenciales inválidas');
            window.location.reload();
            return;
        }

        const stats = await statsResponse.json();
        updateStats(stats);

        // Load heatmap data
        const heatmapResponse = await fetch(`${API_URL}/heatmap`, {
            headers: { 'Authorization': auth }
        });
        const heatmapData = await heatmapResponse.json();
        updateHeatmap(heatmapData);

        // Load recent reports
        const reportsResponse = await fetch(`${API_URL}/reports`, {
            headers: { 'Authorization': auth }
        });
        const reports = await reportsResponse.json();
        updateReports(reports);

    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error al cargar los datos. Verifica la conexión.');
    }
}

function updateStats(stats) {
    document.getElementById('totalReports').textContent = stats.total_reports || 0;
    document.getElementById('todayReports').textContent = stats.today || 0;
    document.getElementById('weekReports').textContent = stats.this_week || 0;
    document.getElementById('monthReports').textContent = stats.this_month || 0;

    // Update top zones
    const topZonesContainer = document.getElementById('topZones');
    if (!stats.top_zones || stats.top_zones.length === 0) {
        topZonesContainer.innerHTML = '<p class="empty">No hay suficientes datos para mostrar zonas calientes</p>';
        return;
    }

    topZonesContainer.innerHTML = stats.top_zones.map((zone, index) => `
        <div class="zone-card">
            <div class="zone-rank">#${index + 1}</div>
            <div class="zone-info">
                <div class="zone-name">${zone.area}</div>
                <div class="zone-location">
                    📍 ${zone.latitude.toFixed(4)}, ${zone.longitude.toFixed(4)}
                </div>
                <div class="zone-count">
                    🔥 <strong>${zone.count}</strong> reportes
                </div>
            </div>
            <button class="btn-zoom" onclick="zoomToZone(${zone.latitude}, ${zone.longitude})">
                🔍 Ver
            </button>
        </div>
    `).join('');
}

function updateHeatmap(data) {
    // Remove old heatmap
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
    }

    // Clear markers
    markersLayer.clearLayers();

    if (!data || data.length === 0) {
        return;
    }

    // Prepare heatmap data
    const heatData = data.map(point => [
        point.lat,
        point.lng,
        point.intensity
    ]);

    // Create heatmap layer
    heatmapLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 35,
        maxZoom: 17,
        max: Math.max(...data.map(p => p.intensity)),
        gradient: {
            0.0: 'blue',
            0.3: 'cyan',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
        }
    });

    // Create markers
    data.forEach(point => {
        const marker = L.marker([point.lat, point.lng]);
        marker.bindPopup(`
            <strong>Reportes:</strong> ${point.intensity}<br>
            <strong>Ubicación:</strong> ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
        `);
        markersLayer.addLayer(marker);
    });

    // Show current mode
    if (currentMode === 'heatmap') {
        map.addLayer(heatmapLayer);
        map.removeLayer(markersLayer);
    } else {
        map.removeLayer(heatmapLayer);
        map.addLayer(markersLayer);
    }
}

function updateReports(reports) {
    const container = document.getElementById('recentReports');

    if (!reports || reports.length === 0) {
        container.innerHTML = '<p class="empty">No hay reportes</p>';
        return;
    }

    container.innerHTML = reports.slice(0, 20).map(report => {
        const date = new Date(report.created_at);
        const formattedDate = date.toLocaleString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="report-card-admin">
                <img src="${report.photo_url}" alt="Foto" class="report-thumb" loading="lazy">
                <div class="report-details">
                    <p class="report-desc">${escapeHtml(report.description)}</p>
                    <div class="report-meta-admin">
                        <span class="report-date">🕒 ${formattedDate}</span>
                        <button class="btn-locate" onclick="zoomToZone(${report.latitude}, ${report.longitude})">
                            📍 Ubicar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function switchMode(mode) {
    currentMode = mode;

    // Update buttons
    document.getElementById('heatmapBtn').classList.toggle('active', mode === 'heatmap');
    document.getElementById('markersBtn').classList.toggle('active', mode === 'markers');

    // Switch layers
    if (mode === 'heatmap') {
        if (heatmapLayer) map.addLayer(heatmapLayer);
        map.removeLayer(markersLayer);
    } else {
        if (heatmapLayer) map.removeLayer(heatmapLayer);
        map.addLayer(markersLayer);
    }
}

function zoomToZone(lat, lng) {
    map.setView([lat, lng], 16);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
