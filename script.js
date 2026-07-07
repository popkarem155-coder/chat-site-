// Global function stubs for sandbox/iframe compatibility
function sendMessage() { if(window._sendMessage) window._sendMessage(); }
function doSendMessage() { if(window._sendMessage) window._sendMessage(); }
function openChat(user) { if(window._openChat) window._openChat(user); }
function closeChat() { if(window._closeChat) window._closeChat(); }
function openDrawer() { if(window._openDrawer) window._openDrawer(); }
function closeDrawer() { if(window._closeDrawer) window._closeDrawer(); }
function openPrivateMessages() { if(window._openPrivateMessages) window._openPrivateMessages(); }
function closePrivateMessages() { if(window._closePrivateMessages) window._closePrivateMessages(); }
function renderUsers(filter) { if(window._renderUsers) window._renderUsers(filter); }
function editProfile() { if(window._editProfile) window._editProfile(); }
function updateProfileName(value) { if(window._updateProfileName) window._updateProfileName(value); }

(function() {
  'use strict';

  const bios = [
    'مطور تطبيقات', 'مصمم جرافيك', 'كاتب محتوى',
    'لاعب ألعاب', 'مصور فوتوغرافي', 'موسيقي',
    'مسافر دائم', 'قارئ نهم', 'طالب جامعي',
    'رائد أعمال', 'شيف طبخ', 'رياضي',
    'مدون تقني', 'فنان رقمي', 'مترجم'
  ];

  const replies = [
    { text: 'مرحباً! أنا سعيد جداً بالتحدث معك', delay: 900 },
    { text: 'هذا موضوع مثير للاهتمام فعلاً!', delay: 1300 },
    { text: 'أتفق معك تماماً', delay: 1100 },
    { text: 'واو! لم أكن أعرف ذلك من قبل', delay: 1600 },
    { text: 'هههههه', delay: 700 },
    { text: 'بالتأكيد، دعنا نتحدث أكثر عن هذا الموضوع', delay: 1200 },
    { text: 'رائع! هذا ما كنت أبحث عنه بالضبط', delay: 1000 },
    { text: 'شكراً جزيلاً على المشاركة!', delay: 800 },
    { text: 'هل يمكنك إرسال المزيد من التفاصيل؟', delay: 1400 },
    { text: 'أحب هذا التطبيق كثيراً', delay: 600 },
    { text: 'هل تعرف أي أماكن حلوة نروحها؟', delay: 1100 },
    { text: 'صح كلامك مية بالمية!', delay: 500 },
  ];

  let users = [
    { id: 1, name: 'أحمد علي', initials: 'أع', color: '#7c3aed', bio: bios[0], badge: 'vip', lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 2, name: 'سارة محمد', initials: 'سم', color: '#c026d3', bio: bios[1], badge: null, lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 3, name: 'محمد خالد', initials: 'مخ', color: '#9333ea', bio: bios[2], badge: 'new', lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 4, name: 'ليلى أحمد', initials: 'لأ', color: '#6366f1', bio: bios[3], badge: null, lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 5, name: 'عمر سامي', initials: 'عس', color: '#6d28d9', bio: bios[4], badge: 'vip', lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 6, name: 'نور الدين', initials: 'ند', color: '#a855f7', bio: bios[5], badge: null, lastSeen: 'الآن', msgCount: 0, isNew: false },
    { id: 7, name: 'فاطمة يوسف', initials: 'في', color: '#8b5cf6', bio: bios[6], badge: 'new', lastSeen: 'الآن', msgCount: 0, isNew: false },
  ];

  const extraNames = ['خالد', 'ريم', 'علي', 'هند', 'ياسين', 'مريم', 'طارق', 'دنيا', 'حسن', 'آية', 'زياد', 'لمى', 'فهد', 'رنا'];
  const colors = ['#7c3aed', '#c026d3', '#9333ea', '#6366f1', '#6d28d9', '#a855f7', '#8b5cf6', '#ec4899', '#d946ef', '#a855f7'];

  let currentChatUser = null;
  let messages = {};
  let userIdCounter = 8;
  let isTyping = false;
  let totalChats = 0;

  const privateMessagesData = [
    { id: 101, name: 'سارة محمد', initials: 'سم', color: '#c026d3', preview: 'مرحباً! كيف حالك اليوم؟', time: '10:30', unread: 2 },
    { id: 102, name: 'محمد خالد', initials: 'مخ', color: '#9333ea', preview: 'هل رأيت التحديث الجديد؟', time: '09:15', unread: 1 },
    { id: 103, name: 'عمر سامي', initials: 'عس', color: '#6d28d9', preview: 'شكراً جزيلاً على المساعدة!', time: 'أمس', unread: 0 },
    { id: 104, name: 'ليلى أحمد', initials: 'لأ', color: '#6366f1', preview: 'متى نلتقي غداً؟', time: 'أمس', unread: 0 },
    { id: 105, name: 'فاطمة يوسف', initials: 'في', color: '#8b5cf6', preview: 'أرسلت لك الملف المطلوب', time: 'الأحد', unread: 0 },
  ];

  const $ = id => document.getElementById(id);
  const usersList = $('users-list');
  const mainView = $('main-view');
  const mainHeader = $('main-header');
  const chatView = $('chat-view');
  const chatUsername = $('chat-username');
  const chatAvatar = $('chat-avatar');
  const chatStatusText = $('chat-status-text');
  const chatStatus = $('chat-status');
  const messagesArea = $('messages-area');
  const msgInput = $('msg-input');
  const sendBtn = $('send-btn');
  const backBtn = $('back-btn');
  const onlineCount = $('stat-users');
  const statChats = $('stat-chats');
  const searchInput = $('search-input');
  const toast = $('toast');
  const toastText = $('toast-text');
  const menuBtn = $('menu-btn');
  const drawerOverlay = $('drawer-overlay');
  const sideDrawer = $('side-drawer');
  const drawerClose = $('drawer-close');
  const drawerProfileName = $('drawer-profile-name');
  const drawerProfileAvatar = $('drawer-profile-avatar');
  const messagesIconBtn = $('messages-icon-btn');
  const messagesBadge = $('messages-badge');
  const privateMessagesPage = $('private-messages-page');
  const privateMessagesBack = $('private-messages-back');
  const privateMessagesList = $('private-messages-list');

  function getTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  function showToast(text) {
    toastText.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function generateId() { return Date.now() + Math.random().toString(36).substr(2, 9); }

  window._openDrawer = function() {
    drawerOverlay.classList.add('active');
    sideDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window._closeDrawer = function() {
    drawerOverlay.classList.remove('active');
    sideDrawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  window._openPrivateMessages = function() {
    privateMessagesPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderPrivateMessages();
  };

  window._closePrivateMessages = function() {
    privateMessagesPage.style.display = 'none';
    document.body.style.overflow = '';
  };

  window._editProfile = function() {
    showToast('اختيار صورة البروفايل');
  };

  window._updateProfileName = function(value) {
    const newName = value.trim();
    if (newName) {
      showToast('تم تحديث الاسم إلى: ' + newName);
      const names = newName.split(' ');
      const initials = names.map(n => n[0]).join('');
      drawerProfileAvatar.childNodes[0].textContent = initials;
    }
  };

  function renderPrivateMessages() {
    privateMessagesList.innerHTML = '';

    if (privateMessagesData.length === 0) {
      privateMessagesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="empty-title">لا توجد رسائل</div>
          <div class="empty-desc">ابدأ محادثة جديدة مع أحد المستخدمين المتصلين</div>
        </div>
      `;
      return;
    }

    privateMessagesData.forEach((msg, i) => {
      const card = document.createElement('div');
      card.className = 'private-msg-card';
      card.style.animationDelay = (i * 0.06) + 's';

      const unreadBadge = msg.unread > 0 
        ? `<span class="private-msg-unread">${msg.unread}</span>` 
        : '';

      card.innerHTML = `
        <div class="private-msg-avatar" style="background: linear-gradient(135deg, ${msg.color}, ${msg.color}dd)">${msg.initials}</div>
        <div class="private-msg-info">
          <div class="private-msg-name">${msg.name}</div>
          <div class="private-msg-preview">${msg.preview}</div>
        </div>
        <div class="private-msg-meta">
          <span class="private-msg-time">${msg.time}</span>
          ${unreadBadge}
        </div>
      `;

      card.addEventListener('click', () => {
        let user = users.find(u => u.name === msg.name);
        if (!user) {
          user = {
            id: userIdCounter++,
            name: msg.name,
            initials: msg.initials,
            color: msg.color,
            bio: bios[Math.floor(Math.random() * bios.length)],
            badge: null,
            lastSeen: 'الآن',
            msgCount: 0,
            isNew: false
          };
          users.push(user);
        }
        closePrivateMessages();
        openChat(user);
        msg.unread = 0;
        updateMessagesBadge();
      });

      privateMessagesList.appendChild(card);
    });
  }

  function updateMessagesBadge() {
    const totalUnread = privateMessagesData.reduce((sum, m) => sum + m.unread, 0);
    if (totalUnread > 0) {
      messagesBadge.textContent = totalUnread;
      messagesBadge.style.display = 'flex';
    } else {
      messagesBadge.style.display = 'none';
    }
  }

  window._renderUsers = function(filter) {
    filter = filter || '';
    const filtered = users.filter(u => u.name.includes(filter));

    if (filtered.length === 0) {
      usersList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <div class="empty-title">لا يوجد مستخدمين</div>
          <div class="empty-desc">جرب بحث مختلف أو انتظر حتى ينضم مستخدمون جدد للدردشة</div>
        </div>
      `;
      onlineCount.textContent = '0';
      return;
    }

    usersList.innerHTML = '';

    filtered.forEach((user, i) => {
      const card = document.createElement('div');
      card.className = 'user-card' + (user.isNew ? ' new-user' : '');
      card.style.animationDelay = (i * 0.06) + 's';

      const badgeHtml = user.badge 
        ? `<span class="user-badge badge-${user.badge}">${user.badge === 'vip' ? 'VIP' : 'جديد'}</span>` 
        : '';

      card.innerHTML = `
        <div class="user-avatar-wrap">
          <div class="user-avatar" style="background: linear-gradient(135deg, ${user.color}, ${user.color}dd)">${user.initials}</div>
          <span class="user-status-dot"></span>
        </div>
        <div class="user-info">
          <div class="user-name-row">
            <span class="user-name">${user.name}</span>
            ${badgeHtml}
          </div>
          <div class="user-bio">${user.bio}</div>
          <div class="user-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${user.lastSeen}
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ${user.msgCount} رسائل
            </span>
          </div>
        </div>
        <div class="user-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 2-7 20-4-9-9-4 20-7z"/>
          </svg>
        </div>
      `;
      card.addEventListener('click', () => openChat(user));
      usersList.appendChild(card);
    });

    onlineCount.textContent = filtered.length;
  };

  window._openChat = function(user) {
    currentChatUser = user;
    chatUsername.textContent = user.name;
    chatAvatar.textContent = user.initials;
    chatAvatar.style.background = `linear-gradient(135deg, ${user.color}, ${user.color}dd)`;
    chatStatusText.textContent = 'يكتب الآن...';
    chatStatus.classList.add('typing');

    if (!messages[user.id]) {
      messages[user.id] = [
        { id: generateId(), from: 'them', text: 'مرحباً! أنا ' + user.name + ' سعيد بالتحدث معك!', time: getTime(), read: true }
      ];
    }
    renderMessages();

    chatView.style.display = 'flex';
    msgInput.focus();

    setTimeout(() => {
      if (currentChatUser && currentChatUser.id === user.id) {
        chatStatusText.textContent = 'متصل الآن';
        chatStatus.classList.remove('typing');
      }
    }, 2200);
  };

  window._closeChat = function() {
    chatView.style.display = 'none';
    currentChatUser = null;
    isTyping = false;
    renderUsers(searchInput.value);
  };

  function renderMessages() {
    if (!currentChatUser) return;
    const msgs = messages[currentChatUser.id] || [];
    messagesArea.innerHTML = '';

    const dateDiv = document.createElement('div');
    dateDiv.className = 'messages-date';
    dateDiv.textContent = 'اليوم';
    messagesArea.appendChild(dateDiv);

    msgs.forEach((msg, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'msg-wrapper ' + (msg.from === 'me' ? 'sent' : 'received');
      wrapper.style.animationDelay = (i * 0.04) + 's';

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble ' + (msg.from === 'me' ? 'sent' : 'received');

      const readIcon = msg.from === 'me' && msg.read
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` 
        : '';

      bubble.innerHTML = msg.text.replace(/\n/g, '<br>') + `
        <div class="msg-time">
          ${msg.time}
          ${msg.from === 'me' ? '<span class="msg-read">' + readIcon + '</span>' : ''}
        </div>
      `;
      wrapper.appendChild(bubble);
      messagesArea.appendChild(wrapper);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    chatStatusText.textContent = 'يكتب الآن...';
    chatStatus.classList.add('typing');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function hideTyping() {
    isTyping = false;
    chatStatusText.textContent = 'متصل الآن';
    chatStatus.classList.remove('typing');
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  window._sendMessage = function() {
    const text = msgInput.value.trim();
    if (!text || !currentChatUser) return;

    const msgId = generateId();
    messages[currentChatUser.id].push({
      id: msgId, from: 'me', text: text, time: getTime(), read: false
    });
    currentChatUser.msgCount++;
    totalChats++;
    statChats.textContent = totalChats;
    msgInput.value = '';
    renderMessages();

    setTimeout(() => {
      const msg = messages[currentChatUser.id].find(m => m.id === msgId);
      if (msg) { msg.read = true; renderMessages(); }
    }, 900);

    const reply = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        if (currentChatUser) {
          messages[currentChatUser.id].push({
            id: generateId(), from: 'them', text: reply.text, time: getTime(), read: true
          });
          currentChatUser.msgCount++;
          totalChats++;
          statChats.textContent = totalChats;
          renderMessages();
          showToast('رسالة جديدة من ' + currentChatUser.name);
        }
      }, 1800);
    }, reply.delay);
  };

  setInterval(() => {
    const action = Math.random();

    if (action < 0.28 && users.length < 16) {
      const firstName = extraNames[Math.floor(Math.random() * extraNames.length)];
      const lastName = extraNames[Math.floor(Math.random() * extraNames.length)];
      const name = firstName + ' ' + lastName;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const newUser = {
        id: userIdCounter++,
        name: name,
        initials: name.split(' ').map(n => n[0]).join(''),
        color: color,
        bio: bios[Math.floor(Math.random() * bios.length)],
        badge: Math.random() > 0.65 ? 'new' : null,
        lastSeen: 'الآن',
        msgCount: 0,
        isNew: true
      };
      users.unshift(newUser);

      const filter = searchInput.value;
      if (!filter || newUser.name.includes(filter)) {
        const card = document.createElement('div');
        card.className = 'user-card new-user';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-30px)';
        card.style.transition = 'none';

        const badgeHtml = newUser.badge 
          ? `<span class="user-badge badge-${newUser.badge}">${newUser.badge === 'vip' ? 'VIP' : 'جديد'}</span>` 
          : '';

        card.innerHTML = `
          <div class="user-avatar-wrap">
            <div class="user-avatar" style="background: linear-gradient(135deg, ${newUser.color}, ${newUser.color}dd)">${newUser.initials}</div>
            <span class="user-status-dot"></span>
          </div>
          <div class="user-info">
            <div class="user-name-row">
              <span class="user-name">${newUser.name}</span>
              ${badgeHtml}
            </div>
            <div class="user-bio">${newUser.bio}</div>
            <div class="user-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${newUser.lastSeen}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${newUser.msgCount} رسائل
              </span>
            </div>
          </div>
          <div class="user-action">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
        `;
        card.addEventListener('click', () => openChat(newUser));

        usersList.insertBefore(card, usersList.firstChild);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            setTimeout(() => { card.classList.remove('new-user'); }, 500);
          });
        });

        onlineCount.textContent = users.filter(u => u.name.includes(filter)).length;
      }

      showToast(name + ' انضم للدردشة!');
      setTimeout(() => { newUser.isNew = false; }, 1000);

    } else if (action > 0.78 && users.length > 4) {
      const idx = Math.floor(Math.random() * users.length);
      const removed = users.splice(idx, 1)[0];

      const cards = usersList.querySelectorAll('.user-card');
      cards.forEach(card => {
        const nameEl = card.querySelector('.user-name');
        if (nameEl && nameEl.textContent === removed.name) {
          card.style.transition = 'all 0.4s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => { if (card.parentNode) card.remove(); }, 400);
        }
      });

      if (currentChatUser && currentChatUser.id === removed.id) {
        chatStatusText.textContent = 'غير متصل';
        chatStatus.style.color = '#ef4444';
      }

      onlineCount.textContent = users.filter(u => u.name.includes(searchInput.value)).length;
    }
  }, 5000);

  renderUsers();
  updateMessagesBadge();

  // Event listeners for send button and form
  const chatForm = document.getElementById('chat-form');
  const sendButton = document.getElementById('send-btn');
  const messageInput = document.getElementById('msg-input');

  if (chatForm) {
    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (window._sendMessage) window._sendMessage();
    });
  }

  if (sendButton) {
    sendButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (window._sendMessage) window._sendMessage();
    });
  }

  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (window._sendMessage) window._sendMessage();
      }
    });
  }

})();
