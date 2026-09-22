

(function () {
  "use strict";

  // Dữ liệu dự phòng mặc định nếu fetch JSON gặp lỗi mạng hoặc chạy qua file://
  const DEFAULT_NAV_CONFIG = {
    announcement: {
      text: "Miễn phí đổi trả trong 30 ngày cho thành viên Woman Wan",
      link: "shop.html?filter=sale",
      enabled: true
    },
    brand: {
      name: "Woman Wan",
      logo: "assets/logos/1212.png",
      homeUrl: "index.html",
      megaDrawerLogo: "assets/logos/LOGO-WOMANWAN.png"
    },
    navTabs: [
      { id: "navMen", key: "men", label: "Nam", url: "shop.html?gender=men" },
      { id: "navWomen", key: "women", label: "Nữ", url: "shop.html?gender=women" },
      { id: "navSale", key: "sale", label: "Khuyến mãi", url: "shop.html?filter=sale" }
    ],
    search: {
      placeholder: "Tìm kiếm sản phẩm...",
      actionUrl: "shop.html"
    },
    megaMenu: {
      men: {
        title: "Nam",
        categories: [
          { name: "Thịnh hành", tag: "trending", link: "shop.html?gender=men&filter=trending" },
          { name: "Áo thun & Tank", tag: "tshirt", link: "shop.html?gender=men&category=tshirt" },
          { name: "Quần short & Dài", tag: "shorts", link: "shop.html?gender=men&category=shorts" },
          { name: "Áo khoác thể thao", tag: "jacket", link: "shop.html?gender=men&category=jacket" },
          { name: "Bộ sưu tập Nam", tag: "collection", link: "shop.html?gender=men&collection=all" },
          { name: "Phụ kiện", tag: "accessories", link: "shop.html?gender=men&category=accessories" },
          { name: "Khuyến mãi Nam", tag: "sale", link: "shop.html?gender=men&filter=sale" },
          { name: "Khám phá", tag: "explore", link: "shop.html?gender=men" }
        ]
      },
      women: {
        title: "Nữ",
        categories: [
          { name: "Thịnh hành", tag: "trending", link: "shop.html?gender=women&filter=trending" },
          { name: "Quần legging", tag: "legging", link: "shop.html?gender=women&category=legging" },
          { name: "Tất cả sản phẩm", tag: "all", "link": "shop.html?gender=women" },
          { name: "Bộ sưu tập", tag: "collection", link: "shop.html?gender=women&collection=all" },
          { name: "Hoạt động thể thao", tag: "activity", link: "shop.html?gender=women&filter=activity" },
          { name: "Phụ kiện", tag: "accessories", link: "shop.html?gender=women&category=accessories" },
          { name: "Cơ hội cuối", tag: "sale", link: "shop.html?gender=women&filter=sale" },
          { name: "Khám phá", tag: "explore", link: "shop.html?gender=women" }
        ]
      },
      sale: {
        title: "Khuyến mãi",
        categories: [
          { name: "Giảm giá đến 50%", tag: "sale-50", link: "shop.html?filter=sale&discount=50" },
          { name: "Sản phẩm mới giảm giá", tag: "new-sale", link: "shop.html?filter=sale&sort=new" },
          { name: "Đồ tập Nữ giảm giá", tag: "women-sale", link: "shop.html?gender=women&filter=sale" },
          { name: "Đồ tập Nam giảm giá", tag: "men-sale", link: "shop.html?gender=men&filter=sale" },
          { name: "Phụ kiện giảm giá", tag: "acc-sale", link: "shop.html?category=accessories&filter=sale" },
          { name: "Cơ hội cuối cùng", tag: "last-chance", link: "shop.html?filter=sale" }
        ]
      }
    }
  };

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
   * Tải cấu hình navigation từ file navigation.json
   */
  let cachedConfig = null;
  async function loadNavConfig(prefix) {
    if (cachedConfig) return cachedConfig;
    try {
      const res = await fetch(`${prefix}navigation.json`);
      if (res.ok) {
        cachedConfig = await res.json();
        return cachedConfig;
      }
    } catch (err) {
      console.warn("WomanWanHeader: Using fallback navigation configuration", err);
    }
    cachedConfig = DEFAULT_NAV_CONFIG;
    return cachedConfig;
  }

  /**
   * Xác định tab đang được active dựa trên URL query
   */
  function detectActiveTab() {
    const params = new URLSearchParams(window.location.search);
    const gender = params.get("gender");
    const filter = params.get("filter");
    if (gender === "men") return "men";
    if (gender === "women") return "women";
    if (filter === "sale") return "sale";
    return "women"; // Mặc định
  }

  /**
   * Tạo chuỗi HTML cho toàn bộ Header + Utility Bar + Mega Nav Drawer
   */
  function renderHeaderHTML(config, prefix) {
    const activeTab = detectActiveTab();

    // 1. Utility Bar (Seamless Infinite Marquee)
    let utilBarHTML = "";
    if (config.announcement && config.announcement.enabled) {
      const itemLink = config.announcement.link
        ? `<a href="${prefix}${config.announcement.link}" class="util-link">${config.announcement.text}</a>`
        : `<span>${config.announcement.text}</span>`;

      const chunkHTML = `
        <span class="util-item">${itemLink}</span>
        <span class="util-sep" aria-hidden="true">•</span>
        <span class="util-item">${itemLink}</span>
        <span class="util-sep" aria-hidden="true">•</span>
        <span class="util-item">${itemLink}</span>
        <span class="util-sep" aria-hidden="true">•</span>
      `;

      utilBarHTML = `
        <div class="util-bar" role="region" aria-label="Thông báo">
          <div class="util-track">
            <div class="util-content">${chunkHTML}</div>
            <div class="util-content" aria-hidden="true">${chunkHTML}</div>
          </div>
        </div>
      `;
    }

    // 2. Navigation List
    const navListHTML = config.navTabs.map(tab => {
      const isActive = tab.key === activeTab;
      return `
        <li class="${isActive ? 'active' : ''}" id="navLi_${tab.key}">
          <a href="${prefix}${tab.url}" id="${tab.id}" data-tab="${tab.key}">
            ${tab.label}
          </a>
        </li>
      `;
    }).join("");

    // 3. Main Header
    const mainHeaderHTML = `
      <header class="main">
        <!-- Mobile Left Controls (Gymshark Style: 2-line Hamburger + Search) -->
        <div class="header-mobile-left">
          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Mở menu điều hướng" title="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <button class="mobile-search-btn" id="mobileSearchBtn" aria-label="Tìm kiếm sản phẩm" title="Tìm kiếm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <a href="${prefix}${config.brand.homeUrl}" class="logo" aria-label="${config.brand.name} Trang chủ">
          <img src="${prefix}${config.brand.logo}" alt="${config.brand.name}">
        </a>
        <nav class="primary">
          <ul style="display:flex;gap:26px;">
            ${navListHTML}
          </ul>
        </nav>
        <div class="header-actions">
          <div class="search-box">
            <img src="${prefix}assets/icons/search.svg" alt="Tìm kiếm" class="action-icon search-icon">
            <input type="text" class="search-input" id="searchInput" placeholder="${config.search.placeholder}"
              aria-label="${config.search.placeholder}">
          </div>
          <a href="#" class="icon-btn header-user-btn" aria-label="Tài khoản">
            <img src="${prefix}assets/icons/user-profile.svg" alt="Tài khoản" class="action-icon">
          </a>
          <a href="#" class="icon-btn header-wishlist-btn" id="wishlistBtn" aria-label="Yêu thích">
            <img src="${prefix}assets/icons/heart.svg" alt="Yêu thích" class="action-icon">
            <span class="badge-count" id="wishlistBadge" style="display:none;">0</span>
          </a>
          <a href="#" class="icon-btn header-cart-btn" id="cartBtn" aria-label="Giỏ hàng">
            <img src="${prefix}assets/icons/bag.svg" alt="Giỏ hàng" class="action-icon">
            <span class="badge-count" id="cartBadge" style="display:none;">0</span>
          </a>
        </div>

        <!-- Mobile Search Dropdown Bar -->
        <div class="mobile-search-dropdown" id="mobileSearchDropdown" aria-hidden="true">
          <div class="mobile-search-inner">
            <img src="${prefix}assets/icons/search.svg" alt="Tìm kiếm" class="action-icon">
            <input type="text" class="mobile-search-input" id="mobileSearchInput" placeholder="${config.search.placeholder}" aria-label="${config.search.placeholder}">
            <button type="button" class="mobile-search-close-btn" id="mobileSearchCloseBtn" aria-label="Đóng tìm kiếm">✕</button>
          </div>
        </div>
      </header>
    `;

    // 4. Mega Nav Overlay & Drawer
    const megaDrawerHTML = `
      <!-- LEFT MEGA NAV OVERLAY -->
      <div class="mega-nav-overlay" id="megaNavOverlay"></div>

      <!-- LEFT MEGA NAV DRAWER (GYMSHARK STYLE) -->
      <aside class="mega-nav-drawer" id="megaNavDrawer" aria-hidden="true" role="dialog" aria-modal="true"
        aria-label="Menu điều hướng">
        <div class="mega-nav-header">
          <div class="mega-nav-tabs">
            <button class="mega-tab ${activeTab === 'men' ? 'active' : ''}" id="megaTabMen" data-tab="men">Nam</button>
            <button class="mega-tab ${activeTab === 'women' ? 'active' : ''}" id="megaTabWomen" data-tab="women">Nữ</button>
            <button class="mega-tab ${activeTab === 'sale' ? 'active' : ''}" id="megaTabSale" data-tab="sale">Khuyến mãi</button>
          </div>
          <button class="mega-close-btn" id="megaCloseBtn" aria-label="Đóng menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="mega-nav-body">
          <ul class="mega-nav-list" id="megaNavList">
            <!-- Rendered dynamically from config.megaMenu -->
          </ul>
        </div>

        <div class="mega-nav-footer">
          <img src="${prefix}${config.brand.megaDrawerLogo}" alt="${config.brand.name}" class="mega-footer-logo">
        </div>
      </aside>
    `;

    // 5. Cart Overlay & Cart Drawer (Gymshark / Clean Fit Mini-Cart)
    const cartDrawerHTML = `
      <!-- CART OVERLAY -->
      <div class="cart-overlay" id="cartOverlay"></div>

      <!-- CART DRAWER -->
      <aside class="cart-drawer" id="cartDrawer" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Giỏ hàng">
        <!-- Header -->
        <div class="cart-header">
          <h2 class="cart-title" id="cartTitle">GIỎ HÀNG CỦA BẠN</h2>
          <div class="cart-header-actions">
            <button class="cart-header-tab" id="tabWishlist" title="Sản phẩm yêu thích" aria-label="Sản phẩm yêu thích">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.69C2 5.6 4.49 3.1 7.56 3.1C9.38 3.1 10.99 3.98 12 5.34C13.01 3.98 14.63 3.1 16.44 3.1C19.51 3.1 22 5.6 22 8.69C22 15.69 15.52 19.82 12.62 20.81Z" />
              </svg>
            </button>
            <button class="cart-header-tab active" id="tabCart" title="Giỏ hàng" aria-label="Giỏ hàng">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M15.6 8.4V5.4C15.6 3.4 14 1.8 12 1.8C10 1.8 8.4 3.4 8.4 5.4V8.4M4.7 22.2H19.3C20.6 22.2 21.6 21.2 21.6 19.9L20.1 7.8C20.1 6.5 19.1 5.5 17.8 5.5H5.9C4.6 5.5 3.6 6.5 3.6 7.8L2.4 19.9C2.4 21.2 3.4 22.2 4.7 22.2Z" />
              </svg>
            </button>
            <button class="cart-close-btn" id="cartCloseBtn" aria-label="Đóng">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Body -->
        <div class="cart-body">
          <!-- CART ITEMS VIEW -->
          <div class="cart-items-view" id="cartItemsView">
            <!-- Free Shipping Progress -->
            <div class="shipping-progress-box">
              <div class="shipping-progress-text">
                <span id="shippingProgressText">Bạn chỉ còn thiếu <strong>1.000.000₫</strong> để được Miễn phí giao hàng</span>
                <span class="info-icon" title="Miễn phí vận chuyển cho đơn từ 1.000.000₫">ⓘ</span>
              </div>
              <div class="progress-track">
                <div class="progress-bar" id="shippingProgressBar" style="width: 0%;"></div>
              </div>
              <div class="progress-labels">
                <span>0₫</span>
                <span>1.000.000₫</span>
              </div>
            </div>

            <!-- Cart Items Container -->
            <div class="cart-items-list" id="cartItemsList"></div>

            <!-- Cross-sell Section -->
            <div class="cross-sell-section">
              <div class="cross-sell-header">
                <h3>GỢI Ý THÊM CHO BẠN</h3>
                <p>Thêm các sản phẩm dưới đây để nhận ưu đãi miễn phí giao hàng</p>
              </div>
              <div class="cross-sell-grid">
                <div class="cross-sell-card">
                  <div class="cross-sell-thumb">
                    <img src="${prefix}assets/sanpham_test/co_tau2.jpg" alt="Conditioning Club Cap">
                  </div>
                  <div class="cross-sell-info">
                    <span class="cross-tag">Mới</span>
                    <div class="cross-name">Conditioning Club Cap</div>
                    <div class="cross-price">250.000₫</div>
                  </div>
                  <button class="cross-add-btn" data-name="Conditioning Club Cap" data-price="250000" data-img="assets/sanpham_test/co_tau2.jpg" data-variant="Mũ thể thao · Free size">+ Thêm</button>
                </div>
                <div class="cross-sell-card">
                  <div class="cross-sell-thumb">
                    <img src="${prefix}assets/sanpham_test/co_tau.jpg" alt="Sport Tote Bag Mini">
                  </div>
                  <div class="cross-sell-info">
                    <span class="cross-tag">Mới</span>
                    <div class="cross-name">Sport Tote Bag Mini</div>
                    <div class="cross-price">320.000₫</div>
                  </div>
                  <button class="cross-add-btn" data-name="Sport Tote Bag Mini" data-price="320000" data-img="assets/sanpham_test/co_tau.jpg" data-variant="Túi tote thể thao · Đen">+ Thêm</button>
                </div>
              </div>
            </div>

            <!-- Discount Code -->
            <div class="discount-section">
              <h3 class="section-heading">MÃ GIẢM GIÁ</h3>
              <form class="discount-form" id="discountForm">
                <input type="text" class="discount-input" id="discountCodeInput" placeholder="Nhập mã giảm giá...">
                <button type="submit" class="discount-btn">Áp dụng</button>
              </form>
              <div class="discount-hint">ⓘ Nhập WOMANWAN hoặc SALE10 để giảm 10%.</div>
            </div>

            <!-- Order Summary -->
            <div class="summary-section">
              <h3 class="section-heading">TỔNG KẾT ĐƠN HÀNG</h3>
              <div class="summary-row">
                <span>Tạm tính</span>
                <span id="cartSubTotal">0₫</span>
              </div>
              <div class="summary-row" id="discountRow" style="display:none;color:#e2231a;">
                <span>Giảm giá</span>
                <span id="cartDiscount">-0₫</span>
              </div>
              <div class="summary-row">
                <span>Phí vận chuyển dự tính</span>
                <span id="cartShipping">30.000₫</span>
              </div>
              <div class="summary-row total-row">
                <span>Tổng cộng</span>
                <span id="cartTotal">0₫</span>
              </div>
            </div>
          </div>

          <!-- SAVED / WISHLIST ITEMS VIEW -->
          <div class="saved-items-view" id="savedItemsView">
            <div class="cart-items-list" id="savedItemsList"></div>
          </div>
        </div>

        <!-- Sticky Footer Checkout -->
        <div class="cart-footer" id="cartFooter">
          <button class="checkout-btn" id="cartCheckoutBtn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            Thanh toán an toàn
          </button>
        </div>
      </aside>
    `;

    return utilBarHTML + mainHeaderHTML + megaDrawerHTML + cartDrawerHTML;
  }

  /**
   * Helper định dạng tiền tệ VND
   */
  function formatVND(num) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num || 0).replace("₫", "").trim() + "₫";
  }

  /**
   * Helper chuẩn hóa đường dẫn hình ảnh theo cấp thư mục
   */
  function resolveItemImage(imgUrl, prefix) {
    if (!imgUrl) return `${prefix}assets/sanpham_test/co_tau.jpg`;
    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://") || imgUrl.startsWith("data:")) {
      return imgUrl;
    }
    const clean = imgUrl.replace(/^(\.\.\/|\.\/)+/, "");
    return `${prefix}${clean}`;
  }

  /**
   * Truy xuất và lưu trữ giỏ hàng / danh sách yêu thích
   */
  function getCartData() {
    try {
      const raw = localStorage.getItem("wan_cart_v1") || localStorage.getItem("wan_cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCartData(cart) {
    localStorage.setItem("wan_cart_v1", JSON.stringify(cart));
    localStorage.setItem("wan_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("wan:cart-updated"));
  }

  function getWishlistData() {
    try {
      const raw = localStorage.getItem("wan_wishlist_v1") || localStorage.getItem("wan_wishlist");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlistData(list) {
    localStorage.setItem("wan_wishlist_v1", JSON.stringify(list));
    localStorage.setItem("wan_wishlist", JSON.stringify(list));
    window.dispatchEvent(new Event("wan:wishlist-updated"));
  }

  /**
   * Toast notification helper
   */
  function showWidgetToast(msg) {
    let toast = document.getElementById("wanToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "wan-toast";
      toast.id = "wanToast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  /**
   * Kết nối và xử lý toàn bộ sự kiện của Header & Mega Nav
   */
  function setupHeaderInteractions(container, config, prefix) {
    const megaNavDrawer = container.querySelector("#megaNavDrawer") || document.getElementById("megaNavDrawer");
    const megaNavOverlay = container.querySelector("#megaNavOverlay") || document.getElementById("megaNavOverlay");
    const megaCloseBtn = container.querySelector("#megaCloseBtn") || document.getElementById("megaCloseBtn");
    const megaNavList = container.querySelector("#megaNavList") || document.getElementById("megaNavList");
    const primaryNav = container.querySelector("nav.primary") || document.querySelector("nav.primary");
    const searchInput = container.querySelector("#searchInput") || document.getElementById("searchInput");
    const searchIcon = container.querySelector(".search-icon") || document.querySelector(".search-icon");
    const cartBtn = container.querySelector("#cartBtn") || document.getElementById("cartBtn");
    const wishlistBtn = container.querySelector("#wishlistBtn") || document.getElementById("wishlistBtn");

    // Cart Drawer elements
    const cartDrawer = container.querySelector("#cartDrawer") || document.getElementById("cartDrawer");
    const cartOverlay = container.querySelector("#cartOverlay") || document.getElementById("cartOverlay");
    const cartCloseBtn = container.querySelector("#cartCloseBtn") || document.getElementById("cartCloseBtn");
    const tabCart = container.querySelector("#tabCart") || document.getElementById("tabCart");
    const tabWishlist = container.querySelector("#tabWishlist") || document.getElementById("tabWishlist");
    const cartTitle = container.querySelector("#cartTitle") || document.getElementById("cartTitle");
    const cartItemsView = container.querySelector("#cartItemsView") || document.getElementById("cartItemsView");
    const savedItemsView = container.querySelector("#savedItemsView") || document.getElementById("savedItemsView");
    const cartFooter = container.querySelector("#cartFooter") || document.getElementById("cartFooter");
    const cartItemsList = container.querySelector("#cartItemsList") || document.getElementById("cartItemsList");
    const savedItemsList = container.querySelector("#savedItemsList") || document.getElementById("savedItemsList");
    const discountForm = container.querySelector("#discountForm") || document.getElementById("discountForm");
    const discountCodeInput = container.querySelector("#discountCodeInput") || document.getElementById("discountCodeInput");
    const cartCheckoutBtn = container.querySelector("#cartCheckoutBtn") || document.getElementById("cartCheckoutBtn");

    let currentTab = detectActiveTab();
    let megaNavHoverTimer = null;
    let currentDrawerTab = "cart";
    let discountPercent = 0;
    const FREE_SHIPPING_THRESHOLD = 1000000;
    const DEFAULT_SHIPPING_FEE = 30000;

    function updateHeaderOffset() {
      const header = container.querySelector("header.main") || document.querySelector("header.main");
      if (header) {
        const bottom = header.getBoundingClientRect().bottom;
        document.documentElement.style.setProperty("--header-bottom", Math.max(0, Math.round(bottom)) + "px");
      }
    }

    window.addEventListener("scroll", updateHeaderOffset, { passive: true });
    window.addEventListener("resize", updateHeaderOffset, { passive: true });
    updateHeaderOffset();

    function scheduleCloseMegaNav() {
      clearTimeout(megaNavHoverTimer);
      megaNavHoverTimer = setTimeout(() => {
        closeMegaMenu();
      }, 260);
    }

    function cancelCloseMegaNav() {
      clearTimeout(megaNavHoverTimer);
    }

    function renderMegaCategories(tabKey) {
      currentTab = tabKey;
      const tabData = config.megaMenu[tabKey] || config.megaMenu.women;

      // Update active tabs inside drawer
      const tabBtns = {
        men: container.querySelector("#megaTabMen") || document.getElementById("megaTabMen"),
        women: container.querySelector("#megaTabWomen") || document.getElementById("megaTabWomen"),
        sale: container.querySelector("#megaTabSale") || document.getElementById("megaTabSale")
      };
      Object.keys(tabBtns).forEach(k => {
        if (tabBtns[k]) {
          if (k === tabKey) tabBtns[k].classList.add("active");
          else tabBtns[k].classList.remove("active");
        }
      });

      // Update active state in top header nav
      config.navTabs.forEach(t => {
        const li = container.querySelector(`#navLi_${t.key}`) || document.getElementById(`navLi_${t.key}`);
        if (li) {
          if (t.key === tabKey) li.classList.add("active");
          else li.classList.remove("active");
        }
      });

      // Render danh mục với mũi tên >
      if (megaNavList) {
        megaNavList.innerHTML = tabData.categories.map(cat => {
          const categoryUrl = cat.link ? `${prefix}${cat.link}` : `${prefix}shop.html?gender=${tabKey}&category=${encodeURIComponent(cat.name)}`;
          return `
            <li class="mega-nav-item">
              <a class="mega-nav-link" href="${categoryUrl}" data-tag="${cat.tag || ''}" data-name="${cat.name}" data-tab="${tabKey}">
                <span>${cat.name}</span>
                <svg class="mega-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </li>
          `;
        }).join("");

        // Gắn sự kiện click vào link danh mục (nếu đang ở trang shop.html thì filter mượt mà)
        megaNavList.querySelectorAll(".mega-nav-link").forEach(a => {
          a.addEventListener("click", (e) => {
            const isShopPage = window.location.pathname.toLowerCase().includes("shop.html");
            if (isShopPage && typeof window.handleMegaCategoryClick === "function") {
              e.preventDefault();
              closeMegaMenu();
              window.handleMegaCategoryClick(a.dataset.tag, a.dataset.name, e, a.dataset.tab);
            } else {
              closeMegaMenu();
            }
          });
        });
      }
    }

    function openMegaMenu(tabKey) {
      if (cartDrawer && cartDrawer.classList.contains("open")) closeCart();
      updateHeaderOffset();
      cancelCloseMegaNav();
      renderMegaCategories(tabKey);
      if (megaNavDrawer) {
        megaNavDrawer.classList.add("open");
        megaNavDrawer.setAttribute("aria-hidden", "false");
      }
      if (megaNavOverlay) {
        megaNavOverlay.classList.add("open");
      }
      if (window.innerWidth < 768) {
        document.body.style.overflow = "hidden";
      }
    }

    function closeMegaMenu() {
      cancelCloseMegaNav();
      if (megaNavDrawer) {
        megaNavDrawer.classList.remove("open");
        megaNavDrawer.setAttribute("aria-hidden", "true");
      }
      if (megaNavOverlay) {
        megaNavOverlay.classList.remove("open");
      }
      document.body.style.overflow = "";
    }

    // =========================================================================
    // CART & WISHLIST DRAWER CONTROLLER
    // =========================================================================
    function openCart() {
      closeMegaMenu();
      if (currentDrawerTab === "wishlist") {
        renderSavedItems();
      } else {
        renderCart();
      }
      if (cartDrawer) {
        cartDrawer.classList.add("open");
        cartDrawer.setAttribute("aria-hidden", "false");
      }
      if (cartOverlay) cartOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeCart() {
      if (cartDrawer) {
        cartDrawer.classList.remove("open");
        cartDrawer.setAttribute("aria-hidden", "true");
      }
      if (cartOverlay) cartOverlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    function switchDrawerTab(tab) {
      currentDrawerTab = tab;
      if (tab === "cart") {
        if (tabCart) tabCart.classList.add("active");
        if (tabWishlist) tabWishlist.classList.remove("active");
        if (cartTitle) cartTitle.textContent = "GIỎ HÀNG CỦA BẠN";
        if (cartItemsView) cartItemsView.classList.remove("hidden");
        if (savedItemsView) savedItemsView.classList.remove("active");
        if (cartFooter) cartFooter.style.display = "flex";
        renderCart();
      } else {
        if (tabWishlist) tabWishlist.classList.add("active");
        if (tabCart) tabCart.classList.remove("active");
        if (cartTitle) cartTitle.textContent = "SẢN PHẨM YÊU THÍCH";
        if (cartItemsView) cartItemsView.classList.add("hidden");
        if (savedItemsView) savedItemsView.classList.add("active");
        if (cartFooter) cartFooter.style.display = "none";
        renderSavedItems();
      }
    }

    function changeCartQty(index, delta) {
      const cart = getCartData();
      if (!cart[index]) return;
      cart[index].qty = (cart[index].qty || 1) + delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCartData(cart);
      renderCart();
    }

    function removeCartItem(index) {
      const cart = getCartData();
      if (!cart[index]) return;
      cart.splice(index, 1);
      saveCartData(cart);
      renderCart();
    }

    function addCrossItem(name, price, img, variant) {
      const cart = getCartData();
      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({
          id: "cross-" + Date.now(),
          name: name,
          variant: variant || "Mặc định",
          price: price,
          qty: 1,
          image: img,
          isNew: true
        });
      }
      saveCartData(cart);
      renderCart();
      showWidgetToast(`✓ Đã thêm "${name}" vào giỏ hàng`);
    }

    function applyDiscount(customCode) {
      const code = (customCode || (discountCodeInput ? discountCodeInput.value : "")).trim().toUpperCase();
      if (!code) return;
      if (code === "WOMANWAN" || code === "SALE10" || code === "WAN10") {
        discountPercent = 0.1;
        showWidgetToast("Áp dụng mã giảm giá 10% thành công!");
      } else {
        showWidgetToast("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
      }
      renderCart();
    }

    function handleCheckout() {
      const cart = getCartData();
      if (cart.length === 0) {
        showWidgetToast("Giỏ hàng của bạn đang trống!");
        return;
      }
      // Resolve path correctly depending on current directory
      const depth = window.location.pathname.split('/').length - 2;
      const prefix = depth > 0 && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('shop.html') && !window.location.pathname.endsWith('/') ? '../' : './';
      // Simpler approach for known structure:
      const isSubDir = window.location.pathname.includes('/product/') || window.location.pathname.includes('/checkout/');
      window.location.href = isSubDir ? '../checkout/index.html' : './checkout/index.html';
    }

    function removeWishlistItem(id) {
      let list = getWishlistData();
      list = list.filter(item => (typeof item === "object" ? item.id : item) !== id);
      saveWishlistData(list);
      renderSavedItems();
      showWidgetToast("Đã bỏ lưu sản phẩm");
    }

    function renderCart() {
      const cart = getCartData();
      const listEl = container.querySelector("#cartItemsList") || document.getElementById("cartItemsList");
      if (!listEl) return;

      updateBadges();

      if (cart.length === 0) {
        listEl.innerHTML = `
          <div class="empty-cart-state" style="text-align:center;padding:40px 20px;color:#767676;">
            <p style="font-size:16px;font-weight:600;color:#111;margin-bottom:8px;">Giỏ hàng của bạn đang trống</p>
            <p style="font-size:13px;margin-bottom:16px;">Hãy khám phá các mẫu trang phục mới nhất của Woman Wan.</p>
            <button class="load-more-btn" id="emptyExploreBtn" style="padding:10px 24px;background:#111;color:#fff;font-weight:700;border:none;border-radius:0;cursor:pointer;">Khám phá ngay</button>
          </div>
        `;
        const exploreBtn = listEl.querySelector("#emptyExploreBtn");
        if (exploreBtn) {
          exploreBtn.addEventListener("click", () => {
            closeCart();
            window.location.href = `${prefix}shop.html`;
          });
        }
      } else {
        listEl.innerHTML = cart.map((item, index) => {
          const itemImg = resolveItemImage(item.image, prefix);
          return `
            <div class="cart-item">
              <div class="cart-item-img">
                <img src="${itemImg}" alt="${item.name}" loading="lazy">
              </div>
              <div class="cart-item-details">
                <div class="cart-item-top">
                  <h4 class="cart-item-name">${item.name}</h4>
                  <button class="cart-item-remove" data-index="${index}" title="Xóa" aria-label="Xóa sản phẩm">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </button>
                </div>
                <div class="cart-item-variant">${item.variant || 'Tiêu chuẩn'}</div>
                <div class="cart-item-bottom">
                  <div class="qty-stepper">
                    <button class="qty-btn cart-qty-minus" data-index="${index}" aria-label="Giảm số lượng">−</button>
                    <span class="qty-val">${item.qty || 1}</span>
                    <button class="qty-btn cart-qty-plus" data-index="${index}" aria-label="Tăng số lượng">+</button>
                  </div>
                  <div class="cart-item-price">${formatVND((item.price || 0) * (item.qty || 1))}</div>
                </div>
              </div>
            </div>
          `;
        }).join("");

        // Stepper buttons & Remove buttons
        listEl.querySelectorAll(".cart-qty-minus").forEach(btn => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index, 10);
            changeCartQty(idx, -1);
          });
        });
        listEl.querySelectorAll(".cart-qty-plus").forEach(btn => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index, 10);
            changeCartQty(idx, 1);
          });
        });
        listEl.querySelectorAll(".cart-item-remove").forEach(btn => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index, 10);
            removeCartItem(idx);
          });
        });
      }

      // Calculations
      const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
      const discount = Math.round(subtotal * discountPercent);
      const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
      const shipping = isFreeShipping ? 0 : (subtotal > 0 ? DEFAULT_SHIPPING_FEE : 0);
      const total = Math.max(0, subtotal - discount + shipping);

      const subTotalEl = container.querySelector("#cartSubTotal") || document.getElementById("cartSubTotal");
      const discountRow = container.querySelector("#discountRow") || document.getElementById("discountRow");
      const discountEl = container.querySelector("#cartDiscount") || document.getElementById("cartDiscount");
      const shippingEl = container.querySelector("#cartShipping") || document.getElementById("cartShipping");
      const totalEl = container.querySelector("#cartTotal") || document.getElementById("cartTotal");

      if (subTotalEl) subTotalEl.textContent = formatVND(subtotal);
      if (discountRow && discountEl) {
        if (discount > 0) {
          discountRow.style.display = "flex";
          discountEl.textContent = `-${formatVND(discount)}`;
        } else {
          discountRow.style.display = "none";
        }
      }
      if (shippingEl) shippingEl.textContent = shipping === 0 ? "Miễn phí" : formatVND(shipping);
      if (totalEl) totalEl.textContent = formatVND(total);

      // Shipping progress bar
      const progressBar = container.querySelector("#shippingProgressBar") || document.getElementById("shippingProgressBar");
      const progressText = container.querySelector("#shippingProgressText") || document.getElementById("shippingProgressText");
      const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

      if (progressBar) progressBar.style.width = progressPercent + "%";
      if (progressText) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0) {
          progressText.innerHTML = `<strong>Chúc mừng!</strong> Bạn đã được <strong>Miễn phí giao hàng</strong>`;
        } else {
          const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
          progressText.innerHTML = `Bạn chỉ còn thiếu <strong>${formatVND(remaining)}</strong> để được Miễn phí giao hàng`;
        }
      }
    }

    async function renderSavedItems() {
      const wishlist = getWishlistData();
      const listEl = container.querySelector("#savedItemsList") || document.getElementById("savedItemsList");
      if (!listEl) return;

      updateBadges();

      if (wishlist.length === 0) {
        listEl.innerHTML = `
          <div class="empty-cart-state" style="text-align:center;padding:40px 20px;color:#767676;">
            <p style="font-size:16px;font-weight:600;color:#111;margin-bottom:8px;">Chưa có sản phẩm yêu thích nào</p>
            <p style="font-size:13px;margin-bottom:16px;">Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại vào đây.</p>
            <button class="load-more-btn" id="emptyWishExploreBtn" style="padding:10px 24px;background:#111;color:#fff;font-weight:700;border:none;border-radius:0;cursor:pointer;">Khám phá sản phẩm</button>
          </div>
        `;
        const btn = listEl.querySelector("#emptyWishExploreBtn");
        if (btn) {
          btn.addEventListener("click", () => {
            closeCart();
            window.location.href = `${prefix}shop.html`;
          });
        }
        return;
      }

      // Fetch products if wishlist contains ID strings
      let productsMap = {};
      try {
        const res = await fetch(`${prefix}products.json`);
        if (res.ok) {
          const products = await res.json();
          products.forEach(p => { productsMap[p.id] = p; });
        }
      } catch (e) { }

      listEl.innerHTML = wishlist.map((item) => {
        let p = typeof item === "object" ? item : productsMap[item];
        if (!p) {
          p = { id: item, name: `Sản phẩm ${item}`, price: 0, image: "assets/sanpham_test/co_tau.jpg" };
        }
        const itemImg = resolveItemImage(p.image, prefix);
        return `
          <div class="cart-item">
            <div class="cart-item-img">
              <img src="${itemImg}" alt="${p.name}" loading="lazy">
            </div>
            <div class="cart-item-details">
              <div class="cart-item-top">
                <h4 class="cart-item-name">${p.name}</h4>
                <button class="wishlist-remove-btn" data-id="${p.id}" title="Bỏ lưu" aria-label="Bỏ lưu sản phẩm">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </button>
              </div>
              <div class="cart-item-variant">${p.category || 'Thời trang thể thao'}</div>
              <div class="cart-item-bottom">
                <button class="wishlist-move-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price || 0}" data-img="${p.image || ''}">+ Thêm vào giỏ</button>
                <div class="cart-item-price">${formatVND(p.price || 0)}</div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      listEl.querySelectorAll(".wishlist-remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          removeWishlistItem(btn.dataset.id);
        });
      });

      listEl.querySelectorAll(".wishlist-move-cart-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const price = parseInt(btn.dataset.price, 10) || 0;
          const img = btn.dataset.img;
          addCrossItem(name, price, img, "Mặc định");
          switchDrawerTab("cart");
        });
      });
    }

    // Hover & Click trên thanh điều hướng chính (Nam, Nữ, Khuyến mãi)
    config.navTabs.forEach(({ id, key }) => {
      const el = container.querySelector(`#${id}`) || document.getElementById(id);
      if (el) {
        const parentLi = el.parentElement || el;
        parentLi.addEventListener("mouseenter", () => {
          cancelCloseMegaNav();
          openMegaMenu(key);
        });
        el.addEventListener("click", (e) => {
          const isShopPage = window.location.pathname.toLowerCase().includes("shop.html");
          if (isShopPage && typeof window.handleNavClick === "function") {
            e.preventDefault();
            closeMegaMenu();
            window.handleNavClick(key, e);
          }
        });
      }
    });

    if (primaryNav) {
      primaryNav.addEventListener("mouseenter", cancelCloseMegaNav);
      primaryNav.addEventListener("mouseleave", scheduleCloseMegaNav);
    }

    if (megaNavDrawer) {
      megaNavDrawer.addEventListener("mouseenter", cancelCloseMegaNav);
      megaNavDrawer.addEventListener("mouseleave", scheduleCloseMegaNav);
      megaNavDrawer.addEventListener("click", (e) => e.stopPropagation());
    }

    // Hover tab switching inside mega nav drawer
    ["men", "women", "sale"].forEach(key => {
      const capKey = key.charAt(0).toUpperCase() + key.slice(1);
      const tabBtn = container.querySelector(`#megaTab${capKey}`) || document.getElementById(`megaTab${capKey}`);
      if (tabBtn) {
        tabBtn.addEventListener("mouseenter", () => {
          cancelCloseMegaNav();
          renderMegaCategories(key);
        });
        tabBtn.addEventListener("click", () => {
          cancelCloseMegaNav();
          renderMegaCategories(key);
        });
      }
    });

    if (megaCloseBtn) {
      megaCloseBtn.addEventListener("click", closeMegaMenu);
    }
    if (megaNavOverlay) {
      megaNavOverlay.addEventListener("click", closeMegaMenu);
    }

    // Gắn sự kiện Cart & Wishlist Drawer
    if (cartBtn) {
      cartBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeMegaMenu();
        switchDrawerTab("cart");
        openCart();
      });
    }

    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeMegaMenu();
        switchDrawerTab("wishlist");
        openCart();
      });
    }

    if (cartCloseBtn) {
      cartCloseBtn.addEventListener("click", closeCart);
    }
    if (cartOverlay) {
      cartOverlay.addEventListener("click", closeCart);
    }

    if (tabCart) {
      tabCart.addEventListener("click", () => switchDrawerTab("cart"));
    }
    if (tabWishlist) {
      tabWishlist.addEventListener("click", () => switchDrawerTab("wishlist"));
    }

    // Gợi ý Cross-sell
    container.querySelectorAll(".cross-add-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price, 10);
        const img = btn.dataset.img;
        const variant = btn.dataset.variant;
        addCrossItem(name, price, img, variant);
      });
    });

    // Mã giảm giá
    if (discountForm) {
      discountForm.addEventListener("submit", (e) => {
        e.preventDefault();
        applyDiscount();
      });
    }

    // Thanh toán
    if (cartCheckoutBtn) {
      cartCheckoutBtn.addEventListener("click", handleCheckout);
    }

    // Đóng khi click bên ngoài drawer
    document.addEventListener("click", (e) => {
      if (megaNavDrawer && megaNavDrawer.classList.contains("open")) {
        const isInside = megaNavDrawer.contains(e.target);
        const isNav = e.target.closest("nav.primary");
        if (!isInside && !isNav) {
          closeMegaMenu();
        }
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (megaNavDrawer && megaNavDrawer.classList.contains("open")) closeMegaMenu();
        if (cartDrawer && cartDrawer.classList.contains("open")) closeCart();
      }
    });

    // Render danh mục mặc định lần đầu
    renderMegaCategories(currentTab);

    // Xử lý ô tìm kiếm
    if (searchInput) {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get("search");
      if (searchParam) searchInput.value = searchParam;

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = searchInput.value.trim();
          if (val) {
            window.location.href = `${prefix}shop.html?search=${encodeURIComponent(val)}`;
          }
        }
      });
    }

    if (searchIcon && searchInput) {
      searchIcon.style.cursor = "pointer";
      searchIcon.addEventListener("click", () => {
        const val = searchInput.value.trim();
        if (val) {
          window.location.href = `${prefix}shop.html?search=${encodeURIComponent(val)}`;
        }
      });
    }

    // Xử lý nút Menu và Tìm kiếm trên Mobile
    const mobileMenuBtn = container.querySelector("#mobileMenuBtn") || document.getElementById("mobileMenuBtn");
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openMegaMenu(currentTab);
      });
    }

    const mobileSearchBtn = container.querySelector("#mobileSearchBtn") || document.getElementById("mobileSearchBtn");
    const mobileSearchDropdown = container.querySelector("#mobileSearchDropdown") || document.getElementById("mobileSearchDropdown");
    const mobileSearchInput = container.querySelector("#mobileSearchInput") || document.getElementById("mobileSearchInput");
    const mobileSearchCloseBtn = container.querySelector("#mobileSearchCloseBtn") || document.getElementById("mobileSearchCloseBtn");

    if (mobileSearchBtn && mobileSearchDropdown) {
      mobileSearchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = mobileSearchDropdown.classList.toggle("open");
        mobileSearchDropdown.setAttribute("aria-hidden", !isOpen);
        if (isOpen && mobileSearchInput) {
          setTimeout(() => mobileSearchInput.focus(), 120);
        }
      });
    }

    if (mobileSearchCloseBtn && mobileSearchDropdown) {
      mobileSearchCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileSearchDropdown.classList.remove("open");
        mobileSearchDropdown.setAttribute("aria-hidden", "true");
      });
    }

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = mobileSearchInput.value.trim();
          if (val) {
            window.location.href = `${prefix}shop.html?search=${encodeURIComponent(val)}`;
          }
        }
      });
    }

    // Lắng nghe sự kiện cập nhật để re-render
    window.addEventListener("wan:cart-updated", () => {
      renderCart();
      updateBadges();
    });
    window.addEventListener("wan:wishlist-updated", () => {
      renderSavedItems();
      updateBadges();
    });

    // Xuất các hàm ra window để các trang tùy ý gọi
    window.openCart = openCart;
    window.closeCart = closeCart;
    window.switchDrawerTab = switchDrawerTab;
    window.renderCart = renderCart;
    window.renderSavedItems = renderSavedItems;
    window.addCrossItem = addCrossItem;
    window.applyDiscount = applyDiscount;
    window.handleCheckout = handleCheckout;

    // Cập nhật số lượng huy hiệu từ localStorage/WanAPI
    updateBadges();
  }

  /**
   * Đồng bộ số lượng hiển thị trên icon Yêu thích và Giỏ hàng
   */
  function updateBadges() {
    try {
      // Giỏ hàng
      let cartCount = 0;
      if (window.WanAPI && window.WanAPI.cart) {
        cartCount = window.WanAPI.cart.getTotalQty ? window.WanAPI.cart.getTotalQty() : window.WanAPI.cart.get().reduce((sum, i) => sum + (i.qty || 1), 0);
      } else {
        const raw = localStorage.getItem("wan_cart_v1") || localStorage.getItem("wan_cart");
        if (raw) {
          const items = JSON.parse(raw);
          cartCount = Array.isArray(items) ? items.reduce((sum, i) => sum + (i.qty || 1), 0) : 0;
        }
      }
      const cartBadge = document.getElementById("cartBadge");
      if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? "flex" : "none";
      }

      // Yêu thích
      let wishCount = 0;
      if (window.WanAPI && window.WanAPI.wishlist) {
        wishCount = window.WanAPI.wishlist.get().length;
      } else {
        const rawW = localStorage.getItem("wan_wishlist_v1") || localStorage.getItem("wan_wishlist");
        if (rawW) {
          const wItems = JSON.parse(rawW);
          wishCount = Array.isArray(wItems) ? wItems.length : 0;
        }
      }
      const wishBadge = document.getElementById("wishlistBadge");
      if (wishBadge) {
        wishBadge.textContent = wishCount;
        wishBadge.style.display = wishCount > 0 ? "flex" : "none";
      }
    } catch (e) { }
  }

  // Khởi tạo Custom Element <womanwan-header>
  if (typeof customElements !== "undefined" && !customElements.get("womanwan-header")) {
    class WomanWanHeaderElement extends HTMLElement {
      async connectedCallback() {
        this.style.display = "block";
        const basePath = this.getAttribute("base-path") || resolveBasePath();
        const config = await loadNavConfig(basePath);
        this.innerHTML = renderHeaderHTML(config, basePath);
        setupHeaderInteractions(this, config, basePath);
      }
    }
    customElements.define("womanwan-header", WomanWanHeaderElement);
  }

  // Export API toàn cục
  window.WomanWanHeader = {
    loadConfig: loadNavConfig,
    updateBadges: updateBadges,
    openCart: () => (typeof window.openCart === "function" ? window.openCart() : null),
    closeCart: () => (typeof window.closeCart === "function" ? window.closeCart() : null)
  };

  // Lắng nghe sự kiện cập nhật giỏ hàng/wishlist từ WanAPI hoặc các trang
  window.addEventListener("storage", updateBadges);
  window.addEventListener("wan:cart-updated", updateBadges);
  window.addEventListener("wan:wishlist-updated", updateBadges);
})();
