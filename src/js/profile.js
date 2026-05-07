/**
 * PROFILE PAGE FUNCTIONALITY
 * Handles user profile management
 */

let currentUser = null;
let userProfile = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile.js: DOMContentLoaded');
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        window.addEventListener('supabaseReady', () => {
            initProfile();
        }, { once: true });
        
        setTimeout(() => {
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                initProfile();
            } else {
                window.location.href = 'login.html';
            }
        }, 3000);
    } else {
        initProfile();
    }
});

async function initProfile() {
    console.log('Initializing profile...');
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        console.log('No user logged in, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    await loadUserProfile();
    await loadUserStats();
    initFormHandlers();
    initModalHandlers();
    initAvatarUpload();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

async function loadUserProfile() {
    try {
        const { data: profile, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading profile:', error);
        }
        
        userProfile = profile || {};
        
        const firstName = userProfile.first_name || currentUser.user_metadata?.first_name || '';
        const lastName = userProfile.last_name || currentUser.user_metadata?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'User';
        
        document.getElementById('profileName').textContent = fullName;
        document.getElementById('profileEmail').textContent = currentUser.email;
        
        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('email').value = currentUser.email;
        document.getElementById('phone').value = userProfile.phone || currentUser.user_metadata?.phone || '';
        
        document.getElementById('address').value = userProfile.address || '';
        document.getElementById('city').value = userProfile.city || '';
        document.getElementById('state').value = userProfile.state || '';
        document.getElementById('zipCode').value = userProfile.zip_code || '';
        document.getElementById('country').value = userProfile.country || '';
        
        if (userProfile.avatar_url) {
            const avatarEl = document.getElementById('profileAvatar');
            avatarEl.innerHTML = `<img src="${userProfile.avatar_url}" alt="Profile">`;
        }
        
        const memberSince = new Date(currentUser.created_at);
        const year = memberSince.getFullYear();
        document.getElementById('memberSince').textContent = year;
        
    } catch (error) {
        console.error('Error in loadUserProfile:', error);
    }
}

async function loadUserStats() {
    try {
        const { data: bookings, error } = await supabaseClient
            .from('bookings')
            .select('id, status')
            .eq('user_id', currentUser.id);
        
        if (error) {
            console.error('Error loading stats:', error);
            return;
        }
        
        const totalBookings = bookings?.length || 0;
        const completedSessions = bookings?.filter(b => b.status === 'completed').length || 0;
        
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('completedSessions').textContent = completedSessions;
        
    } catch (error) {
        console.error('Error in loadUserStats:', error);
    }
}

function initFormHandlers() {
    const editPersonalBtn = document.getElementById('editPersonalBtn');
    const cancelPersonalBtn = document.getElementById('cancelPersonalBtn');
    const personalInfoForm = document.getElementById('personalInfoForm');
    const personalFormActions = document.getElementById('personalFormActions');
    
    const editAddressBtn = document.getElementById('editAddressBtn');
    const cancelAddressBtn = document.getElementById('cancelAddressBtn');
    const addressForm = document.getElementById('addressForm');
    const addressFormActions = document.getElementById('addressFormActions');
    
    editPersonalBtn.addEventListener('click', () => {
        toggleFormEdit(personalInfoForm, personalFormActions, true, ['email']);
        editPersonalBtn.style.display = 'none';
    });
    
    cancelPersonalBtn.addEventListener('click', () => {
        toggleFormEdit(personalInfoForm, personalFormActions, false);
        editPersonalBtn.style.display = 'flex';
        loadUserProfile();
    });
    
    personalInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePersonalInfo();
    });
    
    editAddressBtn.addEventListener('click', () => {
        toggleFormEdit(addressForm, addressFormActions, true);
        editAddressBtn.style.display = 'none';
    });
    
    cancelAddressBtn.addEventListener('click', () => {
        toggleFormEdit(addressForm, addressFormActions, false);
        editAddressBtn.style.display = 'flex';
        loadUserProfile();
    });
    
    addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAddressInfo();
    });
}

function toggleFormEdit(form, actionsEl, enable, excludeFields = []) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (!excludeFields.includes(input.id)) {
            input.disabled = !enable;
        }
    });
    actionsEl.style.display = enable ? 'flex' : 'none';
}

async function savePersonalInfo() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    try {
        const { error } = await supabaseClient
            .from('user_profiles')
            .upsert({
                id: currentUser.id,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        
        if (error) throw error;
        
        await supabaseClient.auth.updateUser({
            data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone
            }
        });
        
        showToast('Personal information saved successfully!');
        
        toggleFormEdit(
            document.getElementById('personalInfoForm'),
            document.getElementById('personalFormActions'),
            false
        );
        document.getElementById('editPersonalBtn').style.display = 'flex';
        
        document.getElementById('profileName').textContent = `${firstName} ${lastName}`.trim() || 'User';
        
    } catch (error) {
        console.error('Error saving personal info:', error);
        showToast('Failed to save changes. Please try again.', true);
    }
}

async function saveAddressInfo() {
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value.trim();
    
    try {
        const { error } = await supabaseClient
            .from('user_profiles')
            .upsert({
                id: currentUser.id,
                address: address,
                city: city,
                state: state,
                zip_code: zipCode,
                country: country,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        
        if (error) throw error;
        
        showToast('Address saved successfully!');
        
        toggleFormEdit(
            document.getElementById('addressForm'),
            document.getElementById('addressFormActions'),
            false
        );
        document.getElementById('editAddressBtn').style.display = 'flex';
        
    } catch (error) {
        console.error('Error saving address:', error);
        showToast('Failed to save changes. Please try again.', true);
    }
}

function initModalHandlers() {
    const passwordModal = document.getElementById('passwordModal');
    const deleteModal = document.getElementById('deleteModal');
    
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        passwordModal.style.display = 'flex';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
    
    document.getElementById('closePasswordModal').addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });
    
    document.getElementById('cancelPasswordBtn').addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });
    
    passwordModal.querySelector('.modal-overlay').addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });
    
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });
    
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });
    
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        deleteModal.style.display = 'flex';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
    
    document.getElementById('closeDeleteModal').addEventListener('click', () => {
        deleteModal.style.display = 'none';
        document.getElementById('deleteConfirm').value = '';
        document.getElementById('confirmDeleteBtn').disabled = true;
    });
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        deleteModal.style.display = 'none';
        document.getElementById('deleteConfirm').value = '';
        document.getElementById('confirmDeleteBtn').disabled = true;
    });
    
    deleteModal.querySelector('.modal-overlay').addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });
    
    document.getElementById('deleteConfirm').addEventListener('input', (e) => {
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.disabled = e.target.value !== 'DELETE';
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        await deleteAccount();
    });
}

async function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', true);
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters', true);
        return;
    }
    
    try {
        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        
        showToast('Password updated successfully!');
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('passwordForm').reset();
        
    } catch (error) {
        console.error('Error changing password:', error);
        showToast(error.message || 'Failed to update password', true);
    }
}

async function deleteAccount() {
    try {
        showToast('Deleting account...', false);
        
        await supabaseClient
            .from('user_profiles')
            .delete()
            .eq('id', currentUser.id);
        
        await supabaseClient.auth.signOut();
        
        showToast('Account deleted. Redirecting...', false);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showToast('Failed to delete account. Please contact support.', true);
    }
}

function initAvatarUpload() {
    const avatarEditBtn = document.getElementById('avatarEditBtn');
    const avatarInput = document.getElementById('avatarInput');
    
    avatarEditBtn.addEventListener('click', () => {
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', true);
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be less than 5MB', true);
            return;
        }
        
        try {
            showToast('Uploading avatar...', false);
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}/avatar.${fileExt}`;
            
            const { error: uploadError } = await supabaseClient.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
            
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabaseClient.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            const avatarUrl = urlData.publicUrl + '?t=' + Date.now();
            
            const { error: updateError } = await supabaseClient
                .from('user_profiles')
                .upsert({
                    id: currentUser.id,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
            
            if (updateError) throw updateError;
            
            const avatarEl = document.getElementById('profileAvatar');
            avatarEl.innerHTML = `<img src="${avatarUrl}" alt="Profile">`;
            
            showToast('Avatar updated successfully!');
            
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast('Failed to upload avatar. Please try again.', true);
        }
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    
    if (isError) {
        toast.classList.add('error');
        toastIcon.setAttribute('data-lucide', 'alert-circle');
    } else {
        toast.classList.remove('error');
        toastIcon.setAttribute('data-lucide', 'check-circle');
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
