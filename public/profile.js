document.addEventListener('DOMContentLoaded', function() {
    // Load user data first
    loadUserData();
    
    // Initialize profile functionality
    initializeLogout();
    initializeFormHandling();
});

// Load user data from API or localStorage
async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        // Try to fetch user data from API
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('User data received from API:', userData);
            populateProfileData(userData);
        } else {
            console.log('API response not OK:', response.status, response.statusText);
            // Fallback to localStorage if API fails
            const storedData = localStorage.getItem('userData');
            if (storedData) {
                const userData = JSON.parse(storedData);
                populateProfileData(userData);
            } else {
                // Use default data if nothing is available
                console.log('No user data found, using defaults');
                // Set loading state to show no data
                const profileName = document.querySelector('.profile-name');
                const profileEmail = document.querySelector('.profile-email');
                if (profileName) profileName.textContent = 'No data available';
                if (profileEmail) profileEmail.textContent = 'Please check server connection';
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Try localStorage as fallback
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            const userData = JSON.parse(storedData);
            populateProfileData(userData);
        } else {
            // Show error state
            const profileName = document.querySelector('.profile-name');
            const profileEmail = document.querySelector('.profile-email');
            if (profileName) profileName.textContent = 'Server connection failed';
            if (profileEmail) profileEmail.textContent = 'Please start the server';
        }
    }
}

// Populate form fields with real user data
function populateProfileData(userData) {
    console.log('Populating profile data:', userData);
    
    // Update profile header
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    
    if (profileName) {
        profileName.textContent = userData.fullName || 'Name not available';
    }
    if (profileEmail) {
        profileEmail.textContent = userData.email || 'Email not available';
    }

    // Populate form fields
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    
    if (fullNameInput) {
        fullNameInput.value = userData.fullName || '';
    }
    if (emailInput) {
        emailInput.value = userData.email || '';
    }

    // Profile photo is now constant logo.png - no dynamic updates needed
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

// Form handling
function initializeFormHandling() {
    const saveBtn = document.querySelector('.save-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    const formInputs = document.querySelectorAll('.form-input');
    
    // Store original values
    const originalValues = {};
    formInputs.forEach(input => {
        originalValues[input.name || input.id || input.type] = input.value;
    });
    
    // Save changes
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            this.disabled = true;
            
            try {
                const token = localStorage.getItem('token');
                const fullName = document.getElementById('fullName').value;
                const email = document.getElementById('email').value;
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                // Validate password change if provided
                if (newPassword || confirmPassword || currentPassword) {
                    if (!currentPassword) {
                        showToast('Current password is required to change password');
                        this.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                        this.disabled = false;
                        return;
                    }
                    if (newPassword !== confirmPassword) {
                        showToast('New passwords do not match');
                        this.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                        this.disabled = false;
                        return;
                    }
                    if (newPassword.length < 6) {
                        showToast('New password must be at least 6 characters');
                        this.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                        this.disabled = false;
                        return;
                    }
                }

                // Update profile data
                const profileResponse = await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fullName, email })
                });

                if (!profileResponse.ok) {
                    throw new Error('Failed to update profile');
                }

                // Update password if provided
                if (newPassword) {
                    const passwordResponse = await fetch('/api/user/password', {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ currentPassword, newPassword })
                    });

                    if (!passwordResponse.ok) {
                        const errorData = await passwordResponse.json();
                        throw new Error(errorData.message || 'Failed to update password');
                    }

                    // Clear password fields
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                }

                this.innerHTML = '<i class="fas fa-check"></i> Saved!';
                showToast('Profile updated successfully!');
                
                // Reload user data
                setTimeout(() => {
                    loadUserData();
                }, 1000);

            } catch (error) {
                console.error('Error saving profile:', error);
                showToast(error.message || 'Error updating profile');
            }
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                this.disabled = false;
            }, 2000);
        });
    }
    
    // Cancel changes
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // Reload original data
            loadUserData();
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        });
    }
}

// Toggle switches functionality (removed - not needed for simplified profile)

// Photo upload functionality
function initializePhotoUpload() {
    const changePhotoBtn = document.querySelector('.change-photo-btn');
    
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', function() {
            // Create hidden file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async function(e) {
                        const avatarCircle = document.querySelector('.avatar-circle');
                        avatarCircle.innerHTML = `<img src="${e.target.result}" alt="Profile Photo" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                        
                        // Save profile photo to database
                        try {
                            const token = localStorage.getItem('token');
                            await fetch('/api/user/profile', {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ profilePhoto: e.target.result })
                            });
                            showToast('Profile photo updated!');
                        } catch (error) {
                            console.error('Error updating profile photo:', error);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f73c50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Form validation
function validateForm() {
    const requiredFields = document.querySelectorAll('.form-input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#dee2e6';
        }
    });
    
    return isValid;
}

// Auto-save functionality (optional)
function initializeAutoSave() {
    const formInputs = document.querySelectorAll('.form-input:not([readonly])');
    
    formInputs.forEach(input => {
        input.addEventListener('input', debounce(function() {
            // Auto-save logic here
            console.log('Auto-saving...', input.name, input.value);
        }, 2000));
    });
}

// Collect form data into object
function collectFormData() {
    const formData = {
        settings: {}
    };
    
    // Collect input field data
    document.querySelectorAll('.form-input').forEach(input => {
        const label = input.previousElementSibling?.textContent?.toLowerCase();
        
        if (label?.includes('name')) {
            formData.fullName = input.value;
        } else if (label?.includes('email')) {
            formData.email = input.value;
        } else if (label?.includes('phone')) {
            formData.phone = input.value;
        } else if (label?.includes('birth')) {
            formData.dateOfBirth = input.value;
        } else if (label?.includes('height')) {
            formData.height = input.value;
        } else if (label?.includes('weight')) {
            formData.weight = input.value;
        } else if (label?.includes('blood')) {
            formData.bloodType = input.value;
        } else if (label?.includes('emergency')) {
            formData.emergencyContact = input.value;
        } else if (label?.includes('device')) {
            formData.deviceId = input.value;
        }
    });
    
    // Collect toggle switch data
    formData.settings.heartRateAlerts = document.getElementById('heartRateAlerts')?.checked || false;
    formData.settings.gpsTracking = document.getElementById('gpsTracking')?.checked || false;
    formData.settings.sosAutoAlert = document.getElementById('sosAutoAlert')?.checked || false;
    
    return formData;
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
