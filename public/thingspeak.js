document.addEventListener('DOMContentLoaded', function() {
    initializeThingSpeak();
    loadConfiguration();
    initializeEventListeners();
});

// Initialize ThingSpeak page
function initializeThingSpeak() {
    updateDataPreview();
    updateConnectionStatus();
}

// Load saved configuration from database
async function loadConfiguration() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            // Set default values if not logged in
            document.getElementById('channelId').value = '3035518';
            document.getElementById('readApiKey').value = '44R0NH1BCLTCZUC3';
            return;
        }

        const response = await fetch('/api/user/thingspeak', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const config = await response.json();
            document.getElementById('channelId').value = config.channelId || '3035518';
            document.getElementById('readApiKey').value = config.readApiKey || '44R0NH1BCLTCZUC3';
        } else {
            // Fallback to default values
            document.getElementById('channelId').value = '3035518';
            document.getElementById('readApiKey').value = '44R0NH1BCLTCZUC3';
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Set default values on error
        document.getElementById('channelId').value = '3035518';
        document.getElementById('readApiKey').value = '44R0NH1BCLTCZUC3';
    }
}

// Save configuration to database
async function saveConfiguration() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to save configuration', 'error');
            return;
        }

        const config = {
            channelId: document.getElementById('channelId').value,
            readApiKey: document.getElementById('readApiKey').value
        };

        const response = await fetch('/api/user/thingspeak', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            showNotification('Configuration saved to database successfully!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to save configuration', 'error');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
        showNotification('Error saving configuration', 'error');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Save configuration
    document.getElementById('saveConfigBtn').addEventListener('click', saveConfiguration);
    
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
}

// Test ThingSpeak connection
async function testConnection() {
    const config = JSON.parse(localStorage.getItem('thingspeakConfig') || '{}');
    
    if (!config.channelId || !config.readApiKey) {
        showNotification('Please configure Channel ID and Read API Key first', 'error');
        return;
    }
    
    try {
        showNotification('Testing connection...', 'info');
        
        // Test connection to ThingSpeak
        const response = await fetch(`https://api.thingspeak.com/channels/${config.channelId}/feeds.json?api_key=${config.readApiKey}&results=1`);
        
        if (response.ok) {
            updateConnectionStatus('connected');
            showNotification('Connection successful!', 'success');
        } else {
            updateConnectionStatus('disconnected');
            showNotification('Connection failed. Check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Connection test error:', error);
        updateConnectionStatus('disconnected');
        showNotification('Connection test failed', 'error');
    }
}

// Upload current data to ThingSpeak
async function uploadData() {
    const config = JSON.parse(localStorage.getItem('thingspeakConfig') || '{}');
    
    if (!config.channelId || !config.writeApiKey) {
        showNotification('Please configure Channel ID and Write API Key first', 'error');
        return;
    }
    
    try {
        // Get current sensor data (mock data for now)
        const sensorData = getCurrentSensorData();
        
        const uploadUrl = `https://api.thingspeak.com/update?api_key=${config.writeApiKey}&field1=${sensorData.heartRate}&field2=${sensorData.steps}&field3=${sensorData.temperature}`;
        
        showNotification('Uploading data...', 'info');
        
        const response = await fetch(uploadUrl, { method: 'POST' });
        
        if (response.ok) {
            updateDataStatus('uploaded');
            showNotification('Data uploaded successfully!', 'success');
            updateDataPreview();
        } else {
            showNotification('Upload failed. Check your Write API Key.', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed', 'error');
    }
}

// Toggle auto sync
function toggleAutoSync() {
    const btn = document.getElementById('autoSyncBtn');
    const isEnabled = btn.textContent.includes('Enable');
    
    if (isEnabled) {
        btn.textContent = 'Disable Auto Sync';
        btn.className = 'btn-primary';
        updateSyncStatus('enabled');
        showNotification('Auto sync enabled', 'success');
        
        // Start auto sync (every 5 minutes)
        window.autoSyncInterval = setInterval(uploadData, 5 * 60 * 1000);
    } else {
        btn.textContent = 'Enable Auto Sync';
        btn.className = 'btn-secondary';
        updateSyncStatus('manual');
        showNotification('Auto sync disabled', 'info');
        
        // Stop auto sync
        if (window.autoSyncInterval) {
            clearInterval(window.autoSyncInterval);
        }
    }
}

// Update connection status indicator
function updateConnectionStatus(status = 'unknown') {
    const indicator = document.getElementById('connectionStatus');
    
    indicator.className = `status-indicator ${status}`;
    
    switch (status) {
        case 'connected':
            indicator.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Connected</span>';
            break;
        case 'disconnected':
            indicator.innerHTML = '<i class="fa-solid fa-circle-xmark"></i><span>Disconnected</span>';
            break;
        default:
            indicator.innerHTML = '<i class="fa-solid fa-circle-question"></i><span>Not Connected</span>';
    }
}

// Update data status indicator
function updateDataStatus(status = 'none') {
    const indicator = document.getElementById('dataStatus');
    
    switch (status) {
        case 'uploaded':
            indicator.className = 'status-indicator connected';
            indicator.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Just Now</span>';
            break;
        default:
            indicator.className = 'status-indicator unknown';
            indicator.innerHTML = '<i class="fa-solid fa-circle-question"></i><span>No Data</span>';
    }
}

// Update sync status indicator
function updateSyncStatus(status = 'manual') {
    const indicator = document.getElementById('syncStatus');
    
    switch (status) {
        case 'enabled':
            indicator.className = 'status-indicator connected';
            indicator.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Auto</span>';
            break;
        default:
            indicator.className = 'status-indicator unknown';
            indicator.innerHTML = '<i class="fa-solid fa-circle-question"></i><span>Manual</span>';
    }
}

// Get current sensor data (mock data - replace with real sensor readings)
function getCurrentSensorData() {
    // In a real implementation, this would get data from the smartband
    return {
        heartRate: Math.floor(Math.random() * (100 - 60) + 60), // 60-100 BPM
        steps: Math.floor(Math.random() * 10000), // 0-10000 steps
        temperature: (Math.random() * (37.5 - 36.0) + 36.0).toFixed(1) // 36.0-37.5°C
    };
}

// Update data preview
function updateDataPreview() {
    const data = getCurrentSensorData();
    
    document.getElementById('previewHeartRate').textContent = `${data.heartRate} BPM`;
    document.getElementById('previewSteps').textContent = `${data.steps} steps`;
    document.getElementById('previewTemp').textContent = `${data.temperature} °C`;
    document.getElementById('previewTime').textContent = new Date().toLocaleTimeString();
}

// Update charts (placeholder function)
function updateCharts() {
    const timeRange = document.getElementById('chartTimeRange').value;
    console.log(`Updating charts for ${timeRange} hours`);
    
    // In a real implementation, this would fetch data from ThingSpeak and render charts
    showNotification(`Charts updated for last ${timeRange} hours`, 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#28a745';
            break;
        case 'error':
            notification.style.background = '#dc3545';
            break;
        case 'info':
            notification.style.background = '#17a2b8';
            break;
        default:
            notification.style.background = '#6c757d';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Update data preview every 30 seconds
setInterval(updateDataPreview, 30000);
