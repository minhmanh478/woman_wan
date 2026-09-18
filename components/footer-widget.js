/**
 * ============================================================================
 * WOMAN WAN - REUSABLE FOOTER WIDGET (WEB COMPONENT & HELPER)
 * ============================================================================
 * Cách dùng:
 * 1. Nhúng script vào trang:
 *    <script src="components/footer-widget.js"></script>  (ở trang root)
 *    <script src="../components/footer-widget.js"></script> (ở trang con /product/)
 *
 * 2. Gọi hiển thị ở bất kỳ trang nào bằng 1 trong các cách sau:
 *    - Cách 1 (Khuyên dùng - Custom Tag): <womanwan-footer></womanwan-footer>
 *    - Cách 2 (HTML ID/Class):           <footer id="siteFooter"></footer>
 *    - Cách 3 (Data Attribute):          <div data-widget="footer"></div>
 *    - Cách 4 (Gọi qua JS):              WomanWanFooter.render("#my-footer-container");
 * ============================================================================
 */

(function () {
  "use strict";

  /**
   * Tự động xác định đường dẫn tương đối tới root (./ hoặc ../)
   */
  function resolveBasePath(customPath) {
    if (customPath) return customPath;
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/product/") || path.includes("/produc/") || path.includes("/checkout/")) {
      return "../";
    }
    return "./";
  }

  /**
   * Tạo chuỗi HTML hoàn chỉnh cho Footer theo chuẩn Clean Fit của WOMAN WAN
   */
  function createFooterHTML(basePath) {
    const prefix = basePath || resolveBasePath();

    return `
    <footer class="womanwan-footer" role="contentinfo" aria-label="Chân trang WOMAN WAN">
      <div class="footer-grid">
        <!-- Cột 1: Thông tin thương hiệu & Mạng xã hội -->
        <div class="footer-brand-col">
          <a href="${prefix}index.html" class="footer-logo" aria-label="WOMANWAN Trang chủ">
            <img src="${prefix}assets/logos/LOGO-WOMANWAN-WHITE.png" alt="WOMANWAN" class="footer-logo-img" loading="lazy">
          </a>
          <div class="footer-brand-info">
            <div>Giờ làm: 8h30 - 22h00</div>
            <div>Hotline: <a href="tel:0867774069">0867 774 069</a></div>
            <div>Email: <a href="mailto:womanwan.vn@gmail.com">womanwan.vn@gmail.com</a></div>
          </div>
          <div class="footer-socials">
            <a href="https://www.facebook.com/womanwan.vn/" target="_blank" rel="noopener noreferrer" class="footer-social-btn"
              aria-label="Fanpage Facebook WOMANWAN" title="Facebook WOMANWAN">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/womanwan.off" target="_blank" rel="noopener noreferrer" class="footer-social-btn"
              aria-label="Instagram WOMANWAN" title="Instagram WOMANWAN">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@womanwan.off" target="_blank" rel="noopener noreferrer" class="footer-social-btn"
              aria-label="TikTok Shop WOMANWAN" title="TikTok Shop WOMANWAN">
              <svg class="icon-tiktok-svg" width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.69a6.34 6.34 0 0 0 6.34 6.31 6.34 6.34 0 0 0 6.34-6.31V9.49a8.16 8.16 0 0 0 4.91 1.63v-3.46a4.85 4.85 0 0 1-1-.97z" />
              </svg>
            </a>
            <a href="https://shopee.vn/womanwan.off" target="_blank" rel="noopener noreferrer" class="footer-social-btn"
              aria-label="Shopee Mall WOMANWAN" title="Shopee Mall WOMANWAN">
              <img src="${prefix}assets/icons/contact/icon_shopee.png" alt="Shopee Mall WOMANWAN" class="footer-social-img">
            </a>
          </div>
        </div>

        <!-- Cột 2: Sản phẩm -->
        <div>
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="${prefix}shop.html?filter=new">Hàng mới về</a></li>
            <li><a href="${prefix}shop.html?gender=women">Quần Áo Nữ</a></li>
            <li><a href="${prefix}shop.html?gender=men">Quần Áo Nam</a></li>
            <li><a href="${prefix}shop.html?filter=sale">Khuyến mãi & Ưu đãi</a></li>
          </ul>
        </div>

        <!-- Cột 3: Hỗ trợ -->
        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Tra cứu đơn hàng</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Hướng dẫn chọn size</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>

        <!-- Cột 4: Về WOMAN WAN -->
        <div>
          <h4>Về WOMAN WAN</h4>
          <ul>
            <li><a href="${prefix}index.html#trending">Câu chuyện thương hiệu</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Cửa hàng</a></li>
            <li><a href="#">Bền vững</a></li>
          </ul>
        </div>
      </div>

      <!-- Dòng bản quyền dưới cùng -->
      <div class="footer-bottom">
        <span>© 2026 WOMAN WAN · Website đang trong quá trình phát triển bởi đội ngũ</span>
        <span>Điều khoản · Bảo mật</span>
      </div>
    </footer>
    `;
  }

  // Khởi tạo Custom Element <womanwan-footer>
  if (typeof customElements !== "undefined" && !customElements.get("womanwan-footer")) {
    class WomanWanFooterElement extends HTMLElement {
      connectedCallback() {
        const basePath = this.getAttribute("base-path") || resolveBasePath();
        this.innerHTML = createFooterHTML(basePath);
      }
    }
    customElements.define("womanwan-footer", WomanWanFooterElement);
  }

  // Tự động quét và render vào các phần tử có sẵn nếu chưa dùng custom tag
  function autoRenderExistingFooters() {
    const targets = document.querySelectorAll("[data-widget='footer'], #womanwan-footer, #siteFooter");
    targets.forEach((el) => {
      const basePath = el.getAttribute("data-base-path") || resolveBasePath();
      el.outerHTML = createFooterHTML(basePath);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoRenderExistingFooters);
  } else {
    autoRenderExistingFooters();
  }

  // Export API toàn cục để có thể gọi thủ công khi cần
  window.WomanWanFooter = {
    getHTML: createFooterHTML,
    render: function (target, basePath) {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) {
        el.outerHTML = createFooterHTML(basePath);
      }
    }
  };
})();
