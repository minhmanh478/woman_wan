// ==========================================================================
// WOMAN WAN - PRODUCT DETAIL PAGE (PDP) LOGIC
// Dynamic JSON rendering, Size/Color Pickers, Cart & Wishlist integration
// ==========================================================================

(function () {
  "use strict";

  // State
  let currentProduct = null;
  let selectedColor = null;
  let selectedSize = null;
  let countdownInterval = null;

  // Format currency helper
  function formatVND(num) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num).replace("₫", "").trim() + "₫";
  }

  // Toast Notification
  function showToast(msg) {
    const toast = document.getElementById("wanToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // Initialize Page
  async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id") || "ww-jac-001";

    try {
      const res = await fetch("product.json");
      const products = await res.json();
      currentProduct = products.find((p) => p.id === productId);

      if (!currentProduct) {
        try {
          const mainRes = await fetch("../products.json");
          const mainCatalog = await mainRes.json();
          const found = mainCatalog.find((p) => p.id === productId || String(p.id) === String(productId));
          if (found) {
            const template = products[0];

            // Normalize images
            let images = [];
            if (Array.isArray(found.images) && found.images.length > 0) {
              images = found.images.map((img) =>
                img.startsWith("http") || img.startsWith("../") || img.startsWith("images/") ? img : `../${img}`
              );
            } else {
              const rawList = [found.image, found.hoverImage, found.image, found.hoverImage].filter(Boolean);
              images = rawList.map((img) =>
                img.startsWith("http") || img.startsWith("../") || img.startsWith("images/") ? img : `../${img}`
              );
            }
            if (images.length === 0) {
              images = template.images || ["images/product_1.png"];
            }

            // Normalize sizes: handle array of strings or objects
            const normalizedSizes = (found.sizes && found.sizes.length > 0 ? found.sizes : ["S", "M", "L", "XL"]).map(
              (s, idx) => {
                if (typeof s === "string") {
                  return { name: s, available: true, selected: idx === 0 };
                }
                return { ...s, selected: s.selected !== undefined ? s.selected : idx === 0 };
              }
            );

            // Normalize colors: handle array of strings or objects
            let normalizedColors = (found.colors || []).map((c, idx) => {
              if (typeof c === "string") {
                return { name: c, thumb: images[0] || "images/product_1.png", selected: idx === 0 };
              }
              const cThumb = c.thumb
                ? c.thumb.startsWith("http") || c.thumb.startsWith("../") || c.thumb.startsWith("images/")
                  ? c.thumb
                  : `../${c.thumb}`
                : images[0] || "images/product_1.png";
              return {
                ...c,
                thumb: cThumb,
                selected: c.selected !== undefined ? c.selected : idx === 0,
              };
            });
            if (normalizedColors.length === 0) {
              normalizedColors = [{ name: "Tiêu chuẩn", thumb: images[0] || "images/product_1.png", selected: true }];
            }

            currentProduct = {
              ...template,
              id: found.id,
              name: found.name,
              subName: found.description || template.subName,
              category: `${found.gender || "Nữ"} • ${found.category || "Originals"}`,
              price: found.price || template.price,
              basePrice: found.basePrice || template.basePrice,
              tag: found.tag || template.tag,
              promoTag: found.promoTag || template.promoTag || "MUA 2 GIẢM THÊM 10%",
              rating: found.rating || 4.8,
              reviewsCount: found.reviewsCount || 64,
              images: images,
              sizes: normalizedSizes,
              colors: normalizedColors,
              breadcrumb: [
                { name: "Trang Chủ", url: "../index.html" },
                {
                  name: found.gender || "Sản phẩm",
                  url: `../shop.html?gender=${(found.gender || "nữ").toLowerCase() === "nam" ? "men" : "women"}`,
                },
                { name: found.category || "Bộ sưu tập", url: "../shop.html" },
              ],
            };
          }
        } catch (catErr) {
          console.warn("Could not fetch main catalog:", catErr);
        }
      }

      if (!currentProduct) {
        currentProduct = products[0];
      }

      renderProduct(currentProduct);
      initCountdown();
      initHeaderDrawers();
    } catch (err) {
      console.error("Error loading product data:", err);
    }
  }

  // Render Product Details
  function renderProduct(p) {
    document.title = `${p.name} - WOMAN WAN`;

    // 1. Breadcrumb
    const breadcrumbEl = document.getElementById("pdpBreadcrumb");
    if (breadcrumbEl && p.breadcrumb) {
      breadcrumbEl.innerHTML = `
        <a href="javascript:history.back()" class="back-btn" aria-label="Quay lại">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Trở lại
        </a>
        ${p.breadcrumb
          .map(
            (b, i) => `
          <a href="${b.url}">${b.name}</a>
          ${i < p.breadcrumb.length - 1 ? '<span class="sep">/</span>' : ""}
        `
          )
          .join("")}
      `;
    }

    // 2. Images Gallery (2x2 Grid)
    const galleryGrid = document.getElementById("pdpGalleryGrid");
    const expandWrap = document.querySelector(".pdp-expand-wrap");
    
    if (galleryGrid && p.images && p.images.length > 0) {
      // For demonstration, if there are exactly 4 or fewer images, duplicate them so the expand feature is visible
      let displayImages = p.images;
      if (displayImages.length <= 4) {
        displayImages = [...displayImages, ...displayImages];
      }

      galleryGrid.innerHTML = displayImages
        .map((imgSrc, idx) => `
          <div class="pdp-gallery-item" onclick="handleGalleryClick(event, '${imgSrc}')">
            <img src="${imgSrc}" alt="${p.name} - Ảnh ${idx + 1}" loading="${idx < 2 ? "eager" : "lazy"}">
          </div>
        `)
        .join("");

      initGalleryZoom();
      
      if (expandWrap) {
        expandWrap.style.display = "flex"; // Always show button for demo
      }
    }

    // 3. Meta & Rating
    const categoryEl = document.getElementById("pdpCategoryText");
    if (categoryEl) categoryEl.textContent = p.category || "Clean Fit";

    const ratingEl = document.getElementById("pdpRatingText");
    if (ratingEl) {
      ratingEl.innerHTML = `${p.rating || 4.7} <span class="pdp-stars">★★★★★</span> <span class="pdp-reviews-count">(${p.reviewsCount || 137})</span>`;
    }
    
    const accReviewEl = document.getElementById("pdpReviewCountAcc");
    if (accReviewEl) accReviewEl.textContent = p.reviewsCount || 137;

    // 4. Badges
    const badgesRow = document.getElementById("pdpBadgesRow");
    if (badgesRow) {
      let badgesHtml = "";
      if (p.tag) badgesHtml += `<span class="pdp-badge-pill new-tag">${p.tag}</span>`;
      if (p.promoTag) badgesHtml += `<span class="pdp-badge-pill sale-tag">${p.promoTag}</span>`;
      badgesRow.innerHTML = badgesHtml;
    }

    // 5. Title & Pricing
    const titleEl = document.getElementById("pdpTitle");
    if (titleEl) titleEl.textContent = p.name;

    const currentPriceEl = document.getElementById("pdpPriceCurrent");
    if (currentPriceEl) currentPriceEl.textContent = formatVND(p.price);

    const basePriceEl = document.getElementById("pdpPriceBase");
    if (basePriceEl) {
      if (p.basePrice && p.basePrice > p.price) {
        basePriceEl.textContent = formatVND(p.basePrice);
        basePriceEl.style.display = "inline";
      } else {
        basePriceEl.style.display = "none";
      }
    }

    // 6. Flash Sale Promo Box
    if (p.flashSale) {
      const promoHead = document.getElementById("pdpPromoHeadTitle");
      if (promoHead) promoHead.textContent = p.flashSale.title;

      const promoDesc = document.getElementById("pdpPromoDesc");
      if (promoDesc) promoDesc.textContent = p.flashSale.description;
    }

    // 7. Colors
    const colorLabelEl = document.getElementById("pdpSelectedColorName");
    const colorsListEl = document.getElementById("pdpColorThumbnails");
    if (colorsListEl && p.colors && p.colors.length > 0) {
      const initialColor = p.colors.find((c) => c.selected) || p.colors[0];
      selectedColor = initialColor;
      const initialColorName = typeof initialColor === "string" ? initialColor : initialColor.name;
      if (colorLabelEl) colorLabelEl.textContent = initialColorName;

      colorsListEl.innerHTML = p.colors
        .map((c) => {
          const cName = typeof c === "string" ? c : c.name;
          const cThumb = typeof c === "object" && c.thumb ? c.thumb : p.images ? p.images[0] : "images/product_1.png";
          return `
        <button class="pdp-color-thumb-btn ${cName === initialColorName ? "active" : ""}" 
          data-color="${cName}" 
          onclick="handleColorSelect('${cName}', this)" 
          title="${cName}"
          aria-label="${cName}">
          <img src="${cThumb}" alt="${cName}">
        </button>
      `;
        })
        .join("");
    }

    // 8. Sizes (Do NOT pre-select size by default, let user choose)
    selectedSize = null;
    const sizeStatusEl = document.getElementById("pdpSizeStatus");
    if (sizeStatusEl) {
      sizeStatusEl.textContent = ": Chưa chọn";
      sizeStatusEl.className = "pdp-size-status";
    }

    const sizesGrid = document.getElementById("pdpSizesGrid");
    if (sizesGrid && p.sizes && p.sizes.length > 0) {
      sizesGrid.innerHTML = p.sizes
        .map((s) => {
          const sName = typeof s === "string" ? s : s.name;
          const isAvail = typeof s === "string" ? true : s.available !== false;
          return `
        <button class="pdp-size-btn ${!isAvail ? "disabled" : ""}" 
          ${!isAvail ? "disabled" : ""} 
          data-size="${sName}" 
          onclick="handleSizeSelect('${sName}', this)">
          ${sName}
        </button>
      `;
        })
        .join("");
    }

    const fitTipEl = document.getElementById("pdpFitTipText");
    if (fitTipEl && p.sizeGuideTip) {
      fitTipEl.textContent = p.sizeGuideTip;
    }

    // 9. Membership points
    const clubPointsEl = document.getElementById("pdpClubPointsText");
    if (clubPointsEl && p.membership) {
      clubPointsEl.textContent = p.membership.text;
    }

    // 10. Accordion Policies
    const policyListEl = document.getElementById("pdpPolicyList");
    if (policyListEl && p.benefits) {
      policyListEl.innerHTML = p.benefits
        .map(
          (b, i) => `
        <div class="pdp-policy-item ${i === 0 ? "open" : ""}">
          <button class="pdp-policy-header" onclick="togglePolicyItem(this)">
            <span class="pdp-policy-header-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${b.title}</span>
            </span>
            <svg class="pdp-policy-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="pdp-policy-content">
            <p>${b.content}</p>
          </div>
        </div>
      `
        )
        .join("");
    }

    // 11. Description & Specifications Tab
    if (p.description) {
      const descTitle = document.getElementById("pdpDescTitle");
      if (descTitle && p.description.title) descTitle.textContent = p.description.title;

      const descLead = document.getElementById("pdpDescLead");
      if (descLead) descLead.textContent = p.description.lead;

      const descBody = document.getElementById("pdpDescBody");
      if (descBody && p.description.paragraphs) {
        descBody.innerHTML = p.description.paragraphs
          .map((para) => `<p>${para}</p>`)
          .join("");
      }

      const descHighList = document.getElementById("pdpDescHighlightsList");
      if (descHighList && p.description.highlights) {
        descHighList.innerHTML = p.description.highlights
          .map(
            (item) => `
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>${item}</span>
          </li>
        `
          )
          .join("");
      }
    }

    if (p.specifications) {
      const specsBody = document.getElementById("pdpSpecsTableBody");
      if (specsBody && p.specifications.items) {
        specsBody.innerHTML = p.specifications.items
          .map(
            (spec) => `
          <tr>
            <th>${spec.label}</th>
            <td>${spec.value}</td>
          </tr>
        `
          )
          .join("");
      }
    }

    // Update Wishlist state on load
    updateWishlistButtonState(p.id);
  }

  // Color Selection Handler
  window.handleColorSelect = function (colorName, btn) {
    document
      .querySelectorAll(".pdp-color-thumb-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (currentProduct && currentProduct.colors) {
      selectedColor = currentProduct.colors.find((c) => (typeof c === "string" ? c : c.name) === colorName) || { name: colorName };
    } else {
      selectedColor = { name: colorName };
    }
    const label = document.getElementById("pdpSelectedColorName");
    if (label) label.textContent = colorName;
    showToast(`Đã chọn màu: ${colorName}`);
  };

  // Size Selection Handler
  window.handleSizeSelect = function (sizeName, btn) {
    document
      .querySelectorAll(".pdp-size-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSize = sizeName;

    const sizeStatusEl = document.getElementById("pdpSizeStatus");
    if (sizeStatusEl) {
      sizeStatusEl.textContent = `: ${sizeName}`;
      sizeStatusEl.className = "pdp-size-status has-selected";
    }

    const sizeSection = document.getElementById("pdpSizesSection") || document.getElementById("pdpSizesGrid");
    if (sizeSection) {
      sizeSection.classList.remove("size-highlight-alert");
      sizeSection.classList.remove("size-shake-alert");
    }

    showToast(`✓ Đã chọn kích cỡ: ${sizeName}`);
  };

  // Toggle Policy Accordion
  window.togglePolicyItem = function (btn) {
    const item = btn.closest(".pdp-policy-item");
    if (item) item.classList.toggle("open");
  };

  // Toggle Details Accordion (Review, Description, Specs)
  window.toggleDetailsItem = function (btn) {
    const item = btn.closest(".pdp-details-item");
    if (item) item.classList.toggle("open");
  };

  // Flash Sale Countdown Timer
  function initCountdown() {
    const timerEl = document.getElementById("pdpTimerVal");
    if (!timerEl) return;

    // Countdown target: 1 day 44 mins from now
    let secondsRemaining = 1 * 24 * 3600 + 1 * 3600 + 44 * 60 + 42;

    function tick() {
      if (secondsRemaining <= 0) {
        clearInterval(countdownInterval);
        timerEl.textContent = "00:00:00:00";
        return;
      }
      secondsRemaining--;
      const d = Math.floor(secondsRemaining / (24 * 3600));
      const h = Math.floor((secondsRemaining % (24 * 3600)) / 3600);
      const m = Math.floor((secondsRemaining % 3600) / 60);
      const s = secondsRemaining % 60;

      const pad = (n) => String(n).padStart(2, "0");
      timerEl.textContent = `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  // =========================================================================
  // INTERACTIVE IMAGE ZOOM & PAN INSPECTOR
  // =========================================================================
  function initGalleryZoom() {
    const galleryItems = document.querySelectorAll(".pdp-gallery-item");
    // Giảm độ phóng to xuống 1/2 so với khoảng cách giữa mặc định (1.0) và mức phóng to trước (2.35): 1.0 + 1.35/2 = ~1.68
    const ZOOM_SCALE = 1.68;

    galleryItems.forEach((item) => {
      const img = item.querySelector("img");
      if (!img) return;

      let isZooming = false;
      let rafId = null;

      function onMouseEnter(e) {
        isZooming = true;
        item.classList.add("is-zooming");
        updatePosition(e);
      }

      function onMouseMove(e) {
        if (!isZooming) return;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          updatePosition(e);
        });
      }

      function onMouseLeave() {
        isZooming = false;
        if (rafId) cancelAnimationFrame(rafId);
        item.classList.remove("is-zooming");
        img.style.transformOrigin = "center center";
        img.style.transform = "scale(1)";
      }

      function updatePosition(e) {
        const rect = item.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Calculate bounded percentage [0, 100] based on cursor offset
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const xPercent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
        const yPercent = Math.max(0, Math.min(100, (offsetY / rect.height) * 100));

        img.style.transformOrigin = `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`;
        img.style.transform = `scale(${ZOOM_SCALE})`;
      }

      // Cleanup prior listeners
      item.onmouseenter = onMouseEnter;
      item.onmousemove = onMouseMove;
      item.onmouseleave = onMouseLeave;

      // Touch screen support (tap and pan)
      item.ontouchstart = (e) => {
        if (e.touches.length === 1) {
          isZooming = true;
          item.classList.add("is-zooming");
          updateTouchPosition(e.touches[0]);
        }
      };

      item.ontouchmove = (e) => {
        if (!isZooming || e.touches.length !== 1) return;
        e.preventDefault();
        updateTouchPosition(e.touches[0]);
      };

      item.ontouchend = () => {
        isZooming = false;
        item.classList.remove("is-zooming");
        img.style.transformOrigin = "center center";
        img.style.transform = "scale(1)";
      };

      function updateTouchPosition(touch) {
        const rect = item.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        const xPercent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
        const yPercent = Math.max(0, Math.min(100, (offsetY / rect.height) * 100));
        img.style.transformOrigin = `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`;
        img.style.transform = `scale(${ZOOM_SCALE})`;
      }
    });
  }

  // Handle click on gallery item: open lightbox
  window.handleGalleryClick = function (e, imgSrc) {
    openLightbox(imgSrc);
  };

  // Lightbox Image Zoom
  window.openLightbox = function (imgSrc) {
    const lightbox = document.getElementById("pdpLightbox");
    const lightboxImg = document.getElementById("pdpLightboxImg");
    if (lightbox && lightboxImg) {
      lightboxImg.src = imgSrc;
      lightbox.classList.add("active");
    }
  };

  window.closeLightbox = function () {
    const lightbox = document.getElementById("pdpLightbox");
    if (lightbox) lightbox.classList.remove("active");
  };

  // Expand Gallery (Hiện thêm)
  window.handleExpandGallery = function () {
    const grid = document.getElementById("pdpGalleryGrid");
    const btnSpan = document.querySelector("#pdpExpandBtn span");
    const btnIcon = document.querySelector("#pdpExpandBtn svg");
    
    if (grid) {
      const isExpanded = grid.classList.toggle("expanded");
      if (btnSpan) btnSpan.textContent = isExpanded ? "Thu gọn" : "Hiện thêm chi tiết";
      if (btnIcon) btnIcon.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
      
      if (!isExpanded) {
        // scroll back to top of gallery container if collapsed
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // =========================================================================
  // CART & WISHLIST INTEGRATION (SHARED WITH WOMAN WAN LOCAL STORAGE)
  // =========================================================================
  function getCart() {
    try {
      const raw = localStorage.getItem("wan_cart_v1") || localStorage.getItem("wan_cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem("wan_cart_v1", JSON.stringify(cart));
    localStorage.setItem("wan_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("wan:cart-updated"));
    updateCartBadges();
  }

  function updateCartBadges() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const badges = document.querySelectorAll(".cart-count, #cartBadge");
    badges.forEach((b) => {
      b.textContent = totalQty;
      b.style.display = totalQty > 0 ? "inline-flex" : "none";
    });
  }

  function getWishlist() {
    try {
      const raw = localStorage.getItem("wan_wishlist_v1") || localStorage.getItem("wan_wishlist");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(list) {
    localStorage.setItem("wan_wishlist_v1", JSON.stringify(list));
    localStorage.setItem("wan_wishlist", JSON.stringify(list));
    window.dispatchEvent(new Event("wan:wishlist-updated"));
    updateWishlistBadges();
  }

  function updateWishlistBadges() {
    const list = getWishlist();
    const badges = document.querySelectorAll(".wishlist-count, #wishlistBadge");
    badges.forEach((b) => {
      b.textContent = list.length;
      b.style.display = list.length > 0 ? "inline-flex" : "none";
    });
  }

  function updateWishlistButtonState(productId) {
    const list = getWishlist();
    const btn = document.getElementById("pdpWishlistBtn");
    if (!btn) return;
    const isSaved = list.some((item) => (typeof item === "object" ? item.id : item) === productId);
    if (isSaved) {
      btn.classList.add("active");
      btn.title = "Bỏ yêu thích";
    } else {
      btn.classList.remove("active");
      btn.title = "Lưu sản phẩm";
    }
  }

  // Prompt Size Selection Notice & Shake Alert
  function promptSelectSize(actionText = "tiếp tục") {
    showToast(`⚠️ Vui lòng chọn kích cỡ trước khi ${actionText}!`);

    const sizeStatusEl = document.getElementById("pdpSizeStatus");
    if (sizeStatusEl) {
      sizeStatusEl.textContent = " — Vui lòng chọn size!";
      sizeStatusEl.className = "pdp-size-status is-warning";
    }

    const sizeSection = document.getElementById("pdpSizesSection") || document.getElementById("pdpSizesGrid");
    if (sizeSection) {
      sizeSection.classList.remove("size-shake-alert");
      sizeSection.classList.remove("size-highlight-alert");
      void sizeSection.offsetWidth;
      sizeSection.classList.add("size-shake-alert");
      sizeSection.classList.add("size-highlight-alert");
      sizeSection.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        sizeSection.classList.remove("size-shake-alert");
      }, 600);
      setTimeout(() => {
        sizeSection.classList.remove("size-highlight-alert");
      }, 1400);
    }
  }

  // Add to Cart
  window.handleAddToCartPDP = function () {
    if (!currentProduct) return;
    if (!selectedSize) {
      promptSelectSize("thêm vào giỏ hàng");
      return;
    }

    const cart = getCart();
    const colorName = selectedColor ? (typeof selectedColor === "string" ? selectedColor : selectedColor.name) : "Tiêu chuẩn";
    const variantName = `${colorName} / ${selectedSize}`;
    const cartItemId = `${currentProduct.id}-${variantName}`;

    // Normalize image for drawer (clean root path)
    let itemImage = currentProduct.images ? currentProduct.images[0] : currentProduct.image || "assets/sanpham_test/co_tau.jpg";
    if (itemImage.startsWith("../")) {
      itemImage = itemImage.substring(3);
    } else if (itemImage.startsWith("images/")) {
      itemImage = `product/${itemImage}`;
    }

    const existingIndex = cart.findIndex((item) => item.id === cartItemId || (item.name === currentProduct.name && item.variant === variantName));

    if (existingIndex > -1) {
      cart[existingIndex].qty = (cart[existingIndex].qty || 1) + 1;
    } else {
      cart.push({
        id: cartItemId,
        productId: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        variant: variantName,
        size: selectedSize,
        color: colorName,
        image: itemImage,
        qty: 1,
      });
    }

    saveCart(cart);
    showToast(`✓ Đã thêm vào giỏ: ${currentProduct.name} (${selectedSize})`);

    // Animate Cart Icon in Header
    const cartIcon = document.querySelector(".cart-btn-wrap") || document.getElementById("cartBadge");
    if (cartIcon) {
      cartIcon.classList.add("badge-pop");
      setTimeout(() => cartIcon.classList.remove("badge-pop"), 400);
    }

    // Automatically open Cart Drawer
    if (typeof window.openCart === "function") {
      if (typeof window.switchDrawerTab === "function") {
        window.switchDrawerTab("cart");
      }
      window.openCart();
    }
  };

  // Buy Now / Đặt hàng ngay (Direct to Checkout)
  window.handleBuyNowPDP = function () {
    if (!currentProduct) return;
    if (!selectedSize) {
      promptSelectSize("đặt hàng");
      return;
    }

    const cart = getCart();
    const colorName = selectedColor ? (typeof selectedColor === "string" ? selectedColor : selectedColor.name) : "Tiêu chuẩn";
    const variantName = `${colorName} / ${selectedSize}`;
    const cartItemId = `${currentProduct.id}-${variantName}`;

    let itemImage = currentProduct.images ? currentProduct.images[0] : currentProduct.image || "assets/sanpham_test/co_tau.jpg";
    if (itemImage.startsWith("../")) {
      itemImage = itemImage.substring(3);
    } else if (itemImage.startsWith("images/")) {
      itemImage = `product/${itemImage}`;
    }

    const existingIndex = cart.findIndex((item) => item.id === cartItemId || (item.name === currentProduct.name && item.variant === variantName));

    if (existingIndex > -1) {
      cart[existingIndex].qty = (cart[existingIndex].qty || 1) + 1;
    } else {
      cart.push({
        id: cartItemId,
        productId: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        variant: variantName,
        size: selectedSize,
        color: colorName,
        image: itemImage,
        qty: 1,
      });
    }

    saveCart(cart);

    // Chuyển hướng ngay sang trang thanh toán checkout
    window.location.href = "../checkout/index.html";
  };

  // Toggle Wishlist
  window.handleToggleWishlistPDP = function () {
    if (!currentProduct) return;
    const list = getWishlist();
    const existingIndex = list.findIndex((item) => (typeof item === "object" ? item.id : item) === currentProduct.id);

    if (existingIndex > -1) {
      list.splice(existingIndex, 1);
      showToast(`Đã bỏ lưu sản phẩm: ${currentProduct.name}`);
    } else {
      list.push(currentProduct.id);
      showToast(`♥ Đã lưu sản phẩm vào danh sách yêu thích!`);
    }

    saveWishlist(list);
    updateWishlistButtonState(currentProduct.id);
  };

  // Header Drawers (Search, Mega Nav, Cart Drawer)
  function initHeaderDrawers() {
    updateCartBadges();
    updateWishlistBadges();

    window.addEventListener("wan:cart-updated", updateCartBadges);
    window.addEventListener("wan:wishlist-updated", () => {
      updateWishlistBadges();
      if (currentProduct) updateWishlistButtonState(currentProduct.id);
    });

    // Close lightbox on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    });
  }

  // DOM Content Loaded
  document.addEventListener("DOMContentLoaded", initProductPage);
})();
