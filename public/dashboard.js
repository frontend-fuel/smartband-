document.addEventListener('DOMContentLoaded', function() {
    // Initialize real-time data updates
    initializeRealTimeUpdates();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize logout functionality
    initializeLogout();
});

// GPS Map Configuration
function initializeGPSMap(latitude, longitude) {
    const mapContainer = document.getElementById('gpsMap');
    
    console.log('Initializing GPS map with:', latitude, longitude);
    
    // Clear placeholder content
    mapContainer.innerHTML = '';
    
    // Validate coordinates
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid GPS coordinates:', latitude, longitude);
        mapContainer.innerHTML = `
            <div style="width: 100%; height: 400px; border-radius: 8px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #6c757d;">
                <div style="text-align: center;">
                    <i class="fa-solid fa-map-location-dot" style="font-size: 48px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>Waiting for valid GPS coordinates...</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Create Google Maps embed (more reliable than OpenStreetMap)
    mapContainer.innerHTML = `
        <div style="position: relative; width: 100%; height: 400px; border-radius: 8px; overflow: hidden;">
            <iframe 
                width="100%" 
                height="400" 
                frameborder="0" 
                scrolling="no" 
                marginheight="0" 
                marginwidth="0" 
                src="https://maps.google.com/maps?q=${longitude},${latitude}&t=&z=15&ie=UTF8&iwloc=&output=embed"
                style="border-radius: 8px;">
            </iframe>
            <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                📍 ${longitude.toFixed(4)}°N, ${latitude.toFixed(4)}°E
            </div>
        </div>
    `;
}

// Real-time data updates
function initializeRealTimeUpdates() {
    // Load ThingSpeak data initially
    loadThingSpeakData();
    
    // Update ThingSpeak data every 30 seconds
    setInterval(loadThingSpeakData, 30000);
}


// Load real data from ThingSpeak
async function loadThingSpeakData() {
    try {
        console.log('Loading ThingSpeak data...');
        
        // Use hardcoded values for now since user provided them
        const channelId = '3035518';
        const readApiKey = '44R0NH1BCLTCZUC3';
        const writeApiKey = '44R0NH1BCLTCZUC3';

        console.log(`Fetching from channel: ${channelId}`);

        // Fetch latest data from ThingSpeak
        const dataResponse = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=1`);
        
        console.log('ThingSpeak response status:', dataResponse.status);
        
        if (dataResponse.ok) {
            const data = await dataResponse.json();
            console.log('ThingSpeak data received:', data);
            
            if (data.feeds && data.feeds.length > 0) {
                const latestEntry = data.feeds[0];
                console.log('Latest entry:', latestEntry);
                updateDashboardData(latestEntry);
            } else {
                console.log('No feeds data available');
            }
        } else {
            console.error('Failed to fetch ThingSpeak data:', dataResponse.status);
        }
    } catch (error) {
        console.error('Error loading ThingSpeak data:', error);
    }
}

// Update dashboard with real ThingSpeak data
function updateDashboardData(data) {
    console.log('Updating dashboard with data:', data);
    
    // GPS Location (Field 1: longitude, Field 2: latitude)
    if (data.field1 && data.field2) {
        const coordElements = document.querySelectorAll('.coordinates');
        if (coordElements.length >= 2) {
            const longitude = parseFloat(data.field1);
            const latitude = parseFloat(data.field2);
            
            coordElements[0].textContent = longitude.toFixed(4) + '°'; // Latitude
            coordElements[1].textContent = latitude.toFixed(4) + '° E'; // Longitude
            console.log('Updated GPS:', longitude, latitude);
            
            // Update GPS map with real coordinates
            initializeGPSMap(latitude, longitude);
        }
    }

    // Body Temperature (Field 5: temp)
    if (data.field5) {
        const tempElement = document.querySelector('.body-temp');
        if (tempElement) {
            tempElement.textContent = parseFloat(data.field5).toFixed(1);
            console.log('Updated temperature:', data.field5);
        }
    }

    // Pulse Rate (Field 4: pulse)
    if (data.field4) {
        const pulseElement = document.querySelector('.pulse-rate');
        if (pulseElement) {
            pulseElement.textContent = Math.round(parseFloat(data.field4));
            console.log('Updated pulse:', data.field4);
        }
    }

    // Air Quality (Field 6: air-quality)
    if (data.field6) {
        const airElement = document.querySelector('.air-status');
        if (airElement) {
            const airValue = parseFloat(data.field6);
            let status, color;
            
            if (airValue <= 50) {
                status = 'Excellent';
                color = '#2ecc71';
            } else if (airValue <= 100) {
                status = 'Good';
                color = '#27ae60';
            } else if (airValue <= 150) {
                status = 'Moderate';
                color = '#f39c12';
            } else {
                status = 'Poor';
                color = '#e74c3c';
            }
            
            airElement.textContent = status;
            airElement.style.color = color;
            console.log('Updated air quality:', airValue, status);
        }
    }
    
    // Show data load indicator
    const indicator = document.createElement('div');
    indicator.textContent = 'Data updated from ThingSpeak';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
    `;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
}


// (Removed) Find My Band button code and ThingSpeak write calls

// Enhanced notification system
function showAdvancedNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    
    const colors = {
        success: { bg: '#27ae60', border: '#2ecc71' },
        error: { bg: '#e74c3c', border: '#c0392b' },
        info: { bg: '#3498db', border: '#2980b9' },
        warning: { bg: '#f39c12', border: '#e67e22' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="font-size: 20px; line-height: 1;">${getNotificationIcon(type)}</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">${title}</div>
                <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">${message}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none; 
                border: none; 
                color: white; 
                font-size: 18px; 
                cursor: pointer; 
                opacity: 0.7;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
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
        border-radius: 12px;
        border-left: 4px solid ${color.border};
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        max-width: 350px;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
        transform: translateX(0);
    `;
    
    // Add CSS animation
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 6 seconds with slide-out animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 6000);
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

// Keep original function for backward compatibility
function showNotification(message, type = 'info') {
    showAdvancedNotification('Notification', message, type);
}

// Navigation functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Only prevent default for items without href or with href="#"
            if (!this.href || this.href.endsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // You can add page switching logic here
                const navText = this.querySelector('.nav-text').textContent;
                console.log(`Navigating to: ${navText}`);
            }
            // For items with actual href (like thingspeak.html), allow normal navigation
        });
    });
}

// Utility function to add CSS transitions
function addTransitions() {
    const style = document.createElement('style');
    style.textContent = `
        .pulse-rate {
            transition: transform 0.2s ease;
        }
        
        .coordinates {
            transition: all 0.3s ease;
        }
        
        .body-temp {
            transition: transform 0.2s ease;
        }
        
        .air-status {
            transition: color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Logout functionality
function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', function() {
        // Clear stored token
        localStorage.removeItem('token');
        
        // Redirect to login page
        window.location.href = 'index.html';
    });
}

// Initialize transitions when DOM is loaded
document.addEventListener('DOMContentLoaded', addTransitions);
