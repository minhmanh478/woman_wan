/**
 * =========================================================================
 * PAGE TRANSITION WIDGET — <womanwan-page-transition>
 * =========================================================================
 * Widget tái sử dụng: hiển thị hiệu ứng logo WOMANWAN khi chuyển trang
 * (tương tự site-intro animation nhưng ngắn hơn: ~1.4s).
 *
 * Cách dùng:
 *   1. Thêm <link rel="stylesheet" href="css/components/page-transition.css">
 *   2. Thêm <script src="components/page-transition-widget.js" defer></script>
 *   3. Đặt <womanwan-page-transition></womanwan-page-transition> vào body
 *   4. Gọi window.WanPageTransition.navigate(url) hoặc dùng thuộc tính
 *      data-page-transition trên thẻ <a> để tự động kích hoạt
 *
 * Các link có class "no-transition" hoặc target="_blank" sẽ bị bỏ qua.
 * =========================================================================
 */
(function () {
  "use strict";

  /** Thời gian chờ trước khi chuyển trang (ms) — phải đồng bộ với CSS animation */
  const TRANSITION_DELAY = 1050;

  /** Đường dẫn base tự động xác định */
  function resolveBasePath() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/product/") || path.includes("/produc/") || path.includes("/checkout/")) {
      return "../";
    }
    return "./";
  }

  /**
   * Tạo DOM overlay cho hiệu ứng chuyển trang
   */
  function createOverlayHTML(prefix) {
    return `
      <div class="page-transition-overlay" id="pageTransitionOverlay" aria-hidden="true">
        <div class="pt-content">
          <div class="pt-logo-wrap">
            <img src="${prefix}assets/logos/LOGO-WOMANWAN-WHITE.png" alt="WOMAN WAN" class="pt-logo">
          </div>
          <div class="pt-tagline">BE A VISIONARY</div>
        </div>
      </div>
    `;
  }

  /**
   * Kích hoạt hiệu ứng chuyển trang
   * @param {string} targetUrl — URL đích cần chuyển đến
   */
  function navigateWithTransition(targetUrl) {
    if (!targetUrl) return;

    const overlay = document.getElementById("pageTransitionOverlay");
    if (!overlay) {
      // Fallback: chuyển trang thường nếu widget chưa sẵn sàng
      window.location.href = targetUrl;
      return;
    }

    // Reset animation bằng cách xóa class rồi thêm lại (force reflow)
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");

    // Force reflow
    void overlay.offsetWidth;

    // Bắt đầu animation
    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");

    // Khóa cuộn trang trong khi chạy animation
    document.body.style.overflow = "hidden";

    // Chuyển trang sau khi animation đạt giai đoạn nền đen
    setTimeout(() => {
      window.location.href = targetUrl;
    }, TRANSITION_DELAY);
  }

  /**
   * Kiểm tra link có nên áp dụng hiệu ứng chuyển trang hay không
   */
  function shouldApplyTransition(anchor) {
    // Bỏ qua nếu có class no-transition
    if (anchor.classList.contains("no-transition")) return false;

    // Bỏ qua target="_blank"
    if (anchor.target === "_blank") return false;

    // Bỏ qua link trống, hash-only, javascript:, mailto:, tel:
    const href = anchor.getAttribute("href");
    if (!href || href === "#" || href.startsWith("#") ||
      href.startsWith("javascript:") || href.startsWith("mailto:") ||
      href.startsWith("tel:")) return false;

    // Bỏ qua external links (khác domain)
    try {
      const linkUrl = new URL(href, window.location.origin);
      if (linkUrl.origin !== window.location.origin) return false;
    } catch (e) {
      // Nếu URL parsing lỗi, vẫn cho phép (relative URL)
    }

    return true;
  }

  /**
   * Gắn sự kiện tự động cho tất cả các link nội bộ
   * có thuộc tính data-page-transition
   */
  function attachAutoTransitionLinks() {
    // Tự động gắn cho các link có [data-page-transition]
    document.querySelectorAll("a[data-page-transition]").forEach(anchor => {
      if (anchor._ptBound) return;
      anchor._ptBound = true;
      anchor.addEventListener("click", (e) => {
        if (!shouldApplyTransition(anchor)) return;
        e.preventDefault();
        navigateWithTransition(anchor.href);
      });
    });
  }

  /**
   * Gắn sự kiện cho tất cả link điều hướng chính (header nav links)
   * và link logo về trang chủ
   */
  function attachHeaderNavTransitions() {
    // 1. Logo link (về trang chủ)
    const logoLinks = document.querySelectorAll("a.logo, .header-logo-link");
    logoLinks.forEach(anchor => {
      if (anchor._ptBound) return;
      anchor._ptBound = true;
      anchor.addEventListener("click", (e) => {
        if (!shouldApplyTransition(anchor)) return;
        e.preventDefault();
        navigateWithTransition(anchor.href);
      });
    });

    // 2. Nav tabs (Nam, Nữ, Khuyến mãi) — trong primary nav
    const navLinks = document.querySelectorAll("nav.primary a[data-tab]");
    navLinks.forEach(anchor => {
      if (anchor._ptBound) return;
      anchor._ptBound = true;
      anchor.addEventListener("click", (e) => {
        // Chỉ áp dụng nếu link thực sự chuyển trang (không phải filter trên shop.html)
        const isShopPage = window.location.pathname.toLowerCase().includes("shop.html");
        if (isShopPage) return; // Trên shop.html, để header widget xử lý filter

        if (!shouldApplyTransition(anchor)) return;
        e.preventDefault();
        navigateWithTransition(anchor.href);
      });
    });

    // 3. Mega nav drawer links (danh mục chi tiết)
    const megaLinks = document.querySelectorAll(".mega-nav-link");
    megaLinks.forEach(anchor => {
      if (anchor._ptBound) return;
      anchor._ptBound = true;
      anchor.addEventListener("click", (e) => {
        const isShopPage = window.location.pathname.toLowerCase().includes("shop.html");
        if (isShopPage) return; // Trên shop.html, để header widget xử lý filter

        if (!shouldApplyTransition(anchor)) return;
        e.preventDefault();
        navigateWithTransition(anchor.href);
      });
    });
  }

  /**
   * Quan sát DOM thay đổi để gắn transition cho các link được render sau
   * (ví dụ: mega nav render dynamic)
   */
  function observeDynamicLinks() {
    const observer = new MutationObserver((mutations) => {
      let hasNewLinks = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              // Kiểm tra nếu node hoặc con cháu có link mega-nav hoặc data-page-transition
              if (node.matches && (node.matches(".mega-nav-link") || node.matches("a[data-page-transition]"))) {
                hasNewLinks = true;
                break;
              }
              if (node.querySelectorAll && (node.querySelectorAll(".mega-nav-link").length > 0 ||
                node.querySelectorAll("a[data-page-transition]").length > 0)) {
                hasNewLinks = true;
                break;
              }
            }
          }
        }
        if (hasNewLinks) break;
      }
      if (hasNewLinks) {
        attachHeaderNavTransitions();
        attachAutoTransitionLinks();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // =========================================================================
  // CUSTOM ELEMENT: <womanwan-page-transition>
  // =========================================================================
  if (typeof customElements !== "undefined" && !customElements.get("womanwan-page-transition")) {
    class WomanWanPageTransition extends HTMLElement {
      connectedCallback() {
        this.style.display = "contents";
        const basePath = this.getAttribute("base-path") || resolveBasePath();
        this.innerHTML = createOverlayHTML(basePath);

        // Đợi DOM header render xong rồi mới gắn sự kiện
        requestAnimationFrame(() => {
          setTimeout(() => {
            attachHeaderNavTransitions();
            attachAutoTransitionLinks();
            observeDynamicLinks();
          }, 100);
        });
      }
    }
    customElements.define("womanwan-page-transition", WomanWanPageTransition);
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================
  window.WanPageTransition = {
    /**
     * Kích hoạt hiệu ứng chuyển trang thủ công
     * @param {string} url — URL đích
     */
    navigate: navigateWithTransition,

    /**
     * Gắn lại sự kiện transition cho các link mới được thêm vào DOM
     */
    refresh: () => {
      attachHeaderNavTransitions();
      attachAutoTransitionLinks();
    }
  };

})();
