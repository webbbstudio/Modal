(function () {
  "use strict";

  // Early exit if no modals present
  if (!document.querySelector("[ws-modal], [ws-modal-open]")) return;

  let activeModal = null;
  let lastFocus = null;

  const FOCUSABLE = [
    "a[href]",
    "button",
    'input:not([type="hidden"])',
    "textarea",
    "select",
    '[tabindex="0"]',
  ].join(",");

  function getModal(id) {
    return document.querySelector(`[ws-modal="${id}"]`);
  }

  function getFocusableElements(modal) {
    if (!modal) return [];
    return Array.from(modal.querySelectorAll(FOCUSABLE)).filter(
      (el) => !el.disabled && !el.hidden && el.offsetWidth > 0
    );
  }

  function openModal(id) {
    const modal = getModal(id);
    if (!modal || !modal.hidden) return;

    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const firstFocusable =
      modal.querySelector("[ws-modal-autofocus]") ||
      getFocusableElements(modal)[0] ||
      modal;

    firstFocusable.focus();
    activeModal = id;
  }

  function closeModal(id) {
    const modal = getModal(id);
    if (!modal) return;

    modal.hidden = true;
    document.body.style.overflow = "";

    if (lastFocus?.isConnected) {
      lastFocus.focus();
    }

    activeModal = null;
    lastFocus = null;
  }

  document.addEventListener("click", function (event) {
    // Handle open
    const openTrigger = event.target.closest("[ws-modal-open]");
    if (openTrigger) {
      event.preventDefault();
      openModal(openTrigger.getAttribute("ws-modal-open"));
      return;
    }

    // Handle close
    const closeTrigger = event.target.closest("[ws-modal-close]");
    if (closeTrigger) {
      event.preventDefault();
      const modal = closeTrigger.closest("[ws-modal]");
      if (modal) {
        closeModal(modal.getAttribute("ws-modal"));
      }
      return;
    }

    // Handle backdrop
    const modalElement = event.target.closest("[ws-modal]");
    if (modalElement && modalElement === event.target) {
      closeModal(modalElement.getAttribute("ws-modal"));
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!activeModal) return;

    const modal = getModal(activeModal);
    if (!modal) return;

    // Close on escape
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(activeModal);
      return;
    }

    // Handle tab trap
    if (event.key === "Tab") {
      const focusable = getFocusableElements(modal);
      if (focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  // Initialize modals
  document.querySelectorAll("[ws-modal]").forEach((modal) => {
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("tabindex", "-1");
    modal.hidden = true;
  });

  // Public API
  window.wsModal = {
    open: openModal,
    close: closeModal,
  };
})();
