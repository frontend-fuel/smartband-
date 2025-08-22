document.addEventListener('DOMContentLoaded', function() {
    // Initialize SOS button functionality
    initializeSOS();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize logout functionality
    initializeLogout();
});

// SOS Button functionality
function initializeSOS() {
    const sosButton = document.querySelector('.sos-emergency-btn');
    if (!sosButton) return;
    
    let isActive = false;
    let countdown = null;
    
    sosButton.addEventListener('click', function() {
        if (isActive) return; // Prevent multiple clicks while active
        
        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Update button state
        isActive = true;
        updateSOSButtonState(sosButton, true);
        
        // Send SOS signal to ThingSpeak Field 3
        activateSOS(sosButton);
        
        console.log('SOS button clicked - Signal sent to band');
    });
    
    // Function to update button appearance and text
    function updateSOSButtonState(button, active, timeLeft = null) {
        if (active) {
            if (timeLeft !== null) {
                button.textContent = `SOS Active (${timeLeft}s)`;
                button.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            } else {
                button.textContent = 'Sending SOS...';
                button.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            }
            button.disabled = true;
        } else {
            button.textContent = 'Send SOS Alert';
            button.style.background = 'linear-gradient(135deg, #f73c50, #e02a3e)';
            button.disabled = false;
            isActive = false;
        }
    }
    
    // Expose update function for use in other functions
    window.updateSOSButton = updateSOSButtonState;
}

// Send SOS signal to ThingSpeak Field 3
async function activateSOS(buttonElement) {
    try {
        const channelId = '3035518';
        const writeApiKey = '44R0NH1BCLTCZUC3';
        
        // Validate API key first
        if (!writeApiKey || writeApiKey.length < 10) {
            throw new Error('Invalid API key');
        }
        
        // Send value 1 to field 3 - Simple GET request
        const url = `https://api.thingspeak.com/update?api_key=${writeApiKey}&field3=1`;
        console.log('Sending SOS request to:', url);
        
        const response = await fetch(url);
        console.log('ThingSpeak SOS response status:', response.status);
        
        if (response.ok) {
            const responseText = await response.text();
            console.log('SOS signal sent successfully. Response:', responseText);
            
            // Show enhanced success notification
            showAdvancedNotification('🚨 SOS Alert Sent!', 'Your emergency signal has been sent to your smartband. Auto-off in 16 seconds.', 'success');
            
            // Start countdown timer
            startSOSCountdownTimer(buttonElement);
            
        } else {
            const errorText = await response.text();
            console.error('Failed to send SOS signal. Status:', response.status, 'Response:', errorText);
            showAdvancedNotification('❌ SOS Failed', `Error ${response.status}: Could not send emergency alert`, 'error');
            
            // Reset button on error
            if (window.updateSOSButton) {
                window.updateSOSButton(buttonElement, false);
            }
        }
    } catch (error) {
        console.error('Error activating SOS:', error);
        showAdvancedNotification('⚠️ Connection Error', 'Could not connect to ThingSpeak. Check your internet connection.', 'error');
        
        // Reset button on error
        if (window.updateSOSButton) {
            window.updateSOSButton(buttonElement, false);
        }
    }
}

// Enhanced countdown timer with visual feedback for SOS
function startSOSCountdownTimer(buttonElement) {
    let timeLeft = 16;
    
    const countdownInterval = setInterval(() => {
        if (window.updateSOSButton) {
            window.updateSOSButton(buttonElement, true, timeLeft);
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdownInterval);
            deactivateSOS(buttonElement);
        }
    }, 1000);
}

// Turn off the SOS signal (send 0 to field 3)
async function deactivateSOS(buttonElement) {
    try {
        const channelId = '3035518';
        const writeApiKey = '44R0NH1BCLTCZUC3';
        
        // Send value 0 to field 3 to turn off
        const url = `https://api.thingspeak.com/update?api_key=${writeApiKey}&field3=0`;
        console.log('Deactivating SOS - Sending GET request to:', url);
        
        const response = await fetch(url);
        
        if (response.ok) {
            console.log('SOS signal turned off automatically');
            showAdvancedNotification('✅ SOS Auto-Deactivated', 'Emergency alert has been automatically turned off after 16 seconds.', 'info');
            
            // Reset button to original state
            if (window.updateSOSButton && buttonElement) {
                window.updateSOSButton(buttonElement, false);
            }
        } else {
            console.error('Failed to turn off SOS signal');
            showAdvancedNotification('⚠️ Auto-Off Failed', 'Could not automatically turn off emergency alert.', 'warning');
        }
    } catch (error) {
        console.error('Error deactivating SOS:', error);
        showAdvancedNotification('❌ Deactivation Error', 'Error occurred while turning off emergency alert.', 'error');
    }
}

// Enhanced notification system (copied from dashboard.js)
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
            // For items with actual href (like dashboard.html), allow normal navigation
        });
    });
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
