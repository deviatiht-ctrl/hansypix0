(() => {
    let allItems = [];
    let filteredItems = [];
    let selectedFile = null;
    let currentEditId = null;
    let currentDeleteId = null;

    function safeShowToast(message, type = 'info') {
        try {
            if (typeof showToast === 'function') {
                showToast(message, type);
                return;
            }
        } catch (_) {
            // ignore
        }

        if (type === 'error') console.error(message);
        else console.log(message);
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text == null ? '' : String(text);
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value == null ? '' : String(value);
    }

    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    function resolveMediaUrl(item, rawUrl) {
        if (!rawUrl) return '';

        if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
            return rawUrl;
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.storage && typeof STORAGE_BUCKETS !== 'undefined' && STORAGE_BUCKETS.PORTFOLIO) {
            const { data } = supabaseClient.storage.from(STORAGE_BUCKETS.PORTFOLIO).getPublicUrl(rawUrl);
            if (data && data.publicUrl) return data.publicUrl;
        }

        return rawUrl;
    }

    async function loadPortfolio() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized. Please refresh the page.', 'error');
            return;
        }

        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;

        try {
            const { data, error } = await supabaseClient
                .from('portfolio')
                .select('*')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;

            allItems = data || [];
            filteredItems = [...allItems];

            renderPortfolio();
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to load portfolio', 'error');
            const grid = document.getElementById('portfolioGrid');
            if (grid) {
                grid.innerHTML = '<p class="error-message">Failed to load portfolio items</p>';
            }
        }
    }

    function renderPortfolio() {
        const grid = document.getElementById('portfolioGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid) return;

        grid.innerHTML = '';

        if (filteredItems.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            grid.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'portfolio-manager-item';

            const mediaUrl = resolveMediaUrl(item, item.thumbnail_url || item.media_url);

            let mediaHtml = '';
            if (item.media_type === 'video') {
                mediaHtml = `<video src="${mediaUrl}" muted loop></video>`;
            } else {
                mediaHtml = `<img src="${mediaUrl}" alt="${item.title || ''}" loading="lazy">`;
            }

            card.innerHTML = `
                ${mediaHtml}
                <div class="portfolio-manager-overlay">
                    <div class="portfolio-manager-info">
                        <h4>${item.title || 'Untitled'}</h4>
                        <p>${item.category || ''}</p>
                        ${item.is_featured ? '<span class="badge badge-primary">Featured</span>' : ''}
                    </div>
                    <div class="portfolio-manager-actions">
                        <button class="icon-btn edit-item-btn" data-id="${item.id}" title="Edit">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="icon-btn delete-item-btn" data-id="${item.id}" title="Delete">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;

            const editBtn = card.querySelector('.edit-item-btn');
            const deleteBtn = card.querySelector('.delete-item-btn');

            if (editBtn) {
                editBtn.addEventListener('click', () => openEditModal(item));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => openDeleteModal(item.id));
            }

            grid.appendChild(card);
        });

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    function applyFilters() {
        const categoryFilter = getValue('categoryFilter') || 'all';
        const mediaTypeFilter = getValue('mediaTypeFilter') || 'all';
        const featuredFilter = getValue('featuredFilter') || 'all';
        const searchTerm = getValue('searchInput').toLowerCase().trim();

        filteredItems = allItems.filter(item => {
            if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
            if (mediaTypeFilter !== 'all' && item.media_type !== mediaTypeFilter) return false;
            if (featuredFilter !== 'all') {
                const isFeatured = Boolean(item.is_featured);
                if (featuredFilter === 'true' && !isFeatured) return false;
                if (featuredFilter === 'false' && isFeatured) return false;
            }

            if (searchTerm) {
                const title = (item.title || '').toLowerCase();
                const description = (item.description || '').toLowerCase();
                if (!title.includes(searchTerm) && !description.includes(searchTerm)) return false;
            }

            return true;
        });

        renderPortfolio();
    }

    function bindFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const mediaTypeFilter = document.getElementById('mediaTypeFilter');
        const featuredFilter = document.getElementById('featuredFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }

        if (mediaTypeFilter) {
            mediaTypeFilter.addEventListener('change', applyFilters);
        }

        if (featuredFilter) {
            featuredFilter.addEventListener('change', applyFilters);
        }

        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(applyFilters, 300);
            });
        }
    }

    function openUploadModal() {
        const modal = document.getElementById('uploadModal');
        const uploadDetails = document.getElementById('uploadDetails');
        const filePreview = document.getElementById('filePreview');

        if (uploadDetails) uploadDetails.style.display = 'none';
        if (filePreview) filePreview.style.display = 'none';

        selectedFile = null;

        const form = document.getElementById('uploadForm');
        if (form) form.reset();

        openModal(modal);
    }

    function handleFileSelect(file) {
        if (!file) return;

        selectedFile = file;

        const filePreview = document.getElementById('filePreview');
        const uploadDetails = document.getElementById('uploadDetails');

        if (filePreview) {
            filePreview.innerHTML = `
                <div class="file-preview-item">
                    <i data-lucide="${file.type.startsWith('video/') ? 'video' : 'image'}"></i>
                    <p>${file.name}</p>
                    <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
            `;
            filePreview.style.display = 'block';
        }

        if (uploadDetails) {
            uploadDetails.style.display = 'block';
        }

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    async function uploadFile(file) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            throw new Error('Supabase client not initialized');
        }

        if (typeof STORAGE_BUCKETS === 'undefined') {
            throw new Error('STORAGE_BUCKETS not defined');
        }

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const bucket = STORAGE_BUCKETS.PORTFOLIO || 'portfolio';

        console.log('Uploading file:', fileName, 'to bucket:', bucket);

        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Storage upload error:', error);
            throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
        }

        if (!data || !data.path) {
            throw new Error('Upload succeeded but no path returned');
        }

        console.log('Upload successful, path:', data.path);
        return data.path;
    }

    async function handleUploadSubmit(e) {
        e.preventDefault();

        if (!selectedFile) {
            safeShowToast('Please select a file', 'warning');
            return;
        }

        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized. Please refresh the page.', 'error');
            return;
        }

        const title = getValue('uploadTitle').trim();
        const description = getValue('uploadDescription').trim();
        const category = getValue('uploadCategory');
        const tags = getValue('uploadTags').split(',').map(t => t.trim()).filter(t => t);
        const isFeatured = document.getElementById('uploadFeatured')?.checked || false;

        if (!title) {
            safeShowToast('Title is required', 'warning');
            return;
        }

        if (!category) {
            safeShowToast('Category is required', 'warning');
            return;
        }

        const progressDiv = document.getElementById('uploadProgress');
        const submitBtn = document.getElementById('submitUpload');

        try {
            if (progressDiv) progressDiv.style.display = 'block';
            if (submitBtn) submitBtn.disabled = true;

            console.log('Starting upload process...');
            const mediaPath = await uploadFile(selectedFile);
            console.log('File uploaded to:', mediaPath);

            const mediaType = selectedFile.type.startsWith('video/') ? 'video' : 'image';

            console.log('Inserting portfolio record...');
            const { error } = await supabaseClient
                .from('portfolio')
                .insert({
                    title,
                    description,
                    category,
                    media_type: mediaType,
                    media_url: mediaPath,
                    tags,
                    is_featured: isFeatured
                });

            if (error) {
                console.error('Database insert error:', error);
                throw new Error(`Database error: ${error.message}`);
            }

            console.log('Portfolio item created successfully');
            safeShowToast('Media uploaded successfully', 'success');
            closeModal(document.getElementById('uploadModal'));
            await loadPortfolio();
        } catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err.message || 'Failed to upload media';
            safeShowToast(errorMessage, 'error');
        } finally {
            if (progressDiv) progressDiv.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    function openEditModal(item) {
        const modal = document.getElementById('editModal');
        if (!modal) return;

        currentEditId = item.id;

        setValue('editItemId', item.id);
        setValue('editTitle', item.title || '');
        setValue('editDescription', item.description || '');
        setValue('editCategory', item.category || 'studio');
        setValue('editTags', Array.isArray(item.tags) ? item.tags.join(', ') : '');

        const featuredCheckbox = document.getElementById('editFeatured');
        if (featuredCheckbox) {
            featuredCheckbox.checked = Boolean(item.is_featured);
        }

        openModal(modal);
    }

    async function handleEditSubmit(e) {
        e.preventDefault();

        if (!currentEditId || typeof supabaseClient === 'undefined' || !supabaseClient) return;

        const title = getValue('editTitle').trim();
        const description = getValue('editDescription').trim();
        const category = getValue('editCategory');
        const tags = getValue('editTags').split(',').map(t => t.trim()).filter(t => t);
        const isFeatured = document.getElementById('editFeatured')?.checked || false;

        if (!title) {
            safeShowToast('Title is required', 'warning');
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('portfolio')
                .update({
                    title,
                    description,
                    category,
                    tags,
                    is_featured: isFeatured
                })
                .eq('id', currentEditId);

            if (error) throw error;

            safeShowToast('Item updated successfully', 'success');
            closeModal(document.getElementById('editModal'));
            await loadPortfolio();
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to update item', 'error');
        }
    }

    function openDeleteModal(itemId) {
        const modal = document.getElementById('deleteModal');
        if (!modal) return;

        currentDeleteId = itemId;
        openModal(modal);
    }

    async function handleDelete() {
        if (!currentDeleteId || typeof supabaseClient === 'undefined' || !supabaseClient) return;

        try {
            const { error } = await supabaseClient
                .from('portfolio')
                .delete()
                .eq('id', currentDeleteId);

            if (error) throw error;

            safeShowToast('Item deleted successfully', 'success');
            closeModal(document.getElementById('deleteModal'));
            await loadPortfolio();
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to delete item', 'error');
        }
    }

    function bindUploadModal() {
        const uploadBtn = document.getElementById('uploadMediaBtn');
        const uploadFirstBtn = document.getElementById('uploadFirstBtn');
        const uploadModal = document.getElementById('uploadModal');
        const closeUploadBtn = document.getElementById('closeUploadModal');
        const cancelUploadBtn = document.getElementById('cancelUpload');
        const uploadForm = document.getElementById('uploadForm');
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', openUploadModal);
        }

        if (uploadFirstBtn) {
            uploadFirstBtn.addEventListener('click', openUploadModal);
        }

        if (closeUploadBtn) {
            closeUploadBtn.addEventListener('click', () => closeModal(uploadModal));
        }

        if (cancelUploadBtn) {
            cancelUploadBtn.addEventListener('click', () => closeModal(uploadModal));
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', handleUploadSubmit);
        }

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--color-accent)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = '';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileSelect(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    handleFileSelect(files[0]);
                }
            });
        }
    }

    function bindEditModal() {
        const modal = document.getElementById('editModal');
        const closeBtn = document.getElementById('closeEditModal');
        const cancelBtn = document.getElementById('cancelEdit');
        const editForm = document.getElementById('editForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => closeModal(modal));
        }

        if (editForm) {
            editForm.addEventListener('submit', handleEditSubmit);
        }

        if (modal) {
            const overlay = modal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => closeModal(modal));
            }
        }
    }

    function bindDeleteModal() {
        const modal = document.getElementById('deleteModal');
        const cancelBtn = document.getElementById('cancelDelete');
        const confirmBtn = document.getElementById('confirmDelete');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => closeModal(modal));
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', handleDelete);
        }

        if (modal) {
            const overlay = modal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => closeModal(modal));
            }
        }
    }

    async function init() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            window.addEventListener('supabaseReady', () => {
                runInit();
            }, { once: true });
            return;
        }
        runInit();
    }

    async function runInit() {
        await loadPortfolio();
        bindFilters();
        bindUploadModal();
        bindEditModal();
        bindDeleteModal();

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal(document.getElementById('uploadModal'));
                closeModal(document.getElementById('editModal'));
                closeModal(document.getElementById('deleteModal'));
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize portfolio manager', 'error');
        });
    });
})();
