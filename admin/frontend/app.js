// Configuration
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8081/api'
    : `${window.location.protocol}//${window.location.hostname}/admin-api`;

// State
let map = null;
let heatmapLayer = null;
let markersLayer = null;
let zonesCircles = null;
let currentMode = 'heatmap';

// Pagination state
let currentZonePage = 1;
let currentReportPage = 1;
const ZONES_PER_PAGE = 4;
const REPORTS_PER_PAGE = 4;
let allZones = [];
let allReports = [];

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
    zonesCircles = L.layerGroup().addTo(map);
}

async function loadData() {
    try {
        // Load stats
        const statsResponse = await fetch(`${API_URL}/stats`);
        const stats = await statsResponse.json();
        updateStats(stats);

        // Load all reports first for individual markers mode
        const reportsResponse = await fetch(`${API_URL}/reports`);
        const reports = await reportsResponse.json();
        updateReports(reports);

        // Store reports for markers mode
        window.allReportsForMarkers = reports;

        // Create individual markers layer
        createIndividualMarkers();

        // Use top_zones from stats for the map (zones, not individual markers)
        if (stats.top_zones && stats.top_zones.length > 0) {
            const zonesData = stats.top_zones.map(zone => ({
                lat: zone.latitude,
                lng: zone.longitude,
                intensity: zone.count
            }));
            updateHeatmap(zonesData);
        }

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

    // Store all zones and display first page
    allZones = stats.top_zones || [];
    displayZonesPage(1);
}

function displayZonesPage(page) {
    currentZonePage = page;
    const topZonesContainer = document.getElementById('topZones');

    if (allZones.length === 0) {
        topZonesContainer.innerHTML = '<p class="empty">No hay suficientes datos para mostrar zonas críticas</p>';
        return;
    }

    const start = (page - 1) * ZONES_PER_PAGE;
    const end = start + ZONES_PER_PAGE;
    const zonesPage = allZones.slice(start, end);

    topZonesContainer.innerHTML = zonesPage.map((zone, index) => `
        <div class="zone-card">
            <div class="zone-rank">#${start + index + 1}</div>
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

    // Update pagination
    updateZonesPagination();
}

function updateZonesPagination() {
    const paginationContainer = document.getElementById('zonesPagination');
    const totalPages = Math.ceil(allZones.length / ZONES_PER_PAGE);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    if (currentZonePage > 1) {
        paginationHTML += `<button class="page-btn" onclick="displayZonesPage(${currentZonePage - 1})">← Anterior</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentZonePage ? 'active' : '';
        paginationHTML += `<button class="page-btn ${activeClass}" onclick="displayZonesPage(${i})">${i}</button>`;
    }

    // Next button
    if (currentZonePage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="displayZonesPage(${currentZonePage + 1})">Siguiente →</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
}

// Create individual markers for all reports
function createIndividualMarkers() {
    if (!window.allReportsForMarkers) {
        return;
    }

    markersLayer.clearLayers();
    window.allReportsForMarkers.forEach(report => {
        const marker = L.marker([report.latitude, report.longitude]);
        marker.bindPopup(`
            <div style="max-width: 200px;">
                <strong>Reporte Individual</strong><br>
                <p style="margin: 5px 0;">${escapeHtml(report.description)}</p>
                <img src="${report.photo_url}" style="width: 100%; border-radius: 4px; margin: 5px 0;" onerror="this.style.display='none'"><br>
                <small>${new Date(report.created_at).toLocaleDateString('es-BO')}</small>
            </div>
        `);
        markersLayer.addLayer(marker);
    });
}

function updateHeatmap(data) {
    // Remove old layers
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
    }

    // Clear markers and circles
    markersLayer.clearLayers();
    zonesCircles.clearLayers();

    if (!data || data.length === 0) {
        return;
    }

    // Get max intensity for color scaling
    const maxIntensity = Math.max(...data.map(p => p.intensity));

    // Prepare heatmap data and create circles
    const heatData = data.map(point => {
        // Create a circle for each cluster/zone
        const intensity = point.intensity;
        const radius = Math.min(150 + (intensity * 30), 400); // 150-400 meters (más pequeños)

        // Color based on intensity - más vibrantes y distintivos
        let color, fillOpacity;
        const normalized = intensity / maxIntensity;
        if (normalized >= 0.7) {
            color = '#DC2626'; // Rojo más oscuro
            fillOpacity = 0.25;
        } else if (normalized >= 0.5) {
            color = '#EA580C'; // Naranja más fuerte
            fillOpacity = 0.2;
        } else if (normalized >= 0.3) {
            color = '#F59E0B'; // Amarillo-naranja
            fillOpacity = 0.18;
        } else {
            color = '#10B981'; // Verde
            fillOpacity = 0.15;
        }

        const circle = L.circle([point.lat, point.lng], {
            color: color,
            fillColor: color,
            fillOpacity: fillOpacity,
            radius: radius,
            weight: 3,
            opacity: 0.8
        });

        circle.bindPopup(`
            <div style="text-align: center;">
                <strong style="font-size: 16px; color: ${color};">🔥 Zona Crítica</strong><br>
                <strong style="font-size: 18px;">${intensity}</strong> reportes<br>
                <small>${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</small>
            </div>
        `);

        zonesCircles.addLayer(circle);

        // Agregar marcador con número en el centro
        const divIcon = L.divIcon({
            html: `<div style="
                background: ${color};
                color: white;
                border: 2px solid white;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">${intensity}</div>`,
            className: 'zone-marker',
            iconSize: [35, 35]
        });

        const numberMarker = L.marker([point.lat, point.lng], { icon: divIcon });
        numberMarker.bindPopup(`
            <div style="text-align: center;">
                <strong style="font-size: 16px; color: ${color};">🔥 Zona Crítica</strong><br>
                <strong style="font-size: 18px;">${intensity}</strong> reportes<br>
                <small>${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</small>
            </div>
        `);
        zonesCircles.addLayer(numberMarker);

        return [point.lat, point.lng, intensity];
    });

    // Create heatmap layer (for backward compatibility)
    heatmapLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 35,
        maxZoom: 17,
        max: maxIntensity,
        gradient: {
            0.0: 'blue',
            0.3: 'cyan',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
        }
    });

    // Show current mode - default to zones/circles in heatmap mode
    if (currentMode === 'heatmap') {
        map.addLayer(zonesCircles); // Show circles instead of heatmap
        map.removeLayer(markersLayer);
        if (heatmapLayer) map.removeLayer(heatmapLayer);
    } else {
        map.removeLayer(zonesCircles);
        if (heatmapLayer) map.removeLayer(heatmapLayer);
        map.addLayer(markersLayer);
    }
}

function updateReports(reports) {
    // Store all reports and display first page
    allReports = reports || [];
    displayReportsPage(1);
}

function displayReportsPage(page) {
    currentReportPage = page;
    const container = document.getElementById('recentReports');

    if (allReports.length === 0) {
        container.innerHTML = '<p class="empty">No hay reportes</p>';
        return;
    }

    const start = (page - 1) * REPORTS_PER_PAGE;
    const end = start + REPORTS_PER_PAGE;
    const reportsPage = allReports.slice(start, end);

    container.innerHTML = reportsPage.map(report => {
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

    // Update pagination
    updateReportsPagination();
}

function updateReportsPagination() {
    const paginationContainer = document.getElementById('reportsPagination');
    const totalPages = Math.ceil(allReports.length / REPORTS_PER_PAGE);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    if (currentReportPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="displayReportsPage(${currentReportPage - 1})">← Anterior</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentReportPage ? 'active' : '';
        paginationHTML += `<button class="page-btn ${activeClass}" onclick="displayReportsPage(${i})">${i}</button>`;
    }

    // Next button
    if (currentReportPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="displayReportsPage(${currentReportPage + 1})">Siguiente →</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
}

function switchMode(mode) {
    currentMode = mode;

    // Update buttons
    document.getElementById('heatmapBtn').classList.toggle('active', mode === 'heatmap');
    document.getElementById('markersBtn').classList.toggle('active', mode === 'markers');

    // Switch layers
    if (mode === 'heatmap') {
        // Show zones/circles
        map.addLayer(zonesCircles);
        map.removeLayer(markersLayer);
        if (heatmapLayer) map.removeLayer(heatmapLayer);
    } else {
        // Show markers
        map.removeLayer(zonesCircles);
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
