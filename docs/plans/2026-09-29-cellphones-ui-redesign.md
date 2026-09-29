# CellphoneS-Style UI Overhaul Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Overhaul the entire NovaTech e-commerce interface to match the sharp, professional, high-density retail design of CellphoneS, eliminating all overly-rounded bubbles/pills in favor of crisp 4px-6px technical corners, a classic 3-column Hero section with a vertical Mega Menu, rectangular badge tags, and structured specs tables.

**Architecture:** Refactor design tokens in `frontend/src/index.css` to enforce strict border-radius constraints (`rounded-sm` 2px - `rounded` 4px - `rounded-md` 6px), overhaul the Navbar into a high-density tech retail header with quick search chips and store locator, transform the Home page Hero into a 3-column layout (Left Vertical Category Menu + Center Banner Slider + Right Side Promos), upgrade product cards to crisp tech cards with rectangular badges and spec chips, and standardize Product Details, Cart, and Checkout pages with structured pricing and technical layouts.

**Tech Stack:** React 19, TailwindCSS v4, Lucide React, Vite, Vanilla CSS Tokens.

---

### Task 1: Design System & Tokens Refactoring (Anti-Pill & Technical Aesthetics)

**Files:**
- Modify: `frontend/src/index.css`

**Step 1: Inspect current pill/bubble classes in `index.css`**
Locate `.nova-card`, input/select styling, and utility rules that allow excessive rounding.

**Step 2: Update `frontend/src/index.css` with CellphoneS-inspired technical design tokens**
- Replace soft rounded corners (`rounded-xl`, `rounded-full`, `rounded-2xl`) with:
  - Base button: `rounded-md` (6px) or `rounded` (4px).
  - Cards & Containers: `rounded-lg` (8px) with crisp 1px borders (`border-slate-200 dark:border-slate-800`).
  - Badges & Discount chips: `rounded-[3px]` (rectangular, crisp 2-3px radius).
  - Micro-shadows: `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` instead of blurry ambient glows.
- Retain high-contrast support for both Light and Dark/Night Mode.

**Step 3: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors, build succeeds in < 1s.

**Step 4: Commit**
```bash
git add frontend/src/index.css
git commit -m "style: establish CellphoneS-inspired crisp design tokens and remove pill shapes"
```

---

### Task 2: CellphoneS-Style Professional Header & Navbar

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`

**Step 1: Redesign Topbar & Main Navigation Bar**
- Topbar: Compact store hotline, nationwide store locator selector, and quick customer support links.
- Logo: Crisp geometric badge, bold uppercase brand text `NovaTech` with official retail badge (`Hệ thống bán lẻ công nghệ`).
- "Danh mục" (Category) trigger button next to Logo with menu icon and arrow, allowing fast category access.
- Search Box: High-density input with crisp 4px corners, search icon inside, and popular quick-search tags directly below or in dropdown (e.g. `iPhone 16`, `Galaxy S24`, `Laptop AI`, `MacBook`, `Sony WH-1000XM5`).
- User Actions:
  - Tra cứu đơn hàng (Order lookup) with clipboard icon and concise 2-line label.
  - Cart button with square-ish red counter badge (`rounded-[4px]` instead of `rounded-full`).
  - NovaMember / Account dropdown with member tier indicator.
  - Night Mode switch with compact, neat toggle button.

**Step 2: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors.

**Step 3: Commit**
```bash
git add frontend/src/components/Navbar.jsx
git commit -m "feat(ui): redesign Navbar to CellphoneS high-density tech retail layout"
```

---

### Task 3: 3-Column Hero Section with Vertical Category Mega Menu

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

**Step 1: Implement 3-Column Hero Grid**
- **Column 1 (Left - Vertical Category Sidebar ~ 220px)**:
  - Vertical list of categories: Điện thoại, Laptop & PC, Máy tính bảng (Tablet), Thiết bị âm thanh, Đồng hồ thông minh, Phụ kiện công nghệ, Đồ gia dụng thông minh.
  - Crisp category items with high-precision Lucide icons, chevron-right indicator, and smooth hover state highlighting in electric blue / navy.
- **Column 2 (Center - Carousel Banner ~ flex-1)**:
  - Main promo slider featuring top tech deals with crisp image display.
  - Bottom 4-tab switcher bar with concise deal headlines (e.g., `Galaxy S24 Ultra`, `iPhone 15 Pro Max`, `Laptop Gaming`, `Tai nghe Sony`).
- **Column 3 (Right - Promo Side Cards ~ 240px)**:
  - 2 to 3 compact rectangular promo cards stacked vertically:
    - Card 1: `Thu cũ đổi mới - Trợ giá đến 2.5 triệu`.
    - Card 2: `Ưu đãi Học sinh - Sinh viên - Giảm thêm 500k`.
    - Card 3: `Mở thẻ Techcombank / VPBank - Hoàn tiền 1 triệu`.

**Step 2: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors.

**Step 3: Commit**
```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat(ui): implement 3-column Hero section with vertical Mega Menu and promo banners"
```

---

### Task 4: CellphoneS-Style Product Cards & Flash Sale Section

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

**Step 1: Overhaul Product Card Design (`renderProductCard`)**
- Frame: White background, 1px crisp border `border-slate-200 dark:border-slate-800`, `rounded-md` (6px) or `rounded` (4px).
- Top badges:
  - Installment tag: `Trả góp 0%` (Blue or white-on-blue rectangular tag, `rounded-[2px]`).
  - Discount tag: `-15%` (Red rectangular tag, font-black, `rounded-[2px]`).
- Image container: Square aspect ratio with clean white/dark padding, high quality product photo.
- Spec chips: Rectangular gray chips for key hardware specs (e.g. `120Hz`, `OLED`, `512GB`, `Snapdragon 8 Gen 3`, `RTX 4060`), eliminating round pill styles.
- Product Name: 2-line clamp with crisp typography (`font-bold text-[13px] sm:text-sm`).
- Pricing block:
  - Special deal price: Bold, prominent in `#0284c7` (or `#d70018` in Flash Sale).
  - Original price: Strikethrough in slate-400.
  - Smember cashback notice: `Giảm thêm đến 1% cho NovaMember`.
- Action buttons: Rectangular "Thêm vào giỏ" (Add to cart) with small cart icon and "Mua ngay" (Buy now) button with solid fill and 4px corners.

**Step 2: Overhaul Flash Sale "Giờ Vàng Giá Sốc"**
- Rectangular header with countdown clock blocks (`rounded-[3px]`), flame icon, and sold progress bar (`Đã bán X/Y`).

**Step 3: Overhaul Brand & Price Quick Filters**
- Convert rounded-full brand chips into rectangular tech filter tabs (`rounded-md`, border-slate-200, hover:border-sky-500).

**Step 4: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors.

**Step 5: Commit**
```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat(ui): redesign Product Cards and Flash Sale to crisp CellphoneS technical standard"
```

---

### Task 5: CellphoneS-Style Product Details Page Refactoring

**Files:**
- Modify: `frontend/src/pages/ProductDetails.jsx`

**Step 1: Restructure Layout to CellphoneS Flagship Specification**
- **Top Bar**: Breadcrumbs (`Trang chủ > Danh mục > Tên sản phẩm`) with crisp typography.
- **Left Column**: High-resolution image gallery with square thumbnail selector, warranty guarantee badges (`Bảo hành 12 tháng chính hãng`, `1 đổi 1 trong 30 ngày`, `Giao hàng siêu tốc 2 giờ`).
- **Center/Right Column**:
  - Title, star rating & verified purchase count.
  - Price block with large promo price, strike-through original price, and savings amount.
  - Version / Storage / Color selector buttons (rectangular radio chips with active border).
  - Promotion Box (Hộp khuyến mại đặc quyền): Red-bordered box with gift icon, listing 3-4 bullet perks (Tặng sạc nhanh, Giảm khi mua phụ kiện, Hoàn tiền qua ví).
  - Action buttons: Large primary "MUA NGAY (Giao tận nơi hoặc nhận tại cửa hàng)" and secondary "THÊM VÀO GIỎ HÀNG" with crisp 6px corners.
- **Specifications Table (Bảng thông số kỹ thuật)**: Structured striped alternating table (`table-auto w-full text-xs`) summarizing Screen, CPU, RAM, Storage, Camera, Battery.
- **Customer Reviews**: Keep verified purchase rating summary aligned with rectangular badges and buttons.

**Step 2: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors.

**Step 3: Commit**
```bash
git add frontend/src/pages/ProductDetails.jsx
git commit -m "feat(ui): overhaul ProductDetails to CellphoneS technical specs and purchase box layout"
```

---

### Task 6: CellphoneS-Style Cart & Checkout Pages Alignment

**Files:**
- Modify: `frontend/src/pages/Cart.jsx`
- Modify: `frontend/src/pages/Checkout.jsx`

**Step 1: Refactor Cart Page (`Cart.jsx`)**
- Replace soft borders and rounded pills with clean 2-column retail checkout layout:
  - Left column: List of items with square product thumbnails, quantity step buttons (`+`, `-`) with crisp rectangular borders, and trash delete icon.
  - Right column: Voucher discount selection box with crisp rectangular code chips, order breakdown (Tạm tính, Giảm giá voucher, Phí vận chuyển, Tổng thanh toán), and large rectangular "TIẾN HÀNH ĐẶT HÀNG" button.

**Step 2: Refactor Checkout Page (`Checkout.jsx`)**
- Shipping address form with crisp inputs (`rounded-md`, 1px border).
- Payment method cards (COD & VietQR Napas 24/7) with square radio indicators and active blue border.
- VietQR modal / inline display with high-precision copy buttons and QR card.

**Step 3: Verify build**
Run: `npm run build` in `frontend/`
Expected: 0 errors.

**Step 4: Commit**
```bash
git add frontend/src/pages/Cart.jsx frontend/src/pages/Checkout.jsx
git commit -m "feat(ui): align Cart and Checkout pages with crisp rectangular technical styling"
```

---

### Task 7: Comprehensive Verification & Visual Polish

**Files:**
- Modify: `docs/plans/task.md`
- Inspect: Live browser at `http://localhost:5173`

**Step 1: Run frontend production build**
Run: `npm run build` in `frontend/`
Expected: 0 errors, build succeeds.

**Step 2: Check live preview with browser subagent or visual verification**
Verify Home, ProductDetails, Cart, Checkout, and Dark Mode transitions to confirm:
- Zero overly-rounded bubble buttons remaining.
- Left category Mega Menu displays cleanly.
- Product cards look sharp, dense, and professional like CellphoneS.
- Dark mode remains fully readable with strong contrast.

**Step 3: Update `docs/plans/task.md`**
Mark all tasks as Completed and report results.

**Step 4: Commit**
```bash
git add docs/plans/task.md
git commit -m "chore(release): complete CellphoneS UI overhaul across all customer-facing views"
```
