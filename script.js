(function() {
  'use strict';

  // بيانات المستخدم و الإعدادات
  const myProfile = {
    id: 'me', name: 'أحمد محمد', initials: 'أم', color: '#7c3aed', 
    bio: 'مطور تطبيقات', age: 28, gender: 'ذكر', nationality: 'مصر', avatar: ''
  };

  const bios = ['مطور تطبيقات', 'مصمم جرافيك', 'كاتب محتوى'];
  let users = [
    { id: 1, name: 'أحمد علي', initials: 'أع', color: '#7c3aed', bio: bios[0], age: 25, isOnline: true },
    { id: 2, name: 'سارة محمد', initials: 'سم', color: '#c026d3', bio: bios[1], age: 22, isOnline: true },
    { id: 3, name: 'محمد خالد', initials: 'مخ', color: '#9333ea', bio: bios[2], age: 30, isOnline: false }
  ];

  let currentChatUser = null;
  let messages = {};
  let privateMessagesData = [
    { id: 1, name: 'أحمد علي', initials: 'أع', color: '#7c3aed', preview: 'أهلاً بك', unread: 2, isOnline: true },
    { id: 2, name: 'سارة محمد', initials: 'سم', color: '#c026d3', preview: 'أرسلت الصورة', unread: 0, isOnline: true }
  ];
  let isRecording = false;
  let mediaRecorder = null;
  let audioChunks = [];
  let recordTimeout = null;

  // جلب العناصر
  const $ = id => document.getElementById(id);
  const usersList = $('users-list');
  const chatView = $('chat-view');
  const messagesArea = $('messages-area');
  const msgInput = $('msg-input');
  const toast = $('toast');
  const toastText = $('toast-text');
  const sideDrawer = $('side-drawer');
  const drawerOverlay = $('drawer-overlay');
  const privateMessagesPage = $('private-messages-page');
  const privateMessagesList = $('private-messages-list');
  const profilePage = $('profile-page');
  const messagesBadge = $('messages-badge');
  const privateHeaderCount = $('private-header-count');
  
  // دالة عرض الإشعارات
  window.showToast = function(text) {
    toastText.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  };

  // توليد أيدي عشوائي للرسائل
  function generateId() { return Date.now() + Math.random().toString(36).substr(2, 9); }
  function getTime() { const d = new Date(); return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0'); }

  // التحكم بالقوائم والصفحات
  window.openDrawer = () => { drawerOverlay.classList.add('active'); sideDrawer.classList.add('active'); };
  window.closeDrawer = () => { drawerOverlay.classList.remove('active'); sideDrawer.classList.remove('active'); };
  
  window.openPrivateMessages = () => {
    privateMessagesPage.style.display = 'flex';
    renderPrivateMessages();
  };
  window.closePrivateMessages = () => privateMessagesPage.style.display = 'none';

  // تحديث عدد الرسائل الخاصة (رقم فعلي وغير ثابت)
  function updateMessagesBadge() {
    const totalUnread = privateMessagesData.reduce((sum, m) => sum + m.unread, 0);
    if (totalUnread > 0) {
      messagesBadge.textContent = totalUnread;
      messagesBadge.style.display = 'flex';
      privateHeaderCount.textContent = `${totalUnread} محادثات جديدة`;
    } else {
      messagesBadge.style.display = 'none';
      privateHeaderCount.textContent = 'لا يوجد محادثات جديدة';
    }
  }

  // عرض القائمة الخاصة (مع النقطة الخضراء للنشط)
  function renderPrivateMessages() {
    privateMessagesList.innerHTML = '';
    privateMessagesData.forEach(msg => {
      const card = document.createElement('div');
      card.className = 'private-msg-card';
      const unreadBadge = msg.unread > 0 ? `<span class="private-msg-unread" style="background:#ef4444;color:#fff;border-radius:50%;padding:2px 6px;font-size:10px;">${msg.unread}</span>` : '';
      const onlineDot = msg.isOnline ? `<span style="position:absolute;bottom:0;right:0;width:12px;height:12px;background:var(--online);border-radius:50%;border:2px solid var(--bg-card);"></span>` : '';
      
      card.innerHTML = `
        <div class="private-msg-avatar" style="background: linear-gradient(135deg, ${msg.color}, ${msg.color}dd)">
          ${msg.initials} ${onlineDot}
        </div>
        <div class="private-msg-info">
          <div class="private-msg-name">${msg.name}</div>
          <div class="private-msg-preview">${msg.preview}</div>
        </div>
        <div>${unreadBadge}</div>
      `;
      card.addEventListener('click', () => {
        let user = users.find(u => u.id === msg.id);
        msg.unread = 0;
        updateMessagesBadge();
        closePrivateMessages();
        openChat(user);
      });
      privateMessagesList.appendChild(card);
    });
    updateMessagesBadge();
  }

  // عرض المستخدمين
  window.renderUsers = (filter = '') => {
    usersList.innerHTML = '';
    const filtered = users.filter(u => u.name.includes(filter));
    filtered.forEach(user => {
      const card = document.createElement('div');
      card.className = 'user-card';
      const onlineDot = user.isOnline ? `<span class="user-status-dot"></span>` : '';
      
      card.innerHTML = `
        <div class="user-avatar-wrap">
          <div class="user-avatar" style="background: linear-gradient(135deg, ${user.color}, ${user.color}dd)">${user.initials}</div>
          ${onlineDot}
        </div>
        <div class="user-info">
          <div class="user-name">${user.name}</div>
          <div class="user-meta">${user.bio}</div>
        </div>
      `;
      card.querySelector('.user-avatar-wrap').addEventListener('click', (e) => {
        e.stopPropagation(); openUserProfile(user);
      });
      card.addEventListener('click', () => openChat(user));
      usersList.appendChild(card);
    });
  };

  // الشات والرسائل
  window.openChat = (user) => {
    currentChatUser = user;
    $('chat-username').textContent = user.name;
    const avatar = $('chat-avatar');
    if(user.avatar) {
      avatar.style.background = `url("${user.avatar}") center / cover no-repeat`;
      avatar.textContent = '';
    } else {
      avatar.style.background = `linear-gradient(135deg, ${user.color}, ${user.color}dd)`;
      avatar.textContent = user.initials;
    }
    chatView.style.display = 'flex';
    if (!messages[user.id]) messages[user.id] = [];
    renderMessages();
  };
  window.closeChat = () => { chatView.style.display = 'none'; currentChatUser = null; };

  // نظام فلترة الوسائط لإخفاء الأقدم من 10 لتوفير المساحة
  window.renderMessages = () => {
    if (!currentChatUser) return;
    messagesArea.innerHTML = '';
    
    let msgs = messages[currentChatUser.id] || [];
    
    // حد أقصى للرسائل العامة 35
    if (msgs.length > 35) {
      msgs = msgs.slice(-35);
      messages[currentChatUser.id] = msgs;
    }

    // حساب عدد ملفات الوسائط والصوت لتطبيق تأثير التمويه على القديم
    let mediaCount = 0;
    const reversedMsgs = [...msgs].reverse();
    reversedMsgs.forEach(msg => {
      if (msg.type === 'image' || msg.type === 'audio' || msg.type === 'file') {
        mediaCount++;
        if (mediaCount > 10) msg.isBlurred = true; // علامة التشويه
      }
    });

    msgs.forEach(msg => {
      const wrapper = document.createElement('div');
      wrapper.className = 'msg-wrapper ' + (msg.from === 'me' ? 'sent' : 'received');
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble ' + (msg.from === 'me' ? 'sent' : 'received');

      let content = '';
      if (msg.type === 'image') {
        content = `<img src="${msg.content}" class="chat-image ${msg.isBlurred ? 'blurred-media' : ''}" onclick="!${msg.isBlurred} && openImageModal(this.src)">`;
        if (msg.isBlurred) content += `<div class="blurred-overlay-text">تم إزالة الوسائط لتوفير المساحة</div>`;
      } else if (msg.type === 'audio') {
        content = `<div class="${msg.isBlurred ? 'blurred-media' : ''}">🎙️ تسجيل صوتي <br> <audio controls src="${msg.content}"></audio></div>`;
        if (msg.isBlurred) content += `<div class="blurred-overlay-text">تم إزالة الصوت لتوفير المساحة</div>`;
      } else {
        content = msg.text.replace(/\n/g, '<br>');
      }

      bubble.innerHTML = `${content}<div class="msg-time">${msg.time}</div>`;
      wrapper.appendChild(bubble);
      messagesArea.appendChild(wrapper);
    });
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  // فلترة الأكواد ومنع التكرار
  window.sendMessage = () => {
    const text = msgInput.value.trim();
    if (!text || !currentChatUser) return;

    // منع الأكواد البرمجية
    const codeRegex = /[<>{}[\];=]|\b(function|const|let|var|if|for|while|console)\b/i;
    if (codeRegex.test(text)) {
      showToast('عذراً، إرسال الأكواد البرمجية غير مسموح.');
      return;
    }

    const msgs = messages[currentChatUser.id];
    // منع التكرار للرسالة الأخيرة
    if (msgs.length > 0 && msgs[msgs.length - 1].text === text) {
      showToast('الرجاء عدم تكرار نفس الرسالة.');
      return;
    }

    msgs.push({ id: generateId(), from: 'me', text: text, type: 'text', time: getTime() });
    msgInput.value = '';
    renderMessages();
  };

  // رفع مرفق بحد أقصى 5 ميجا (بمساحة صورة) وربط Modal الصور
  window.chooseAttachment = () => { if(currentChatUser) $('attachment-input').click(); };
  $('attachment-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // حد أقصى 5 ميجا بايت
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الملف كبير جداً، الحد الأقصى 5 ميجابايت.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const isImage = file.type.startsWith('image/');
      messages[currentChatUser.id].push({
        id: generateId(), from: 'me', type: isImage ? 'image' : 'file', text: file.name, content: event.target.result, time: getTime()
      });
      renderMessages();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  // تسجيل صوتي (ضغطة واحدة للبدء وأخرى للإنهاء، حد أقصى 5 دقائق)
  window.toggleVoiceRecording = async () => {
    const voiceBtn = $('voice-btn');
    
    if (isRecording) {
      mediaRecorder.stop();
      clearTimeout(recordTimeout);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => { if(e.data.size > 0) audioChunks.push(e.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioUrl = URL.createObjectURL(new Blob(audioChunks, { type: 'audio/webm' }));
        messages[currentChatUser.id].push({
          id: generateId(), from: 'me', type: 'audio', content: audioUrl, time: getTime()
        });
        renderMessages();
        isRecording = false;
        voiceBtn.style.color = "var(--text-muted)";
      };
      mediaRecorder.start();
      isRecording = true;
      voiceBtn.style.color = "#ef4444"; // لون أحمر أثناء التسجيل
      showToast('جاري التسجيل...');
      
      // إيقاف إجباري بعد 5 دقائق (300,000 ملي ثانية)
      recordTimeout = setTimeout(() => {
        if(isRecording) { showToast('تم الوصول للحد الأقصى (5 دقائق)'); mediaRecorder.stop(); }
      }, 300000);
      
    } catch (e) {
      showToast('لم يتم السماح باستخدام الميكروفون');
    }
  };

  // التحكم بالملف الشخصي
  window.openUserProfile = (user) => {
    $('profile-display-name').textContent = user.name;
    $('profile-display-bio').textContent = user.bio || 'لا توجد نبذة';
    $('profile-display-age').textContent = user.age || 'غير محدد';
    $('profile-display-gender').textContent = user.gender || 'غير محدد';
    $('profile-display-nationality').textContent = user.nationality || 'غير محدد';
    
    const avatar = $('profile-avatar');
    if (user.avatar) {
      avatar.style.background = `url("${user.avatar}") center / cover no-repeat`;
      avatar.textContent = '';
    } else {
      avatar.style.background = `linear-gradient(135deg, ${user.color}, ${user.color}dd)`;
      avatar.textContent = user.initials;
    }
    
    const isMe = user.id === 'me';
    $('profile-edit-btn').style.display = isMe ? 'block' : 'none';
    $('profile-avatar-edit').style.display = isMe ? 'flex' : 'none';
    $('profile-form').style.display = 'none';
    $('profile-details').style.display = 'block';
    profilePage.style.display = 'flex';
  };
  
  window.openMyProfile = () => { closeDrawer(); openUserProfile(myProfile); };
  window.closeProfile = () => profilePage.style.display = 'none';
  window.editMyProfile = () => {
    $('profile-details').style.display = 'none';
    $('profile-edit-btn').style.display = 'none';
    $('profile-form').style.display = 'flex';
    $('profile-name-input').value = myProfile.name;
    $('profile-bio-input').value = myProfile.bio;
    $('profile-age-input').value = myProfile.age;
    $('profile-gender-input').value = myProfile.gender;
  };
  window.cancelProfileEdit = () => {
    $('profile-form').style.display = 'none';
    $('profile-details').style.display = 'block';
    $('profile-edit-btn').style.display = 'block';
  };
  window.saveProfile = () => {
    myProfile.name = $('profile-name-input').value;
    myProfile.bio = $('profile-bio-input').value; // النبذة محدودة بـ 400 حرف بالـ HTML
    myProfile.age = $('profile-age-input').value; // العمر محدود بـ 100 بالـ HTML
    myProfile.gender = $('profile-gender-input').value;
    
    $('drawer-profile-name').textContent = myProfile.name;
    showToast('تم حفظ الملف الشخصي');
    openUserProfile(myProfile); // تحديث العرض
  };

  // تغيير الصورة الشخصية
  window.chooseProfileImage = () => $('profile-avatar-input').click();
  $('profile-avatar-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      myProfile.avatar = event.target.result;
      openUserProfile(myProfile); // تحديث صورة البروفايل
      
      // تحديث صورة القائمة الجانبية لتصبح احترافية ومطابقة
      const drawerAvatar = $('drawer-profile-avatar');
      drawerAvatar.style.background = `url("${myProfile.avatar}") center / cover no-repeat`;
      drawerAvatar.textContent = ''; 
    };
    reader.readAsDataURL(file);
  });

  // Modal الصور في الشات
  window.openImageModal = (src) => {
    $('img-modal-target').src = src;
    $('image-modal').style.display = 'flex';
  };

  // شكاوى واقتراحات
  window.sendComplaint = () => {
    const text = $('complaints-input').value.trim();
    if(text.length < 5) { showToast('الرجاء كتابة شكوى واضحة'); return; }
    showToast('تم حفظ الشكوى للإدارة بنجاح');
    $('complaints-input').value = '';
    closeDrawer();
  };
  
  // دوال فارغة لمنع الأخطاء أثناء التصفح السريع
  window.toggleChatMenu = () => {};
  window.openChatProfileFromMenu = () => {};
  window.blockCurrentUser = () => {};

  // تشغيل الواجهة
  renderUsers();
  updateMessagesBadge();

})();
