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
          <button class="quick-add-btn" onclick="handleQuickAdd('${p.id}', event)" aria-label="Thêm vào giỏ" title="Thêm vào giỏ">
            <img src="assets/icons/bag.svg" alt="Thêm vào giỏ" class="card-icon">
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
    // 3. PRODUCT GRID & INTERACTION HANDLERS
    // =========================================================================
    const grid = document.getElementById("productGrid");
    let loaded = 0;
    const PAGE_SIZE = 12;
    let currentShopList = [];
    let currentShopTab = "women";

    async function initProducts() {
      await WanAPI.products.fetchAll();
      const params = new URLSearchParams(window.location.search);
      const g = params.get('gender');
      const f = params.get('filter');
      const s = params.get('search');

      if (s) {
        setShopSearch(s);
      } else {
        setShopGender(g === 'men' ? 'men' : (f === 'sale' ? 'sale' : 'women'));
      }
      updateWishlistBadges();
      renderCart();
      initSidebarFilters();
    }

    function setShopSearch(searchTerm) {
      currentShopTab = "search";
      const all = WanAPI.products.list;
      const q = searchTerm.toLowerCase().trim();

      const searchInputEl = document.getElementById("searchInput");
      if (searchInputEl) searchInputEl.value = searchTerm;

      document.querySelectorAll("nav.primary li").forEach(li => li.classList.remove("active"));

      const breadcrumb = document.querySelector(".breadcrumb");
      const title = document.querySelector(".page-title");
      const subnavActive = document.querySelector(".subnav a.active") || document.querySelector(".subnav a:first-child");

      if (breadcrumb) breadcrumb.innerHTML = `<a href="index.html">Trang chủ</a> <span>›</span> Tìm kiếm: "${searchTerm}"`;
      if (title) title.textContent = `Kết quả tìm kiếm cho: "${searchTerm}"`;
      if (subnavActive) subnavActive.textContent = `Tìm kiếm: "${searchTerm}"`;

      currentShopList = all.filter(p => {
        const name = (p.name || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const tag = (p.tag || "").toLowerCase();
        const gen = (p.gender || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q) || tag.includes(q) || gen.includes(q);
      });

      applyCurrentSort();
      grid.innerHTML = "";
      loaded = 0;
      loadMore();

      const resultCountEl = document.getElementById("resultCount");
      if (resultCountEl) {
        resultCountEl.textContent = `${currentShopList.length} sản phẩm phù hợp`;
      }
    }

    function setShopGender(tabKey) {
      currentShopTab = tabKey;
      const all = WanAPI.products.list;

      // Update Nav Li active class
      document.querySelectorAll("nav.primary li").forEach(li => li.classList.remove("active"));
      const navEl = tabKey === 'men' ? (document.getElementById("navLiMen") || document.getElementById("navMen")?.parentElement) :
        (tabKey === 'sale' ? (document.getElementById("navLiSale") || document.getElementById("navSale")?.parentElement) :
          (document.getElementById("navLiWomen") || document.getElementById("navWomen")?.parentElement));
      if (navEl) navEl.classList.add("active");

      // Update Breadcrumb & Title & Subnav
      const breadcrumb = document.querySelector(".breadcrumb");
      const title = document.querySelector(".page-title");
      const subnavActive = document.querySelector(".subnav a.active") || document.querySelector(".subnav a:first-child");

      if (tabKey === 'men') {
        if (breadcrumb) breadcrumb.innerHTML = '<a href="index.html">Trang chủ</a> <span>›</span> Nam';
        if (title) title.textContent = 'Sản phẩm Nam';
        if (subnavActive) subnavActive.textContent = 'Tất cả sản phẩm Nam';
        currentShopList = all.filter(p => {
          const g = (p.gender || "").toLowerCase();
          const c = (p.category || "").toLowerCase();
          const n = (p.name || "").toLowerCase();
          return g.includes("nam") || c.includes("short") || c.includes("thun") || n.includes("nam") || n.includes("jogger");
        });
      } else if (tabKey === 'sale') {
        if (breadcrumb) breadcrumb.innerHTML = '<a href="index.html">Trang chủ</a> <span>›</span> Khuyến mãi';
        if (title) title.textContent = 'Sản phẩm Khuyến Mãi';
        if (subnavActive) subnavActive.textContent = 'Tất cả sản phẩm Khuyến Mãi';
        currentShopList = all.filter(p => p.onSale || p.discountPercent > 0 || (p.tag && p.tag.includes("%")));
      } else {
        if (breadcrumb) breadcrumb.innerHTML = '<a href="index.html">Trang chủ</a> <span>›</span> Nữ';
        if (title) title.textContent = 'Sản phẩm Nữ';
        if (subnavActive) subnavActive.textContent = 'Tất cả sản phẩm Nữ';
        currentShopList = all.filter(p => {
          const g = (p.gender || "").toLowerCase();
          const c = (p.category || "").toLowerCase();
          const n = (p.name || "").toLowerCase();
          return g.includes("nữ") || c.includes("legging") || c.includes("choàng") || n.includes("nữ") || n.includes("croptop") || n.includes("đầm");
        });
      }

      if (!currentShopList || currentShopList.length === 0) {
        currentShopList = all;
      }

      applyCurrentSort();
      grid.innerHTML = "";
      loaded = 0;
      loadMore();

      const resultCountEl = document.getElementById("resultCount");
      if (resultCountEl) {
        resultCountEl.textContent = `${currentShopList.length} sản phẩm`;
      }
    }

    function applyCurrentSort() {
      const sortSelect = document.getElementById("sortSelect");
      if (!sortSelect || !currentShopList) return;
      const val = sortSelect.value;
      if (val.includes("Thấp đến cao")) {
        currentShopList.sort((a, b) => (a.price || a.now || 0) - (b.price || b.now || 0));
      } else if (val.includes("Cao đến thấp")) {
        currentShopList.sort((a, b) => (b.price || b.now || 0) - (a.price || a.now || 0));
      } else if (val.includes("Mới nhất")) {
        currentShopList.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      }
    }

    function loadMore() {
      const list = (currentShopList && currentShopList.length > 0) ? currentShopList : WanAPI.products.list;
      const frag = document.createDocumentFragment();
      const wrapper = document.createElement("div");
      let html = "";
      const end = Math.min(loaded + PAGE_SIZE, list.length);
      for (let i = loaded; i < end; i++) {
        html += cardHTML(list[i]);
      }
      loaded = end;
      wrapper.innerHTML = html;
      while (wrapper.firstChild) frag.appendChild(wrapper.firstChild);
      grid.appendChild(frag);
      const btn = document.getElementById("loadMoreBtn");
      if (btn) {
        btn.style.display = (loaded >= list.length) ? "none" : "inline-block";
      }
    }

    // Nhấn vào card sản phẩm -> Mở trang chi tiết sản phẩm
    function handleProductCardClick(productId, e) {
      // Nếu click vào nút tim hoặc nút thêm nhanh thì đã xử lý riêng
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
    // 3.5. NAVIGATION & FILTER INTEGRATION (WITH WOMANWAN-HEADER)
    // =========================================================================
    function handleNavClick(tabKey, e) {
      if (e) {
        e.preventDefault();
      }
      const newUrl = tabKey === 'men' ? 'shop.html?gender=men' :
        (tabKey === 'sale' ? 'shop.html?filter=sale' : 'shop.html?gender=women');
      if (window.WanPageTransition && typeof window.WanPageTransition.navigate === "function") {
        window.WanPageTransition.navigate(newUrl);
      } else {
        window.location.href = newUrl;
      }
    }

    function handleMegaCategoryClick(tag, name, e, tabKey) {
      if (e) e.preventDefault();
      const targetGender = tabKey || (currentShopTab === 'men' ? 'men' : 'women');
      const newUrl = `shop.html?gender=${targetGender}&category=${encodeURIComponent(name)}`;
      if (window.WanPageTransition && typeof window.WanPageTransition.navigate === "function") {
        window.WanPageTransition.navigate(newUrl);
      } else {
        window.location.href = newUrl;
      }
    }

    window.handleNavClick = handleNavClick;
    window.handleMegaCategoryClick = handleMegaCategoryClick;

    window.addEventListener("popstate", () => {
      const params = new URLSearchParams(window.location.search);
      const g = params.get('gender');
      const f = params.get('filter');
      setShopGender(g === 'men' ? 'men' : (f === 'sale' ? 'sale' : 'women'));
    });

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
    // 5. INITIALIZATION & SEARCH / SORT / SIDEBAR FILTER LISTENERS
    // =========================================================================
    document.getElementById("loadMoreBtn").addEventListener("click", loadMore);

    document.getElementById("sortSelect").addEventListener("change", () => {
      applyCurrentSort();
      grid.innerHTML = "";
      loaded = 0;
      loadMore();
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const all = WanAPI.products.list;
        if (!query) {
          const params = new URLSearchParams(window.location.search);
          const g = params.get('gender');
          const f = params.get('filter');
          setShopGender(g === 'men' ? 'men' : (f === 'sale' ? 'sale' : 'women'));
          return;
        }

        currentShopList = all.filter(p => {
          const name = (p.name || "").toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();
          const tag = (p.tag || "").toLowerCase();
          return name.includes(query) || desc.includes(query) || cat.includes(query) || tag.includes(query);
        });

        applyCurrentSort();
        grid.innerHTML = "";
        loaded = 0;
        loadMore();

        const resultCountEl = document.getElementById("resultCount");
        if (resultCountEl) {
          resultCountEl.textContent = `${currentShopList.length} sản phẩm phù hợp`;
        }
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = searchInput.value.trim();
          if (val) {
            setShopSearch(val);
            window.history.pushState({}, "", `shop.html?search=${encodeURIComponent(val)}`);
          }
        }
      });
    }

    const searchIconBtn = document.querySelector(".search-icon");
    if (searchIconBtn && searchInput) {
      searchIconBtn.style.cursor = "pointer";
      searchIconBtn.addEventListener("click", () => {
        const val = searchInput.value.trim();
        if (val) {
          setShopSearch(val);
          window.history.pushState({}, "", `shop.html?search=${encodeURIComponent(val)}`);
        }
      });
    }

    function initSidebarFilters() {
      // 1. Lắng nghe các checkbox danh mục
      const catCheckboxes = document.querySelectorAll(".filters .filter-group:first-of-type input[type='checkbox']");
      catCheckboxes.forEach(cb => {
        cb.addEventListener("change", applySidebarFilters);
      });

      // 2. Kích thước
      const sizeBtns = document.querySelectorAll(".size-grid button");
      sizeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          btn.classList.toggle("active");
          if (btn.classList.contains("active")) {
            btn.style.background = "#111";
            btn.style.color = "#fff";
          } else {
            btn.style.background = "";
            btn.style.color = "";
          }
          applySidebarFilters();
        });
      });

      // 3. Màu sắc
      const swatches = document.querySelectorAll(".swatches .swatch");
      swatches.forEach(sw => {
        sw.style.cursor = "pointer";
        sw.addEventListener("click", () => {
          sw.classList.toggle("active");
          if (sw.classList.contains("active")) {
            sw.style.outline = "2px solid #111";
            sw.style.outlineOffset = "2px";
          } else {
            sw.style.outline = "";
            sw.style.outlineOffset = "";
          }
          applySidebarFilters();
        });
      });

      // 4. Khoảng giá
      const priceCheckboxes = document.querySelectorAll(".filters details:nth-of-type(3) input[type='checkbox']");
      priceCheckboxes.forEach(cb => {
        cb.addEventListener("change", applySidebarFilters);
      });

      // 5. Xóa tất cả bộ lọc
      const clearBtn = document.querySelector(".clear-filters");
      if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
          e.preventDefault();
          document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => cb.checked = false);
          sizeBtns.forEach(btn => {
            btn.classList.remove("active");
            btn.style.background = "";
            btn.style.color = "";
          });
          swatches.forEach(sw => {
            sw.classList.remove("active");
            sw.style.outline = "";
            sw.style.outlineOffset = "";
          });
          const params = new URLSearchParams(window.location.search);
          const g = params.get('gender');
          const f = params.get('filter');
          setShopGender(g === 'men' ? 'men' : (f === 'sale' ? 'sale' : 'women'));
        });
      }
    }

    function applySidebarFilters() {
      const all = WanAPI.products.list;
      let list = [...all];

      // Lọc theo tab hiện tại nếu không phải search
      if (currentShopTab === 'men') {
        list = list.filter(p => (p.gender || "").toLowerCase().includes("nam"));
      } else if (currentShopTab === 'sale') {
        list = list.filter(p => p.onSale || p.discountPercent > 0 || (p.tag && p.tag.includes("%")));
      } else if (currentShopTab === 'women') {
        list = list.filter(p => (p.gender || "").toLowerCase().includes("nữ") || (p.gender || "").toLowerCase().includes("nu") || !(p.gender || "").toLowerCase().includes("nam"));
      }

      // Checkbox danh mục được chọn
      const selectedCats = [];
      const catLabels = document.querySelectorAll(".filters .filter-group:first-of-type label");
      catLabels.forEach(lbl => {
        const input = lbl.querySelector("input");
        if (input && input.checked) {
          selectedCats.push(lbl.textContent.toLowerCase());
        }
      });

      if (selectedCats.length > 0) {
        list = list.filter(p => {
          const cat = (p.category || "").toLowerCase();
          const name = (p.name || "").toLowerCase();
          return selectedCats.some(sc => {
            if (sc.includes("khoác") && (cat.includes("khoác") || name.includes("khoác") || name.includes("jacket"))) return true;
            if (sc.includes("thun") && (cat.includes("thun") || name.includes("thun") || name.includes("tee") || name.includes("tank"))) return true;
            if (sc.includes("legging") && (cat.includes("legging") || name.includes("legging"))) return true;
            if (sc.includes("short") && (cat.includes("short") || name.includes("short"))) return true;
            if (sc.includes("giày") && (cat.includes("giày") || name.includes("giày") || name.includes("runner"))) return true;
            if (sc.includes("bơi") && (cat.includes("bơi") || name.includes("bơi"))) return true;
            return false;
          });
        });
      }

      currentShopList = list;
      applyCurrentSort();
      grid.innerHTML = "";
      loaded = 0;
      loadMore();

      const resultCountEl = document.getElementById("resultCount");
      if (resultCountEl) {
        resultCountEl.textContent = `${currentShopList.length} sản phẩm`;
      }
    }

    // Khởi động dữ liệu
    initProducts();
