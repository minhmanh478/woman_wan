/**
 * ============================================================================
 * WOMAN WAN - CHECKOUT LOGIC & INTERACTION ENGINE
 * Phong cách Clean Fit & Trải nghiệm mua sắm cao cấp
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initCheckout();
});

// Trạng thái đơn hàng
const orderState = {
  cart: [],
  subtotal: 0,
  shippingFee: 20000,
  discount: 0,
  discountCode: "",
  shippingMethod: "standard",
  paymentMethod: "cod"
};

// Định dạng tiền tệ VND
function formatVND(amount) {
  const rounded = Math.round(Number(amount) || 0);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

// Xử lý đường dẫn tương đối tới ảnh tài nguyên từ thư mục /checkout/
function resolveAssetPath(imgPath) {
  if (!imgPath) return "../assets/sanpham_test/co_tau.jpg";
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://") || imgPath.startsWith("data:")) {
    return imgPath;
  }
  if (imgPath.startsWith("../")) {
    return imgPath;
  }
  if (imgPath.startsWith("./")) {
    return "../../" + imgPath.slice(2);
  }
  return "../../" + imgPath;
}

function initCheckout() {
  loadCartData();
  renderSummary();
  setupShippingMethods();
  setupPaymentMethods();
  setupVatToggle();
  setupVouchers();
  setupOrderSubmission();
  initProvinces();
}

/**
 * Khởi tạo dữ liệu Tỉnh/Thành, Quận/Huyện, Phường/Xã từ API
 */
function initProvinces() {
  const provinceSelect = document.getElementById("shippingProvince");
  const districtSelect = document.getElementById("shippingDistrict");
  const wardSelect = document.getElementById("shippingWard");

  if (!provinceSelect || !districtSelect || !wardSelect) return;

  // Tải danh sách Tỉnh/Thành phố
  fetch("https://provinces.open-api.vn/api/p/")
    .then(response => response.json())
    .then(data => {
      data.forEach(p => {
        const option = document.createElement("option");
        option.value = p.code;
        option.textContent = p.name;
        provinceSelect.appendChild(option);
      });
    })
    .catch(err => console.error("Lỗi tải tỉnh/thành:", err));

  // Khi chọn Tỉnh/Thành phố -> Tải Quận/Huyện
  provinceSelect.addEventListener("change", (e) => {
    const pCode = e.target.value;
    districtSelect.innerHTML = '<option value="" disabled selected>Chọn Quận/Huyện</option>';
    wardSelect.innerHTML = '<option value="" disabled selected>Chọn Phường/Xã</option>';
    wardSelect.disabled = true;

    if (!pCode) {
      districtSelect.disabled = true;
      return;
    }

    fetch(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`)
      .then(response => response.json())
      .then(data => {
        districtSelect.disabled = false;
        data.districts.forEach(d => {
          const option = document.createElement("option");
          option.value = d.code;
          option.textContent = d.name;
          districtSelect.appendChild(option);
        });
      })
      .catch(err => console.error("Lỗi tải quận/huyện:", err));
  });

  // Khi chọn Quận/Huyện -> Tải Phường/Xã
  districtSelect.addEventListener("change", (e) => {
    const dCode = e.target.value;
    wardSelect.innerHTML = '<option value="" disabled selected>Chọn Phường/Xã</option>';

    if (!dCode) {
      wardSelect.disabled = true;
      return;
    }

    fetch(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`)
      .then(response => response.json())
      .then(data => {
        wardSelect.disabled = false;
        data.wards.forEach(w => {
          const option = document.createElement("option");
          option.value = w.code;
          option.textContent = w.name;
          wardSelect.appendChild(option);
        });
      })
      .catch(err => console.error("Lỗi tải phường/xã:", err));
  });
}

/**
 * Tải dữ liệu giỏ hàng từ localStorage
 */
function loadCartData() {
  const raw = localStorage.getItem("wan_cart_v1") || localStorage.getItem("wan_cart");
  let items = [];
  try {
    items = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Lỗi đọc giỏ hàng:", e);
  }

  // Nếu giỏ hàng có sản phẩm, dùng sản phẩm thực tế
  if (Array.isArray(items) && items.length > 0) {
    orderState.cart = items;
  } else {
    // Nếu chưa có sản phẩm (mở trực tiếp), nạp sản phẩm mẫu tương ứng giỏ hàng Clean Fit
    orderState.cart = [
      {
        id: "ww-002-1",
        name: "Áo thun tập luyện AeroReady",
        price: 384000,
        quantity: 1,
        size: "XS",
        color: "Xanh dương",
        image: "assets/sanpham_test/co_tau.jpg"
      },
      {
        id: "ww-002-2",
        name: "Áo thun tập luyện AeroReady",
        price: 384000,
        quantity: 1,
        size: "2XL",
        color: "Ivory",
        image: "assets/sanpham_test/phong1.jpg"
      },
      {
        id: "ww-001",
        name: "Áo khoác gió Ultraboost Layer",
        price: 849000,
        quantity: 1,
        size: "2XL",
        color: "Ivory",
        image: "assets/sanpham_test/co_tau2.jpg"
      }
    ];
  }
}

/**
 * Xóa một sản phẩm khỏi đơn hàng / giỏ hàng
 */
function removeItemFromCart(index) {
  if (index >= 0 && index < orderState.cart.length) {
    orderState.cart.splice(index, 1);
    try {
      localStorage.setItem("wan_cart_v1", JSON.stringify(orderState.cart));
      localStorage.setItem("wan_cart", JSON.stringify(orderState.cart));
      window.dispatchEvent(new CustomEvent("wan:cart-updated", { detail: orderState.cart }));
    } catch (e) {
      console.warn("Lỗi lưu giỏ hàng:", e);
    }
    renderSummary();
  }
}

/**
 * Hiển thị tóm tắt đơn hàng ở cột bên phải
 */
function renderSummary() {
  const itemsListEl = document.getElementById("checkoutItemsList");
  const itemsBadgeEl = document.getElementById("summaryItemsBadge");
  const headerSummaryEl = document.getElementById("checkoutHeaderSummary");
  const subtotalEl = document.getElementById("summarySubtotal");
  const shippingFeeEl = document.getElementById("summaryShippingFee");
  const totalEl = document.getElementById("summaryTotal");
  const btnTotalEl = document.getElementById("btnOrderTotal");

  if (!itemsListEl) return;

  let totalQty = 0;
  let subtotal = 0;
  let html = "";

  if (!orderState.cart || orderState.cart.length === 0) {
    html = `
      <div style="text-align: center; padding: 28px 10px; color: #888;">
        <p style="font-size: 14px; margin-bottom: 10px; color: #666;">Giỏ hàng của bạn đang trống</p>
        <a href="../shop.html" style="display: inline-block; font-size: 13px; font-weight: 700; color: #111; text-decoration: underline;">Tiếp tục mua sắm</a>
      </div>
    `;
    itemsListEl.innerHTML = html;
  } else {
    orderState.cart.forEach((item, index) => {
      const qty = Number(item.quantity || item.qty) || 1;
      const price = Number(item.price) || 0;
      const itemTotal = price * qty;
      totalQty += qty;
      subtotal += itemTotal;

      const imgSrc = resolveAssetPath(item.image);
      const sizeStr = item.size || item.variant || "M";
      const colorStr = item.color || "Tiêu chuẩn";

      html += `
        <div class="cart-item-card">
          <div class="item-thumb-frame">
            <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.src='../../assets/sanpham_test/co_tau.jpg'">
          </div>
          <div class="item-details-block">
            <div class="item-details-top">
              <h4 class="item-title-name">${item.name}</h4>
              <button type="button" class="item-delete-btn" data-index="${index}" title="Xóa sản phẩm" aria-label="Xóa">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
            <div class="item-variant-line">Size: <strong>${sizeStr}</strong> &bull; Màu: <strong>${colorStr}</strong></div>
            <div class="item-price-calc">
              <span class="item-unit-price">${formatVND(price)} &times; ${qty}</span>
              <span class="item-total-price">${formatVND(itemTotal)}</span>
            </div>
          </div>
        </div>
      `;
    });

    itemsListEl.innerHTML = html;

    itemsListEl.querySelectorAll(".item-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        removeItemFromCart(idx);
      });
    });
  }
  orderState.subtotal = subtotal;

  // Tính tổng thanh toán cuối cùng
  const finalTotal = Math.max(0, subtotal + orderState.shippingFee - orderState.discount);
  const formattedFinal = formatVND(finalTotal);

  if (itemsBadgeEl) itemsBadgeEl.textContent = `${totalQty} sản phẩm`;
  if (headerSummaryEl) headerSummaryEl.textContent = `(${totalQty} sản phẩm) • ${formattedFinal}`;
  if (subtotalEl) subtotalEl.textContent = formatVND(subtotal);
  if (shippingFeeEl) {
    shippingFeeEl.textContent = orderState.shippingFee > 0 ? formatVND(orderState.shippingFee) : "Miễn phí";
  }
  if (totalEl) totalEl.textContent = formattedFinal;
  if (btnTotalEl) btnTotalEl.textContent = formattedFinal;
}

/**
 * Xử lý chọn phương thức vận chuyển
 */
function setupShippingMethods() {
  const options = document.querySelectorAll(".shipping-method-option");
  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");

      const radio = opt.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        orderState.shippingMethod = radio.value;
        orderState.shippingFee = radio.value === "express" ? 35000 : 20000;
        renderSummary();
      }
    });
  });
}

/**
 * Xử lý chọn phương thức thanh toán
 */
function setupPaymentMethods() {
  const options = document.querySelectorAll(".payment-method-option");
  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");

      const radio = opt.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        orderState.paymentMethod = radio.value;
      }
    });
  });
}

/**
 * Xử lý mở/gập form hóa đơn VAT
 */
function setupVatToggle() {
  const vatCheck = document.getElementById("vatInvoiceCheck");
  const vatForm = document.getElementById("vatExpandForm");

  if (!vatCheck || !vatForm) return;

  vatCheck.addEventListener("change", () => {
    if (vatCheck.checked) {
      vatForm.classList.remove("hidden");
    } else {
      vatForm.classList.add("hidden");
    }
  });
}

/**
 * Xử lý mã voucher ưu đãi
 */
function setupVouchers() {
  const input = document.getElementById("promoInput");
  const applyBtn = document.getElementById("promoApplyBtn");
  const msgEl = document.getElementById("promoFeedbackMsg");
  const discountRow = document.getElementById("summaryDiscountRow");
  const discountCodeEl = document.getElementById("discountCodeName");
  const discountValEl = document.getElementById("summaryDiscountVal");
  const chips = document.querySelectorAll(".voucher-chip");

  function applyCode(code) {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      showMessage("Vui lòng nhập mã khuyến mãi!", "error");
      return;
    }

    if (clean === "WOMANWAN") {
      orderState.discountCode = "WOMANWAN";
      orderState.discount = Math.round(orderState.subtotal * 0.1); // Giảm 10%
      showMessage("Áp dụng mã WOMANWAN: Giảm ngay 10% tổng đơn hàng!", "success");
      discountRow.classList.remove("hidden");
      discountCodeEl.textContent = "WOMANWAN (-10%)";
      discountValEl.textContent = `-${formatVND(orderState.discount)}`;
      renderSummary();
    } else if (clean === "FREESHIP") {
      orderState.discountCode = "FREESHIP";
      orderState.discount = orderState.shippingFee;
      showMessage("Áp dụng mã FREESHIP: Miễn phí vận chuyển toàn quốc!", "success");
      discountRow.classList.remove("hidden");
      discountCodeEl.textContent = "FREESHIP";
      discountValEl.textContent = `-${formatVND(orderState.shippingFee > 0 ? orderState.shippingFee : 20000)}`;
      renderSummary();
    } else {
      orderState.discount = 0;
      orderState.discountCode = "";
      discountRow.classList.add("hidden");
      showMessage("Mã ưu đãi không hợp lệ hoặc đã hết lượt dùng.", "error");
      renderSummary();
    }
  }

  function showMessage(text, type) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = `promo-feedback-msg ${type}`;
  }

  if (applyBtn && input) {
    applyBtn.addEventListener("click", () => applyCode(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyCode(input.value);
      }
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const code = chip.getAttribute("data-code");
      if (input) input.value = code;
      applyCode(code);
    });
  });
}

/**
 * Xử lý bấm HOÀN TẤT ĐẶT HÀNG & Kiểm tra dữ liệu
 */
function setupOrderSubmission() {
  const btnSubmit = document.getElementById("btnSubmitOrder");
  const modal = document.getElementById("orderSuccessModal");
  if (!btnSubmit) return;

  btnSubmit.addEventListener("click", () => {
    const fullName = document.getElementById("shippingFullName")?.value.trim();
    const phone = document.getElementById("shippingPhone")?.value.trim();
    const email = document.getElementById("shippingEmail")?.value.trim();
    const address = document.getElementById("shippingAddress")?.value.trim();
    const terms = document.getElementById("termsAgreementCheck");

    // Kiểm tra các trường bắt buộc
    if (!fullName) {
      showToastNotice("Vui lòng điền họ và tên người nhận");
      document.getElementById("shippingFullName")?.focus();
      return;
    }
    if (!phone || phone.length < 9) {
      showToastNotice("Vui lòng nhập số điện thoại hợp lệ (ít nhất 9 số)");
      document.getElementById("shippingPhone")?.focus();
      return;
    }
    if (!email || !email.includes("@")) {
      showToastNotice("Vui lòng nhập địa chỉ email hợp lệ để nhận thông báo");
      document.getElementById("shippingEmail")?.focus();
      return;
    }
    if (!address) {
      showToastNotice("Vui lòng nhập địa chỉ nhận hàng chi tiết");
      document.getElementById("shippingAddress")?.focus();
      return;
    }
    if (terms && !terms.checked) {
      showToastNotice("Vui lòng đồng ý với Điều khoản mua hàng & Chính sách đổi trả");
      terms.focus();
      return;
    }

    // Nếu chọn VAT thì kiểm tra mã số thuế
    const vatCheck = document.getElementById("vatInvoiceCheck");
    if (vatCheck && vatCheck.checked) {
      const taxCode = document.getElementById("vatTaxCode")?.value.trim();
      const compName = document.getElementById("vatCompanyName")?.value.trim();
      if (!taxCode || !compName) {
        showToastNotice("Vui lòng điền đầy đủ Mã số thuế và Tên công ty/cá nhân");
        return;
      }
    }

    // Hiển thị Dialog Đặt hàng thành công
    const orderCode = `WW-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalAmount = Math.max(0, orderState.subtotal + orderState.shippingFee - orderState.discount);

    const paymentTexts = {
      cod: "Thanh toán khi nhận hàng (COD)",
      vietqr: "Chuyển khoản VietQR",
      ewallet: "Ví điện tử (MoMo / ZaloPay)"
    };

    if (modal) {
      const codeEl = document.getElementById("modalOrderCode");
      const nameEl = document.getElementById("modalCustomerName");
      const totalEl = document.getElementById("modalFinalTotal");
      const payEl = document.getElementById("modalPaymentMethod");

      if (codeEl) codeEl.textContent = orderCode;
      if (nameEl) nameEl.textContent = fullName;
      if (totalEl) totalEl.textContent = formatVND(finalAmount);
      if (payEl) payEl.textContent = paymentTexts[orderState.paymentMethod] || "COD";

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }

    // Xóa giỏ hàng sau khi đặt hàng thành công
    localStorage.removeItem("wan_cart_v1");
    localStorage.removeItem("wan_cart");
    window.dispatchEvent(new Event("wan:cart-updated"));
  });
}

/**
 * Toast thông báo nhanh, tinh gọn
 */
function showToastNotice(msg) {
  const old = document.querySelector(".ck-floating-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.className = "ck-floating-toast";
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #111111;
    color: #ffffff;
    padding: 12px 22px;
    border-radius: 4px;
    font-size: 13.5px;
    font-weight: 500;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transition: all 0.25s ease;
  `;
  toast.innerHTML = `<span>⚠️ ${msg}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
