// Global stubs for sandbox compatibility
function sendMessage() { if(window._sendMessage) window._sendMessage(); }
function openChat(user) { if(window._openChat) window._openChat(user); }
function closeChat() { if(window._closeChat) window._closeChat(); }
function openDrawer() { if(window._openDrawer) window._openDrawer(); }
function closeDrawer() { if(window._closeDrawer) window._closeDrawer(); }
function openPrivateMessages() { if(window._openPrivateMessages) window._openPrivateMessages(); }
function closePrivateMessages() { if(window._closePrivateMessages) window._closePrivateMessages(); }
function renderUsers(filter) { if(window._renderUsers) window._renderUsers(filter); }
function openMyProfile() { if(window._openMyProfile) window._openMyProfile(); }
function closeProfile() { if(window._closeProfile) window._closeProfile(); }
function chooseProfileImage() { if(window._chooseProfileImage) window._chooseProfileImage(); }
function saveProfile() { if(window._saveProfile) window._saveProfile(); }
function editMyProfile() { if(window._editMyProfile) window._editMyProfile(); }
function cancelProfileEdit() { if(window._cancelProfileEdit) window._cancelProfileEdit(); }
function chooseAttachment() { if(window._chooseAttachment) window._chooseAttachment(); }
function toggleVoiceRecording() { if(window._toggleVoiceRecording) window._toggleVoiceRecording(); }
function openCountryPicker() { if(window._openCountryPicker) window._openCountryPicker(); }
function filterCountries(value) { if(window._filterCountries) window._filterCountries(value); }
function toggleCountryPicker(event) { if(window._toggleCountryPicker) window._toggleCountryPicker(event); }
function toggleChatMenu(event) { if(window._toggleChatMenu) window._toggleChatMenu(event); }
function openChatProfileFromMenu() { if(window._openChatProfileFromMenu) window._openChatProfileFromMenu(); }
function blockCurrentUser() { if(window._blockCurrentUser) window._blockCurrentUser(); }
function submitFeedback() { if(window._submitFeedback) window._submitFeedback(); }
function calculateAgeFromDOB(dobStr) { if(window._calculateAgeFromDOB) window._calculateAgeFromDOB(dobStr); }
function closeImageModal() { if(window._closeImageModal) window._closeImageModal(); }
function viewLargeAvatar() { if(window._viewLargeAvatar) window._viewLargeAvatar(); }
function openChatAvatarModal() { if(window._openChatAvatarModal) window._openChatAvatarModal(); }

(function() {
  'use strict';

  const bios = [
    'مطور تطبيقات وشغوف بالتقنية', 'مصمم جرافيك وفنان رقمي', 'كاتب محتوى ومترجم',
    'لاعب ألعاب محترف', 'مصور فوتوغرافي ومسافر', 'موسيقي ومحب للفنون',
    'قارئ نهم ومدون تقني', 'رائد أعمال طموح', 'شيف طبخ ورياضي'
  ];

  const replies = [
    { text: 'مرحباً! أهلاً بك في موف شات', delay: 800 },
    { text: 'هذا موضوع جميل ومثير للاهتمام!', delay: 1200 },
    { text: 'أتفق معك تماماً في هذه النقطة', delay: 1000 },
    { text: 'واو! تجربة رائعة حقاً', delay: 1400 },
    { text: 'هههههه سعدت بالتحدث معك', delay: 700 },
    { text: 'بالتأكيد، يسعدني مناقشة التفاصيل أكثر', delay: 1100 },
    { text: 'شكراً جزيلاً لك!', delay: 900 }
  ];

  const countryCodes = [
    'EG','SA','AE','MA','JO','TN','DZ','KW','QA','BH','OM','IQ','LB','SY','PS','LY','SD','YE'
  ];
  const countryNameFormatter = new Intl.DisplayNames(['ar'], { type: 'region' });
  const countries = countryCodes.map(code => ({
    code,
    name: countryNameFormatter.of(code) || code,
    flag: code.replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
  }));

  const demoCountries = ['EG', 'SA', 'AE', 'MA', 'JO', 'TN', 'DZ'];
  const demoAges = [28, 24, 31, 26, 29, 22, 27];

  let users = [
    { id: 1, name: 'أحمد علي', initials: 'أع', color: '#7c3aed', bio: bios[0], badge: 'vip', isOnline: true, msgCount: 0 },
    { id: 2, name: 'سارة محمد', initials: 'سم', color: '#c026d3', bio: bios[1], badge: null, isOnline: true, msgCount: 0 },
    { id: 3, name: 'محمد خالد', initials: 'مخ', color: '#9333ea', bio: bios[2], badge: 'new', isOnline: true, msgCount: 0 },
    { id: 4, name: 'ليلى أحمد', initials: 'لأ', color: '#6366f1', bio: bios[3], badge: null, isOnline: false, msgCount: 0 },
    { id: 5, name: 'عمر سامي', initials: 'عس', color: '#6d28d9', bio: bios[4], badge: 'vip', isOnline: true, msgCount: 0 },
    { id: 6, name: 'نور الدين', initials: 'ند', color: '#a855f7', bio: bios[5], badge: null, isOnline: false, msgCount: 0 },
    { id: 7, name: 'فاطمة يوسف', initials: 'في', color: '#8b5cf6', bio: bios[6], badge: 'new', isOnline: true, msgCount: 0 }
  ];

  users.forEach((user, index) => {
    user.age = demoAges[index % demoAges.length];
    user.countryCode = demoCountries[index % demoCountries.length];
    user.country = countries.find(country => country.code === user.countryCode) || countries[0];
    user.avatar = '';
  });

  const extraNames = ['خالد', 'ريم', 'علي', 'هند', 'ياسين', 'مريم', 'طارق', 'دنيا', 'حسن', 'آية', 'زياد', 'لمى'];
  const colors = ['#7c3aed', '#c026d3', '#9333ea', '#6366f1', '#6d28d9', '#a855f7', '#8b5cf6', '#ec4899'];

  let currentChatUser = null;
  let messages = {};
  let userIdCounter = 10;
  let isTyping = false;
  let profileTargetUser = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let recordTimer = null;
  let recordSeconds = 0;
  let blockedUsers = new Set();
  let selectedCountry = null;

  const myProfile = {
    id: 'me',
    name: 'أحمد محمد',
    initials: 'أم',
    color: '#7c3aed',
    bio: 'أهلاً بك في حسابي بـ MofChat',
    age: 28,
    dob: '1998-05-15',
    gender: 'ذكر',
    nationality: 'مصر',
    countryCode: 'EG',
    country: countries.find(c => c.code === 'EG'),
    avatar: ''
  };

  let privateMessagesData = [
    { id: 101, name: 'سارة محمد', initials: 'سم', color: '#c026d3', preview: 'مرحباً! كيف حالك اليوم؟', time: '10:30', unread: 2, isOnline: true },
    { id: 102, name: 'محمد خالد', initials: 'مخ', color: '#9333ea', preview: 'هل رأيت التحديث الجديد؟', time: '09:15', unread: 1, isOnline: true },
    { id: 103, name: 'عمر سامي', initials: 'عس', color: '#6d28d9', preview: 'شكراً جزيلاً على المساعدة!', time: 'أمس', unread: 0, isOnline: true },
    { id: 104, name: 'ليلى أحمد', initials: 'لأ', color: '#6366f1', preview: 'متى نلتقي غداً؟', time: 'أمس', unread: 0, isOnline: false }
  ];

  const $ = id => document.getElementById(id);
  const usersList = $('users-list');
  const chatView = $('chat-view');
  const chatUsername = $('chat-username');
  const chatAvatar = $('chat-avatar');
  const chatOnlineRing = $('chat-online-ring');
  const chatStatusText = $('chat-status-text');
  const chatStatus = $('chat-status');
  const messagesArea = $('messages-area');
  const msgInput = $('msg-input');
  const searchInput = $('search-input');
  const toast = $('toast');
  const toastText = $('toast-text');
  const drawerOverlay = $('drawer-overlay');
  const sideDrawer = $('side-drawer');
  const messagesBadge = $('messages-badge');
  const drawerUnreadBadge = $('drawer-unread-badge');
  const privateMessagesPage = $('private-messages-page');
  const privateMessagesList = $('private-messages-list');
  const privateUnreadText = $('private-unread-text');
  const profilePage = $('profile-page');
  const profileAvatar = $('profile-avatar');
  const profileAvatarInput = $('profile-avatar-input');
  const profileNameInput = $('profile-name-input');
  const profileBioInput = $('profile-bio-input');
  const profileDobInput = $('profile-dob-input');
  const profileAgeInput = $('profile-age-input');
  const profileGenderInput = $('profile-gender-input');
  const profileNationalityInput = $('profile-nationality-input');
  const profileDisplayName = $('profile-display-name');
  const profileDisplayBio = $('profile-display-bio');
  const profileDisplayAge = $('profile-display-age');
  const profileDisplayGender = $('profile-display-gender');
  const profileDisplayNationality = $('profile-display-nationality');
  const selectedCountryFlag = $('selected-country-flag');
  const countryOptions = $('country-options');
  const profileDetails = $('profile-details');
  const profileEditBtn = $('profile-edit-btn');
  const profileForm = $('profile-form');
  const profileAvatarEdit = $('profile-avatar-edit');
  const attachmentInput = $('attachment-input');
  const voiceBtn = $('voice-btn');
  const chatMoreMenu = $('chat-more-menu');
  const imageModal = $('image-modal');
  const imageModalImg = $('image-modal-img');

  function getCountry(value) {
    return countries.find(c => c.code === value) || countries.find(c => c.name === value) || null;
  }

  function renderCountryOptions(filter = '') {
    const normalized = filter.trim().toLowerCase();
    const filtered = countries.filter(c => !normalized || c.name.toLowerCase().includes(normalized) || c.code.toLowerCase().includes(normalized));
    countryOptions.innerHTML = filtered.map(c => `
      <button type="button" class="country-option" onclick="selectCountry('${c.code}')">
        <span class="country-option-flag">${c.flag}</span>
        <span>${c.name}</span>
      </button>
    `).join('') || '<div class="country-empty">لا توجد دولة بهذا الاسم</div>';
    countryOptions.classList.add('open');
  }

  window.selectCountry = function(code) {
    selectedCountry = getCountry(code);
    if (!selectedCountry) return;
    profileNationalityInput.value = selectedCountry.name;
    selectedCountryFlag.textContent = selectedCountry.flag;
    countryOptions.classList.remove('open');
  };

  window._openCountryPicker = () => renderCountryOptions(profileNationalityInput.value);
  window._filterCountries = (val) => {
    selectedCountry = null;
    selectedCountryFlag.textContent = '🌍';
    renderCountryOptions(val);
  };
  window._toggleCountryPicker = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (countryOptions.classList.contains('open')) countryOptions.classList.remove('open');
    else renderCountryOptions(profileNationalityInput.value);
  };

  function getTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  function showToast(text) {
    toastText.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function generateId() { return Date.now() + Math.random().toString(36).substr(2, 7); }

  window._openDrawer = () => {
    drawerOverlay.classList.add('active');
    sideDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window._closeDrawer = () => {
    drawerOverlay.classList.remove('active');
    sideDrawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  window._openPrivateMessages = () => {
    privateMessagesPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderPrivateMessages();
  };

  window._closePrivateMessages = () => {
    privateMessagesPage.style.display = 'none';
    document.body.style.overflow = '';
  };

  // Lightbox Image View Function
  function openImageModal(src) {
    if (!src) return;
    imageModalImg.src = src;
    imageModal.classList.add('active');
  }
  window._closeImageModal = () => { imageModal.classList.remove('active'); };

  window._viewLargeAvatar = () => {
    if (profileTargetUser && profileTargetUser.avatar) {
      openImageModal(profileTargetUser.avatar);
    }
  };

  window._openChatAvatarModal = () => {
    if (currentChatUser && currentChatUser.avatar) {
      openImageModal(currentChatUser.avatar);
    }
  };

  // Uniform Avatar Renderer
  function applyAvatarToElement(el, user) {
    if (!el) return;
    if (user.avatar) {
      el.style.backgroundImage = `url("${user.avatar}")`;
      el.style.backgroundColor = 'transparent';
      el.classList.add('has-image');
      el.textContent = '';
    } else {
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = user.color || '#7c3aed';
      el.classList.remove('has-image');
      el.textContent = user.initials || '';
    }
  }

  function renderProfile(user) {
    const pCountry = user.country || getCountry(user.countryCode) || getCountry(user.nationality);
    selectedCountry = pCountry;
    profileNameInput.value = user.name || '';
    profileBioInput.value = user.bio || '';
    profileDobInput.value = user.dob || '';
    profileAgeInput.value = user.age || '';
    profileGenderInput.value = user.gender || '';
    profileNationalityInput.value = pCountry ? pCountry.name : (user.nationality || '');
    selectedCountryFlag.textContent = pCountry ? pCountry.flag : '🌍';

    profileDisplayName.textContent = user.name || 'مستخدم';
    profileDisplayBio.textContent = user.bio || 'لا توجد نبذة شخصية';
    profileDisplayAge.textContent = user.age ? `${user.age} سنة` : 'غير محدد';
    profileDisplayGender.textContent = user.gender || 'غير محدد';
    profileDisplayNationality.textContent = pCountry ? `${pCountry.flag} ${pCountry.name}` : (user.nationality || 'غير محدد');

    const isMine = user.id === myProfile.id;
    profileEditBtn.style.display = isMine ? 'flex' : 'none';
    profileAvatarEdit.style.display = isMine ? 'flex' : 'none';
    profileForm.style.display = 'none';
    profileDetails.style.display = 'flex';

    applyAvatarToElement(profileAvatar, user);
  }

  window._calculateAgeFromDOB = (dobStr) => {
    if (!dobStr) return;
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

    if (age > 100) {
      showToast('الحد الأقصى للعمر المسموح هو 100 سنة');
      profileDobInput.value = '';
      profileAgeInput.value = '';
      return;
    }
    if (age < 5) {
      showToast('يرجى اختيار تاريخ ميلاد صحيح');
      profileDobInput.value = '';
      profileAgeInput.value = '';
      return;
    }
    profileAgeInput.value = age;
  };

  window._openUserProfile = (user) => {
    profileTargetUser = user;
    renderProfile(user);
    profilePage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window._openMyProfile = () => {
    window._closeDrawer();
    window._openUserProfile(myProfile);
  };

  window._closeProfile = () => {
    profilePage.style.display = 'none';
    profileTargetUser = null;
    document.body.style.overflow = '';
  };

  window._chooseProfileImage = () => {
    if (profileTargetUser && profileTargetUser.id === myProfile.id) profileAvatarInput.click();
  };

  window._editMyProfile = () => {
    if (!profileTargetUser || profileTargetUser.id !== myProfile.id) return;
    profileDetails.style.display = 'none';
    profileEditBtn.style.display = 'none';
    profileAvatarEdit.style.display = 'flex';
    profileForm.style.display = 'flex';
  };

  window._cancelProfileEdit = () => {
    if (!profileTargetUser) return;
    renderProfile(profileTargetUser);
  };

  profileAvatarInput.addEventListener('change', function() {
    const file = profileAvatarInput.files && profileAvatarInput.files[0];
    if (!file || !profileTargetUser) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('الحد الأقصى لحجم الصورة هو 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      profileTargetUser.avatar = reader.result;
      applyAvatarToElement(profileAvatar, profileTargetUser);
      if (profileTargetUser.id === myProfile.id) {
        applyAvatarToElement($('drawer-profile-avatar'), myProfile);
      }
    };
    reader.readAsDataURL(file);
  });

  window._saveProfile = () => {
    if (!profileTargetUser) return;
    const newName = profileNameInput.value.trim();
    if (!newName) { showToast('يرجى كتابة الاسم أولاً'); return; }

    profileTargetUser.name = newName;
    profileTargetUser.bio = profileBioInput.value.trim().slice(0, 400);
    profileTargetUser.dob = profileDobInput.value;
    profileTargetUser.age = profileAgeInput.value || profileTargetUser.age;
    profileTargetUser.gender = profileGenderInput.value;

    const chosenCountry = selectedCountry || getCountry(profileNationalityInput.value.trim());
    profileTargetUser.nationality = chosenCountry ? chosenCountry.name : '';
    profileTargetUser.countryCode = chosenCountry ? chosenCountry.code : '';
    profileTargetUser.country = chosenCountry || null;
    profileTargetUser.initials = newName.split(' ').map(n => n[0]).join('').slice(0, 3);

    if (profileTargetUser.id === myProfile.id) {
      $('drawer-profile-name-display').textContent = profileTargetUser.name;
      applyAvatarToElement($('drawer-profile-avatar'), myProfile);
      renderProfile(profileTargetUser);
    }
    window._renderUsers(searchInput.value);
    showToast('تم حفظ البيانات بنجاح');
  };

  // Feedback Submission
  window._submitFeedback = () => {
    const input = $('feedback-input');
    const text = input.value.trim();
    if (!text) { showToast('يرجى كتابة الشكوى أو الاقتراح أولاً'); return; }
    showToast('تم إرسال شكواك/اقتراحك بنجاح، شكراً لاهتمامك!');
    input.value = '';
    window._closeDrawer();
  };

  window._toggleChatMenu = (e) => { e.stopPropagation(); chatMoreMenu.classList.toggle('open'); };
  window._openChatProfileFromMenu = () => {
    chatMoreMenu.classList.remove('open');
    if (currentChatUser) window._openUserProfile(currentChatUser);
  };

  window._blockCurrentUser = () => {
    if (!currentChatUser) return;
    const blocked = currentChatUser;
    blockedUsers.add(blocked.id);
    users = users.filter(u => u.id !== blocked.id);
    chatMoreMenu.classList.remove('open');
    window._closeChat();
    showToast('تم حظر ' + blocked.name);
  };

  document.addEventListener('click', e => {
    if (!e.target.closest('.chat-header-actions')) chatMoreMenu.classList.remove('open');
    if (!e.target.closest('.profile-field')) countryOptions.classList.remove('open');
  });

  // Attachment (Max 5MB)
  window._chooseAttachment = () => { if (currentChatUser) attachmentInput.click(); };

  attachmentInput.addEventListener('change', function() {
    const file = attachmentInput.files && attachmentInput.files[0];
    if (!file || !currentChatUser) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('عفواً، الحد الأقصى لحجم الصورة هو 5 ميجابايت');
      attachmentInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      addMessageToChat(currentChatUser.id, {
        id: generateId(),
        from: 'me',
        text: 'صورة مرفقة',
        mediaUrl: reader.result,
        time: getTime(),
        type: 'image'
      });
      renderMessages();
      showToast('تم إرسال الصورة بنجاح');
      attachmentInput.value = '';
    };
    reader.readAsDataURL(file);
  });

  // Voice Recording (Single Click Toggle, Max 5 mins)
  window._toggleVoiceRecording = async () => {
    if (!currentChatUser) return;

    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      showToast('التسجيل الصوتي غير مدعوم على هذا المتصفح');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      recordSeconds = 0;

      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(recordTimer);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        addMessageToChat(currentChatUser.id, {
          id: generateId(),
          from: 'me',
          text: `تسجيل صوتي (${Math.floor(recordSeconds / 60)}:${(recordSeconds % 60).toString().padStart(2, '0')})`,
          audioUrl,
          time: getTime(),
          type: 'audio'
        });
        renderMessages();
        showToast('تم إرسال التسجيل الصوتي');
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.title = 'تسجيل صوتي (نقرة واحدة)';
      };

      mediaRecorder.start();
      isRecording = true;
      voiceBtn.classList.add('recording');
      showToast('جاري التسجيل... اضغط مرة أخرى للإرسال');

      recordTimer = setInterval(() => {
        recordSeconds++;
        voiceBtn.title = `جاري التسجيل (${recordSeconds}s) - اضغط للإيقاف`;
        if (recordSeconds >= 300) { // 5 minutes limit
          stopVoiceRecording();
          showToast('تم الوصول للحد الأقصى للتسجيل (5 دقائق)');
        }
      }, 1000);

    } catch (err) {
      isRecording = false;
      showToast('لم يتم السماح باستخدام الميكروفون');
    }
  };

  function stopVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  // Manage Messages Limit (35 messages total, Max 10 Media/Voice unblurred)
  function addMessageToChat(userId, msgObj) {
    if (!messages[userId]) messages[userId] = [];
    messages[userId].push(msgObj);

    // Retain latest 35 messages only
    if (messages[userId].length > 35) {
      messages[userId] = messages[userId].slice(-35);
    }

    // Apply Media & Voice blur/memory optimization (Keep latest 10 unblurred)
    const mediaMsgs = messages[userId].filter(m => m.type === 'image' || m.type === 'audio');
    if (mediaMsgs.length > 10) {
      const oldestToPurge = mediaMsgs.slice(0, mediaMsgs.length - 10);
      oldestToPurge.forEach(m => {
        m.isPurged = true;
        m.mediaUrl = null;
        m.audioUrl = null;
      });
    }
  }

  function renderPrivateMessages() {
    privateMessagesList.innerHTML = '';
    let totalUnread = 0;

    if (privateMessagesData.length === 0) {
      privateMessagesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">لا توجد رسائل</div>
          <div class="empty-desc">ابدأ محادثة جديدة مع المستخدمين المتصلين</div>
        </div>
      `;
      updateUnreadBadges(0);
      return;
    }

    privateMessagesData.forEach((msg, i) => {
      totalUnread += (msg.unread || 0);
      const card = document.createElement('div');
      card.className = 'private-msg-card';
      card.style.animationDelay = (i * 0.05) + 's';

      const unreadBadge = msg.unread > 0 ? `<span class="private-msg-unread">${msg.unread}</span>` : '';
      const onlineDot = msg.isOnline ? `<span class="private-online-dot"></span>` : '';

      card.innerHTML = `
        <div class="private-msg-avatar-wrap">
          <div class="private-msg-avatar avatar-render" id="p-avatar-${msg.id}"></div>
          ${onlineDot}
        </div>
        <div class="private-msg-info">
          <div class="private-msg-name">${msg.name}</div>
          <div class="private-msg-preview">${msg.preview}</div>
        </div>
        <div class="private-msg-meta">
          <span class="private-msg-time">${msg.time}</span>
          ${unreadBadge}
        </div>
      `;

      const avatarEl = card.querySelector(`#p-avatar-${msg.id}`);
      applyAvatarToElement(avatarEl, msg);

      avatarEl.addEventListener('click', (e) => {
        e.stopPropagation();
        let u = users.find(x => x.name === msg.name) || msg;
        window._openUserProfile(u);
      });

      card.addEventListener('click', () => {
        let u = users.find(x => x.name === msg.name);
        if (!u) {
          u = { id: userIdCounter++, name: msg.name, initials: msg.initials, color: msg.color, bio: bios[0], isOnline: msg.isOnline, age: 25, country: countries[0] };
          users.push(u);
        }
        closePrivateMessages();
        openChat(u);
        msg.unread = 0;
        renderPrivateMessages();
      });

      privateMessagesList.appendChild(card);
    });

    updateUnreadBadges(totalUnread);
  }

  function updateUnreadBadges(count) {
    if (count > 0) {
      messagesBadge.textContent = count;
      messagesBadge.style.display = 'flex';
      drawerUnreadBadge.textContent = count;
      drawerUnreadBadge.style.display = 'inline-block';
      privateUnreadText.textContent = `${count} رسائل جديدة غير مقروءة`;
    } else {
      messagesBadge.style.display = 'none';
      drawerUnreadBadge.style.display = 'none';
      privateUnreadText.textContent = 'جميع الرسائل مقروءة';
    }
  }

  window._renderUsers = (filter = '') => {
    const filtered = users.filter(u => !blockedUsers.has(u.id) && u.name.includes(filter));
    $('stat-users').textContent = filtered.length;

    if (filtered.length === 0) {
      usersList.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">لا يوجد مستخدمون</div>
          <div class="empty-desc">جرب بحثاً آخر أو انتظر انضمام أصدقاء جدد</div>
        </div>
      `;
      return;
    }

    usersList.innerHTML = '';
    filtered.forEach((u, i) => {
      const card = document.createElement('div');
      card.className = 'user-card';
      card.style.animationDelay = (i * 0.05) + 's';

      const badgeHtml = u.badge ? `<span class="user-badge badge-${u.badge}">${u.badge === 'vip' ? 'VIP' : 'جديد'}</span>` : '';
      const onlineClass = u.isOnline ? 'online-dot' : 'offline-dot';

      card.innerHTML = `
        <div class="user-avatar-wrap">
          <div class="user-avatar avatar-render" id="u-avatar-${u.id}"></div>
          <span class="user-status-dot ${onlineClass}"></span>
        </div>
        <div class="user-info">
          <div class="user-name-row">
            <span class="user-name">${u.name}</span>
            ${badgeHtml}
          </div>
          <div class="user-meta">
            <span class="meta-item">${u.age || '—'} سنة</span>
            <span class="meta-item">${u.country ? u.country.flag : '🌍'} ${u.country ? u.country.name : 'غير محدد'}</span>
          </div>
        </div>
        <div class="user-action" title="بدء المحادثة">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
        </div>
      `;

      const avatarEl = card.querySelector(`#u-avatar-${u.id}`);
      applyAvatarToElement(avatarEl, u);

      avatarEl.addEventListener('click', (e) => {
        e.stopPropagation();
        window._openUserProfile(u);
      });

      card.addEventListener('click', () => openChat(u));
      usersList.appendChild(card);
    });
  };

  window._openChat = (user) => {
    currentChatUser = user;
    chatUsername.textContent = user.name;
    applyAvatarToElement(chatAvatar, user);

    if (user.isOnline) {
      chatOnlineRing.style.display = 'block';
      chatStatusText.textContent = 'متصل الآن';
    } else {
      chatOnlineRing.style.display = 'none';
      chatStatusText.textContent = 'غير متصل';
    }

    if (!messages[user.id]) {
      messages[user.id] = [];
      addMessageToChat(user.id, {
        id: generateId(),
        from: 'them',
        text: 'مرحباً بك! سعيد جداً بالتواصل معك عبر MofChat',
        time: getTime(),
        type: 'text'
      });
    }

    renderMessages();
    chatView.style.display = 'flex';
    msgInput.focus();
  };

  window._closeChat = () => {
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

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble ' + (msg.from === 'me' ? 'sent' : 'received');

      let content = '';
      if (msg.isPurged) {
        content = `<div class="purged-media">📁 وسائط قديمة (تم حذف المساحة للحفاظ على الأداء)</div>`;
      } else if (msg.type === 'image' && msg.mediaUrl) {
        content = `<div class="chat-img-wrap" onclick="openImageModal('${msg.mediaUrl}')"><img src="${msg.mediaUrl}" alt="صورة مرفقة" class="chat-rendered-img"></div>`;
      } else if (msg.type === 'audio' && msg.audioUrl) {
        content = `<div class="audio-message"><span>🎙️ ${msg.text}</span><audio controls src="${msg.audioUrl}"></audio></div>`;
      } else {
        content = (msg.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
      }

      bubble.innerHTML = `${content}<div class="msg-time">${msg.time}</div>`;
      wrapper.appendChild(bubble);
      messagesArea.appendChild(wrapper);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    chatStatusText.textContent = 'يكتب الآن...';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function hideTyping() {
    isTyping = false;
    chatStatusText.textContent = currentChatUser && currentChatUser.isOnline ? 'متصل الآن' : 'غير متصل';
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  window._sendMessage = () => {
    const text = msgInput.value.trim();
    if (!text || !currentChatUser) return;

    // Check Duplicate Messages
    const userMsgs = messages[currentChatUser.id] || [];
    const lastMsg = userMsgs[userMsgs.length - 1];
    if (lastMsg && lastMsg.from === 'me' && lastMsg.text === text) {
      showToast('تم منع إرسال الرسالة المكررة');
      return;
    }

    addMessageToChat(currentChatUser.id, {
      id: generateId(),
      from: 'me',
      text: text,
      time: getTime(),
      type: 'text'
    });

    msgInput.value = '';
    renderMessages();

    // Simulated Bot Reply
    const reply = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        if (currentChatUser) {
          addMessageToChat(currentChatUser.id, {
            id: generateId(),
            from: 'them',
            text: reply.text,
            time: getTime(),
            type: 'text'
          });
          renderMessages();
        }
      }, 1500);
    }, reply.delay);
  };

  // Initializations
  applyAvatarToElement($('drawer-profile-avatar'), myProfile);
  renderUsers();
  renderPrivateMessages();

})();
