/* ourstrap.js — readable version
   Main UI behaviors for Ourstrap (copy, dropdown, modal, tabs, toast, accordion, stepper)
   Intended for development (unminified / comment-rich)
*/
(function () {
  'use strict';

  // helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const ariaLive = () => document.getElementById('os-aria-live');

  /* -------------------------
     Copy-to-clipboard (with fallback)
     ------------------------- */
  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // fallback
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  // delegate click for copy buttons
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.copy-btn');
    if (!btn) return;
    const wrap = btn.parentElement;
    const pre = wrap && wrap.querySelector('pre.code');
    if (!pre) return;
    const txt = pre.innerText.replace(/\u00A0/g, ' ').trim(); // normalize NBSP
    const original = btn.innerText;
    copyTextToClipboard(txt).then(() => {
      btn.innerText = 'Tersalin!';
      btn.setAttribute('aria-pressed', 'true');
      const live = ariaLive();
      if (live) live.textContent = 'Kode tersalin ke clipboard';
      setTimeout(() => {
        btn.innerText = original;
        btn.removeAttribute('aria-pressed');
        if (live) live.textContent = '';
      }, 1400);
    }).catch(() => {
      btn.innerText = 'Gagal';
      const live = ariaLive();
      if (live) live.textContent = 'Gagal menyalin kode';
      setTimeout(() => {
        btn.innerText = original;
        if (live) live.textContent = '';
      }, 1400);
    });
  });

  /* -------------------------
     Dropdown (click + keyboard)
     - toggled by element with data-toggle="dropdown"
     - wrapper element should have class "dropdown"
     ------------------------- */
  document.addEventListener('click', (ev) => {
    const toggle = ev.target.closest('[data-toggle="dropdown"], .dropdown-toggle');
    if (!toggle) return;
    const root = toggle.closest('.dropdown');
    if (!root) return;
    const open = root.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // focus first menu item when opened
    if (open) {
      const first = root.querySelector('.dropdown-menu [role="menuitem"], .dropdown-menu a, .dropdown-menu button');
      first && first.focus();
    }
  });

  // keyboard support for dropdown toggles (Enter / Space)
  document.addEventListener('keydown', (ev) => {
    if (!ev.target) return;
    if (ev.target.matches('[data-toggle="dropdown"], .dropdown-toggle')) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        ev.target.click();
      }
    }
  });

  // close dropdowns on outside click or escape
  document.addEventListener('click', (ev) => {
    $$(' .dropdown').forEach((dd) => {
      if (!dd.contains(ev.target)) {
        dd.classList.remove('open');
        const t = dd.querySelector('[data-toggle="dropdown"], .dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      $$(' .dropdown.open').forEach((dd) => {
        dd.classList.remove('open');
        const t = dd.querySelector('[data-toggle="dropdown"], .dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* -------------------------
     Modal (open/close, focus trap, restore focus)
     - trigger: element with data-modal-open="modal-id"
     - close with [data-modal-close] inside modal, Escape, or clicking backdrop
     ------------------------- */
  let activeModal = null;
  let lastFocused = null;

  function focusable(root) {
    if (!root) return [];
    return Array.from(root.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'));
  }

  function openModalById(id, triggerEl) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocused = triggerEl || document.activeElement;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    activeModal = modal;
    setTimeout(() => {
      const list = focusable(modal);
      if (list.length) list[0].focus();
      else modal.querySelector('.dialog')?.focus();
    }, 50);
    document.addEventListener('focus', trapFocus, true);
    document.addEventListener('keydown', modalKeyHandler);
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('show');
    modalEl.setAttribute('aria-hidden', 'true');
    activeModal = null;
    document.removeEventListener('focus', trapFocus, true);
    document.removeEventListener('keydown', modalKeyHandler);
    try { lastFocused && lastFocused.focus(); } catch (e) {}
  }

  function trapFocus(e) {
    if (!activeModal) return;
    if (!activeModal.contains(e.target)) {
      const nodes = focusable(activeModal);
      if (nodes.length) nodes[0].focus();
      else activeModal.querySelector('.dialog')?.focus();
    }
  }

  function modalKeyHandler(e) {
    if (!activeModal) return;
    if (e.key === 'Escape') { closeModal(activeModal); }
    if (e.key === 'Tab') {
      const nodes = focusable(activeModal);
      if (!nodes.length) { e.preventDefault(); return; }
      const idx = nodes.indexOf(document.activeElement);
      if (e.shiftKey && idx === 0) { e.preventDefault(); nodes[nodes.length - 1].focus(); }
      else if (!e.shiftKey && idx === nodes.length - 1) { e.preventDefault(); nodes[0].focus(); }
    }
  }

  // open / close handlers
  document.addEventListener('click', (ev) => {
    const openBtn = ev.target.closest('[data-modal-open]');
    if (openBtn) {
      const id = openBtn.getAttribute('data-modal-open');
      openModalById(id, openBtn);
      return;
    }
    const closeBtn = ev.target.closest('[data-modal-close]');
    if (closeBtn) {
      const m = closeBtn.closest('.os-modal');
      if (m) closeModal(m);
      return;
    }
  });

  // backdrop click closes modal
  document.querySelectorAll('.os-modal').forEach((m) => {
    m.addEventListener('click', (ev) => {
      if (ev.target === m) closeModal(m);
    });
  });

  /* -------------------------
     Tabs (ARIA + keyboard)
     - expects role="tablist" containing role="tab" items with data-tab="panelId"
     - panels have id matching data-tab and role="tabpanel"
     ------------------------- */
  function initTabs() {
    const lists = $$('[role="tablist"]');
    lists.forEach((list) => {
      const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
      list.addEventListener('keydown', (ev) => {
        const current = document.activeElement;
        const idx = tabs.indexOf(current);
        if (idx === -1) return;
        if (ev.key === 'ArrowRight') { ev.preventDefault(); const n = tabs[(idx + 1) % tabs.length]; n.focus(); n.click(); }
        if (ev.key === 'ArrowLeft')  { ev.preventDefault(); const p = tabs[(idx - 1 + tabs.length) % tabs.length]; p.focus(); p.click(); }
        if (ev.key === 'Home') { ev.preventDefault(); tabs[0].focus(); tabs[0].click(); }
        if (ev.key === 'End')  { ev.preventDefault(); tabs[tabs.length - 1].focus(); tabs[tabs.length - 1].click(); }
      });

      list.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[role="tab"]');
        if (!btn) return;
        const tabId = btn.dataset.tab;
        // deactivate
        tabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); t.setAttribute('tabindex', '-1'); });
        $$('.tab-content').forEach((p) => { p.classList.remove('active'); p.setAttribute('aria-hidden', 'true'); });
        // activate
        btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); btn.removeAttribute('tabindex');
        const panel = document.getElementById(tabId);
        if (panel) {
          panel.classList.add('active');
          panel.removeAttribute('aria-hidden');
          panel.setAttribute('tabindex', '-1');
          panel.focus();
        }
      });
    });
  }
  initTabs();

  /* -------------------------
     Progress animation
     ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-width].progress-fill, .progress-fill[data-width]').forEach((p) => {
      const w = p.dataset.width || p.style.width || p.innerText || '0%';
      setTimeout(() => { p.style.width = w; }, 150);
    });
  });

  /* -------------------------
     Toast (accessible)
     - usage: showToast(message, type)
     ------------------------- */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    node.innerHTML = '<strong style="margin-right:8px">' + String(type).toUpperCase() + '</strong>' +
                     '<div style="flex:1">' + message + '</div>' +
                     '<button aria-label="Tutup notifikasi" type="button" style="border:0;background:transparent;color:#fff;cursor:pointer;font-weight:700">✕</button>';
    container.appendChild(node);
    // close on button
    node.querySelector('button')?.addEventListener('click', () => node.remove());
    // auto remove
    setTimeout(() => node.remove(), 4200);
  }
  // support data-toast attribute delegation
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-toast]');
    if (!btn) return;
    try {
      const info = JSON.parse(btn.getAttribute('data-toast'));
      showToast(info.msg || info, info.type || 'info');
    } catch (err) {
      showToast('Notif', 'info');
    }
  });

  /* -------------------------
     Accordion (basic)
     ------------------------- */
  $$('.accordion .header').forEach((h) => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
    h.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); h.parentElement.classList.toggle('open'); }
    });
  });

  /* -------------------------
     Stepper (simple)
     - Next/Prev triggers use data-step="next" or "prev"
     ------------------------- */
  let currentStep = 1;
  const totalSteps = 3;
  function updateStepper() {
    $$('.step').forEach((s, i) => { s.classList.toggle('active', (i + 1) === currentStep); });
    for (let i = 1; i <= totalSteps; i++) {
      const pane = document.getElementById('step-' + i);
      if (pane) pane.style.display = (i === currentStep) ? 'block' : 'none';
    }
  }
  function nextStep() { if (currentStep < totalSteps) { currentStep++; updateStepper(); } }
  function prevStep() { if (currentStep > 1) { currentStep--; updateStepper(); } }
  // expose
  window.nextStep = nextStep;
  window.prevStep = prevStep;
  updateStepper();

  // stepper buttons delegation
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-step]');
    if (!b) return;
    const act = b.getAttribute('data-step');
    if (act === 'next') nextStep();
    if (act === 'prev') prevStep();
  });

  /* -------------------------
     Misc: prevent demo anchors with href="#" from navigating
     ------------------------- */
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href="#"], a.demo-link');
    if (a) ev.preventDefault();
  });

  /* -------------------------
     Expose some utilities globally
     ------------------------- */
  window.ourstrap = {
    openModal: (id, trigger) => openModalById(id, trigger),
    closeModal: (el) => closeModal(typeof el === 'string' ? document.getElementById(el) : el),
    showToast,
    copyTextToClipboard
  };

  // close all modals on Escape globally (extra safety)
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      $$('.os-modal.show').forEach((m) => closeModal(m));
    }
  });

})(); // end IIFE
