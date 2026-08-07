/* ============================================
   MofChat Profile Card - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  const card = document.getElementById('profileCard');
  if (!card) return;

  // ===== شرارات ذهبية حول التاج =====
  const sparkleCount = 12;
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = (Math.random() * 30 + 5) + '%';
    sparkle.style.top = (Math.random() * 20 + 3) + '%';
    sparkle.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    sparkle.style.animationDelay = Math.random() * 3 + 's';
    const size = Math.random() * 3 + 2;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    card.appendChild(sparkle);
  }

  // ===== غبار ذهبي =====
  const dustCount = 20;
  for (let i = 0; i < dustCount; i++) {
    const dust = document.createElement('div');
    dust.className = 'dust-particle';
    dust.style.left = Math.random() * 100 + '%';
    dust.style.top = (Math.random() * 50 + 50) + '%';
    dust.style.animationDuration = (Math.random() * 4 + 3) + 's';
    dust.style.animationDelay = Math.random() * 6 + 's';
    const size = Math.random() * 2.5 + 1;
    dust.style.width = size + 'px';
    dust.style.height = size + 'px';
    card.appendChild(dust);
  }
});
