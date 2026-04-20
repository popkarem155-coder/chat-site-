(() => {
  "use strict";

  const KEYS = {
    الحسابات: 'kareem3_accounts',
    الرسائل_العامة: 'kareem3_publicMessages',
    privateThreads: 'kareem3_privateThreads',
    الجلسة_الحالية: 'kareem3_currentSession',
    guestSeed: 'kareem3_guestSeed',
  };

  const CONFIG = {
    SESSION_TTL_MS: 24 * 60 * 60 * 1000,
    ONLINE_WINDOW_MS: 15 * 60 * 1000,
    FEATURED_WINDOW_MS: 2 * 60 * 60 * 1000,
    PUBLIC_MESSAGE_CAP: 70,
    MAX_NOTIFICATIONS: 20,
    TOAST_MS: 2400,
    MAX_NAME_LENGTH: 40,
  };

  const state = {
    الحسابات: [],
    الرسائل_العامة: [],
    privateThreads: {},
    currentAccountId: null,
    selectedPrivatePeerId: null,
    selectedUserId: null,
    pendingAction: null,
    monitorPanelEl: null,
    toastHostEl: null,
    activitySaveTimer: null,
    intervalTimer: null,
    view: 'الرئيسية',
    searchQuery: '',
    externalDB: null,
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function now() {
    return new Date();
  }

  function safeJSONParse(value, fallback) {
    try {
      if (!value) return fallback;
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function safeJSONStringify(value, fallback = '{}') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  function normalizeText(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ');
  }

  function clampText(value, max = CONFIG.MAX_NAME_LENGTH) {
    return normalizeText(value).slice(0, max);
  }

  function createId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function hashString(str) {
    let h = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function colorFromText(text) {
    const h = hashString(text) % 360;
    return `hsl(${h} 35% 28%)`;
  }

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }


  function timeAgo(ts)
    const diff = Math.max(0, now() - Number(ts || 0));
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    إذا (فرق < دقيقة) تُرجع 'ظ…ظ†ط° ظ„طط¸ط§طھ'؛
    إذا (فرق < ساعة) العودة `ظ…ظ†ط° ${Math.floor(diff / moment)} ط¯ظ‚ظٹظ‚ط©`;
    إذا كان (الفرق < اليوم) أرجع `ظ…ظ†ط° ${Math.floor(الفرق / الساعة)} ط³ط§ط¹ط©`;
    return `ظ…ظ†ط° ${Math.floor(diff / day)} ظٹظˆظ…`;
  }

  دالة تسمية المدة (مللي ثانية) {
    const totalMinutes = Math.floor(Math.max(0, ms) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    إذا كانت (الساعات <= 0) تُرجع `ظ†ط´ط· ظ…ظ†ط° ${دقائق} ط¯ظ‚ظٹظ‚ط©`;
    إذا كانت (الدقائق <= 0) تُرجع `ظ†ط´ط· ظ…ظ†ط° ${hours} ط³ط§ط¹ط©`;
    return `ظ†ط´ط· ظ…ظ†ط° ${hours} ط³ط§ط¹ط© ظˆ${دقائق} ط¯ظ‚ظٹظ‚ط©`;
  }

  function getAccounts() {
    return Array.isArray(state.accounts) ? state.accounts : [];
  }

  function getAccountById(id) {
    return getAccounts().find((acc) => acc.id === id) || null;
  }

  function getAccountByUsername(اسم المستخدم) {
    const key = normalizeText(username).toLowerCase();
    إذا لم يكن المفتاح موجودًا، فأرجع قيمة فارغة.
    return getAccounts().find((acc) => normalizeText(acc.username).toLowerCase() === key) || null;
  }

  function getDisplayName(account) {
    إذا قام (!الحساب) بإرجاع 'ظ…ط³طھط®ط¯ظ…';
    const name = clampText(account.profile?.name || account.username || 'ظ…ط³طھط®ط¯ظ…', 40);
    اسم الإرجاع || 'ظ…ط³طھط®ط¯ظ…';
  }

  function getAvatarInitial(account) {
    const name = getDisplayName(account);
    اسم العودة؟ name[0] : 'طں';
  }

  function getCurrentSession() {
    return safeJSONParse(localStorage.getItem(KEYS.currentSession), null);
  }

  function isSessionExpired(session) {
    إذا لم تكن هناك جلسة أو لم تكن الجلسة تنتهي صلاحيتها، فسيتم إرجاع القيمة true.
    return now() > Number(session.expiresAt);
  }

  function getCurrentAccount() {
    إذا لم يكن (state.currentAccountId) موجودًا، فسيتم إرجاع قيمة فارغة (null).
    return getAccountById(state.currentAccountId);
  }

  function isCurrentAccountOnline() {
    const acc = getCurrentAccount();
    إذا لم يكن الحساب موجودًا، فأرجع خطأ.
    const session = getCurrentSession();
    إذا لم تكن هناك جلسة أو كان معرف الحساب الخاص بالجلسة لا يساوي معرف الحساب، فسيتم إرجاع خطأ.
    إذا كانت الجلسة منتهية الصلاحية (isSessionExpired(session))، فسيتم إرجاع خطأ (false).
    const lastSeen = Number(acc.lastSeenAt || 0);
    return now() - lastSeen <= CONFIG.ONLINE_WINDOW_MS;
  }

  function isCurrentAccountFeatured() {
    const acc = getCurrentAccount();
    إذا لم يكن الحساب موجودًا، فأرجع خطأ.
    إذا لم يكن الحساب الحالي متصلاً بالإنترنت، فسيتم إرجاع القيمة false.
    const session = getCurrentSession();
    const startedAt = Number(session?.startedAt || 0);
    const total = Number(acc.totalActiveMs || 0) + Math.max(0, now() - startedAt);
    إرجاع المجموع >= CONFIG.FEATURED_WINDOW_MS;
  }

  function getActiveDurationForAccount(acc) {
    إذا لم يكن الحساب صحيحًا، فأرجع 0.
    const session = getCurrentSession();
    إذا كانت الجلسة موجودة وكان معرف الحساب الخاص بها يساوي معرف الحساب ولم تكن الجلسة منتهية الصلاحية،
      أعد القيمة العددية (acc.totalActiveMs || 0) + Math.max(0, now() - Number(session.startedAt || now()));
    }
    أرجع الرقم (acc.totalActiveMs || 0)؛
  }

  function setAvatar(el, account, fallbackLabel = 'طں') {
    إذا لم يكن العنصر موجودًا، فقم بالخروج.
    const initial = account ? getAvatarInitial(account) : fallbackLabel;
    const avatarUrl = account?.profile?.avatar || '';

    el.textContent = initial;
    el.style.backgroundImage = '';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundColor = colorFromText(account?.username || fallbackLabel);
    el.style.color = '';

    إذا كان (avatarUrl) {
      el.style.backgroundImage = `url("${avatarUrl}")`);
      el.textContent = '';
      el.style.backgroundColor = '#222';
    }
  }

  دالة قراءة وحدة التخزين() {
    state.accounts = safeJSONParse(localStorage.getItem(KEYS.accounts), []);
    state.publicMessages = safeJSONParse(localStorage.getItem(KEYS.publicMessages), []);
    state.privateThreads = safeJSONParse(localStorage.getItem(KEYS.privateThreads), {});
  }

  دالة كتابة التخزين() {
    يحاول {
      localStorage.setItem(KEYS.accounts, safeJSONStringify(state.accounts, '[]'));
      localStorage.setItem(KEYS.publicMessages, safeJSONStringify(state.publicMessages, '[]'));
      localStorage.setItem(KEYS.privateThreads, safeJSONStringify(state.privateThreads, '{}'));
      إذا كان (state.currentAccountId) {
        const acc = getCurrentAccount();
        إذا (acc) {
          localStorage.setItem(
            KEYS.currentSession,
            safeJSONStringify({
              معرّف الحساب: state.currentAccountId،
              بدأ في: acc.sessionStartedAt || الآن()،
              expiresAt: acc.sessionExpiresAt || (now() + CONFIG.SESSION_TTL_MS),
            }, '{}')
          );
        }
      } آخر {
        localStorage.removeItem(KEYS.currentSession);
      }
    } catch (err) {
      showToast('طھط¹ط°ط± طظپط¸ ط§ظ„ط¨ظٹط§ظ†ط§طھ. طھط £ظƒط¯ ط £ظ† ظ…ط³ط§طط© ط§ظ„طھط®ط²ظٹظ† ظ…طھط§طط©.');
      console.error(err);
    }
  }

  function prunePublicMessages() {
    إذا لم تكن `state.publicMessages` مصفوفة، فسيتم تعيينها إلى `[]`.
    إذا كان طول الرسائل العامة في الحالة أكبر من الحد الأقصى المسموح به للرسائل العامة في الإعدادات {
      state.publicMessages = state.publicMessages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
    }
  }

  function pruneNotifications(acc) {
    إذا لم يكن الحساب موجودًا، فقم بالخروج.
    إذا لم تكن `acc.notifications` مصفوفة، فسيتم تعيينها إلى `[]`.
    إذا كان عدد الإشعارات في الحساب أكبر من الحد الأقصى للإشعارات المحددة في الإعدادات {
      acc.notifications = acc.notifications.slice(-CONFIG.NOTIFICATION_CAP);
    }
  }

  function normalizeThread(thread) {
    إذا لم يكن هناك خيط (thread) أو كان نوع الخيط (thread) ليس كائنًا (object)، فسيتم إرجاع قيمة فارغة (null).
    const messages = Array.isArray(thread.messages) ? thread.messages : [];
    يعود {
      المشاركون: Array.isArray(thread.participants) ? thread.participants : [],
      رسائل،
      تم التحديث في: رقم (thread.updatedAt || 0)،
    };
  }

  function prunePrivateThreads() {
    const cleaned = {};
    Object.entries(state.privateThreads || {}).forEach(([key, thread]) => {
      const t = normalizeThread(thread);
      إذا لم يكن t مصفوفة أو لم تكن t.participants مصفوفة أو كان طول t.participants أقل من 2، فقم بالخروج.
      t.messages = Array.isArray(t.messages) ? t.messages : [];
      إذا كان عدد الرسائل أكبر من الحد الأقصى المسموح به للرسائل العامة (CONFIG.PUBLIC_MESSAGE_CAP) {
        t.messages = t.messages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
      }
      cleaned[key] = t;
    });
    state.privateThreads = cleaned;
  }

  function getThreadKey(a, b) {
    return [a, b].sort().join('__');
  }

  function getThread(a, b, createIfMissing = false) {
    إذا لم يكن (أ || لم يكن ب) فأرجع قيمة فارغة؛
    const key = getThreadKey(a, b);
    let thread = normalizeThread(state.privateThreads[key]);

    إذا لم يكن هناك خيط (thread) وتم إنشاء الدالة إذا كانت مفقودة (createIfMissing) {
      الخيط = {
        المشاركون: [أ، ب]،
        رسائل: []،
        تم التحديث في: الآن()،
      };
      state.privateThreads[key] = thread;
      أعد الخيط؛
    }

    إذا لم يكن هناك خيط، فأرجع قيمة فارغة.
    state.privateThreads[key] = thread;
    أعد الخيط؛
  }

  function seedGuestAccount() {
    const guestSeed = safeJSONParse(localStorage.getItem(KEYS.guestSeed), null) || {
      المعرّف: makeId('acc'),
      تم الإنشاء في: الآن()،
    };

    يحاول {
      localStorage.setItem(KEYS.guestSeed, safeJSONStringify(guestSeed, '{}'));
    } يمسك {
      /* يتجاهل */
    }

    const existing = getAccountById(guestSeed.id);
    إذا (كان موجودًا) فأرجع الموجود؛

    const guest = {
      المعرّف: guestSeed.id،
      اسم المستخدم: 'ط²ط§ط¦ط±',
      كلمة المرور: ''،
      تاريخ الإنشاء: guestSeed.createdAt،
      lastSeenAt: now(),
      totalActiveMs: 0,
      sessionStartedAt: now(),
      sessionExpiresAt: now() + CONFIG.SESSION_TTL_MS,
      حساب تعريفي: {
        الاسم: 'ط²ط§ط¦ط±',
        عمر: ''،
        جنس: ''،
        جنسية: ''،
        السيرة الذاتية: 'طط³ط§ط¨ ط§ظپطھط±ط§ط¶ظٹ ظ‹ظ‹طھط¬ط±ط¨ط©.',
        الصورة الرمزية: '',
      },
      إشعارات: []،
      isDemo: true,
    };

    state.accounts.push(guest);
    حذف الإشعارات (الضيف)؛
    ضيف عائد؛
  }

  دالة تضمن الحساب الحالي() {
    const session = getCurrentSession();
    إذا كانت الجلسة موجودة وكان معرف الحساب الخاص بها موجودًا،
      const acc = getAccountById(session.accountId);
      إذا كان الحساب موجودًا ولم تنتهِ صلاحية الجلسة، {
        state.currentAccountId = acc.id;
        acc.sessionStartedAt = Number(session.startedAt || now());
        acc.sessionExpiresAt = Number(session.expiresAt || (now() + CONFIG.SESSION_TTL_MS));
        acc.lastSeenAt = acc.lastSeenAt || now();
        إرجاع الحساب؛
      }
    }

    const guest = seedGuestAccount();
    state.currentAccountId = guest.id;
    localStorage.setItem(
      KEYS.currentSession,
      safeJSONStringify({
        معرّف الحساب: guest.id،
        بدأ في: الآن()،
        expiresAt: now() + CONFIG.SESSION_TTL_MS,
      }, '{}')
    );
    ضيف عائد؛
  }

  دالة إنشاء حساب (اسم المستخدم، كلمة المرور = '') {
    const name = clampText(username, CONFIG.MAX_NAME_LENGTH);
    const pass = String(password || '').trim();
    const existing = getAccountByUsername(name);
    إذا (كان موجودًا) فأرجع الموجود؛

    const account = {
      المعرّف: makeId('acc'),
      اسم المستخدم: الاسم،
      كلمة المرور: كلمة المرور،
      تم الإنشاء في: الآن()،
      lastSeenAt: now(),
      totalActiveMs: 0,
      sessionStartedAt: now(),
      sessionExpiresAt: now() + CONFIG.SESSION_TTL_MS,
      حساب تعريفي: {
        اسم،
        عمر: ''،
        جنس: ''،
        جنسية: ''،
        السيرة الذاتية: '',
        الصورة الرمزية: '',
      },
      إشعارات: []،
      isDemo: false,
    };

    state.accounts.push(account);
    حذف الإشعارات (الحساب)؛
    إعادة الحساب؛
  }

  دالة تسجيل الدخول إلى الحساب (الحساب) {
    إذا لم يكن هناك حساب، فقم بالخروج؛

    const startedAt = now();
    account.lastSeenAt = startedAt;
    account.sessionStartedAt = startedAt;
    account.sessionExpiresAt = startedAt + CONFIG.SESSION_TTL_MS;
    state.currentAccountId = account.id;

    localStorage.setItem(
      KEYS.currentSession,
      safeJSONStringify({
        معرّف الحساب: account.id،
        بدأ في،
        تنتهي صلاحيات الجلسة في: account.sessionExpiresAt,
      }, '{}')
    );

    writeStorage();
    استدعاء الكل();
    إذا كان (state.externalDB?.setUser) {
      state.externalDB.setUser({ id: account.id, name: getDisplayName(account) }).catch?.(() => {});
    }
  }

  دالة commitCurrentSession(force = false) {
    const acc = getCurrentAccount();
    إذا لم يكن الحساب {
      localStorage.removeItem(KEYS.currentSession);
      state.currentAccountId = null;
      يعود؛
    }

    const session = getCurrentSession();
    إذا لم تكن هناك جلسة، فقم بالخروج؛

    const duration = Math.max(0, now() - Number(session.startedAt || now()));
    إذا كانت (المدة > 0 || القوة) {
      acc.totalActiveMs = Number(acc.totalActiveMs || 0) + duration;
    }

    acc.lastSeenAt = now();
    acc.sessionStartedAt = null;
    acc.sessionExpiresAt = null;

    localStorage.removeItem(KEYS.currentSession);
    state.currentAccountId = null;
    writeStorage();
  }

  دالة تسجيل الخروج من الحساب الحالي (عرض الرسالة = صحيح) {
    const acc = getCurrentAccount();
    إذا لم يكن الحساب {
      state.currentAccountId = null;
      localStorage.removeItem(KEYS.currentSession);
      استدعاء الكل();
      يعود؛
    }

    commitCurrentSession(true);
    state.selectedPrivatePeerId = null;
    state.selectedUserId = null;

    if (showMessage) showToast('طھظ… طھط³ط¬ظٹظ‹ ط§ظ‹ط®ط±ظˆط¬.');
    استدعاء الكل();
  }

  function markActivity() {
    const acc = getCurrentAccount();
    const session = getCurrentSession();
    إذا لم يكن هناك حساب أو جلسة أو كان معرف الحساب في الجلسة لا يساوي معرف الحساب، فقم بالخروج.
    إذا كانت الجلسة منتهية الصلاحية {
      logoutCurrentAccount(false);
      showToast('ط§ظ†طھظ‡طھ ط§ظ„ط¬ظ„ط³ط©طŒ ط±ط¬ظ'ط¹ ط§ظ„طظˆط £ظ†ط´ط¦ طط³ط§ط¨ ط¬ط¯ظٹط¯.');
      يعود؛
    }

    acc.lastSeenAt = now();
    إذا كان (state.activitySaveTimer) موجودًا، فقم بالخروج؛
    state.activitySaveTimer = setTimeout(() => {
      state.activitySaveTimer = null;
      writeStorage();
      renderShellState();
    }, 900);
  }

  function canUseCurrentSession() {
    const acc = getCurrentAccount();
    const session = getCurrentSession();
    إذا لم يكن الحساب موجودًا أو لم تكن هناك جلسة، فسيتم إرجاع خطأ.
    إذا كان (session.accountId !== acc.id) فسيتم إرجاع خطأ؛
    إذا كانت الجلسة منتهية الصلاحية (isSessionExpired(session))، فسيتم إرجاع خطأ (false).
    أعد القيمة true؛
  }

  دالة تضمن المصادقة(الإجراء) {
    // ط§ظ„ظ†ط³ط®ط© ط§ظ„طط§ظ„ظٹط© ط¨ط¯ظˆظ† ط´ط§ط´ط© طھط³ط¬ظٹظ„ ط¯ط®ظˆظ„ ظ…ظ†ظپطμظ„ط©.
    // ظˆ ط§ططھط¬طھ ظ„ط§طظ‚ظ‹ط§طŒ ظٹظ…ظƒظ† طھظپط¹ظٹظ„ظ‡ط§ ظ…ظ† firebase/ظˆط§ط¬ظ‡ط© ظ…ط³طھظ‚ظ„ط©.
    state.pendingAction = action || null;
    أعد canUseCurrentSession();
  }

  دالة عرض رسالة التنبيه (الرسالة) {
    إذا لم تكن خاصية `toastHostEl` موجودة في الحالة، {
      state.toastHostEl = document.createElement('div');
      state.toastHostEl.id = 'toastHost';
      state.toastHostEl.className = 'toast-host';
      document.body.appendChild(state.toastHostEl);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    state.toastHostEl.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 220);
    }, CONFIG.TOAST_MS);
  }

  function getCurrentPublicMessages() {
    إذا كانت قيمة `state.publicMessages` مصفوفة، فسيتم إرجاعها إذا كانت `state.publicMessages` مصفوفة، وإلا فسيتم إرجاع مصفوفة فارغة.
  }

  function getThreadMessagesForPeer(peerId) {
    const current = getCurrentAccount();
    إذا لم يكن (الحالي || !معرف النظير) فأرجع [];
    const thread = getThread(current.id, peerId, false);
    أعد قيمة الخيط إذا كانت `thread.messages` مصفوفة، وإلا فأعد `[]`.
  }

  function getPrivateChatsForCurrentUser() {
    const current = getCurrentAccount();
    إذا لم يكن (current) فسيتم إرجاع [];

    return Object.entries(state.privateThreads || {})
      .map(([key, thread]) => {
        const t = normalizeThread(thread);
        إذا لم يكن t أو لم يكن t.participants مصفوفة، فسيتم إرجاع قيمة فارغة (null).
        إذا لم يكن t.participants.includes(current.id))، فسيتم إرجاع قيمة فارغة (null).
        const peerId = t.participants.find((id) => id !== current.id);
        const peer = getAccountById(peerId);
        const lastMessage = (t.messages || [])[t.messages.length - 1] || null;
        يعود {
          مفتاح،
          الموضوع: t،
          peerId,
          نظير،
          الرسالة الأخيرة،
          updatedAt: Number(t.updatedAt || (lastMessage?.at || 0)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  دالة إضافة رسالة عامة (نص، معرف المرسل = لا شيء، تسمية المرسل = لا شيء) {
    const message = {
      المعرّف: makeId('msg'),
      معرف المرسل،
      senderLabel: senderLabel || 'ظ…ط³طھط®ط¯ظ…',
      text: normalizeText(text),
      في: الآن()،
    };

    state.publicMessages.push(message);
    حذف الرسائل العامة();
    writeStorage();
    renderPublicMessages();
    renderShellState();
    إرجاع الرسالة؛
  }

  دالة إضافة رسالة خاصة (معرف النظير، النص، معرف المرسل = لا شيء، تسمية المرسل = لا شيء) {
    const current = getCurrentAccount();
    إذا لم يكن (الحالي || !معرف النظير) فأرجع قيمة فارغة؛

    const thread = getThread(current.id, peerId, true);
    إذا لم يكن هناك خيط، فأرجع قيمة فارغة.

    const message = {
      المعرّف: makeId('pmsg'),
      معرف المرسل،
      senderLabel: senderLabel || 'ظ…ط³طھط®ط¯ظ…',
      text: normalizeText(text),
      في: الآن()،
    };

    thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
    thread.messages.push(message);

    إذا كان عدد الرسائل في سلسلة الرسائل أكبر من الحد الأقصى المسموح به للرسائل العامة (CONFIG.PUBLIC_MESSAGE_CAP) {
      thread.messages = thread.messages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
    }

    thread.updatedAt = now();
    state.privateThreads[getThreadKey(current.id, peerId)] = thread;
    prunePrivateThreads();
    writeStorage();
    renderPrivateChatsList();
    renderPrivateConversation();
    renderShellState();
    إرجاع الرسالة؛
  }

  دالة إشعار عرض الملف الشخصي (معرف الحساب المستهدف، تسمية العارض، معرف العارض = لا شيء) {
    const target = getAccountById(targetAccountId);
    إذا لم يكن الهدف موجودًا، فقم بالخروج.
    إذا كان (viewerId && viewerId === targetAccountId) فارجع؛

    إذا لم تكن `target.notifications` مصفوفة، فسيتم تعيينها إلى `[]`.
    target.notifications.push({
      id: makeId('noti'),
      النوع: 'عرض الملف الشخصي'،
      معرف المشاهد،
      viewerLabel: normalizeText(viewerLabel) || 'ط²ط§ط¦ط±',
      في: الآن()،
      القراءة: خطأ،
    });

    حذف الإشعارات (الهدف)؛
    writeStorage();
  }

  function markCurrentNotificationsRead() {
    const acc = getCurrentAccount();
    إذا لم يكن الحساب موجودًا أو لم يكن مصفوفة من الإشعارات، فقم بالخروج.
    acc.notifications.forEach((n) => { n.read = true; });
    writeStorage();
    renderMonitorPanel();
    renderShellState();
  }

  function getUnreadNotificationCount() {
    const acc = getCurrentAccount();
    إذا لم يكن الحساب موجودًا أو لم يكن مصفوفة من نوع `acc.notifications`، فسيتم إرجاع القيمة 0.
    return acc.notifications.filter((n) => !n.read).length;
  }

  function getMonitorItems() {
    const acc = getCurrentAccount();
    إذا لم يكن الحساب موجودًا أو لم يكن مصفوفة، فسيتم إرجاع مصفوفة فارغة.
    return [...acc.notifications].sort((a, b) => Number(b.at) - Number(a.at));
  }

  function فتح المنزل() {
    state.selectedUserId = null;
    state.selectedPrivatePeerId = state.selectedPrivatePeerId || null;
    setView('home');
  }

  function إغلاق الدرج() {
    إذا لم يكن عنصر القائمة موجودًا، فقم بالخروج.
    els.menuDrawer.classList.add('is-hidden');
    els.menuDrawer.setAttribute('aria-hidden', 'true');
  }

  دالة فتح الدرج() {
    إذا لم يكن عنصر القائمة موجودًا، فقم بالخروج.
    els.menuDrawer.classList.remove('is-hidden');
    els.menuDrawer.setAttribute('aria-hidden', 'false');
  }

  دالة تبديل الدرج() {
    إذا لم يكن عنصر القائمة موجودًا، فقم بالخروج.
    if (els.menuDrawer.classList.contains('is-hidden')) openDrawer();
    وإلا أغلق الدرج.
  }

  function setView(viewName) {
    state.view = viewName;

    const sections = {
      الصفحة الرئيسية: els.homeView،
      الملف الشخصي: els.profileView،
      خاص: els.privateView،
      المستخدم: els.userView،
    };

    Object.entries(sections).forEach(([name, el]) => {
      إذا لم يكن العنصر موجودًا، فقم بالخروج.
      el.classList.toggle('is-hidden', name !== viewName);
    });

    إذا كان (els.app) els.app.dataset.view = viewName;
    closeDrawer();

if (viewName === 'home') {
  renderHomeView();
  els.publicMessageInput?.focus?.();

} else if (viewName === 'profile') {
  renderProfileView();
  els.profileName?.focus?.();

} else if (viewName === 'private') {
  renderPrivateChatsList();
  renderPrivateConversation();
  els.privateMessageInput?.focus?.();

} else if (viewName === 'user') {
  renderUserView();
}

  دالة فتح لوحة المراقبة() {
    إذا لم يكن بالإمكان استخدام الجلسة الحالية، فقم بالخروج.
    افتح الدرج();
    markCurrentNotificationsRead();
    renderMonitorPanel();
    إذا كان (state.monitorPanelEl) {
      state.monitorPanelEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  دالة فتح الملف الشخصي() {
    إذا لم يكن بالإمكان استخدام الجلسة الحالية، فقم بالخروج.
    state.selectedUserId = null;
    setView('profile');
  }

  دالة فتح ملف تعريف المستخدم بواسطة المعرف(معرف المستخدم) {
    إذا لم يكن (userId) موجودًا، فقم بالخروج؛
    const target = getAccountById(userId);
    إذا لم يكن الهدف موجودًا {
      showToast('ط§ظ„ظ…ط³طھط®ط¯ظ… ط؛ظٹط± ظ…ظˆط¬ظˆط¯.');
      يعود؛
    }

    const current = getCurrentAccount();
    const viewerLabel = current ? getDisplayName(current) : 'ط²ط§ط¦ط±';

    إذا كان (الحالي && معرف الحالي يساوي معرف الهدف) {
      فتح الملف الشخصي();
      يعود؛
    }

    state.selectedUserId = target.id;
    notifyProfileViewed(target.id, viewerLabel, current?.id || null);
    setView('user');
    renderUserView();
    renderMonitorPanel();
  }

  دالة فتح ملف تعريف الحساب بواسطة المعرف(معرف المستخدم) {
    فتح ملف تعريف المستخدم بواسطة المعرف(معرف المستخدم)؛
  }

  دالة فتح محادثة خاصة (معرف النظير، صامت = خطأ) {
    const peer = getAccountById(peerId);
    إذا لم يكن هناك نظير {
      if (!silent) showToast('ط§ظ„ط´ط®طµ ط¯ظ‡ ط;ظٹط± ظ…ظˆط¬ظˆط¯.');
      يعود؛
    }

    state.selectedPrivatePeerId = peer.id;
    state.selectedUserId = null;
    setView('private');
    renderPrivateConversation();
    renderPrivateChatsList();
    setTimeout(() => els.privateMessageInput?.focus?.(), 20);
  }

  دالة إرسال رسالة عامة (نص، صامت = خطأ) {
    const messageText = normalizeText(text);
    إذا لم يكن نص الرسالة موجودًا {
      if (!صامت) showToast('ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط £ظˆظ„ظ‹ط§.');
      أعد القيمة خطأ؛
    }

    const current = getCurrentAccount();
    إذا لم يكن (الحالي) {
      if (!صامت) showToast('ظ…ظپظٹط´ طط³ط§ط¨ ظ†ط´ط· ط§ظظ„ظٹظ‹ط§.');
      أعد القيمة خطأ؛
    }

    addPublicMessage(messageText, current.id, getDisplayName(current));
    markActivity();
    أعد القيمة true؛
  }

  دالة إرسال رسالة خاصة (معرف النظير، النص، صامت = خطأ) {
    const messageText = normalizeText(text);
    إذا لم يكن (peerId) {
      إذا لم يكن الوضع صامتًا، فسيتم عرض رسالة منبثقة ('ط§ط®طھط§ط± ط´ط®طµ ط§ظ„ط£ظˆظ„.');
      أعد القيمة خطأ؛
    }

    إذا لم يكن نص الرسالة موجودًا {
      if (!صامت) showToast('ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط £ظˆظ„ظ‹ط§.');
      أعد القيمة خطأ؛
    }

    const current = getCurrentAccount();
    const peer = getAccountById(peerId);

    إذا لم يكن (الحالي || النظير) {
      if (!صامت) showToast('طھط¹ط°ط± ط¥ط±ط³ط§ظ‹ ط§ظ‹ط±ط³ط§ظ‹ط©.');
      أعد القيمة خطأ؛
    }

    addPrivateMessage(peerId, messageText, current.id, getDisplayName(current));
    markActivity();
    أعد القيمة true؛
  }

  function renderShellState() {
    const current = getCurrentAccount();
    const online = isCurrentAccountOnline();
    const featured = isCurrentAccountFeatured();

    إذا كان (els.currentUserState) {
      إذا لم يكن (الحالي) {
        els.currentUserState.textContent = 'ط²ط§ط¦ط±';
      } else if (online) {
        els.currentUserState.textContent = `${getDisplayName(current)} â€¢ ظ…طھطμظ„ ط§ظ„ط¢ظ†`;
      } آخر {
        els.currentUserState.textContent = `${getDisplayName(current)} â€¢ ط;ظٹط± ظ†ط´ط·`;
      }
    }

    إذا كان (els.menuUserName) {
      els.menuUserName.textContent = الحالي؟ getDisplayName(current) : 'ظ…ظ„ظپظٹ ط§ظ„ط´ط®طμظٹ';
    }

    إذا كان (els.menuUserMeta) {
      els.menuUserMeta.textContent = current
        ؟ `ط§ط¶ط;ط· ظ„ظپطھط ط§ظ„ظ…ظ„ظپ ظˆطھط¹ط¯ظٹظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ â€¢ ${featured ? 'ظ…ط³طھط®ط¯ظ… ظ…ظ…ظٹط²' : 'طط³ط§ط¨ظƒ ط§ظ‹طط§ظ‹ظٹ'}`
        : 'ط³ظٹظڈظ†ط´ط £ طط³ط§ط¨ ط§ظپطھط±ط§ط¶ظٹ طھظ„ظ‚ط§ط¦ظٹظ‹ط§';
    }

    إذا كان (els.menuAvatar) {
      setAvatar(els.menuAvatar, current, current ? getAvatarInitial(current) : 'ط²');
    }

    إذا كان (els.profileMonitorCount) els.profileMonitorCount.textContent = String(getUnreadNotificationCount());
    إذا كان (els.drawerMonitorBadge) els.drawerMonitorBadge.textContent = String(getUnreadNotificationCount());

    إذا كان (els.publicMessageInput) {
      els.publicMessageInput.placeholder = current
        ؟ 'ط§ظƒطھط¨ ط±ط³ط§ظ‹طھظƒ ظپظٹ ط§ظ‹ط´ط§طھ ط§ظ‹ط¹ط§ظ……'
        : 'ط¬ظ‡ط² ط§ظ‹طط³ط§ط¨ ط £ظˆظ‹ظ‹ط§';
    }

    if (els.publicSendBtn) els.publicSendBtn.textContent = 'ط¥ط±ط³ط§ظ„';
    if (els.privateSendBtn) els.privateSendBtn.textContent = 'ط¥ط±ط³ط§ظ„';
  }

  دالة بناء عنصر الرسالة (الرسالة) {
    const sender = getAccountById(message.senderId);
    const senderName = NormalizeText(sender ? getDisplayName(sender) : message.senderLabel || 'ظ…ط³طھط®ط¯ظ…');

    const article = document.createElement('article');
    article.className = 'message-item';
    إذا كان (message.senderId && state.currentAccountId && message.senderId === state.currentAccountId) {
      article.classList.add('is-own');
    }

    const head = document.createElement('div');
    head.className = 'message-head';

    const avatar = document.createElement('button');
    avatar.type = 'button';
    avatar.className = 'message-avatar';
    setAvatar(avatar, sender, senderName ? senderName[0] : 'طں');
    avatar.title = `ظپطھط ظ…ظ„ظپ ${senderName}`;
    avatar.addEventListener('click', () => {
      إذا كان (message.senderId) افتح ملف تعريف الحساب بواسطة المعرف (message.senderId)؛
    });

    const metaWrap = document.createElement('div');
    metaWrap.className = 'message-meta-wrap';

    const senderBtn = document.createElement('button');
    senderBtn.type = 'button';
    senderBtn.className = 'message-sender';
    senderBtn.textContent = senderName;
    senderBtn.addEventListener('click', () => {
      إذا كان (message.senderId) افتح ملف تعريف الحساب بواسطة المعرف (message.senderId)؛
    });

    const time = document.createElement('time');
    time.className = 'message-time';
    time.dateTime = new Date(message.at).toISOString();
    time.textContent = formatClock(message.at);

    metaWrap.appendChild(senderBtn);
    metaWrap.appendChild(time);
    head.appendChild(avatar);
    head.appendChild(metaWrap);

    const body = document.createElement('p');
    body.className = 'message-text';
    body.textContent = message.text || '';

    article.appendChild(head);
    article.appendChild(body);
    إرجاع المقالة؛
  }

  function renderPublicMessages() {
    إذا لم تكن الرسائل العامة موجودة، فقم بالخروج.
    els.publicMessages.innerHTML = '';

    const messages = getCurrentPublicMessages();
    إذا لم تكن هناك رسائل، {
      const empty = document.createElement('div');
      empty.className = 'messages-placeholder';
      فارغ.textContent = 'ظ„ط³ظ‡ ظ…ط§ ظپظٹط´ ط±ط³ط§ط¦ظ„ ط¸ط§ظ‡ط±ط© ظ‡ظ†ط§.';
      els.publicMessages.appendChild(empty);
      يعود؛
    }

    messages.forEach((message) => {
      els.publicMessages.appendChild(buildMessageElement(message));
    });

    els.publicMessages.scrollTop = els.publicMessages.scrollHeight;
  }

  function renderOnlineUsers() {
    إذا لم تكن قائمة المستخدمين المتصلين (els.onlineUsersList) أو لم تكن فارغة (els.onlineUsersEmpty)، فقم بالخروج.

    const list = [];
    const current = getCurrentAccount();
    إذا كان الحساب الحالي متصلاً بالإنترنت، فسيتم إضافته إلى القائمة.

    els.onlineUsersList.innerHTML = '';
    إذا لم يكن طول القائمة {
      els.onlineUsersEmpty.classList.remove('is-hidden');
      يعود؛
    }

    els.onlineUsersEmpty.classList.add('is-hidden');
    list.forEach((acc) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'user-row';
      row.setAttribute('role', 'listitem');

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      setAvatar(avatar, acc, getAvatarInitial(acc));

      const info = document.createElement('div');
      info.className = 'user-row-info';

      const name = document.createElement('strong');
      name.textContent = getDisplayName(acc);

      const sub = document.createElement('span');
      sub.textContent = 'ظ…طھطμظ‹ ط§ظ‹ط™ظ†';

      info.appendChild(name);
      info.appendChild(sub);

      const badge = document.createElement('span');
      badge.className = 'online-badge';
      badge.textContent = 'â—ڈ';

      row.appendChild(avatar);
      row.appendChild(info);
      row.appendChild(badge);
      row.addEventListener('click', () => openAccountProfileById(acc.id));

      els.onlineUsersList.appendChild(row);
    });
  }

  function renderFeaturedUsers() {
    إذا لم تكن قائمة المستخدمين المميزين (els.featuredUsersList) فارغة أو لم تكن فارغة (els.featuredUsersEmpty)، فقم بالخروج.

    const list = [];
    const current = getCurrentAccount();
    إذا كان الحساب الحالي موجودًا وكان الحساب الحالي مميزًا، فسيتم إضافة الحساب الحالي إلى القائمة.

    els.featuredUsersList.innerHTML = '';
    إذا لم يكن طول القائمة {
      els.featuredUsersEmpty.classList.remove('is-hidden');
      يعود؛
    }

    els.featuredUsersEmpty.classList.add('is-hidden');
    list.forEach((acc) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'user-row featured-row';
      row.setAttribute('role', 'listitem');

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      setAvatar(avatar, acc, getAvatarInitial(acc));

      const info = document.createElement('div');
      info.className = 'user-row-info';

      const nameLine = document.createElement('div');
      nameLine.className = 'featured-name-line';

      const name = document.createElement('strong');
      name.textContent = getDisplayName(acc);

      const star = document.createElement('span');
      star.className = 'featured-badge';
      star.textContent = 'âگ';

      nameLine.appendChild(name);
      nameLine.appendChild(star);

      const sub = document.createElement('span');
      sub.textContent = DurationLabel(getActiveDurationForAccount(acc));

      info.appendChild(nameLine);
      info.appendChild(sub);
      row.appendChild(avatar);
      row.appendChild(info);
      row.addEventListener('click', () => openAccountProfileById(acc.id));

      els.featuredUsersList.appendChild(row);
    });
  }

  function renderHomeView() {
    renderShellState();
    renderPublicMessages();
    renderOnlineUsers();
    renderFeaturedUsers();
    renderPrivateChatsList();
    renderMonitorPanel();
    renderUserSearchResults();
  }

  function renderProfileView() {
    const current = getCurrentAccount();
    إذا لم يكن (الحالي) فارجع؛

    إذا كان (els.profileName) els.profileName.value = current.username || '';
    إذا كان (els.profilePassword) els.profilePassword.value = current.password || '';
    إذا كان (els.profileAge) els.profileAge.value = current.profile?.age || '';
    إذا كان (els.profileGender) els.profileGender.value = current.profile?.gender || '';
    إذا كانت (els.profileNationality) els.profileNationality.value = current.profile?.nationality || '';
    إذا كان (els.profileBio) els.profileBio.value = current.profile?.bio || '';

    إذا كان (els.profileAvatarPreview) setAvatar(els.profileAvatarPreview, current, getAvatarInitial(current));
    إذا كانت حالة الملف الشخصي متصلة بالإنترنت (els.profileOnlineState) {
      els.profileOnlineState.textContent = isCurrentAccountOnline() ؟ 'ظ…طھطμظ„ ط§ظ„ط™ظ†' : 'ط؛ظٹط± ظ†ط´ط·';
    }

    إذا كان (els.profileLastSeen) {
      els.profileLastSeen.textContent = current.lastSeenAt
        ? `${durationLabel(getActiveDurationForAccount(current))} â€¢ ط¢ط®ط± ط¸ظ‡ظˆط± ${timeAgo(current.lastSeenAt)}`
        : 'ظط§ ظٹظˆط¬ط¯ ظ†ط´ط§ط· ظ…ط³ط¬ظ„';
    }
  }

  function renderPrivateChatsList() {
    إذا لم تكن قائمة المحادثات الخاصة (els.privateChatsList) فارغة، فقم بالخروج.

    const current = getCurrentAccount();
    els.privateChatsList.innerHTML = '';

    إذا لم يكن (الحالي) {
      els.privateChatsEmpty.classList.remove('is-hidden');
      els.privateChatsEmpty.textContent = 'ظط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط· ط§ظظ„ظٹظ‹ط§.';
      يعود؛
    }

    const chats = getPrivateChatsForCurrentUser();
    إذا لم يكن عدد المحادثات {
      els.privateChatsEmpty.classList.remove('is-hidden');
      els.privateChatsEmpty.textContent = 'ظ„ط³ظ‡ ظ…ط§ ظƒظ„ظ…طھط´ طط¯ ظپظٹ ط§ظ„ط®ط§طμ.';
      يعود؛
    }

    els.privateChatsEmpty.classList.add('is-hidden');

    chats.forEach((item) => {
      const peer = item.peer;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'private-chat-item';
      إذا كان (state.selectedPrivatePeerId && state.selectedPrivatePeerId === item.peerId) {
        btn.classList.add('is-active');
      }

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      setAvatar(avatar, Peer, Peer ? getAvatarInitial(peer) : 'طں');

      const info = document.createElement('div');
      info.className = 'private-chat-item-info';

      const name = document.createElement('strong');
      name.textContent = النظير؟ getDisplayName(peer) : 'ظ…ط³طھط®ط¯ظ… ط؛ظٹط± ظ…ط¹ط±ظˆظپ';

      const preview = document.createElement('span');
      const lastMessage = item.lastMessage;
      Preview.textContent = lastMessage
        ؟ (lastMessage.senderId === current.id ? 'ط £ظ†طھ: ' : '') + (lastMessage.text || '')
        : 'ط§ط¨ط¯ط £ ط§ظ„ظ…ط§ط¯ط«ط©';

      info.appendChild(name);
      info.appendChild(preview);

      const time = document.createElement('time');
      time.className = 'private-chat-item-time';
      time.textContent = lastMessage؟ formatClock(lastMessage.at) : '';

      btn.appendChild(avatar);
      btn.appendChild(info);
      btn.appendChild(time);
      btn.addEventListener('click', () => {
        if (item.peerId) openPrivateChat(item.peerId, true);
      });

      els.privateChatsList.appendChild(btn);
    });
  }

  function renderPrivateConversation() {
    if (!els.privateMessages || !els.privateChatTitle || !els.privateChatMeta || !els.privateChatAvatar) return;

    const current = getCurrentAccount();
    const peer = getAccountById(state.selectedPrivatePeerId);

    إذا لم يكن (الحالي) {
      els.privateChatTitle.textContent = 'ط§ظ‹ط±ط³ط§ط¦ظ‹ط§ظ‹ط®ط§طط©';
      els.privateChatMeta.textContent = 'ظط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط·.';
      setAvatar(els.privateChatAvatar, null, 'طں');
      els.privateMessages.innerHTML = '';
      const placeholder = document.createElement('div');
      placeholder.className = 'messages-placeholder';
      placeholder.textContent = 'ظط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط· طط§ظظٹظ‹ط§.';
      els.privateMessages.appendChild(placeholder);
      if (els.privateMessageInput) els.privateMessageInput.placeholder = 'ظ„ط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط·';
      إذا كان (els.privateSendBtn) els.privateSendBtn.disabled = true;
      يعود؛
    }

    إذا لم يكن هناك نظير {
      els.privateChatTitle.textContent = 'ط§ط®طھط§ط± ط´ط®طµ ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط©';
      els.privateChatMeta.textContent = 'ظ‡ظ†ط§ ظ‡طھط¸ظ‡ط± ط§ظ„ظ…طط§ط¯ط«ط© ط§ظ„ظƒط§ظ…ظ„ط©.';
      setAvatar(els.privateChatAvatar, null, 'طں');
      els.privateMessages.innerHTML = '';
      const placeholder = document.createElement('div');
      placeholder.className = 'messages-placeholder';
      placeholder.textContent = 'ط§ط®طھط§ط± ط´ط®طμ ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ط £ظˆ ظ…ظ† ط§ظ„ط¨طط«.';
      els.privateMessages.appendChild(placeholder);
      if (els.privateMessageInput) els.privateMessageInput.placeholder = 'ط§ظƒطھط¨ ط±ط³ط§ظ„طھظƒ ط§ظ„ط®ط§طµط©...';
      إذا كان (els.privateSendBtn) els.privateSendBtn.disabled = true;
      يعود؛
    }

    els.privateChatTitle.textContent = getDisplayName(peer);
    els.privateChatMeta.textContent = Peer.lastSeenAt
      ? `${isCurrentAccountOnline() && state.selectedPrivatePeerId === peer.id ? 'ظ…طھط§ط' : 'ط¢ط®ط± ط¸ظ‡ظˆط±'} ${timeAgo(peer.lastSeenAt)}`
      : 'ظ…ط³طھط®ط¯ظ… ط¬ط¯ظٹط¯';

    setAvatar(els.privateChatAvatar, Peer, getAvatarInitial(peer));
    إذا كان (els.privateSendBtn) els.privateSendBtn.disabled = false;
    إذا (els.privateMessageInput) {
      els.privateMessageInput.placeholder = `ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط¥ظ„ظ‰ ${getDisplayName(peer)}...`;
    }

    const messages = getThreadMessagesForPeer(peer.id);
    els.privateMessages.innerHTML = '';

    إذا لم تكن هناك رسائل، {
      const placeholder = document.createElement('div');
      placeholder.className = 'messages-placeholder';
      placeholder.textContent = 'ظ…ط§ ظپظٹط´ ط±ط³ط§ط¦ظ„ ظ„ط³ظ‡.ط§ط¨ط¯ط £ ط £ظˆظ„ ط±ط³ط§ظ„ط©.';
      els.privateMessages.appendChild(placeholder);
      يعود؛
    }

    messages.forEach((message) => {
      els.privateMessages.appendChild(buildMessageElement(message));
    });

    els.privateMessages.scrollTop = els.privateMessages.scrollHeight;
  }

  function renderUserView() {
    const target = getAccountById(state.selectedUserId);
    إذا لم يكن الهدف موجودًا {
      if (els.userViewTitle) els.userViewTitle.textContent = 'ظ…ظ„ظپ ط§ظ„ظ…ط³طھط®ط¯ظ…';
      if (els.userViewName) els.userViewName.textContent = 'ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ…';
      if (els.userViewStatus) els.userViewStatus.textContent = 'ط§ظ„ظ…ط³طھط®ط¯ظ… ط;ظٹط± ظ…ظˆط¬ظˆط¯';
      if (els.userViewBio) els.userViewBio.textContent = 'ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ.';
      setAvatar(els.userViewAvatar, null, 'طں');
      يعود؛
    }

    إذا كان (els.userViewTitle) els.userViewTitle.textContent = `ظ…ظ„ظپ ${getDisplayName(target)}`;
    إذا كان (els.userViewName) els.userViewName.textContent = getDisplayName(target);
    إذا كان (els.userViewAge) els.userViewAge.textContent = target.profile?.age || 'â€”';
    إذا كان (els.userViewGender) els.userViewGender.textContent = target.profile?.gender || '–';
    إذا كانت (els.userViewNationality) els.userViewNationality.textContent = target.profile?.nationality || '–';
    إذا (els.userViewBio) els.userViewBio.textContent = target.profile?.bio || "ظ"ط§ طھظˆط¬ط¯ ظ†ط¨ط°ط© ط¨ط¹ط¯.';
    إذا كان (els.userViewStatus) {
      const online = target.id === state.currentAccountId && isCurrentAccountOnline();
      إذا كان (متصلاً بالإنترنت) {
        els.userViewStatus.textContent = 'ظ…طھطμظ‹ ط§ظ‹ط¢ظ†';
      } else if (target.lastSeenAt) {
        els.userViewStatus.textContent = `ط¢ط®ط± ط¸ظ‡ظˆط± ${timeAgo(target.lastSeenAt)}`;
      } آخر {
        els.userViewStatus.textContent = 'ط؛ظٹط± ظ…طط¯ط¯';
      }
    }

    إذا كان (els.userViewActivity) {
      els.userViewActivity.textContent = DurationLabel(getActiveDurationForAccount(target));
    }

    setAvatar(els.userViewAvatar, target, getAvatarInitial(target));
    إذا (els.startPrivateChatBtn) {
      els.startPrivateChatBtn.dataset.targetId = target.id;
      els.startPrivateChatBtn.textContent = 'ظپطھط ط´ط§طھ ط®ط§طμ';
    }
  }

  function renderMonitorPanel() {
    إذا لم تكن حالة لوحة المراقبة موجودة، فقم بالخروج.

    const current = getCurrentAccount();
    const unreadCount = getUnreadNotificationCount();
    إذا كان (els.profileMonitorCount) els.profileMonitorCount.textContent = String(unreadCount);
    إذا كان (els.drawerMonitorBadge) els.drawerMonitorBadge.textContent = String(unreadCount);

    const titleEl = state.monitorPanelEl.querySelector('[data-monitor-title]');
    const countEl = state.monitorPanelEl.querySelector('[data-monitor-count]');
    const listEl = state.monitorPanelEl.querySelector('[data-monitor-list]');
    const emptyEl = state.monitorPanelEl.querySelector('[data-monitor-empty]');

    إذا لم يكن (titleEl || countEl || listEl || emptyEl) فارجع؛

    listEl.innerHTML = '';
    countEl.textContent = String(unreadCount);

    إذا لم يكن (الحالي) {
      titleEl.textContent = 'ظ…ظ†ط¸ط§ط± ظ…ظ„ظپظƒ';
      فارغEl.textContent = 'ظط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط·.';
      emptyEl.classList.remo('is-hidden');
      يعود؛
    }

    titleEl.textContent = 'ظ…ظ†ط¸ط§ط± ظ…ظ„ظپظƒ';
    const items = getMonitorItems();

    إذا لم يكن عدد العناصر {
      فارغEl.textContent = 'ظ…ط§ ظپظٹط´ ط²ظٹط§ط±ط§طھ ظ„ظ…ظ„ظپظƒ ظ„ط³ظ‡.';
      emptyEl.classList.remo('is-hidden');
      يعود؛
    }

    emptyEl.classList.add('is-hidden');
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'monitor-item';

      const icon = document.createElement('div');
      icon.className = 'monitor-item-icon';
      icon.textContent = 'ًں'€';

      const info = document.createElement('div');
      info.className = 'monitor-item-info';

      const title = document.createElement('strong');
      title.textContent = item.viewerLabel || 'ط²ط§ط¦ط±';

      const sub = document.createElement('span');
      sub.textContent = `${timeAgo(item.at)} € ™ ط²ط§ط± ظ…ظ„ظپظƒ`;

      info.appendChild(title);
      info.appendChild(sub);
      row.appendChild(icon);
      row.appendChild(info);
      listEl.appendChild(row);
    });
  }

  function renderUserSearchResults() {
    إذا لم تكن هناك نتائج بحث للمستخدم أو عدد نتائج البحث، فقم بالخروج.

    const current = getCurrentAccount();
    const query = normalizeText(els.userSearchInput?.value || '');
    state.searchQuery = query;

    els.userSearchResults.innerHTML = '';

    إذا لم يتم تنفيذ الاستعلام {
      els.searchResultCount.textContent = '0';
      const empty = document.createElement('div');
      empty.className = 'empty-state empty-state-small';
      فارغ.textContent = 'ط§ظƒطھط¨ ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ… ط¹ط´ط§ظ† ظٹط¸ظ‡ط± ظپظٹ ط§ظ„ظ†طھط§ط¦ط¬.';
      els.userSearchResults.appendChild(empty);
      يعود؛
    }

    const q = query.toLowerCase();
    const results = getAccounts().filter((acc) => {
      const name = normalizeText(acc.username).toLowerCase();
      const profileName = normalizeText(acc.profile?.name || '').toLowerCase();
      const bio = normalizeText(acc.profile?.bio || '').toLowerCase();
      const nationality = normalizeText(acc.profile?.nationality || '').toLowerCase();
      return name.includes(q) || profileName.includes(q) || bio.includes(q) || nationality.includes(q);
    });

    els.searchResultCount.textContent = String(results.length);

    إذا لم تكن النتائج موجودة {
      const empty = document.createElement('div');
      empty.className = 'empty-state empty-state-small';
      فارغ.textContent = 'ظ…ط§ظپظٹط´ ظ†طھط§ط¦ط¬ ظ…ط·ط§ط¨ظ‚ط©.';
      els.userSearchResults.appendChild(empty);
      يعود؛
    }

    results.forEach((acc) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'search-result-item';

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      setAvatar(avatar, acc, getAvatarInitial(acc));

      const info = document.createElement('div');
      info.className = 'search-result-info';

      const titleLine = document.createElement('div');
      titleLine.className = 'search-result-title-line';

      const name = document.createElement('strong');
      name.textContent = getDisplayName(acc);

      const badge = document.createElement('span');
      badge.className = 'search-result-badge';
      Badge.textContent = acc.id === الحالي؟.id ? 'ط £ظ†طھ' : 'ظپطھط ط§ظ„ظ…ظ„ظپ';

      titleLine.appendChild(name);
      titleLine.appendChild(badge);

      const sub = document.createElement('span');
      sub.textContent = acc.profile?.bio ? acc.profile.bio : 'ظ…ظ„ظپ ط´ط®طμظٹ';

      info.appendChild(titleLine);
      info.appendChild(sub);
      item.appendChild(avatar);
      item.appendChild(info);
      item.addEventListener('click', () => openAccountProfileById(acc.id));

      els.userSearchResults.appendChild(item);
    });
  }

  function renderMonitorPanelIfNeeded() {
    إذا لم تكن حالة لوحة المراقبة موجودة، فقم بالخروج.
    renderMonitorPanel();
  }

  function renderAll() {
    renderShellState();
    renderHomeView();
    renderProfileView();
    renderPrivateChatsList();
    renderPrivateConversation();
    renderUserView();
    renderMonitorPanel();
    renderUserSearchResults();
  }

  function handleProfileSave(event) {
    event.preventDefault();

    const current = getCurrentAccount();
    إذا لم يكن (الحالي) {
      showToast('ظ„ط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط·.');
      يعود؛
    }

    const newName = clampText(els.profileName?.value || '', CONFIG.MAX_NAME_LENGTH);
    const newPass = normalizeText(els.profilePassword?.value || '');
    const newAge = normalizeText(els.profileAge?.value || '');
    const newGender = NormalizeText(els.profileGender?.value || '');
    const newNationality = normalizeText(els.profileNationality?.value || '');
    const newBio = normalizeText(els.profileBio?.value || '');

    إذا لم يكن الاسم الجديد موجودًا {
      showToast('ط§ظ„ط§ط³ظ… ظ…ط·ظ„ظˆط¨.');
      يعود؛
    }

    const existing = getAccountByUsername(newName);
    إذا كان (موجود && معرف الموجود !== معرف الحالي) {
      showToast('ط§ظ„ط§ط³ظ… ط¯ظ‡ ظ…ط³طھط®ط¯ظ… ط¨ط§ظ„ظپط¹ظ„.');
      يعود؛
    }

    current.username = newName;
    كلمة المرور الحالية = كلمة المرور الجديدة؛
    current.profile.name = newName;
    current.profile.age = newAge;
    current.profile.gender = newGender;
    current.profile.nationality = newNationality;
    current.profile.bio = newBio;
    current.lastSeenAt = now();

    إذا كان (current.id === state.currentAccountId) {
      current.sessionStartedAt = current.sessionStartedAt || now();
      current.sessionExpiresAt = current.sessionExpiresAt || (now() + CONFIG.SESSION_TTL_MS);
    }

    writeStorage();
    استدعاء الكل();
    showToast('طھظ… طظپط¸ ط§ظ„ظ…ظ„ظپ.');
  }

  function handleProfileImagePick(event) {
    const file = event.target.files?.[0];
    إذا لم يكن الملف موجودًا، فقم بالخروج.

    إذا كان حجم الملف أكبر من 800 × 1024 {
      showToast('ط§ظ„طμظˆط±ط© ظƒط¨ظٹط±ط© ط¬ط¯ظ‹ط§.ط§ط®طھط§ط± طμظˆط±ط© ط £ط®ظپ.');
      event.target.value = '';
      يعود؛
    }

    const current = getCurrentAccount();
    إذا لم يكن (الحالي) {
      showToast('ظ„ط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط·.');
      يعود؛
    }

    const reader = new FileReader();
    reader.onload = () => {
      current.profile.avatar = String(reader.result || '');
      writeStorage();
      renderProfileView();
      renderShellState();
      showToast('طھظ… طھطط¯ظٹط« ط§ظ„طµظˆط±ط©.');
    };
    reader.readAsDataURL(file);
  }

  function handlePublicSubmit(event) {
    event.preventDefault();
    const text = normalizeText(els.publicMessageInput?.value || '');
    إذا لم يكن النص موجودًا {
      showToast('ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط £ظˆظ„ظ‹ط§.');
      يعود؛
    }

    إذا لم يكن بالإمكان استخدام الجلسة الحالية،
      showToast('ظ„ط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط·.');
      يعود؛
    }

    sendPublicMessage(text);
    إذا (els.publicMessageInput) els.publicMessageInput.value = '';
    markActivity();
  }

  function handlePrivateSubmit(event) {
    event.preventDefault();
    const text = normalizeText(els.privateMessageInput?.value || '');
    constpeerId =state.selectedPrivatePeerId;

    إذا لم يكن (peerId) {
      showToast('ط§ط®طھط§ط± ط´ط®طμ ط§ظ„ط £ظˆظ„.');
      يعود؛
    }

    إذا لم يكن النص موجودًا {
      showToast('ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط £ظˆظ„ظ‹ط§.');
      يعود؛
    }

    إذا لم يكن بالإمكان استخدام الجلسة الحالية،
      showToast('ظ„ط§ ظٹظˆط¬ط¯ طط³ط§ط¨ ظ†ط´ط·.');
      يعود؛
    }

    sendPrivateMessage(peerId, text);
    إذا (els.privateMessageInput) els.privateMessageInput.value = '';
    markActivity();
  }

  function فتح العرض الخاص بدون نظير() {
    setView('private');
    renderPrivateChatsList();
    renderPrivateConversation();

    const chats = getPrivateChatsForCurrentUser();
    إذا كان عدد المحادثات غير محدد ولم يتم تحديد معرف النظير الخاص في الحالة، {
      state.selectedPrivatePeerId = chats[0].peerId;
      renderPrivateConversation();
      renderPrivateChatsList();
function attachEvents() {
  els.menuBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!els.menuDrawer) return;
    els.menuDrawer.classList.toggle('is-hidden');
    els.menuDrawer.setAttribute(
      'aria-hidden',
      els.menuDrawer.classList.contains('is-hidden') ? 'true' : 'false'
    );
  });

 if (!window.__drawerClickAttached) {
  window.__drawerClickAttached = true;

  document.addEventListener('click', (event) => {
    const drawer = els.menuDrawer;
    if (!drawer || drawer.classList.contains('is-hidden')) return;

    const target = event.target;
    if (!target || !(target instanceof Node)) return;

    const insideDrawer = drawer.contains(target);
    const insideMenuBtn = els.menuBtn?.contains(target);

    if (!insideDrawer && !insideMenuBtn) {
      drawer.classList.add('is-hidden');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });
 }

  els.appTitleBtn?.addEventListener('click', handleAppTitleClick);
  els.privateShortcutBtn?.addEventListener('click', handlePrivateShortcutClick);

  els.publicMessageForm?.addEventListener('submit', handlePublicSubmit);
  els.privateMessageForm?.addEventListener('submit', handlePrivateSubmit);
  els.profileForm?.addEventListener('submit', handleProfileSave);
  els.profileImageInput?.addEventListener('change', handleProfileImagePick);

  els.openMyProfileFromMenu?.addEventListener('click', openSelfProfile);
  els.drawerProfileBtn?.addEventListener('click', openSelfProfile);
  els.drawerMonitorBtn?.addEventListener('click', openMonitorPanel);
  els.profileMonitorBtn?.addEventListener('click', openMonitorPanel);

  els.drawerSettingsBtn?.addEventListener('click', () => {
    showToast('الإعدادات هتتضاف لاحقًا.');
  });

  els.drawerLogoutBtn?.addEventListener('click', () => {
    if (!getCurrentAccount()) {
      showToast('لا يوجد حساب نشط.');
      return;
    }
    logoutCurrentAccount(true);
  });

  els.backFromProfileBtn?.addEventListener('click', () => openHome());
  els.closeProfileBtn?.addEventListener('click', () => openHome());
  els.backFromPrivateBtn?.addEventListener('click', () => openHome());
  els.backFromUserViewBtn?.addEventListener('click', () => openHome());
  els.closeUserViewBtn?.addEventListener('click', () => openHome());

  els.startPrivateChatBtn?.addEventListener('click', () => {
    const targetId = els.startPrivateChatBtn?.dataset?.targetId;
    if (!targetId) return;
    openPrivateChat(targetId, true);
  });

  els.userSearchInput?.addEventListener('input', () => {
    renderUserSearchResults();
  });

  els.publicMessageInput?.addEventListener('focus', () => markActivity());
  els.privateMessageInput?.addEventListener('focus', () => markActivity());

  const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
  activityEvents.forEach((type) => {
    document.addEventListener(type, () => {
      if (canUseCurrentSession()) markActivity();
    }, { passive: true });
  });

  window.addEventListener('storage', () => {
  readStorage();
  ensureCurrentAccount();
  renderAll();
});
  
  function handleAppTitleClick() {
  location.reload();
}

function handlePrivateShortcutClick() {
  openPrivateViewWithoutPeer();
}

function attachEvents() {
  els.menuBtn?.addEventListener('click', () => {
    if (!els.menuDrawer) return;
    els.menuDrawer.classList.toggle('is-hidden');
  });
}
    els.appTitleBtn?.addEventListener('click', handleAppTitleClick);
    els.privateShortcutBtn?.addEventListener('click', handlePrivateShortcutClick);

    els.publicMessageForm?.addEventListener('submit', handlePublicSubmit);
    els.privateMessageForm?.addEventListener('submit', handlePrivateSubmit);
    els.profileForm?.addEventListener('submit', handleProfileSave);
    els.profileImageInput?.addEventListener('change', handleProfileImagePick);

    els.openMyProfileFromMenu?.addEventListener('click', openSelfProfile);


  function إنشاء لوحة المراقبة() {
    إذا لم يكن عنصر القائمة موجودًا، فقم بالخروج.

    const panel = document.createElement('section');
    panel.className = 'drawer-section monitor-panel';
    panel.id = 'monitorPanel';
    panel.innerHTML = `
      <div class="drawer-subhead">
        <h3 data-monitor-title>ظ…ظ†ط¸ط§ط± ظ…ظ„ظپظƒ</h3>
        <span class="tiny-count" data-monitor-count>0</span>
      </div>
      <div class="monitor-panel-body">
        <div class="empty-stateempty-state-small" data-monitor-empty>ط³ط¬ظ'ظ„ ط¯ط®ظˆظ„ظƒ ط¹ط´ط§ظ† ظٹط¸ظ‡ط± ط³ط¬ظ„ ط²ظٹط§ط±ط§طھ ط§ظ„ظ…ظ„ظپ.</div>
        <div class="monitor-list" data-monitor-list></div>
      </div>
    `;

    const firstSection = els.menuDrawer.querySelector('.drawer-section');
    إذا كان (firstSection && firstSection.parentElement === els.menuDrawer) {
      els.menuDrawer.insertBefore(panel, firstSection);
    } آخر {
      els.menuDrawer.appendChild(panel);
    }

    state.monitorPanelEl = panel;
  }

  function إعداد الفترات الزمنية() {
    إذا كان (state.intervalTimer) قم بمسح الفاصل الزمني(state.intervalTimer)؛

    state.intervalTimer = setInterval(() => {
      const session = getCurrentSession();
      const acc = getCurrentAccount();

      إذا (الجلسة && الحساب) {
        إذا كانت الجلسة منتهية الصلاحية {
          commitCurrentSession(true);
          showToast('ط§ظ†طھظ‡طھ ط§ظ„ط¬ظ„ط³ط© ط¨ط¹ط¯ 24 ط³ط§ط¹ط©.');
          استدعاء الكل();
          يعود؛
        }

        إذا كان (الوقت الحالي - رقم (آخر ظهور للحساب || 0) > CONFIG.ONLINE_WINDOW_MS) {
          renderShellState();
          renderOnlineUsers();
          renderFeaturedUsers();
          renderMonitorPanel();
        }
      }

      حذف الرسائل العامة();
      prunePrivateThreads();
      writeStorage();
      renderShellState();
      renderOnlineUsers();
      renderFeaturedUsers();
      renderPrivateChatsList();
      renderPrivateConversation();
      renderMonitorPanel();
    }, 30000);
  }

  function cacheElements() {
    els.app = $('app');
    els.privateShortcutBtn = $('privateShortcutBtn');
    els.appTitleBtn = $('appTitleBtn');
    els.menuBtn = $('menuBtn');
    els.currentUserState = $('currentUserState');
    els.profileMonitorBtn = $('profileMonitorBtn');
    els.profileMonitorCount = $('profileMonitorCount');

    els.homeView = $('homeView');
    els.onlineUsersEmpty = $('onlineUsersEmpty');
    els.onlineUsersList = $('onlineUsersList');
    els.featuredUsersEmpty = $('featuredUsersEmpty');
    els.featuredUsersList = $('featuredUsersList');
    els.publicMessages = $('publicMessages');
    els.publicMessageForm = $('publicMessageForm');
    els.publicMessageInput = $('publicMessageInput');
    els.publicSendBtn = $('publicSendBtn');

    els.menuDrawer = $('menuDrawer');
    els.openMyProfileFromMenu = $('openMyProfileFromMenu');
    els.menuAvatar = $('menuAvatar');
    els.menuUserName = $('menuUserName');
    els.menuUserMeta = $('menuUserMeta');
    els.userSearchInput = $('userSearchInput');
    els.searchResultCount = $('searchResultCount');
    els.userSearchResults = $('userSearchResults');
    els.drawerProfileBtn = $('drawerProfileBtn');
    els.drawerMonitorBtn = $('drawerMonitorBtn');
    els.drawerSettingsBtn = $('drawerSettingsBtn');
    els.drawerLogoutBtn = $('drawerLogoutBtn');
    els.drawerMonitorBadge = $('drawerMonitorBadge');

    els.profileView = $('profileView');
    els.backFromProfileBtn = $('backFromProfileBtn');
    els.profileTitle = $('profileTitle');
    els.profileForm = $('profileForm');
    els.profileAvatarPreview = $('profileAvatarPreview');
    els.profileImageInput = $('profileImageInput');
    els.profileOnlineState = $('profileOnlineState');
    els.profileLastSeen = $('profileLastSeen');
    els.profileName = $('profileName');
    els.profilePassword = $('profilePassword');
    els.profileAge = $('profileAge');
    els.profileGender = $('profileGender');
    els.profileNationality = $('profileNationality');
    els.profileBio = $('profileBio');
    els.saveProfileBtn = $('saveProfileBtn');
    els.closeProfileBtn = $('closeProfileBtn');

    els.privateView = $('privateView');
    els.backFromPrivateBtn = $('backFromPrivateBtn');
    els.privateTitle = $('privateTitle');
    els.privateChatsEmpty = $('privateChatsEmpty');
    els.privateChatsList = $('privateChatsList');
    els.privateChatAvatar = $('privateChatAvatar');
    els.privateChatTitle = $('privateChatTitle');
    els.privateChatMeta = $('privateChatMeta');
    els.privateMessages = $('privateMessages');
    els.privateMessageForm = $('privateMessageForm');
    els.privateMessageInput = $('privateMessageInput');
    els.privateSendBtn = $('privateSendBtn');

    els.userView = $('userView');
    els.backFromUserViewBtn = $('backFromUserViewBtn');
    els.userViewTitle = $('userViewTitle');
    els.userViewAvatar = $('userViewAvatar');
    els.userViewName = $('userViewName');
    els.userViewStatus = $('userViewStatus');
    els.userViewAge = $('userViewAge');
    els.userViewGender = $('userViewGender');
    els.userViewNationality = $('userViewNationality');
    els.userViewActivity = $('userViewActivity');
    els.userViewBio = $('userViewBio');
    els.startPrivateChatBtn = $('startPrivateChatBtn');
    els.closeUserViewBtn = $('closeUserViewBtn');
  }

  async function tryBindExternalDB() {
    const db = window.KAREEM3_DB;
    إذا لم تكن قاعدة البيانات موجودة أو كان نوع `db.init` ليس دالة، فسيتم إرجاع قيمة فارغة.

    state.externalDB = db;
    يحاول {
      await db.init({ mode: 'auto' });
      return db.getStatus?.() || null;
    } catch (err) {
      console.warn('[KAREEM3] فشل تهيئة قاعدة البيانات الخارجية، جارٍ متابعة الوضع المحلي', err);
      أعد قيمة فارغة (null).
    }
  }

  function initLocalData() {
    readStorage();
    const guest = ensureCurrentCaccount();
    إذا لم تكن `state.publicMessages` مصفوفة أو كان طولها يساوي صفرًا،
      state.publicMessages = [
        {
          المعرّف: makeId('msg'),
          معرّف المرسل: guest.id،
          senderLabel: getDisplayName(guest),
          text: 'ط £ظ‡ظ‹ط§ظ‹ ط¨ظƒ ظپظٹ ط´ط§طھ ظ†ط§ط±. ظ’ظ’ط±ط¨ط·.',
          at: now() - 5 * 60 * 1000,
        },
      ];
    }
    حذف الرسائل العامة();
    prunePrivateThreads();
    writeStorage();
  }

  async function init() {
    cacheElements();
    إنشاء لوحة مراقبة();
    initLocalData();
    attachEvents();
    setupIntervals();
    استدعاء الكل();
    افتح الصفحة الرئيسية();
    انتظر محاولة ربط قاعدة البيانات الخارجية();
    إذا كان بالإمكان استخدام الجلسة الحالية، فقم بتحديد النشاط.
  }

  window.KAREEM3 = {
    تحديث: عرض الكل،
    تسجيل الخروج: تسجيل الخروج من الحساب الحالي،
    فتح الملف الشخصي: فتح الملف الشخصي الذاتي،
    فتح ملف تعريف المستخدم بواسطة المعرف،
    فتح محادثة خاصة،
    الحالة: () => ({
      الحساب الحالي: getCurrentAccount(),
      الجلسة الحالية: getCurrentSession(),
      unreadNotifications: getUnreadNotificationCount(),
      عرض: state.view،
    }),
  };

  إذا كانت حالة المستند 'loading' {
    document.addEventListener('DOMContentLoaded', init);
  } آخر {
    init();
  }
})();
