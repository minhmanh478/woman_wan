    // =========================================================================
    // 1. WAN API & DATA SERVICE (Sẵn sàng mở rộng thành REST API / Backend)
    // =========================================================================
    const WanAPI = {
      // --- Quản lý Sản phẩm ---
      products: {
        list: [],
        async fetchAll() {
          try {
            const res = await fetch("shared/data/products.json");
            if (res.ok) {
              this.list = await res.json();
              return this.list;
            }
          } catch (e) {
            console.warn("fetch products.json fallback", e);
          }
          if (!this.list || this.list.length === 0) {
            this.list = Array.from({ length: 124 }, (_, i) => randomProduct(i));
          }
          return this.list;
        },
        getById(id) {
          if (!this.list || this.list.length === 0) return null;
          return this.list.find(p => String(p.id) === String(id)) || null;
        }
      },

      // --- Quản lý Giỏ hàng (Cart API & Persistence) ---
      cart: {
        STORAGE_KEY: "wan_cart_v1",
        get() {
          try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) return JSON.parse(data);
          } catch (e) {
            console.error("Lỗi đọc giỏ hàng từ localStorage", e);
          }
          // Mẫu mặc định ban đầu nếu chưa có
          return [
            {
              id: "ww-001",
              name: "Áo khoác gió Ultraboost Layer",
              variant: "Trắng ngà · Size M",
              price: 849000,
              basePrice: 849000,
              qty: 1,
              image: "assets/sanpham_test/co_tau.jpg",
              isNew: true
            }
          ];
        },
        save(items) {
          try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
          } catch (e) {
            console.error("Lỗi lưu giỏ hàng", e);
          }
          // TODO Backend API:
          // return fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items) });
        },
        addItem(productId, qty = 1, customVariant = null) {
          const product = WanAPI.products.getById(productId);
          if (!product) {
            console.error("Không tìm thấy sản phẩm với id:", productId);
            return null;
          }

          const cart = this.get();
          const variantName = customVariant || (
            (product.colors && product.colors[0] ? (product.colors[0].name || product.colors[0]) : "Tiêu chuẩn") +
            " · Size " +
            (product.sizes && product.sizes[0] ? product.sizes[0] : "M")
          );

          const existingIndex = cart.findIndex(item => item.id === product.id && item.variant === variantName);

          if (existingIndex > -1) {
            cart[existingIndex].qty += qty;
          } else {
            cart.push({
              id: product.id,
              name: product.name,
              variant: variantName,
              price: product.price || product.now || 0,
              basePrice: product.basePrice || product.base || product.price || 0,
              qty: qty,
              image: product.image || "assets/sanpham_test/co_tau.jpg",
              isNew: Boolean(product.tag === "Mới" || product.tag === "NEW" || product.onSale)
            });
          }

          this.save(cart);
          return { product, cart };
        },
        updateQty(index, delta) {
          const cart = this.get();
          if (!cart[index]) return cart;
          cart[index].qty += delta;
          if (cart[index].qty <= 0) {
            cart.splice(index, 1);
          }
          this.save(cart);
          return cart;
        },
        removeItem(index) {
          const cart = this.get();
          cart.splice(index, 1);
          this.save(cart);
          return cart;
        }
      },

      // --- Quản lý Danh sách Yêu thích / Lưu sản phẩm (Wishlist API & Persistence) ---
      wishlist: {
        STORAGE_KEY: "wan_wishlist_v1",
        get() {
          try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) return JSON.parse(data);
          } catch (e) {
            console.error("Lỗi đọc danh sách yêu thích", e);
          }
          return [];
        },
        save(ids) {
          try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
          } catch (e) {
            console.error("Lỗi lưu danh sách yêu thích", e);
          }
          // TODO Backend API:
          // return fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ids) });
        },
        has(productId) {
          const list = this.get();
          return list.includes(String(productId));
        },
        toggle(productId) {
          const list = this.get();
          const idStr = String(productId);
          const idx = list.indexOf(idStr);
          let isSaved = false;

          if (idx > -1) {
            list.splice(idx, 1);
            isSaved = false;
          } else {
            list.push(idStr);
            isSaved = true;
          }

          this.save(list);
          return { isSaved, total: list.length, list };
        }
      }
    };

    // =========================================================================
    // 2. HELPER FUNCTIONS & UI FORMATTING
    // =========================================================================
    const colors = ["#111111", "#e2231a", "#0057ff", "#8a6d3b", "#e8b4c8", "#2e5339", "#7d7d7d", "#ffffff"];
    const tags = [null, "Mới", "-30%", "Bán chạy", null, null, "Mới", null];
    const names = [
      "Áo khoác gió Ultraboost Layer", "Áo thun tập luyện AeroReady", "Quần legging Essentials 7/8",
      "Giày chạy bộ Pulse Runner", "Áo hoodie nỉ Sportswear", "Quần short thể thao 3-Stripes Style",
      "Đầm thể thao năng động", "Áo bra tập gym FlexFit", "Giày sneaker đường phố Retro Court",
      "Áo khoác bomber nữ", "Quần jogger thời trang", "Túi tote thể thao mini",
      "Áo tank top yoga", "Legging cạp cao Motion", "Giày trekking City Trail",
      "Áo croptop tập luyện", "Quần culottes năng động", "Áo khoác dù chống nước",
      "Giày chạy bộ đường dài Marathon+", "Áo len thể thao mỏng"
    ];

    function formatVND(n) {
      if (typeof n !== 'number') return "0₫";
      return n.toLocaleString("vi-VN") + "₫";
    }

    function showToast(message) {
      const toast = document.getElementById("wanToast");
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.classList.remove("show");
      }, 2500);
    }

    function randomProduct(i) {
      const id = `ww-${String(i + 1).padStart(3, '0')}`;
      const name = names[i % names.length];
      const base = 399000 + Math.floor(Math.random() * 8) * 150000;
      const onSale = Math.random() < 0.3;
      const now = onSale ? Math.round(base * 0.7 / 1000) * 1000 : base;
      const c1 = colors[Math.floor(Math.random() * colors.length)];
      const c2 = colors[Math.floor(Math.random() * colors.length)];
      const tag = onSale ? "-30%" : tags[Math.floor(Math.random() * tags.length)];
      const hue = Math.floor(Math.random() * 360);
      const image = "assets/sanpham_test/co_tau.jpg";
      const hoverImage = "assets/sanpham_test/co_tau2.jpg";
      return { id, name, basePrice: base, price: now, onSale, c1, c2, tag, hue, image, hoverImage };
    }

    function cardHTML(p) {
      const c1 = p.colors ? (p.colors[0]?.hex || p.colors[0] || "#111") : (p.c1 || "#111");
      const c2 = p.colors ? (p.colors[1]?.hex || p.colors[1] || "#fff") : (p.c2 || "#fff");
      const base = p.basePrice || p.base || p.price;
      const now = p.price || p.now;
      const onSale = p.onSale;
      const tag = p.tag;
      const desc = p.description || "Giày & Trang phục thể thao Nữ";
      const image = p.image || "assets/sanpham_test/co_tau.jpg";
      const hoverImage = p.hoverImage || "assets/sanpham_test/co_tau2.jpg";
      const isSaved = WanAPI.wishlist.has(p.id);

      return `
      <div class="card" data-id="${p.id}" onclick="handleProductCardClick('${p.id}', event)">
        <div class="card-media">
          <div class="product-img-wrap">
            <img src="${image}" alt="${p.name}" class="product-img primary-img" loading="lazy">
            <img src="${hoverImage}" alt="${p.name}" class="product-img hover-img" loading="lazy">
          </div>
          ${tag ? `<div class="tag ${onSale ? 'sale' : ''}">${tag}</div>` : ""}
          <button class="wishlist ${isSaved ? 'active' : ''}" data-id="${p.id}" onclick="handleToggleWishlist('${p.id}', event)" title="Lưu sản phẩm" aria-label="Lưu sản phẩm">
            <img src="assets/icons/heart.svg" alt="Yêu thích" class="card-icon heart-icon-outline">
            <img src="assets/icons/heart_click.svg" alt="Yêu thích" class="card-icon heart-icon-filled">
          </button>
          <button class="quick-add-btn" onclick="handleQuickAdd('${p.id}', event)" aria-label="Thêm vào giỏ">
            <span>+ Thêm vào giỏ</span>
          </button>
        </div>
        <div class="card-info">
          <div class="name">${p.name}</div>
          <div class="desc">${desc}</div>
          <div class="price-row">
            ${onSale ? `<span class="old">${formatVND(base)}</span>` : ""}
            <span class="now ${onSale ? 'sale' : ''}">${formatVND(now)}</span>
          </div>
        </div>
      </div>`;
    }

    // =========================================================================
    // 3. PRODUCT GRID & HOMEPAGE INTERACTION HANDLERS
    // =========================================================================
    const grid = document.getElementById("productGrid");
    let loaded = 0;
    const PAGE_SIZE = 8;
    let activeDisplayList = [];
    let currentTrendingTab = "all";

    async function initProducts() {
      await WanAPI.products.fetchAll();
      activeDisplayList = WanAPI.products.list;
      loadMore();
      updateWishlistBadges();
      renderCart();
      loadCampaigns();
      loadGuides();
    }

    async function loadCampaigns() {
      try {
        const res = await fetch("shared/data/campaigns.json");
        if (res.ok) {
          const campaigns = await res.json();
          renderCampaigns(campaigns);
        }
      } catch (e) {
        console.warn("fetch campaigns.json fallback", e);
      }
    }

    function renderCampaigns(campaigns) {
      const container = document.getElementById("campaignGrid");
      if (!container || !campaigns || campaigns.length === 0) return;
      container.innerHTML = campaigns.map(c => `
        <a href="${c.ctaLink || '#trending'}" class="gs-split-card" onclick="setTrendingFilter('${c.filterTab || 'all'}', null, event)">
          <div class="gs-split-bg" style="background-image: url('${c.image}');"></div>
          <div class="gs-split-gradient"></div>
          <div class="gs-split-content">
            <span class="gs-split-tag">${c.badge || ''}</span>
            <h2 class="gs-split-title">${c.title || ''}</h2>
            <p class="gs-split-desc">${c.description || ''}</p>
            <span class="gs-split-btn">${c.ctaText || 'MUA NGAY'}</span>
          </div>
        </a>
      `).join("");
    }

    async function loadGuides() {
      try {
        const res = await fetch("shared/data/guides.json");
        if (res.ok) {
          const guides = await res.json();
          renderGuides(guides);
        }
      } catch (e) {
        console.warn("fetch guides.json fallback", e);
      }
    }

    function renderGuides(guides) {
      const container = document.getElementById("guidesGrid");
      if (!container || !guides || guides.length === 0) return;
      container.innerHTML = guides.map((g, idx) => `
        <article class="gs-guide-card${idx === 0 ? ' featured' : ''}">
          <div class="gs-guide-media">
            <img src="${g.image}" alt="${g.title}" class="gs-guide-img" loading="lazy">
          </div>
          <div class="gs-guide-body">
            <span class="gs-guide-tag">${g.tag || ''}</span>
            <h3 class="gs-guide-title">${g.title || ''}</h3>
            <p class="gs-guide-excerpt">${g.excerpt || ''}</p>
            <a href="${g.linkUrl || '#'}" class="gs-guide-link">${g.linkText || 'Xem chi tiết &rarr;'}</a>
          </div>
        </article>
      `).join("");
    }

    function loadMore() {
      const frag = document.createDocumentFragment();
      const wrapper = document.createElement("div");
      let html = "";
      const sourceList = (activeDisplayList && activeDisplayList.length > 0) ? activeDisplayList : WanAPI.products.list;
      const end = Math.min(loaded + PAGE_SIZE, sourceList.length);
      for (let i = loaded; i < end; i++) {
        html += cardHTML(sourceList[i]);
      }
      loaded = end;
      wrapper.innerHTML = html;
      while (wrapper.firstChild) frag.appendChild(wrapper.firstChild);
      grid.appendChild(frag);

      const btn = document.getElementById("loadMoreBtn");
      if (btn) {
        btn.style.display = (loaded >= sourceList.length) ? "none" : "inline-flex";
      }
    }

    function setTrendingFilter(tabKey, btnEl, event) {
      if (event) {
        event.preventDefault();
      }
      currentTrendingTab = tabKey;

      // Cập nhật trạng thái active của nút tab
      document.querySelectorAll(".gs-tab-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabKey) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Lọc danh sách theo tab
      const all = WanAPI.products.list;
      if (tabKey === "women") {
        activeDisplayList = all.filter(p => {
          const g = (p.gender || "").toLowerCase();
          const c = (p.category || "").toLowerCase();
          const n = (p.name || "").toLowerCase();
          return g.includes("nữ") || c.includes("legging") || c.includes("choàng") || n.includes("nữ") || n.includes("croptop") || n.includes("đầm");
        });
      } else if (tabKey === "men") {
        activeDisplayList = all.filter(p => {
          const g = (p.gender || "").toLowerCase();
          const c = (p.category || "").toLowerCase();
          const n = (p.name || "").toLowerCase();
          return g.includes("nam") || c.includes("short") || c.includes("thun") || n.includes("nam") || n.includes("jogger");
        });
      } else if (tabKey === "sale") {
        activeDisplayList = all.filter(p => p.onSale || p.discountPercent > 0 || (p.tag && p.tag.includes("%")));
      } else if (tabKey === "new") {
        activeDisplayList = all.filter(p => p.tag === "Mới" || p.tag === "NEW" || p.isNew);
      } else {
        activeDisplayList = all;
      }

      if (!activeDisplayList || activeDisplayList.length === 0) {
        activeDisplayList = all;
      }

      grid.innerHTML = "";
      loaded = 0;
      loadMore();

      // Nếu click từ banner hoặc danh mục thì cuộn mượt xuống khu vực sản phẩm
      const trendingEl = document.getElementById("trending");
      if (trendingEl && (!btnEl || !btnEl.classList.contains("gs-tab-btn"))) {
        trendingEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function filterByCategory(catKeyword, event) {
      if (event) event.preventDefault();
      const all = WanAPI.products.list;
      const kw = catKeyword.toLowerCase();
      activeDisplayList = all.filter(p => {
        const c = (p.category || "").toLowerCase();
        const n = (p.name || "").toLowerCase();
        return c.includes(kw) || n.includes(kw);
      });

      if (activeDisplayList.length === 0) activeDisplayList = all;

      // Bỏ active tab hiện tại
      document.querySelectorAll(".gs-tab-btn").forEach(btn => btn.classList.remove("active"));
      grid.innerHTML = "";
      loaded = 0;
      loadMore();

      const trendingEl = document.getElementById("trending");
      if (trendingEl) {
        trendingEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      showToast(`Đang lọc: ${catKeyword}`);
    }

    function handleNewsletterSubmit(event) {
      if (event) event.preventDefault();
      const input = document.getElementById("newsletterEmail");
      const email = input ? input.value.trim() : "";
      if (!email || !email.includes("@")) {
        showToast("Vui lòng nhập địa chỉ email hợp lệ!");
        return;
      }
      showToast("✓ Chúc mừng! Mã voucher 10% của bạn là: WAN10");
      if (input) input.value = "";
    }

    function toggleHeroPlay() {
      const vid = document.getElementById("heroVideo");
      const pauseIcon = document.getElementById("heroPauseIcon");
      const playIcon = document.getElementById("heroPlayIcon");
      if (!vid) return;
      if (vid.paused) {
        vid.play();
        if (pauseIcon) pauseIcon.style.display = "block";
        if (playIcon) playIcon.style.display = "none";
      } else {
        vid.pause();
        if (pauseIcon) pauseIcon.style.display = "none";
        if (playIcon) playIcon.style.display = "block";
      }
    }

    function updateHeroSoundUI(isMuted) {
      const muteIcon = document.getElementById("heroMuteIcon");
      const soundIcon = document.getElementById("heroSoundIcon");
      const btn = document.getElementById("heroSoundToggle");
      if (muteIcon) muteIcon.style.display = isMuted ? "block" : "none";
      if (soundIcon) soundIcon.style.display = isMuted ? "none" : "block";
      if (btn) btn.title = isMuted ? "Bật âm thanh" : "Tắt âm thanh";
    }

    function initHeroVideoAudio() {
      const vid = document.getElementById("heroVideo");
      if (!vid) return;

      vid.volume = 1.0;
      vid.muted = false;

      const p = vid.play();
      if (p !== undefined) {
        p.then(() => {
          updateHeroSoundUI(false);
        }).catch(() => {
          vid.muted = true;
          vid.play().catch(() => { });
          updateHeroSoundUI(true);
        });
      }
    }

    function toggleHeroSound(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const vid = document.getElementById("heroVideo");
      if (!vid) return;
      if (vid.muted) {
        vid.muted = false;
        vid.volume = 1.0;
        vid.play().catch(() => { });
        updateHeroSoundUI(false);
      } else {
        vid.muted = true;
        updateHeroSoundUI(true);
      }
    }

    // =========================================================================
    // SITE INTRO & HERO VIDEO PLAY SYNCHRONIZATION
    // Preload video during intro animation; start playing ONLY when intro finishes
    // =========================================================================
    function initSiteIntro() {
      const intro = document.getElementById("siteIntro");
      const video = document.getElementById("heroVideo");

      // Tải trước video intro.mp4 ngay trong lúc chạy animation mở đầu
      if (video) {
        try {
          video.load();
        } catch (err) { }
      }

      if (!intro) {
        initHeroVideoAudio();
        return;
      }

      // Khóa cuộn trang khi đang hiển thị intro splash
      document.body.style.overflow = "hidden";

      let completed = false;
      function finishIntro() {
        if (completed) return;
        completed = true;
        intro.classList.add("is-dismissed");
        setTimeout(() => {
          if (intro && intro.parentNode) {
            intro.parentNode.removeChild(intro);
          }
        }, 400);

        document.body.style.overflow = "";

        // Chạy video intro.mp4 ngay khi kết thúc phần SITE INTRO ANIMATION
        initHeroVideoAudio();
      }

      // Lắng nghe khi animation kết thúc (2.4s)
      intro.addEventListener("animationend", (e) => {
        if (e.target === intro || e.animationName === "introBgTransition") {
          finishIntro();
        }
      });

      // Fallback an toàn (2.5s)
      setTimeout(finishIntro, 2500);

      // Cho phép click hoặc nhấn phím để bỏ qua nhanh
      intro.addEventListener("click", finishIntro);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === " ") finishIntro();
      }, { once: true });
    }

    // Nhấn vào card sản phẩm -> Mở trang chi tiết sản phẩm
    function handleProductCardClick(productId, e) {
      // Nếu click vào nút tim hoặc nút thêm nhanh thì xử lý riêng
      if (e.target.closest(".wishlist") || e.target.closest(".quick-add-btn")) return;
      window.location.href = `product/index.html?id=${encodeURIComponent(productId)}`;
    }

    // Nhấn nút + Thêm vào giỏ trên card (chỉ tăng số ở badge giỏ hàng, không mở bảng bên phải)
    function handleQuickAdd(productId, e) {
      if (e) e.stopPropagation();
      handleAddToCart(productId, false);
    }

    // Logic cốt lõi Thêm vào giỏ theo ID (mặc định không mở bảng bên phải)
    function handleAddToCart(productId, openDrawer = false) {
      const result = WanAPI.cart.addItem(productId, 1);
      if (result && result.product) {
        renderCart();
        showToast(`✓ Đã thêm "${result.product.name}" vào giỏ hàng`);
        if (openDrawer) {
          openCart();
          switchDrawerTab('cart');
        }
      }
    }

    // Nhấn nút Trái tim -> Lưu / Bỏ lưu sản phẩm vào Wishlist (chỉ tăng số ở badge yêu thích, không mở bảng bên phải)
    function handleToggleWishlist(productId, e) {
      if (e) e.stopPropagation();
      const { isSaved, total } = WanAPI.wishlist.toggle(productId);
      const product = WanAPI.products.getById(productId);

      // Cập nhật trạng thái icon trên tất cả card ngoài trang chủ
      document.querySelectorAll(`.wishlist[data-id="${productId}"]`).forEach(btn => {
        if (isSaved) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Cập nhật trạng thái icon trên tất cả nút tim trong giỏ hàng
      document.querySelectorAll(`.item-fav-btn[data-id="${productId}"]`).forEach(btn => {
        if (isSaved) {
          btn.classList.add("active");
          btn.title = "Bỏ lưu";
        } else {
          btn.classList.remove("active");
          btn.title = "Lưu sản phẩm";
        }
      });

      updateWishlistBadges();
      const prodName = product ? product.name : "Sản phẩm";
      showToast(isSaved ? `♥ Đã lưu "${prodName}" vào danh sách yêu thích` : `Đã bỏ lưu "${prodName}"`);

      // Nếu drawer đang mở sẵn thì cập nhật lại danh sách hiển thị
      if (cartDrawer && cartDrawer.classList.contains("open")) {
        renderSavedItems();
      }
    }

    function updateWishlistBadges() {
      const saved = WanAPI.wishlist.get();
      const count = saved.length;
      const badge = document.getElementById("wishlistBadge");
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
        if (count > 0) {
          badge.classList.remove("badge-pop");
          void badge.offsetWidth;
          badge.classList.add("badge-pop");
        }
      }
    }

    // =========================================================================
    // 4. CART DRAWER CONTROLLER
    // =========================================================================
    let discountPercent = 0;
    const FREE_SHIPPING_THRESHOLD = 1000000;
    const DEFAULT_SHIPPING_FEE = 30000;
    let currentDrawerTab = "cart";

    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartCloseBtn = document.getElementById("cartCloseBtn");

    function openCart() {
      const megaNav = document.getElementById("megaNavDrawer");
      if (megaNav && megaNav.classList.contains("open")) {
        megaNav.classList.remove("open");
        document.getElementById("megaNavOverlay")?.classList.remove("open");
      }
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

    window.openCart = openCart;
    window.closeCart = closeCart;

    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (cartDrawer && cartDrawer.classList.contains("open")) closeCart();
      }
    });

    // Chuyển tab giữa Giỏ hàng và Mục đã lưu
    function switchDrawerTab(tab) {
      currentDrawerTab = tab;
      const tabCart = document.getElementById("tabCart");
      const tabWishlist = document.getElementById("tabWishlist");
      const cartTitle = document.getElementById("cartTitle");
      const cartItemsView = document.getElementById("cartItemsView");
      const savedItemsView = document.getElementById("savedItemsView");
      const cartFooter = document.getElementById("cartFooter");

      if (tab === "cart") {
        tabCart.classList.add("active");
        tabWishlist.classList.remove("active");
        cartTitle.textContent = "GIỎ HÀNG CỦA BẠN";
        cartItemsView.classList.remove("hidden");
        savedItemsView.classList.remove("active");
        cartFooter.style.display = "flex";
        renderCart();
      } else {
        tabWishlist.classList.add("active");
        tabCart.classList.remove("active");
        cartTitle.textContent = "SẢN PHẨM YÊU THÍCH";
        cartItemsView.classList.add("hidden");
        savedItemsView.classList.add("active");
        cartFooter.style.display = "none";
        renderSavedItems();
      }
    }
    window.switchDrawerTab = switchDrawerTab;

    function changeQty(index, delta) {
      WanAPI.cart.updateQty(index, delta);
      renderCart();
    }

    function addCrossItem(name, price, image, variant) {
      const cart = WanAPI.cart.get();
      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({
          id: "cross-" + Date.now(),
          name: name,
          variant: variant || "Mặc định",
          price: price,
          qty: 1,
          image: image,
          isNew: true
        });
      }
      WanAPI.cart.save(cart);
      renderCart();
      showToast(`✓ Đã thêm "${name}" vào giỏ hàng`);
    }

    function applyDiscount() {
      const code = document.getElementById("discountCodeInput").value.trim().toUpperCase();
      if (!code) return;
      if (code === "WOMANWAN" || code === "SALE10" || code === "WAN10") {
        discountPercent = 0.1;
        showToast("Áp dụng mã giảm giá 10% thành công!");
      } else {
        showToast("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
      }
      renderCart();
    }

    function handleCheckout() {
      const cart = WanAPI.cart.get();
      if (cart.length === 0) {
        showToast("Giỏ hàng của bạn đang trống!");
        return;
      }
      window.location.href = './checkout/index.html';
    }

    // Render danh sách trong giỏ
    function renderCart() {
      const cart = WanAPI.cart.get();
      const cartItemsList = document.getElementById("cartItemsList");
      if (!cartItemsList) return;

      const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
      if (cartBadge) {
        cartBadge.textContent = totalQty;
        cartBadge.style.display = totalQty > 0 ? "flex" : "none";
        if (totalQty > 0) {
          cartBadge.classList.remove("badge-pop");
          void cartBadge.offsetWidth;
          cartBadge.classList.add("badge-pop");
        }
      }

      if (cart.length === 0) {
        cartItemsList.innerHTML = `
          <div class="empty-cart-state">
            <p>Giỏ hàng của bạn đang trống</p>
            <button class="load-more-btn" onclick="closeCart()" style="margin-top:12px;padding:10px 24px;background:#111;color:#fff;font-weight:700;border:none;border-radius:0;">Khám phá ngay</button>
          </div>
        `;
      } else {
        cartItemsList.innerHTML = cart.map((item, index) => {
          const isSaved = WanAPI.wishlist.has(item.id);
          return `
          <div class="cart-item">
            <div class="cart-item-img">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
              <div class="cart-item-top">
                ${item.isNew ? `<span class="item-tag">MỚI</span>` : `<span></span>`}
                <button class="item-fav-btn ${isSaved ? 'active' : ''}" data-id="${item.id}" onclick="handleToggleWishlist('${item.id}', event)" title="${isSaved ? 'Bỏ lưu' : 'Lưu sản phẩm'}" aria-label="Yêu thích">
                  <img src="assets/icons/heart.svg" alt="Yêu thích" class="cart-fav-icon heart-icon-outline">
                  <img src="assets/icons/heart_click.svg" alt="Yêu thích" class="cart-fav-icon heart-icon-filled">
                </button>
              </div>
              <h4 class="cart-item-name">${item.name}</h4>
              <div class="cart-item-variant">${item.variant}</div>
              <div class="cart-item-bottom">
                <div class="cart-item-price">${formatVND(item.price * item.qty)}</div>
                <div class="qty-stepper">
                  <button class="qty-btn minus-btn" onclick="changeQty(${index}, -1)" aria-label="Giảm">−</button>
                  <span class="qty-val">${item.qty}</span>
                  <button class="qty-btn plus-btn" onclick="changeQty(${index}, 1)" aria-label="Tăng">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
        }).join("");
      }

      // Calculations
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discount = Math.round(subtotal * discountPercent);
      const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
      const shipping = isFreeShipping ? 0 : DEFAULT_SHIPPING_FEE;
      const total = Math.max(0, subtotal - discount + shipping);

      document.getElementById("cartSubTotal").textContent = formatVND(subtotal);

      const discountRow = document.getElementById("discountRow");
      if (discountRow) {
        if (discount > 0) {
          discountRow.style.display = "flex";
          document.getElementById("cartDiscount").textContent = "-" + formatVND(discount);
        } else {
          discountRow.style.display = "none";
        }
      }

      document.getElementById("cartShipping").textContent = isFreeShipping ? (subtotal > 0 ? "Miễn phí" : "0₫") : formatVND(shipping);
      document.getElementById("cartTotal").textContent = formatVND(total);

      // Shipping progress
      const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      const progressBar = document.getElementById("shippingProgressBar");
      const progressText = document.getElementById("shippingProgressText");

      if (progressBar) progressBar.style.width = progressPercent + "%";
      if (progressText) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0) {
          progressText.innerHTML = `<strong>Chúc mừng!</strong> Bạn đã được <strong>Miễn phí vận chuyển</strong>`;
        } else {
          const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
          progressText.innerHTML = `Bạn chỉ còn thiếu <strong>${formatVND(remaining)}</strong> để được Miễn phí giao hàng`;
        }
      }
    }

    // Render danh sách sản phẩm đã lưu (Wishlist View)
    function renderSavedItems() {
      const savedIds = WanAPI.wishlist.get();
      const savedItemsList = document.getElementById("savedItemsList");
      if (!savedItemsList) return;

      if (savedIds.length === 0) {
        savedItemsList.innerHTML = `
          <div class="empty-cart-state">
            <p>Bạn chưa lưu sản phẩm nào</p>
            <p style="font-size:12px;color:#999;margin-top:4px;">Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại</p>
          </div>
        `;
        return;
      }

      const savedProducts = savedIds.map(id => WanAPI.products.getById(id)).filter(Boolean);

      savedItemsList.innerHTML = savedProducts.map(p => {
        const isSaved = WanAPI.wishlist.has(p.id);
        return `
        <div class="cart-item" data-saved-item="${p.id}">
          <div class="cart-item-img">
            <img src="${p.image || 'assets/sanpham_test/co_tau.jpg'}" alt="${p.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-top">
              <span class="item-tag">${p.tag || 'YÊU THÍCH'}</span>
              <button class="item-fav-btn ${isSaved ? 'active' : ''}" data-id="${p.id}" onclick="handleToggleWishlist('${p.id}', event)" title="${isSaved ? 'Bỏ lưu' : 'Lưu sản phẩm'}" aria-label="Lưu sản phẩm">
                <img src="assets/icons/heart.svg" alt="Lưu sản phẩm" class="cart-fav-icon heart-icon-outline">
                <img src="assets/icons/heart_click.svg" alt="Lưu sản phẩm" class="cart-fav-icon heart-icon-filled">
              </button>
            </div>
            <h4 class="cart-item-name">${p.name}</h4>
            <div class="cart-item-variant">${p.category || 'Thời trang thể thao'}</div>
            <div class="cart-item-bottom">
              <div class="cart-item-price">${formatVND(p.price || p.now || 0)}</div>
              <button class="cross-add-btn" style="position:static;font-size:12px;font-weight:700;background:#111;color:#fff;padding:5px 12px;border:none;border-radius:0;" onclick="handleAddToCart('${p.id}', false); switchDrawerTab('cart');">
                + Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      `;
      }).join("");
    }

    // =========================================================================
    // 5. INITIALIZATION & SEARCH / SORT LISTENERS
    // =========================================================================
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", loadMore);
    }

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        grid.innerHTML = "";
        loaded = 0;
        if (loadMoreBtn) loadMoreBtn.style.display = "inline-flex";
        loadMore();
      });
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = grid.querySelectorAll(".card");
        let visibleCount = 0;

        cards.forEach(card => {
          const title = card.querySelector(".name")?.textContent.toLowerCase() || "";
          if (title.includes(query)) {
            card.style.display = "";
            visibleCount++;
          } else {
            card.style.display = "none";
          }
        });

        const resultCountEl = document.getElementById("resultCount");
        if (resultCountEl) {
          resultCountEl.textContent = query ? `${visibleCount} sản phẩm phù hợp` : `${WanAPI.products.list.length} sản phẩm`;
        }
      });

      // Nhấn Enter để chuyển sang trang shop với kết quả tìm kiếm đầy đủ
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
          }
        }
      });
    }

    const searchIconBtn = document.querySelector(".search-icon");
    if (searchIconBtn && searchInput) {
      searchIconBtn.style.cursor = "pointer";
      searchIconBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
        }
      });
    }

    // Khởi động dữ liệu & Màn hình mở đầu (tải video nền, sau khi intro kết thúc mới phát video)
    initSiteIntro();
    initProducts();

    // =========================================================================
    // 6. SCROLL-REVEAL (BRAND STATEMENT SECTION)
    // =========================================================================

    // Scroll-reveal: trigger reveal animations when in viewport
    function initScrollReveal() {
      const revealItems = document.querySelectorAll('.reveal-item');

      if (!('IntersectionObserver' in window)) {
        revealItems.forEach(el => {
          el.classList.add('is-visible');
        });
        return;
      }

      // Reveal observer
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      revealItems.forEach(el => revealObserver.observe(el));
    }

    initScrollReveal();
