/* examples.js — tiny demo helpers for docs/examples pages */
(function () {
  'use strict';

  // Mobile nav toggle (expects #os-toggle and #os-nav)
  const toggleBtn = document.getElementById('os-toggle');
  const navEl = document.getElementById('os-nav');
  if (toggleBtn && navEl) {
    toggleBtn.addEventListener('click', () => navEl.classList.toggle('open'));
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) navEl.classList.remove('open'); });
  }

  // Demo: show a welcome toast on docs page (only once per session)
  try {
    if (window.location.pathname.includes('docs') || window.location.pathname.includes('ourstrap-doc')) {
      if (!sessionStorage.getItem('ourstrap_docs_welcomed')) {
        if (window.ourstrap && window.ourstrap.showToast) {
          window.ourstrap.showToast('Selamat datang di dokumentasi Ourstrap!', 'info');
        }
        sessionStorage.setItem('ourstrap_docs_welcomed', '1');
      }
    }
  } catch (e) {
    // ignore
  }

  // Prevent default for .demo-link anchors
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a.demo-link');
    if (a) ev.preventDefault();
  });

})();
