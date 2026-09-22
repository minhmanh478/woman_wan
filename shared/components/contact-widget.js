/**
 * ============================================================================
 * WOMAN WAN - REUSABLE FLOATING CONTACT WIDGET (WEB COMPONENT & SCRIPT)
 * ============================================================================
 */

(function () {
  "use strict";

  function resolveBasePath(customPath) {
    if (customPath) return customPath;
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/product/") || path.includes("/produc/") || path.includes("/checkout/")) {
      return "../";
    }
    return "./";
  }

  function createContactHTML(basePath) {
    basePath = basePath || resolveBasePath();
    const phoneIconPath = `${basePath}assets/icons/contact/icon_phone.svg`;
    const zaloIconPath = `${basePath}assets/icons/contact/icon_zalo.svg`;
    const messengerIconPath = `${basePath}assets/icons/contact/icon_messenger.svg`;

    return `
      <!-- 1. Hotline -->
      <a href="tel:0867774069" class="ww-float-btn phone-btn" aria-label="Gọi hotline 0867 774 069">
        <img src="${phoneIconPath}" alt="Hotline 0867 774 069" width="24" height="24" class="ww-contact-icon-img" onerror="this.outerHTML='<svg width=\\'22\\' height=\\'22\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\'><path d=\\'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\\' fill=\\'#ffffff\\'/><path d=\\'M14 2a6 6 0 0 1 6 6\\' stroke=\\'#ffffff\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' fill=\\'none\\'/><path d=\\'M14 6a2 2 0 0 1 2 2\\' stroke=\\'#ffffff\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' fill=\\'none\\'/></svg>'">
      </a>

      <!-- 2. Zalo -->
      <a href="https://zalo.me/0867774069" target="_blank" rel="noopener noreferrer" class="ww-float-btn zalo-btn" aria-label="Chat Zalo">
        <img src="${zaloIconPath}" alt="Chat Zalo" width="28" height="28" class="ww-contact-icon-img" onerror="this.outerHTML='<svg width=\\'26\\' height=\\'26\\' viewBox=\\'0 0 36 36\\' fill=\\'none\\'><path d=\\'M18 5.5C10.8 5.5 5 10.4 5 16.5c0 3.5 1.9 6.6 4.9 8.6-.2 2-1 3.9-2.2 5.1 2.6-.2 5.3-1.2 7.2-2.4 1 .2 2 .3 3.1.3 7.2 0 13-4.9 13-11S25.2 5.5 18 5.5z\\' fill=\\'#ffffff\\'/><text x=\\'18\\' y=\\'20.2\\' font-family=\\'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif\\' font-weight=\\'900\\' font-size=\\'10.5\\' fill=\\'#000000\\' text-anchor=\\'middle\\' letter-spacing=\\'-0.3px\\'>Zalo</text></svg>'">
      </a>

      <!-- 3. Messenger -->
      <a href="https://m.me/womanwan.vn" target="_blank" rel="noopener noreferrer" class="ww-float-btn messenger-btn" aria-label="Chat Messenger">
        <img src="${messengerIconPath}" alt="Chat Messenger" width="24" height="24" class="ww-contact-icon-img" onerror="this.outerHTML='<svg width=\\'23\\' height=\\'23\\' viewBox=\\'0 0 28 28\\' fill=\\'none\\'><path d=\\'M14 2C7.37 2 2 7.05 2 13.28c0 3.54 1.73 6.7 4.45 8.78.23.18.37.45.38.74l.08 2.3c.03.88.94 1.45 1.71 1.05l2.58-1.34c.24-.12.51-.15.77-.08 1.3.36 2.68.55 4.03.55 6.63 0 12-5.05 12-11.28C26 7.05 20.63 2 14 2z\\' fill=\\'#ffffff\\'/><path d=\\'M6.8 16.5l4.5-7.15c.6-.95 1.95-1.15 2.8-.42l3.55 3.05c.27.23.66.23.93 0l3.82-2.9c.56-.42 1.3.26.9 0.82l-4.5 7.15c-.6.95-1.95 1.15-2.8.42l-3.55-3.05c-.27-.23-.66-.23-.93 0l-3.82 2.9c-.56.42-1.3-.26-.9-.82z\\' fill=\\'#000000\\'/></svg>'">
      </a>
    `;
  }

  function ensureFloatingContacts(basePath) {
    basePath = basePath || resolveBasePath();
    let existing = document.getElementById("womanwanFloatingContact");
    if (existing) {
      existing.innerHTML = createContactHTML(basePath);
      return;
    }

    const container = document.createElement("div");
    container.id = "womanwanFloatingContact";
    container.className = "ww-floating-contact";
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Liên hệ nhanh WOMAN WAN");
    container.innerHTML = createContactHTML(basePath);
    document.body.appendChild(container);
  }

  if (typeof customElements !== "undefined" && !customElements.get("womanwan-contact")) {
    class WomanWanContactElement extends HTMLElement {
      connectedCallback() {
        const basePath = this.getAttribute("base-path") || resolveBasePath();
        ensureFloatingContacts(basePath);
      }
    }
    customElements.define("womanwan-contact", WomanWanContactElement);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ensureFloatingContacts());
  } else {
    ensureFloatingContacts();
  }

  window.WomanWanContact = {
    render: ensureFloatingContacts,
    getHTML: createContactHTML
  };
})();
