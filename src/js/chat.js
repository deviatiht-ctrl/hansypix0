/**
 * REAL-TIME CHAT SYSTEM
 * WhatsApp-style chat functionality
 */

let chatSubscription = null;
let currentUserId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        window.addEventListener('supabaseReady', () => {
            initChat();
        }, { once: true });
    } else {
        initChat();
    }
});

/**
 * Initialize chat system
 */
async function initChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatClose = document.getElementById('chatClose');
    const chatWindow = document.getElementById('chatWindow');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatMessageInput = document.getElementById('chatMessageInput');
    
    if (!chatWidget) return;
    
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            chatWidget.style.display = 'none';
            return;
        }
        
        currentUserId = user.id;
        chatWidget.style.display = 'block';
        
        // Toggle chat window
        if (chatToggle) {
            chatToggle.addEventListener('click', () => {
                const isOpen = chatWindow.style.display === 'block';
                chatWindow.style.display = isOpen ? 'none' : 'block';
                
                if (!isOpen) {
                    loadMessages();
                    markMessagesAsRead();
                }
            });
        }
        
        // Close chat
        if (chatClose) {
            chatClose.addEventListener('click', () => {
                chatWindow.style.display = 'none';
            });
        }
        
        // Send message
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', sendMessage);
        }
        
        if (chatMessageInput) {
            chatMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                }
            });
        }
        
        // Subscribe to real-time updates
        subscribeToMessages();
        
        // Load initial messages
        await loadMessages();
        
        // Check for unread messages
        await checkUnreadMessages();
        
        chatWidget.style.display = 'block';
        
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

/**
 * Load chat messages
 */
async function loadMessages() {
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatMessages || !currentUserId) return;
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    
    try {
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        chatMessages.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="chat-empty">
                    <i data-lucide="message-circle"></i>
                    <p>No messages yet. Start a conversation!</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        
        messages.forEach(message => {
            const messageEl = createMessageElement(message);
            chatMessages.appendChild(messageEl);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

/**
 * Create message element
 */
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `chat-message ${message.sender_type === 'user' ? 'user-message' : 'admin-message'}`;
    
    const time = new Date(message.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message.message_text)}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    return div;
}

/**
 * Send message
 */
async function sendMessage(e) {
    e.preventDefault();
    
    const chatMessageInput = document.getElementById('chatMessageInput');
    
    if (!chatMessageInput || !currentUserId) return;
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    
    const messageText = chatMessageInput.value.trim();
    
    if (!messageText) return;
    
    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert({
                user_id: currentUserId,
                sender_type: 'user',
                message_text: messageText,
                is_read: false
            });
        
        if (error) throw error;
        
        chatMessageInput.value = '';
        
        await loadMessages();
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message', 'error');
    }
}

/**
 * Subscribe to real-time message updates
 */
function subscribeToMessages() {
    if (!currentUserId || typeof supabaseClient === 'undefined' || !supabaseClient) return;
    
    chatSubscription = supabaseClient
        .channel('messages')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${currentUserId}`
        }, () => {
            loadMessages();
            checkUnreadMessages();
        })
        .subscribe();
}

/**
 * Check for unread messages
 */
async function checkUnreadMessages() {
    const chatBadge = document.getElementById('chatBadge');
    
    if (!chatBadge || !currentUserId) return;
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('user_id', currentUserId)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
        
        if (error) throw error;
        
        const count = data?.length || 0;
        
        if (count > 0) {
            chatBadge.textContent = count;
            chatBadge.style.display = 'block';
        } else {
            chatBadge.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error checking unread messages:', error);
    }
}

/**
 * Mark messages as read
 */
async function markMessagesAsRead() {
    if (!currentUserId || typeof supabaseClient === 'undefined' || !supabaseClient) return;
    
    try {
        await supabaseClient
            .from('messages')
            .update({ is_read: true })
            .eq('user_id', currentUserId)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
        
        await checkUnreadMessages();
        
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (chatSubscription && typeof supabaseClient !== 'undefined' && supabaseClient) {
        supabaseClient.removeChannel(chatSubscription);
    }
});
