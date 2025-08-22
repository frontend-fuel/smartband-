document.addEventListener('DOMContentLoaded', function() {
    // Initialize analytics page
    initializeCharts();
    initializeControls();
    initializeExportButtons();
    loadAnalyticsData();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize logout functionality
    initializeLogout();
});

// Chart instances
let heartRateChart, temperatureChart, airQualityChart, gpsChart;

// Initialize all charts
function initializeCharts() {
    initializeHeartRateChart();
    initializeTemperatureChart();
    initializeGPSChart();
    initializeAirQualityChart();
}

// Heart Rate Chart
function initializeHeartRateChart() {
    const ctx = document.getElementById('heartRateChart').getContext('2d');
    
    heartRateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Heart Rate (BPM)',
                data: generateHeartRateData(),
                borderColor: '#f73c50',
                backgroundColor: 'rgba(247, 60, 80, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 100,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

// Temperature Chart
function initializeTemperatureChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Temperature (°C)',
                data: generateTemperatureData(),
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 35,
                    max: 39,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

// GPS Chart
function initializeGPSChart() {
    const ctx = document.getElementById('gpsChart').getContext('2d');
    
    gpsChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'GPS Locations',
                data: generateGPSData(),
                backgroundColor: '#f73c50',
                borderColor: '#f73c50',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Longitude'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Latitude'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

// Air Quality Chart
function initializeAirQualityChart() {
    const ctx = document.getElementById('airQualityChart').getContext('2d');
    
    airQualityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Air Quality Index',
                data: generateAirQualityData(),
                borderColor: '#00d2d3',
                backgroundColor: 'rgba(0, 210, 211, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

// Generate time labels
function generateTimeLabels(hours) {
    const labels = [];
    const now = new Date();
    
    for (let i = hours - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
        labels.push(time.getHours().toString().padStart(2, '0') + ':00');
    }
    
    return labels;
}

// Generate sample heart rate data
function generateHeartRateData() {
    const data = [];
    const baseRate = 72;
    
    for (let i = 0; i < 24; i++) {
        const variation = Math.sin(i * 0.5) * 10 + Math.random() * 8 - 4;
        data.push(Math.round(baseRate + variation));
    }
    
    return data;
}

// Generate sample temperature data
function generateTemperatureData() {
    const data = [];
    const baseTemp = 36.8;
    
    for (let i = 0; i < 24; i++) {
        const variation = Math.sin(i * 0.3) * 0.5 + Math.random() * 0.4 - 0.2;
        data.push(Math.round((baseTemp + variation) * 10) / 10);
    }
    
    return data;
}

// Generate sample air quality data
function generateAirQualityData() {
    const data = [];
    
    for (let i = 0; i < 24; i++) {
        const baseQuality = 75 + Math.sin(i * 0.2) * 15;
        const variation = Math.random() * 10 - 5;
        data.push(Math.round(Math.max(0, Math.min(100, baseQuality + variation))));
    }
    
    return data;
}

// Generate sample GPS data
function generateGPSData() {
    const data = [];
    const baseLat = 17.3850;
    const baseLng = 78.4867;
    
    for (let i = 0; i < 20; i++) {
        const latVariation = (Math.random() - 0.5) * 0.01;
        const lngVariation = (Math.random() - 0.5) * 0.01;
        data.push({
            x: baseLng + lngVariation,
            y: baseLat + latVariation
        });
    }
    
    return data;
}

// Initialize controls
function initializeControls() {
    // Time range selector
    const timeRange = document.getElementById('timeRange');
    timeRange.addEventListener('change', function() {
        updateChartsForTimeRange(this.value);
    });
    
    // Chart type buttons
    const chartButtons = document.querySelectorAll('.chart-btn');
    chartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            const buttonType = this.textContent.toLowerCase();
            
            // Update active state
            this.parentNode.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update chart type
            updateChartType(chartType, buttonType);
        });
    });
}

// Update charts for time range
function updateChartsForTimeRange(range) {
    let hours;
    switch(range) {
        case '24h': hours = 24; break;
        case '7d': hours = 168; break;
        case '30d': hours = 720; break;
        default: hours = 24;
    }
    
    const labels = generateTimeLabels(hours);
    
    // Update all charts
    heartRateChart.data.labels = labels;
    heartRateChart.data.datasets[0].data = generateHeartRateData();
    heartRateChart.update();
    
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = generateTemperatureData();
    temperatureChart.update();
    
    gpsChart.data.datasets[0].data = generateGPSData();
    gpsChart.update();
    
    airQualityChart.data.labels = labels;
    airQualityChart.data.datasets[0].data = generateAirQualityData();
    airQualityChart.update();
}

// Update chart type
function updateChartType(chartName, type) {
    let chart;
    switch(chartName) {
        case 'heartRate': chart = heartRateChart; break;
        case 'temperature': chart = temperatureChart; break;
        case 'airQuality': chart = airQualityChart; break;
    }
    
    if (chart) {
        chart.config.type = type === 'area' ? 'line' : type;
        chart.data.datasets[0].fill = type === 'area';
        chart.update();
    }
}

// Load analytics data from ThingSpeak
async function loadAnalyticsData() {
    try {
        const channelId = '3035518';
        const readApiKey = '44R0NH1BCLTCZUC3';
        const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=100`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.feeds && data.feeds.length > 0) {
            updateChartsWithRealData(data.feeds);
        }
    } catch (error) {
        console.error('Error loading analytics data:', error);
        // Keep using sample data if API fails
    }
}

// Update summary cards with real data
function updateSummaryCards(feeds) {
    if (feeds.length === 0) return;
    
    // Calculate averages from recent data
    const recentFeeds = feeds.slice(-24); // Last 24 entries
    
    // Heart rate average (assuming field4 contains heart rate)
    const heartRates = recentFeeds.map(f => parseFloat(f.field4)).filter(v => !isNaN(v));
    if (heartRates.length > 0) {
        const avgHeartRate = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length);
        document.getElementById('avgHeartRate').textContent = avgHeartRate;
    }
    
    // Temperature average (assuming field5 contains temperature)
    const temperatures = recentFeeds.map(f => parseFloat(f.field5)).filter(v => !isNaN(v));
    if (temperatures.length > 0) {
        const avgTemp = Math.round((temperatures.reduce((a, b) => a + b, 0) / temperatures.length) * 10) / 10;
        document.getElementById('avgTemperature').textContent = avgTemp;
    }
    
    // Air quality (assuming field6 contains air quality)
    const airQualities = recentFeeds.map(f => parseFloat(f.field6)).filter(v => !isNaN(v));
    if (airQualities.length > 0) {
        const avgAirQuality = Math.round(airQualities.reduce((a, b) => a + b, 0) / airQualities.length);
        const qualityText = avgAirQuality > 80 ? 'Good' : avgAirQuality > 60 ? 'Moderate' : 'Poor';
        document.getElementById('avgAirQuality').textContent = qualityText;
    }
}

// Update charts with real data
function updateChartsWithRealData(feeds) {
    const labels = feeds.slice(-24).map(feed => {
        const date = new Date(feed.created_at);
        return date.getHours().toString().padStart(2, '0') + ':' + 
               date.getMinutes().toString().padStart(2, '0');
    });
    
    // Update heart rate chart (Field 4)
    const heartRateData = feeds.slice(-24).map(f => parseFloat(f.field4) || 72);
    heartRateChart.data.labels = labels;
    heartRateChart.data.datasets[0].data = heartRateData;
    heartRateChart.update();
    
    // Update temperature chart (Field 5)
    const temperatureData = feeds.slice(-24).map(f => parseFloat(f.field5) || 36.8);
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = temperatureData;
    temperatureChart.update();
    
    // Update GPS chart (Fields 1 & 2)
    const gpsData = feeds.slice(-20).map(f => ({
        x: parseFloat(f.field2) || 78.4867, // Longitude
        y: parseFloat(f.field1) || 17.3850  // Latitude
    })).filter(point => point.x !== 0 && point.y !== 0);
    
    gpsChart.data.datasets[0].data = gpsData;
    gpsChart.update();
    
    // Update air quality chart (Field 6)
    const airQualityData = feeds.slice(-24).map(f => parseFloat(f.field6) || 75);
    airQualityChart.data.labels = labels;
    airQualityChart.data.datasets[0].data = airQualityData;
    airQualityChart.update();
}

// Initialize export buttons
function initializeExportButtons() {
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
    document.getElementById('exportJSON').addEventListener('click', exportToJSON);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
}

// Export functions
function exportToCSV() {
    const data = [
        ['Timestamp', 'Heart Rate', 'Temperature', 'Air Quality'],
        ...generateExportData()
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    downloadFile(csvContent, 'smartband_analytics.csv', 'text/csv');
}

function exportToJSON() {
    const data = {
        exported_at: new Date().toISOString(),
        data: generateExportData().map(row => ({
            timestamp: row[0],
            heart_rate: row[1],
            temperature: row[2],
            air_quality: row[3]
        }))
    };
    
    downloadFile(JSON.stringify(data, null, 2), 'smartband_analytics.json', 'application/json');
}

function exportToPDF() {
    showNotification('PDF export feature coming soon!', 'info');
}

// Generate export data
function generateExportData() {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
        data.push([
            timestamp.toISOString(),
            Math.round(72 + Math.sin(i * 0.5) * 10 + Math.random() * 8 - 4),
            Math.round((36.8 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.4 - 0.2) * 10) / 10,
            Math.round(75 + Math.sin(i * 0.2) * 15 + Math.random() * 10 - 5)
        ]);
    }
    
    return data;
}

// Download file helper
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification(`${filename} downloaded successfully!`, 'success');
}

// Navigation functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.href || this.href.endsWith('#')) {
                e.preventDefault();
                
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                const navText = this.querySelector('.nav-text').textContent;
                console.log(`Navigating to: ${navText}`);
            }
        });
    });
}

// Logout functionality
function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    
    const colors = {
        success: { bg: '#27ae60', border: '#2ecc71' },
        error: { bg: '#e74c3c', border: '#c0392b' },
        info: { bg: '#3498db', border: '#2980b9' },
        warning: { bg: '#f39c12', border: '#e67e22' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 16px;">${getNotificationIcon(type)}</div>
            <div style="flex: 1; font-size: 14px;">${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none; 
                border: none; 
                color: white; 
                font-size: 18px; 
                cursor: pointer; 
                opacity: 0.7;
            ">×</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: white;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid ${color.border};
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    return icons[type] || icons.info;
}
