// 1. نظام القوائم الجانبية (Sidebars)
function toggleSidebar(side) {
    const sidebar = document.getElementById(side === 'left' ? 'private-sidebar' : 'profile-sidebar');
    const overlay = document.getElementById('overlay');
    
    // إغلاق أي قائمة مفتوحة أخرى أولاً
    closeAllSidebars();

    sidebar.classList.add('active');
    overlay.style.display = 'block';
    
    // إضافة حركة دخول ناعمة
    sidebar.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
}

function closeAllSidebars() {
    document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('active'));
    document.getElementById('overlay').style.display = 'none';
}

// 2. نظام إرسال الرسائل (Chat Logic)
function sendMessage() {
    const input = document.getElementById('mainInput');
    const chatDisplay = document.getElementById('chatDisplay');
    const text = input.value.trim();

    if (text !== "") {
        // إنشاء عنصر الرسالة بتصميم احترافي
        const messageDiv = document.createElement('div');
        messageDiv.className = 'msg-animate'; // كلاس للحركة
        messageDiv.style.padding = "10px";
        messageDiv.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
        messageDiv.style.animation = "fadeInUp 0.3s ease forwards";

        const now = new Date();
        const time = now.getHours() + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

        messageDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <span style="color:#ffcf40; font-weight:bold;">أنت (زائر ملك)</span>
                <span style="font-size:10px; color:#aaa;">${time}</span>
            </div>
            <div style="margin-top:5px; color:#eee; line-height:1.4;">${text}</div>
        `;

        chatDisplay.appendChild(messageDiv);
        
        // تفريغ الحقل والنزول للرسالة الجديدة بسلاسة
        input.value = "";
        chatDisplay.scrollTo({ top: chatDisplay.scrollHeight, behavior: 'smooth' });
        
        // نغمة بسيطة اختيارية (تحتاج ملف صوتي)
        // new Audio('send_sound.mp3').play();
    }
}

// 3. التعامل مع مفتاح Enter للإرسال
document.getElementById('mainInput')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 4. محاكاة المتصلين (Dynamic Content)
const demoUsers = [
    { name: 'أحمد علي', status: 'متصل الآن', img: 'https://pravatar.cc' },
    { name: 'لينا محمد', status: 'متصل الآن', img: 'https://pravatar.cc' },
    { name: 'كريم محمود', status: 'مشغول', img: 'https://pravatar.cc' }
];

function loadUsers() {
    const list = document.getElementById('usersList');
    if(!list) return;
    list.innerHTML = demoUsers.map(user => `
        <div class="user-card" onclick="alert('فتح محادثة مع ${user.name}')">
            <img src="${user.img}" class="avatar" alt="user">
            <div class="user-info">
                <div style="font-weight:bold">${user.name}</div>
                <div style="color:#4eff4e; font-size:11px;">● ${user.status}</div>
            </div>
            <i class="fas fa-chevron-left" style="margin-right:auto; opacity:0.3"></i>
        </div>
    `).join('');
}

// تشغيل الوظائف عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadUsers);
