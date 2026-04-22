(() => {
  "use strict";

  /* =========================
     🔑 STATE
  ========================= */
  const state = {
    currentView: "home",
    currentUserId: null,
  };

  /* =========================
     🧠 HELPERS
  ========================= */
  const $ = (id) => document.getElementById(id);

  function safeGet(id) {
    return document.getElementById(id);
  }

  function showView(view) {
    state.currentView = view;

    const views = ["homeView", "profileView", "privateView", "userView"];

    views.forEach((v) => {
      const el = $(v);
      if (!el) return;

      if (v === view + "View") {
        el.classList.remove("is-hidden");
      } else {
        el.classList.add("is-hidden");
      }
    });

    document.getElementById("app")?.setAttribute("data-view", view);
  }

  /* =========================
     🎯 NAVIGATION FIX
  ========================= */
  function openPrivate() {
    console.log("private button clicked");

    showView("private");

    // optional focus fix
    setTimeout(() => {
      const input = $("privateMessageInput");
      input?.focus();
    }, 50);
  }

  function openHome() {
    showView("home");
  }

  function openProfile() {
    showView("profile");
  }

  function openUser() {
    showView("user");
  }

  /* =========================
     📦 INIT
  ========================= */
  function init() {
    console.log("main.js loaded");

    // زر الرسائل الخاصة
    const privateBtn = $("privateShortcutBtn");
    if (privateBtn) {
      privateBtn.addEventListener("click", openPrivate);
    }

    // زر القائمة
    const menuBtn = $("menuBtn");
    const drawer = $("menuDrawer");

    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", () => {
        drawer.classList.toggle("is-hidden");
      });
    }

    // الرجوع للهوم (لو عندك زر)
    $("appTitleBtn")?.addEventListener("click", openHome);

    // رجوع من الصفحات
    $("backFromPrivateBtn")?.addEventListener("click", openHome);
    $("backFromProfileBtn")?.addEventListener("click", openHome);
    $("backFromUserViewBtn")?.addEventListener("click", openHome);
  }

  /* =========================
     🚀 START
  ========================= */
  document.addEventListener("DOMContentLoaded", init);
})();
