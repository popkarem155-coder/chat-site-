// 1. نظام القوائم الجانبية (FIXED)
function toggleSidebar(side) {
    const leftSidebar = document.getElementById('private-sidebar');
    const rightSidebar = document.getElementById('profile-sidebar');
    const overlay = document.getElementById('overlay');

    // اقفل الاثنين الأول
    closeAllSidebars();

    let sidebar;

    if (side === 'left') {
        sidebar = leftSidebar;
    } else {
        sidebar = rightSidebar;
    }

    if (!sidebar) return;

    // افتح الصح
    if (side === 'left') {
        sidebar.classList.add('active-left');
    } else {
        sidebar.classList.add('active-right');
    }

    overlay.style.display = 'block';
}

// 2. قفل الكل بشكل مضمون
function closeAllSidebars() {
    document.querySelectorAll('.sidebar').forEach(s => {
        s.classList.remove('active-left', 'active-right');
    });

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';
}

// اقفل لما تدوس على الخلفية
document.getElementById('overlay')?.addEventListener('click', closeAllSidebars);
