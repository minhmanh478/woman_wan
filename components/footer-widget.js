/**
 * ============================================================================
 * WOMAN WAN - REUSABLE FOOTER WIDGET (WEB COMPONENT & HELPER)
 * ============================================================================
 * Cách dùng:
 * 1. Nhúng script vào trang:
 *    <script src="components/footer-widget.js"></script>  (ở trang root)
 *    <script src="../components/footer-widget.js"></script> (ở trang con /product/)
 *
 * 2. Gọi hiển thị ở bất kỳ trang nào:
 *    - Custom Tag: <womanwan-footer></womanwan-footer>
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

  // Dữ liệu nội dung chi tiết 12 chính sách & mục hỗ trợ
  const POLICIES_DATA = {
    price: {
      title: "Chính sách giá",
      tag: "Minh bạch & Chuẩn niêm yết",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
      content: `
        <p><strong>1. Cam kết giá niêm yết:</strong> Toàn bộ sản phẩm của WOMAN WAN đều được niêm yết giá công khai, minh bạch và thống nhất trên website cũng như các sàn thương mại điện tử chính thức.</p>
        <p><strong>2. Giá đã bao gồm thuế:</strong> Tất cả giá bán hiển thị trên website đã bao gồm thuế giá trị gia tăng (VAT) theo quy định hiện hành.</p>
        <p><strong>3. Chính sách khuyến mãi:</strong> Các chương trình khuyến mãi, mã giảm giá voucher hay Flash Sale sẽ được áp dụng theo thời gian công bố cụ thể và không có giá trị quy đổi thành tiền mặt.</p>
        <p><strong>4. Cam kết giá tốt nhất:</strong> WOMAN WAN cam kết mang tới giá trị tương xứng nhất với chất lượng vải công nghệ Seamless 4 chiều cao cấp.</p>
      `
    },
    payment: {
      title: "Chính sách thanh toán",
      tag: "Đa dạng & Bảo mật 100%",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
      content: `
        <p><strong>1. Thanh toán khi nhận hàng (COD):</strong> Quý khách thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi đã kiểm tra sản phẩm.</p>
        <p><strong>2. Chuyển khoản ngân hàng (VietQR):</strong> Quét mã QR chuyển khoản tức thì từ mọi ứng dụng ngân hàng. Hệ thống tự động xác nhận đơn trong 1 giây.</p>
        <p><strong>3. Ví điện tử tiện lợi:</strong> Hỗ trợ thanh toán nhanh chóng qua MoMo, ZaloPay, ShopeePay.</p>
        <p><strong>4. Thẻ tín dụng / Ghi nợ quốc tế:</strong> Chấp nhận thanh toán thẻ Visa, MasterCard, JCB qua cổng thanh toán bảo mật tiêu chuẩn quốc tế.</p>
      `
    },
    shipping: {
      title: "Chính sách vận chuyển và giao nhận",
      tag: "Freeship đơn từ 1.000.000₫",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      content: `
        <p><strong>1. Miễn phí vận chuyển (Freeship):</strong> Toàn bộ đơn hàng có giá trị từ <strong>1.000.000₫</strong> trở lên sẽ được miễn phí giao hàng tiêu chuẩn trên toàn quốc.</p>
        <p><strong>2. Cước phí đơn dưới 1.000.000₫:</strong> Áp dụng mức phí đồng giá ưu đãi từ <strong>25.000₫ - 30.000₫</strong> tùy khu vực.</p>
        <p><strong>3. Thời gian giao hàng:</strong>
          <br>• Nội thành Hà Nội & TP.HCM: 1 - 2 ngày làm việc.
          <br>• Các tỉnh thành khác: 2 - 4 ngày làm việc.
        </p>
        <p><strong>4. Quyền đồng kiểm:</strong> Khách hàng được quyền mở gói hàng kiểm tra ngoại quan (mẫu mã, màu sắc, kích cỡ) trước khi thanh toán cho bên vận chuyển.</p>
      `
    },
    return: {
      title: "Chính sách đổi hàng",
      tag: "Đổi trả dễ dàng trong 30 ngày",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
      content: `
        <p><strong>1. Thời hạn đổi hàng:</strong> Hỗ trợ đổi sản phẩm trong vòng <strong>30 ngày</strong> kể từ khi quý khách nhận được đơn hàng.</p>
        <p><strong>2. Đổi hàng tận nơi miễn phí:</strong> Nhân viên giao vận sẽ mang sản phẩm đổi mới đến tận nhà bạn và đồng thời thu hồi lại sản phẩm cũ, bạn không cần ra bưu cục gửi hàng.</p>
        <p><strong>3. Điều kiện đổi hàng:</strong> Sản phẩm còn nguyên tem mác, chưa qua giặt ủi, không bám bẩn hoặc có mùi lạ.</p>
        <p><strong>4. Nội dung hỗ trợ:</strong> Hỗ trợ đổi size, đổi màu hoặc đổi sang sản phẩm khác có giá trị tương đương hoặc cao hơn.</p>
      `
    },
    warranty: {
      title: "Chính sách bảo hành và bảo trì",
      tag: "Bảo hành 6 tháng miễn phí",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      content: `
        <p><strong>1. Thời hạn bảo hành:</strong> Bảo hành miễn phí <strong>06 tháng</strong> cho tất cả sản phẩm thời trang chính hãng WOMAN WAN.</p>
        <p><strong>2. Phạm vi bảo hành:</strong> Khắc phục các lỗi kỹ thuật từ nhà sản xuất như bung chỉ may, đứt cúc, hỏng khoá kéo, co rút hoặc bai giãn sợi vải bất thường.</p>
        <p><strong>3. Hỗ trợ bảo trì trọn đời:</strong> Hỗ trợ sửa chữa, may vá và gia cố phụ kiện trọn đời cho các sản phẩm của WOMAN WAN.</p>
        <p><strong>4. Tiếp nhận:</strong> Quý khách chỉ cần liên hệ Hotline <strong>0867 774 069</strong> hoặc Fanpage để được hướng dẫn gửi sản phẩm về trung tâm bảo hành.</p>
      `
    },
    privacy: {
      title: "Chính sách bảo mật",
      tag: "An toàn dữ liệu khách hàng",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      content: `
        <p><strong>1. Thu thập thông tin:</strong> Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc xử lý đơn hàng gồm: Họ tên, Số điện thoại, Địa chỉ giao hàng và Email.</p>
        <p><strong>2. Cam kết bảo mật:</strong> Mọi thông tin khách hàng được mã hóa và bảo vệ theo tiêu chuẩn bảo mật cao nhất, tuyệt đối không tiết lộ hay bán cho bên thứ ba.</p>
        <p><strong>3. Quyền của khách hàng:</strong> Quý khách có quyền yêu cầu tra cứu, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình trong hệ thống bất kỳ lúc nào.</p>
      `
    },
    complaint: {
      title: "Chính sách khiếu nại",
      tag: "Giải quyết trong vòng 24h",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      content: `
        <p><strong>1. Kênh tiếp nhận 24/7:</strong>
          <br>• Hotline: <a href="tel:0867774069" style="color:#111;font-weight:700;">0867 774 069</a>
          <br>• Email: <a href="mailto:womanwan.vn@gmail.com" style="color:#111;font-weight:700;">womanwan.vn@gmail.com</a>
          <br>• Fanpage Facebook: <a href="https://www.facebook.com/womanwan.vn/" target="_blank" style="color:#111;font-weight:700;">WOMAN WAN Vietnam</a>
        </p>
        <p><strong>2. Thời gian xử lý:</strong> Cam kết liên hệ lại và đưa ra phương án xử lý thỏa đáng cho khách hàng trong vòng <strong>24 giờ làm việc</strong>.</p>
        <p><strong>3. Tinh thần giải quyết:</strong> Đặt quyền lợi và sự hài lòng tuyệt đối của khách hàng lên hàng đầu.</p>
      `
    },
    terms: {
      title: "Điều khoản dịch vụ",
      tag: "Quy chế hoạt động",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      content: `
        <p><strong>1. Chấp thuận điều khoản:</strong> Khi truy cập và đặt hàng tại website WOMAN WAN, quý khách được xem là đã đồng ý với các điều khoản mua bán và quy định của chúng tôi.</p>
        <p><strong>2. Thay đổi quy định:</strong> WOMAN WAN có quyền điều chỉnh nội dung điều khoản để phù hợp với quy định pháp luật và nâng cao chất lượng dịch vụ khách hàng.</p>
        <p><strong>3. Trách nhiệm người dùng:</strong> Người dùng có trách nhiệm cung cấp thông tin giao hàng chính xác và bảo mật tài khoản cá nhân.</p>
      `
    },
    about: {
      title: "Giới thiệu thương hiệu",
      tag: "Thương hiệu Clean Fit 2024",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
      content: `
        <p><em>"WOMANWAN ra đời năm 2024, lấy cảm hứng từ phong cách American Casual – tự do, tối giản và có cá tính."</em></p>
        <p>Chúng tôi tin rằng thời trang không nên tạo ra một khuôn mẫu cho tất cả mọi người. Cùng một sản phẩm, khi được mặc bởi những con người khác nhau, sẽ tạo nên những phong cách hoàn toàn khác biệt.</p>
        <p>WOMANWAN không định nghĩa bạn phải mặc như thế nào. Chúng tôi tạo ra những sản phẩm dệt Seamless đủ đơn giản, bền bỉ và thoải mái để bạn tự do biến chúng thành phong cách của chính mình.</p>
      `
    },
    contact: {
      title: "Thông tin liên hệ",
      tag: "Hỗ trợ khách hàng 24/7",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
      content: `
        <p><strong>Hotline:</strong> <a href="tel:0867774069" style="color:#111;font-weight:700;">0867 774 069</a> (8h30 - 22h00 hàng ngày)</p>
        <p><strong>Email:</strong> <a href="mailto:womanwan.vn@gmail.com" style="color:#111;font-weight:700;">womanwan.vn@gmail.com</a></p>
        <p><strong>Facebook:</strong> <a href="https://www.facebook.com/womanwan.vn/" target="_blank" style="color:#111;font-weight:700;">fb.com/womanwan.vn</a></p>
        <p><strong>Instagram:</strong> <a href="https://www.instagram.com/womanwan.off" target="_blank" style="color:#111;font-weight:700;">@womanwan.off</a></p>
        <p><strong>TikTok:</strong> <a href="https://www.tiktok.com/@womanwan.off" target="_blank" style="color:#111;font-weight:700;">@womanwan.off</a></p>
      `
    },
    faq: {
      title: "FAQ - Câu hỏi thường gặp",
      tag: "Giải đáp thắc mắc",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>`,
      content: `
        <p><strong>1. Làm thế nào để chọn đúng kích cỡ (size)?</strong>
        <br>Tại mỗi trang chi tiết sản phẩm đều có bảng Hướng dẫn chọn size chuẩn. Bạn cũng có thể liên hệ trực tiếp tư vấn viên để được tư vấn size theo chiều cao, cân nặng.</p>
        <p><strong>2. Tôi có thể đổi hàng nếu mặc không vừa không?</strong>
        <br>Hoàn toàn được. WOMAN WAN hỗ trợ đổi size miễn phí tận nhà trong vòng 30 ngày.</p>
        <p><strong>3. Bao lâu tôi sẽ nhận được hàng?</strong>
        <br>Nội thành Hà Nội & TP.HCM từ 1 - 2 ngày, các tỉnh thành khác từ 2 - 4 ngày làm việc.</p>
        <p><strong>4. Tôi có thể hủy hoặc thay đổi đơn hàng không?</strong>
        <br>Vui lòng gọi ngay hotline <strong>0867 774 069</strong> để được hỗ trợ kịp thời trước khi đơn được giao cho đơn vị vận chuyển.</p>
      `
    }
  };

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

        <!-- Cột 2: Về WOMAN WAN & Hỗ trợ -->
        <div>
          <h4>Về WOMAN WAN & Hỗ trợ</h4>
          <ul>
            <li><a href="${prefix}shop.html">Tìm kiếm</a></li>
            <li><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('about')">Giới thiệu</a></li>
            <li><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('contact')">Liên hệ</a></li>
            <li><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('faq')">FAQ</a></li>
          </ul>
        </div>

        <!-- Cột 3: Chính sách -->
        <div>
          <h4>Chính sách</h4>
          <ul>
            <li><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('return')">Chính sách đổi hàng</a></li>
            <li><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('shipping')">Chính sách vận chuyển và giao nhận</a></li>
            <li><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('payment')">Chính sách thanh toán</a></li>
            <li><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('privacy')">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <!-- Cột 4: Sản phẩm -->
        <div>
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="${prefix}shop.html?filter=new">Hàng mới về</a></li>
            <li><a href="${prefix}shop.html?gender=women">Quần Áo Nữ</a></li>
            <li><a href="${prefix}shop.html?gender=men">Quần Áo Nam</a></li>
            <li><a href="${prefix}shop.html?filter=sale">Khuyến mãi & Ưu đãi</a></li>
          </ul>
        </div>
      </div>

      <!-- Dòng bản quyền dưới cùng -->
      <div class="footer-bottom">
        <span>© 2026 WOMAN WAN · Thương hiệu thời trang thể thao Clean Fit</span>
        <span><a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('terms')" style="color:#a3a3a3;text-decoration:none;">Điều khoản</a> · <a href="javascript:void(0)" onclick="WomanWanFooter.openPolicy('privacy')" style="color:#a3a3a3;text-decoration:none;">Bảo mật</a></span>
      </div>
    </footer>
    `;
  }

  /**
   * Tạo Modal Popup hiển thị chi tiết các chính sách
   */
  function ensurePolicyModal() {
    let modal = document.getElementById("womanwanPolicyModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "womanwanPolicyModal";
    modal.className = "ww-policy-modal";
    modal.innerHTML = `
      <div class="ww-policy-backdrop" onclick="WomanWanFooter.closePolicy()"></div>
      <div class="ww-policy-dialog" role="dialog" aria-modal="true" aria-labelledby="wwPolicyTitle">
        <button class="ww-policy-close" onclick="WomanWanFooter.closePolicy()" aria-label="Đóng cửa sổ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="ww-policy-header">
          <div class="ww-policy-icon" id="wwPolicyIcon"></div>
          <div>
            <div class="ww-policy-tag" id="wwPolicyTag">CHÍNH SÁCH WOMAN WAN</div>
            <h3 class="ww-policy-title" id="wwPolicyTitle">Tiêu đề chính sách</h3>
          </div>
        </div>

        <div class="ww-policy-body" id="wwPolicyContent"></div>

        <div class="ww-policy-footer">
          <div class="ww-policy-nav">
            <button class="ww-policy-nav-btn" onclick="WomanWanFooter.openPolicy('return')">Đổi hàng 30 ngày</button>
            <button class="ww-policy-nav-btn" onclick="WomanWanFooter.openPolicy('shipping')">Vận chuyển</button>
            <button class="ww-policy-nav-btn" onclick="WomanWanFooter.openPolicy('warranty')">Bảo hành</button>
            <button class="ww-policy-nav-btn" onclick="WomanWanFooter.openPolicy('contact')">Liên hệ</button>
          </div>
          <button class="ww-policy-btn-primary" onclick="WomanWanFooter.closePolicy()">Đã hiểu</button>
        </div>
      </div>
    `;

    // Inject CSS styles for modal if not already present
    if (!document.getElementById("ww-policy-modal-styles")) {
      const style = document.createElement("style");
      style.id = "ww-policy-modal-styles";
      style.textContent = `
        .ww-policy-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 99999;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .ww-policy-modal.active {
          display: flex;
          opacity: 1;
        }
        .ww-policy-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(4px);
        }
        .ww-policy-dialog {
          position: relative;
          z-index: 2;
          background: #ffffff;
          color: #111111;
          width: 100%;
          max-width: 620px;
          max-height: 85vh;
          border-radius: 12px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: wwModalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes wwModalScale {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .ww-policy-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f4f4f4;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #333333;
          transition: all 0.15s ease;
        }
        .ww-policy-close:hover {
          background: #111111;
          color: #ffffff;
        }
        .ww-policy-header {
          padding: 28px 28px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .ww-policy-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: #111111;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ww-policy-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #888888;
          margin-bottom: 4px;
        }
        .ww-policy-title {
          font-size: 20px;
          font-weight: 800;
          color: #111111;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .ww-policy-body {
          padding: 24px 28px;
          overflow-y: auto;
          font-size: 14.5px;
          line-height: 1.7;
          color: #333333;
        }
        .ww-policy-body p {
          margin: 0 0 14px;
        }
        .ww-policy-body p:last-child {
          margin-bottom: 0;
        }
        .ww-policy-body strong {
          color: #111111;
        }
        .ww-policy-footer {
          padding: 16px 28px;
          background: #fafafa;
          border-top: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ww-policy-nav {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ww-policy-nav-btn {
          background: transparent;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #555555;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .ww-policy-nav-btn:hover {
          border-color: #111111;
          color: #111111;
          background: #ffffff;
        }
        .ww-policy-btn-primary {
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 8px 20px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .ww-policy-btn-primary:hover {
          background: #333333;
        }
        @media (max-width: 600px) {
          .ww-policy-header { padding: 20px 20px 16px; }
          .ww-policy-body { padding: 18px 20px; font-size: 14px; }
          .ww-policy-footer { padding: 14px 20px; flex-direction: column; align-items: stretch; }
          .ww-policy-nav { display: none; }
          .ww-policy-btn-primary { width: 100%; text-align: center; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);
    return modal;
  }

  /**
   * Tạo 3 nút liên hệ nổi góc trái màn hình với hiệu ứng sóng lan tỏa (Pulse Wave)
   */
  function ensureFloatingContacts() {
    if (document.getElementById("womanwanFloatingContact")) return;

    // Inject CSS styles cho nút liên hệ nếu chưa có
    if (!document.getElementById("ww-floating-contact-styles")) {
      const style = document.createElement("style");
      style.id = "ww-floating-contact-styles";
      style.textContent = `
        .ww-floating-contact {
          position: fixed;
          left: 22px;
          bottom: 26px;
          z-index: 9990;
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
          pointer-events: auto;
        }
        .ww-float-btn {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #111111;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease, box-shadow 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        /* Hiệu ứng vòng tròn gợn sóng lan tỏa (Pulse Ripple Wave) */
        .ww-float-btn::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: rgba(17, 17, 17, 0.2);
          z-index: -1;
          pointer-events: none;
          animation: wwPulseRipple 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .ww-float-btn::after {
          content: "";
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          background: rgba(17, 17, 17, 0.1);
          z-index: -2;
          pointer-events: none;
          animation: wwPulseRipple 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 0.6s;
        }
        /* Độ trễ so le giữa 3 nút */
        .ww-float-btn:nth-child(1)::before { animation-delay: 0s; }
        .ww-float-btn:nth-child(1)::after  { animation-delay: 0.5s; }
        .ww-float-btn:nth-child(2)::before { animation-delay: 0.35s; }
        .ww-float-btn:nth-child(2)::after  { animation-delay: 0.85s; }
        .ww-float-btn:nth-child(3)::before { animation-delay: 0.7s; }
        .ww-float-btn:nth-child(3)::after  { animation-delay: 1.2s; }
        @keyframes wwPulseRipple {
          0% {
            transform: scale(0.8);
            opacity: 0.85;
          }
          60% {
            transform: scale(1.24);
            opacity: 0.22;
          }
          100% {
            transform: scale(1.42);
            opacity: 0;
          }
        }
        /* Hiệu ứng rung nhẹ cho icon điện thoại */
        @keyframes wwPhoneWiggle {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-12deg); }
          20%, 40% { transform: rotate(12deg); }
          50% { transform: rotate(0deg); }
        }
        .ww-float-btn.phone-btn svg {
          animation: wwPhoneWiggle 3.5s ease-in-out infinite;
        }
        .ww-float-btn:hover {
          transform: scale(1.12);
          background: #000000;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.38);
        }
        .ww-float-btn:active {
          transform: scale(0.94);
        }
        @media (max-width: 768px) {
          .ww-floating-contact {
            left: 14px;
            bottom: 20px;
            gap: 12px;
          }
          .ww-float-btn {
            width: 44px;
            height: 44px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const container = document.createElement("div");
    container.id = "womanwanFloatingContact";
    container.className = "ww-floating-contact";
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Liên hệ nhanh WOMAN WAN");

    container.innerHTML = `
      <!-- 1. Hotline -->
      <a href="tel:0867774069" class="ww-float-btn phone-btn" aria-label="Gọi hotline 0867 774 069">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          <path d="M16.5 3.5a7 7 0 0 1 4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M14.5 6.5a3.5 3.5 0 0 1 2.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </a>

      <!-- 2. Zalo -->
      <a href="https://zalo.me/0867774069" target="_blank" rel="noopener noreferrer" class="ww-float-btn zalo-btn" aria-label="Chat Zalo">
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
          <path d="M18 5.5C10.8 5.5 5 10.4 5 16.5c0 3.5 1.9 6.6 4.9 8.6-.2 2-1 3.9-2.2 5.1 2.6-.2 5.3-1.2 7.2-2.4 1 .2 2 .3 3.1.3 7.2 0 13-4.9 13-11S25.2 5.5 18 5.5z" fill="#ffffff"/>
          <text x="18" y="20.2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="10.5" fill="#000000" text-anchor="middle" letter-spacing="-0.3px">Zalo</text>
        </svg>
      </a>

      <!-- 3. Messenger -->
      <a href="https://m.me/womanwan.vn" target="_blank" rel="noopener noreferrer" class="ww-float-btn messenger-btn" aria-label="Chat Messenger">
        <svg width="23" height="23" viewBox="0 0 28 28" fill="none">
          <path d="M14 2C7.37 2 2 7.05 2 13.28c0 3.54 1.73 6.7 4.45 8.78.23.18.37.45.38.74l.08 2.3c.03.88.94 1.45 1.71 1.05l2.58-1.34c.24-.12.51-.15.77-.08 1.3.36 2.68.55 4.03.55 6.63 0 12-5.05 12-11.28C26 7.05 20.63 2 14 2z" fill="#ffffff"/>
          <path d="M6.8 16.5l4.5-7.15c.6-.95 1.95-1.15 2.8-.42l3.55 3.05c.27.23.66.23.93 0l3.82-2.9c.56-.42 1.3.26.9 0.82l-4.5 7.15c-.6.95-1.95 1.15-2.8.42l-3.55-3.05c-.27-.23-.66-.23-.93 0l-3.82 2.9c-.56.42-1.3-.26-.9-.82z" fill="#000000"/>
        </svg>
      </a>
    `;

    document.body.appendChild(container);
  }

  // Khởi tạo Custom Element <womanwan-footer>
  if (typeof customElements !== "undefined" && !customElements.get("womanwan-footer")) {
    class WomanWanFooterElement extends HTMLElement {
      connectedCallback() {
        const basePath = this.getAttribute("base-path") || resolveBasePath();
        this.innerHTML = createFooterHTML(basePath);
        ensureFloatingContacts();
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
    ensureFloatingContacts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      autoRenderExistingFooters();
      ensureFloatingContacts();
    });
  } else {
    autoRenderExistingFooters();
    ensureFloatingContacts();
  }

  // Export API toàn cục để mở / đóng chính sách
  window.WomanWanFooter = {
    getHTML: createFooterHTML,
    openPolicy: function (policyKey) {
      const data = POLICIES_DATA[policyKey] || POLICIES_DATA.return;
      const modal = ensurePolicyModal();

      document.getElementById("wwPolicyTitle").textContent = data.title;
      document.getElementById("wwPolicyTag").textContent = data.tag || "CHÍNH SÁCH WOMAN WAN";
      document.getElementById("wwPolicyIcon").innerHTML = data.icon || "";
      document.getElementById("wwPolicyContent").innerHTML = data.content;

      modal.style.display = "flex";
      // Trigger animation
      setTimeout(() => modal.classList.add("active"), 10);
      document.body.style.overflow = "hidden";
    },
    closePolicy: function () {
      const modal = document.getElementById("womanwanPolicyModal");
      if (modal) {
        modal.classList.remove("active");
        setTimeout(() => {
          modal.style.display = "none";
          document.body.style.overflow = "";
        }, 200);
      }
    },
    render: function (target, basePath) {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) {
        el.outerHTML = createFooterHTML(basePath);
      }
    }
  };

  // Lắng nghe phím ESC để đóng modal
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.WomanWanFooter && window.WomanWanFooter.closePolicy();
    }
  });
})();
