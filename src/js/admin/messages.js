(() => {
    let currentConversationUserId = null;
    let allConversations = [];
    let allSubmissions = [];

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

    function setHtml(id, html) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = html == null ? '' : String(html);
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';

        if (typeof formatDate === 'function') {
            try {
                return formatDate(dateStr, 'long');
            } catch (_) {
                // ignore
            }
        }

        try {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(dateStr));
        } catch (_) {
            return String(dateStr);
        }
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    async function loadConversations() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized', 'error');
            return;
        }

        const container = document.getElementById('conversationsList');
        const emptyState = document.getElementById('conversationsEmpty');

        if (!container) return;

        try {
            const { data, error } = await supabaseClient
                .from('messages')
                .select('user_id, users(full_name, email), created_at, is_read')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const conversationsMap = new Map();

            (data || []).forEach(msg => {
                if (!msg.user_id) return;

                if (!conversationsMap.has(msg.user_id)) {
                    conversationsMap.set(msg.user_id, {
                        userId: msg.user_id,
                        userName: msg.users && msg.users.full_name ? msg.users.full_name : (msg.users && msg.users.email ? msg.users.email : 'Unknown'),
                        userEmail: msg.users && msg.users.email ? msg.users.email : '',
                        lastMessageTime: msg.created_at,
                        hasUnread: !msg.is_read
                    });
                } else {
                    const existing = conversationsMap.get(msg.user_id);
                    if (!msg.is_read) existing.hasUnread = true;
                }
            });

            allConversations = Array.from(conversationsMap.values());

            container.innerHTML = '';

            if (allConversations.length === 0) {
                container.innerHTML = '';
                if (emptyState) emptyState.style.display = 'flex';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            allConversations.forEach(conv => {
                const item = document.createElement('div');
                item.className = `conversation-item${conv.hasUnread ? ' unread' : ''}`;
                item.dataset.userId = conv.userId;

                item.innerHTML = `
                    <div class="conversation-avatar">
                        <i data-lucide="user"></i>
                    </div>
                    <div class="conversation-info">
                        <h4>${conv.userName}</h4>
                        <p>${conv.userEmail}</p>
                        <small>${formatDateTime(conv.lastMessageTime)}</small>
                    </div>
                    ${conv.hasUnread ? '<span class="unread-indicator"></span>' : ''}
                `;

                item.addEventListener('click', () => loadConversation(conv.userId, conv.userName, conv.userEmail));

                container.appendChild(item);
            });

            if (typeof lucide !== 'undefined') {
                try {
                    lucide.createIcons();
                } catch (_) {
                    // ignore
                }
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p class="error-message">Failed to load conversations</p>';
        }
    }

    async function loadConversation(userId, userName, userEmail) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

        currentConversationUserId = userId;

        const noConv = document.getElementById('noConversation');
        const activeConv = document.getElementById('activeConversation');
        const messagesArea = document.getElementById('messagesArea');

        if (noConv) noConv.style.display = 'none';
        if (activeConv) activeConv.style.display = 'flex';

        setText('chatUserName', userName);
        setText('chatUserEmail', userEmail);

        const activeUserIdInput = document.getElementById('activeUserId');
        if (activeUserIdInput) activeUserIdInput.value = userId;

        if (!messagesArea) return;

        try {
            const { data, error } = await supabaseClient
                .from('messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            messagesArea.innerHTML = '';

            (data || []).forEach(msg => {
                const msgEl = document.createElement('div');
                msgEl.className = `message ${msg.sender_type === 'admin' ? 'admin-message' : 'user-message'}`;

                msgEl.innerHTML = `
                    <div class="message-bubble">
                        <p>${msg.message_text || ''}</p>
                        <small>${formatDateTime(msg.created_at)}</small>
                    </div>
                `;

                messagesArea.appendChild(msgEl);
            });

            messagesArea.scrollTop = messagesArea.scrollHeight;

            const items = Array.from(document.querySelectorAll('.conversation-item'));
            items.forEach(item => {
                if (item.dataset.userId === userId) {
                    item.classList.add('active');
                    item.classList.remove('unread');
                } else {
                    item.classList.remove('active');
                }
            });

            if (typeof lucide !== 'undefined') {
                try {
                    lucide.createIcons();
                } catch (_) {
                    // ignore
                }
            }
        } catch (err) {
            console.error(err);
            messagesArea.innerHTML = '<p class="error-message">Failed to load messages</p>';
        }
    }

    async function sendReply(e) {
        e.preventDefault();

        if (typeof supabaseClient === 'undefined' || !supabaseClient || !currentConversationUserId) return;

        const input = document.getElementById('messageInput');
        const text = input?.value?.trim();

        if (!text) {
            safeShowToast('Please enter a message', 'warning');
            return;
        }

        try {
            const user = await getCurrentUser();
            if (!user) {
                safeShowToast('Not authenticated', 'error');
                return;
            }

            const { error } = await supabaseClient
                .from('messages')
                .insert({
                    user_id: currentConversationUserId,
                    sender_type: 'admin',
                    message_text: text,
                    is_read: true
                });

            if (error) throw error;

            if (input) input.value = '';

            const messagesArea = document.getElementById('messagesArea');
            if (messagesArea) {
                const msgEl = document.createElement('div');
                msgEl.className = 'message admin-message';
                msgEl.innerHTML = `
                    <div class="message-bubble">
                        <p>${text}</p>
                        <small>${formatDateTime(new Date().toISOString())}</small>
                    </div>
                `;
                messagesArea.appendChild(msgEl);
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }

            safeShowToast('Reply sent', 'success');
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to send reply', 'error');
        }
    }

    async function markAsRead() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient || !currentConversationUserId) return;

        try {
            await supabaseClient
                .from('messages')
                .update({ is_read: true })
                .eq('user_id', currentConversationUserId)
                .eq('sender_type', 'user');

            safeShowToast('Marked as read', 'success');
            await loadConversations();
        } catch (err) {
            console.error(err);
            safeShowToast('Failed to mark as read', 'error');
        }
    }

    async function loadSubmissions() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            safeShowToast('Supabase client not initialized', 'error');
            return;
        }

        const container = document.getElementById('submissionsList');
        const emptyState = document.getElementById('submissionsEmpty');

        if (!container) return;

        try {
            const { data, error } = await supabaseClient
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            allSubmissions = data || [];

            container.innerHTML = '';

            if (allSubmissions.length === 0) {
                container.innerHTML = '';
                if (emptyState) emptyState.style.display = 'flex';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            allSubmissions.forEach(sub => {
                const item = document.createElement('div');
                item.className = 'submission-item';

                item.innerHTML = `
                    <div class="submission-icon">
                        <i data-lucide="mail"></i>
                    </div>
                    <div class="submission-info">
                        <h4>${sub.name || 'N/A'}</h4>
                        <p>${sub.subject || 'No subject'}</p>
                        <small>${formatDateTime(sub.created_at)}</small>
                    </div>
                `;

                item.addEventListener('click', () => showSubmissionDetails(sub));

                container.appendChild(item);
            });

            if (typeof lucide !== 'undefined') {
                try {
                    lucide.createIcons();
                } catch (_) {
                    // ignore
                }
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p class="error-message">Failed to load submissions</p>';
        }
    }

    function showSubmissionDetails(sub) {
        const modal = document.getElementById('submissionModal');
        if (!modal) return;

        setText('submissionName', sub.name || '-');
        setText('submissionEmail', sub.email || '-');
        setText('submissionPhone', sub.phone || '-');
        setText('submissionSubject', sub.subject || '-');
        setText('submissionDate', formatDateTime(sub.created_at));
        setText('submissionMessage', sub.message || '-');

        const replyLink = document.getElementById('replyToSubmission');
        if (replyLink && sub.email) {
            replyLink.href = `mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.subject || 'Your inquiry')}`;
        }

        openModal(modal);

        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (_) {
                // ignore
            }
        }
    }

    function bindFilters() {
        const tabs = Array.from(document.querySelectorAll('.filter-tab'));
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const filter = tab.dataset.filter;
                if (filter === 'unread') {
                    const items = Array.from(document.querySelectorAll('.conversation-item'));
                    items.forEach(item => {
                        if (item.classList.contains('unread')) {
                            item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                } else {
                    const items = Array.from(document.querySelectorAll('.conversation-item'));
                    items.forEach(item => {
                        item.style.display = 'flex';
                    });
                }
            });
        });
    }

    function bindModals() {
        const submissionModal = document.getElementById('submissionModal');
        const closeSubmissionBtn = document.getElementById('closeSubmissionModal');
        const closeSubmissionBtn2 = document.getElementById('closeSubmissionBtn');

        if (closeSubmissionBtn) {
            closeSubmissionBtn.addEventListener('click', () => closeModal(submissionModal));
        }

        if (closeSubmissionBtn2) {
            closeSubmissionBtn2.addEventListener('click', () => closeModal(submissionModal));
        }

        if (submissionModal) {
            const overlay = submissionModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => closeModal(submissionModal));
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal(submissionModal);
            }
        });
    }

    function bindActions() {
        const replyForm = document.getElementById('replyForm');
        if (replyForm) {
            replyForm.addEventListener('submit', sendReply);
        }

        const markReadBtn = document.getElementById('markAsRead');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', markAsRead);
        }

        const viewProfileBtn = document.getElementById('viewUserProfile');
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', () => {
                if (currentConversationUserId) {
                    window.location.href = `users.html?user=${currentConversationUserId}`;
                }
            });
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
        await Promise.all([
            loadConversations(),
            loadSubmissions()
        ]);
        bindFilters();
        bindModals();
        bindActions();
    }

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error(err);
            safeShowToast('Failed to initialize messages page', 'error');
        });
    });
})();
