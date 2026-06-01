const sequelize = require('./config/db');
const { DanhMuc, SanPham, HinhAnh } = require('./models');

// Mapping categories from dummyjson to our database MaDM
// MaDM = 1: Điện thoại & Máy tính bảng
// MaDM = 2: Laptop & PC
// MaDM = 3: Phụ kiện công nghệ
// MaDM = 4: Thiết bị thông minh
const getCategoryId = (category, title) => {
  const t = title.toLowerCase();
  const cat = category.toLowerCase();
  
  if (cat === 'smartphones' || cat === 'tablets') {
    return 1;
  }
  if (cat === 'laptops') {
    return 2;
  }
  if (cat === 'mobile-accessories') {
    // If it's a smartwatch or speaker, map it to "Thiết bị thông minh" (MaDM: 4)
    if (t.includes('watch') || t.includes('homepod') || t.includes('echo')) {
      return 4;
    }
    // Otherwise, map to "Phụ kiện công nghệ" (MaDM: 3)
    return 3;
  }
  return 3; // default fallback to Accessories
};

// Map prices from USD to realistic VND (e.g. price * 25000)
const convertPrice = (usdPrice) => {
  // Round to nearest 10,000 VND
  const vnd = usdPrice * 25000;
  return Math.round(vnd / 10000) * 10000;
};

// Translate product descriptions and titles to Vietnamese to match Nemo Tech branding
const translateTitle = (title) => {
  let name = title;
  // Make titles clean
  name = name.replace('Apple MacBook Pro', 'MacBook Pro');
  name = name.replace('New DELL XPS', 'Dell XPS');
  name = name.replace('Asus Zenbook Pro Dual Screen Laptop', 'Asus Zenbook Pro Duo Dual Screen');
  name = name.replace('Huawei Matebook X Pro', 'Huawei MateBook X Pro');
  name = name.replace('Lenovo Yoga 920', 'Lenovo Yoga 920 2-in-1');
  name = name.replace('Apple Airpods Max Silver', 'Apple AirPods Max (Silver)');
  name = name.replace('Apple Airpods', 'Apple AirPods 2 Wireless');
  name = name.replace('Apple HomePod Mini Cosmic Grey', 'Apple HomePod Mini (Cosmic Grey)');
  name = name.replace('Apple Watch Series 4 Gold', 'Apple Watch Series 4 LTE (Gold)');
  name = name.replace('Beats Flex Wireless Earphones', 'Beats Flex Wireless');
  name = name.replace('iPhone 12 Silicone Case with MagSafe Plum', 'Ốp lưng Silicon iPhone 12 MagSafe');
  
  return name;
};

const translateDescription = (title, desc) => {
  const t = title.toLowerCase();
  if (t.includes('iphone 5s')) {
    return 'Điện thoại iPhone 5s chính hãng Apple phiên bản cổ điển. Thiết kế nhỏ gọn, khung nhôm nguyên khối sang trọng, hiệu năng ổn định cho các tác vụ nghe gọi và cơ bản.';
  }
  if (t.includes('iphone 6')) {
    return 'Điện thoại iPhone 6 chính hãng Apple. Màn hình Retina sắc nét, thiết kế mỏng nhẹ bo cong mềm mại, camera chụp hình chân thực và bộ nhớ lưu trữ thoải mái.';
  }
  if (t.includes('iphone 13 pro')) {
    return 'Siêu phẩm iPhone 13 Pro chính hãng Apple. Màn hình Super Retina XDR với công nghệ ProMotion 120Hz siêu mượt, chip A15 Bionic đỉnh cao, hệ thống camera 3 mắt Pro chuyên nghiệp.';
  }
  if (t.includes('iphone x')) {
    return 'Điện thoại iPhone X chính hãng Apple - phiên bản kỷ niệm 10 năm đột phá. Thiết kế tai thỏ màn hình OLED tràn viền, nhận diện khuôn mặt Face ID thời thượng và sạc không dây tiện lợi.';
  }
  if (t.includes('oppo a57')) {
    return 'Điện thoại Oppo A57 chính hãng. Thiết kế trẻ trung bắt mắt, pin dung lượng lớn kèm công nghệ sạc nhanh SuperVOOC, camera selfie tích hợp AI làm đẹp tự nhiên.';
  }
  if (t.includes('oppo f19 pro plus')) {
    return 'Điện thoại Oppo F19 Pro+ 5G chính hãng. Hỗ trợ kết nối mạng 5G siêu tốc, cụm camera hỗ trợ quay video đêm đỉnh cao, thiết kế mỏng nhẹ thời trang hiện đại.';
  }
  if (t.includes('oppo k1')) {
    return 'Điện thoại Oppo K1 chính hãng. Trang bị cảm biến vân tay ẩn dưới màn hình độc đáo, cấu hình mượt mà đáp ứng tốt nhu cầu giải trí và chơi game tầm trung.';
  }
  if (t.includes('realme c35')) {
    return 'Điện thoại Realme C35 giá rẻ chính hãng. Thiết kế khung viền vuông cá tính thời thượng, camera 50MP sắc nét, thời lượng pin 5000 mAh sử dụng cực lâu.';
  }
  if (t.includes('realme x')) {
    return 'Điện thoại Realme X chính hãng. Thiết kế camera thò thụt độc đáo mang lại màn hình tràn viền hoàn toàn không khuyết điểm, hiệu năng chiến game đỉnh cao.';
  }
  if (t.includes('realme xt')) {
    return 'Điện thoại Realme XT chính hãng. Trang bị camera siêu độ phân giải 64MP đầu tiên, thiết kế mặt lưng kính chuyển màu gradient cao cấp sang trọng.';
  }
  if (t.includes('galaxy s7')) {
    return 'Điện thoại Samsung Galaxy S7 chính hãng. Màn hình Super AMOLED 2K sắc nét, khả năng kháng nước kháng bụi chuẩn IP68 tiện lợi, camera khẩu độ lớn chụp đêm xuất sắc.';
  }
  if (t.includes('galaxy s8')) {
    return 'Điện thoại Samsung Galaxy S8 chính hãng với màn hình vô cực độc đáo. Thiết kế cong tràn hai cạnh sang trọng, cấu hình mạnh mẽ đáp ứng mượt mà mọi nhu cầu sử dụng.';
  }
  if (t.includes('galaxy s10')) {
    return 'Siêu phẩm Samsung Galaxy S10 chính hãng. Màn hình Infinity-O đục lỗ thời thượng, cảm biến vân tay siêu âm dưới màn hình, cụm 3 camera sau đa góc chụp chuyên nghiệp.';
  }
  if (t.includes('vivo s1')) {
    return 'Điện thoại Vivo S1 chính hãng. Thiết kế mặt lưng chuyển màu lung linh thời trang, màn hình giọt nước sắc nét, pin dung lượng lớn sạc nhanh tiện lợi.';
  }
  if (t.includes('vivo v9')) {
    return 'Điện thoại Vivo V9 chính hãng. Màn hình tràn viền tai thỏ thời thượng, camera kép xóa phông nghệ thuật, hỗ trợ mở khóa bằng nhận diện khuôn mặt cực nhạy.';
  }
  if (t.includes('vivo x21')) {
    return 'Điện thoại Vivo X21 chính hãng cao cấp. Công nghệ quét vân tay dưới màn hình tiên phong, thiết kế kính sang trọng, hiệu năng mượt mà ổn định.';
  }
  if (t.includes('ipad mini')) {
    return 'Máy tính bảng iPad Mini 2021 (iPad Mini 6) chính hãng Apple. Thiết kế tràn viền mới siêu nhỏ gọn, chip A15 Bionic mạnh mẽ, hỗ trợ Apple Pencil 2 tiện dụng cho vẽ và ghi chú.';
  }
  if (t.includes('tab s8 plus')) {
    return 'Máy tính bảng Samsung Galaxy Tab S8 Plus chính hãng. Màn hình Super AMOLED 12.4 inch siêu lớn 120Hz, kèm bút S-Pen quyền năng, trợ thủ đắc lực cho công việc và thiết kế đồ họa.';
  }
  if (t.includes('galaxy tab white')) {
    return 'Máy tính bảng Samsung Galaxy Tab phiên bản màu trắng thanh lịch. Cấu hình mượt mà, thích hợp cho học sinh, sinh viên học tập trực tuyến và giải trí gia đình.';
  }
  if (t.includes('macbook pro')) {
    return 'Máy tính xách tay Apple MacBook Pro 14 Inch chính hãng. Trang bị bộ vi xử lý Apple Silicon M1 Pro siêu mạnh mẽ, màn hình Liquid Retina XDR 120Hz đẹp nhất thế giới, tản nhiệt siêu êm.';
  }
  if (t.includes('zenbook pro')) {
    return 'Laptop Asus Zenbook Pro Duo 2 màn hình độc đáo. Cấu hình cực khủng chuyên cho nhà sáng tạo nội dung, thiết kế vỏ kim loại sang trọng, tản nhiệt tối ưu và bàn phím chất lượng.';
  }
  if (t.includes('matebook x pro')) {
    return 'Laptop Huawei MateBook X Pro siêu mỏng nhẹ cao cấp. Màn hình cảm ứng tràn viền tỷ lệ 3:2 sắc nét, vỏ hợp kim nhôm nguyên khối, hiệu năng làm việc văn phòng và đồ họa đỉnh cao.';
  }
  if (t.includes('yoga 920')) {
    return 'Laptop Lenovo Yoga 920 xoay gập 360 độ cao cấp. Bản lề kiểu dây đồng hồ độc đáo, màn hình cảm ứng 4K siêu nét, kèm bút cảm ứng tiện lợi cho vẽ phác thảo.';
  }
  if (t.includes('dell xps 13')) {
    return 'Laptop Dell XPS 13 9300 chính hãng - biểu tượng ultrabook cao cấp. Màn hình vô cực InfinityEdge siêu mỏng, vỏ nhôm cắt CNC và sợi carbon siêu nhẹ, hiệu năng mạnh mẽ.';
  }
  if (t.includes('echo plus')) {
    return 'Loa thông minh tích hợp trợ lý ảo Alexa Amazon Echo Plus. Chất âm cao cấp 360 độ, tích hợp bộ điều khiển nhà thông minh Zigbee kết nối và điều khiển vạn vật dễ dàng bằng giọng nói.';
  }
  if (t.includes('airpods max')) {
    return 'Tai nghe chụp tai Apple AirPods Max chính hãng. Thiết kế sang trọng đẳng cấp, chất âm Hi-Fi độ chi tiết cực cao, chống ồn chủ động ANC hàng đầu thế giới và chế độ xuyên âm.';
  }
  if (t.includes('airpods')) {
    return 'Tai nghe không dây Apple AirPods chính hãng. Kết nối nhanh chóng thông minh với hệ sinh thái Apple, thời lượng pin bền bỉ, âm thanh rõ nét đàm thoại cực tốt.';
  }
  if (t.includes('airpower')) {
    return 'Đế sạc không dây Apple AirPower cao cấp. Hỗ trợ sạc nhanh đồng thời nhiều thiết bị iPhone, Apple Watch, AirPods vô cùng tiện lợi trên cùng một bề mặt sạc phẳng.';
  }
  if (t.includes('homepod mini')) {
    return 'Loa thông minh Apple HomePod Mini chính hãng. Chất âm ấm áp đầy đặn so với kích thước nhỏ gọn, điều khiển nhà thông minh qua Siri mượt mà và kết nối đa phòng.';
  }
  if (t.includes('iphone charger')) {
    return 'Củ sạc nhanh Apple iPhone chính hãng. Hỗ trợ sạc nhanh chuẩn Power Delivery (PD) công suất cao, an toàn tuyệt đối cho thiết bị của bạn khỏi quá nhiệt và quá dòng.';
  }
  if (t.includes('magsafe battery pack')) {
    return 'Sạc dự phòng không dây Apple MagSafe Battery Pack chính hãng. Hít nam châm chắc chắn vào mặt sau iPhone 12 trở lên, tự động sạc thông minh tiện dụng khi di chuyển.';
  }
  if (t.includes('watch series 4')) {
    return 'Đồng hồ thông minh Apple Watch Series 4 GPS chính hãng. Màn hình tràn viền sắc nét, tích hợp tính năng đo điện tâm đồ ECG và phát hiện té ngã an toàn cho người sử dụng.';
  }
  if (t.includes('beats flex')) {
    return 'Tai nghe không dây đeo cổ Beats Flex chính hãng. Thiết kế thể thao năng động, chip Apple W1 kết nối nhanh, thời lượng pin nghe nhạc lên đến 12 giờ liên tục, sạc nhanh USB-C.';
  }
  if (t.includes('silicone case')) {
    return 'Ốp lưng Silicon chống sốc tích hợp sạc không dây MagSafe dành cho iPhone. Ôm khít máy bảo vệ toàn diện, chất liệu silicon êm ái chống bám vân tay và chống bẩn.';
  }
  if (t.includes('monopod') || t.includes('selfie stick')) {
    return 'Gậy chụp hình selfie kiêm chân đế tripod nhỏ gọn. Hỗ trợ kết nối Bluetooth từ xa, xoay 360 độ linh hoạt giúp lưu lại khoảnh khắc gia đình và bạn bè dễ dàng.';
  }
  if (t.includes('selfie lamp')) {
    return 'Đèn LED hỗ trợ ánh sáng chụp ảnh selfie và quay livestream tiện lợi. Nhiều chế độ sáng ấm/lạnh điều chỉnh linh hoạt, kẹp điện thoại chắc chắn cho hình ảnh sắc nét.';
  }
  if (t.includes('camera pedestal')) {
    return 'Chân đế quay phim chụp ảnh chuyên nghiệp chịu lực tốt. Điều chỉnh chiều cao linh hoạt, xoay gimbal mượt mà cho thước phim chất lượng cao không bị rung lắc.';
  }
  return desc; // Fallback to raw description if not found
};

const getSpecs = (product) => {
  const title = product.title.toLowerCase();
  if (title.includes('iphone 13 pro')) {
    return JSON.stringify({
      "Màn hình": "6.1 inch Super Retina XDR 120Hz OLED",
      "Hệ điều hành": "iOS 15",
      "Camera": "3 camera 12 MP (Góc rộng, góc siêu rộng, tele zoom 3x)",
      "Chip": "Apple A15 Bionic mạnh mẽ",
      "Pin": "3095 mAh, sạc nhanh 20W"
    });
  }
  if (title.includes('iphone x')) {
    return JSON.stringify({
      "Màn hình": "5.8 inch Super Retina OLED",
      "Hệ điều hành": "iOS 11",
      "Camera": "Camera kép 12 MP xóa phông chuyên nghiệp",
      "Chip": "Apple A11 Bionic",
      "Pin": "2716 mAh, sạc không dây"
    });
  }
  if (title.includes('iphone 5s')) {
    return JSON.stringify({
      "Màn hình": "4.0 inch IPS LCD",
      "Hệ điều hành": "iOS 7",
      "Camera": "8 MP & camera trước 1.2 MP",
      "Chip": "Apple A7 64-bit",
      "Pin": "1560 mAh"
    });
  }
  if (title.includes('iphone 6')) {
    return JSON.stringify({
      "Màn hình": "4.7 inch Retina HD IPS",
      "Hệ điều hành": "iOS 8",
      "Camera": "8 MP & camera trước 1.2 MP",
      "Chip": "Apple A8",
      "Pin": "1810 mAh"
    });
  }
  if (title.includes('galaxy s10')) {
    return JSON.stringify({
      "Màn hình": "6.1 inch Quad HD+ Dynamic AMOLED",
      "Hệ điều hành": "Android 9",
      "Camera": "3 camera 12 MP & 12 MP & 16 MP",
      "Chip": "Exynos 9820 hoặc Snapdragon 855",
      "Pin": "3400 mAh, sạc ngược không dây"
    });
  }
  if (title.includes('galaxy s8')) {
    return JSON.stringify({
      "Màn hình": "5.8 inch Quad HD+ Super AMOLED",
      "Hệ điều hành": "Android 7",
      "Camera": "12 MP & camera trước 8 MP",
      "Chip": "Exynos 8895 hoặc Snapdragon 835",
      "Pin": "3000 mAh"
    });
  }
  if (title.includes('galaxy s7')) {
    return JSON.stringify({
      "Màn hình": "5.1 inch Quad HD Super AMOLED",
      "Hệ điều hành": "Android 6",
      "Camera": "12 MP & camera trước 5 MP",
      "Chip": "Exynos 8890 hoặc Snapdragon 820",
      "Pin": "3000 mAh, kháng nước IP68"
    });
  }
  if (title.includes('macbook pro')) {
    return JSON.stringify({
      "CPU": "Apple M1 Pro 8 nhân",
      "RAM": "16 GB LPDDR5",
      "Ổ cứng": "512 GB SSD siêu tốc",
      "Màn hình": "14.2 inch Liquid Retina XDR 120Hz",
      "Cân nặng": "1.6 kg"
    });
  }
  if (title.includes('zenbook pro')) {
    return JSON.stringify({
      "CPU": "Intel Core i9-12900H cực mạnh",
      "RAM": "32 GB LPDDR5",
      "Ổ cứng": "1 TB SSD NVMe PCIe 4.0",
      "Đồ họa": "NVIDIA GeForce RTX 3060",
      "Màn hình": "Màn hình chính 15.6 inch 4K OLED cảm ứng & Màn phụ ScreenPad Plus"
    });
  }
  if (title.includes('dell xps')) {
    return JSON.stringify({
      "CPU": "Intel Core i7-1065G7",
      "RAM": "16 GB LPDDR4X",
      "Ổ cứng": "512 GB SSD NVMe",
      "Màn hình": "13.4 inch Full HD+ IPS cảm ứng tràn viền",
      "Cân nặng": "1.2 kg"
    });
  }
  if (title.includes('airpods max')) {
    return JSON.stringify({
      "Kết nối": "Bluetooth 5.0, chip Apple H1 mỗi bên tai",
      "Khử tiếng ồn": "Chống ồn chủ động ANC & Chế độ xuyên âm",
      "Thời lượng pin": "Lên đến 20 giờ nghe nhạc liên tục",
      "Trọng lượng": "384.8 g"
    });
  }
  if (title.includes('airpods')) {
    return JSON.stringify({
      "Kết nối": "Bluetooth 5.0, chip Apple H1",
      "Thời lượng pin": "Hơn 24 giờ sử dụng kèm hộp sạc",
      "Điều khiển": "Chạm hai lần để phát/bỏ qua nhạc hoặc trả lời cuộc gọi"
    });
  }
  if (title.includes('watch series 4')) {
    return JSON.stringify({
      "Màn hình": "Always-On Retina LTPO OLED",
      "Kích thước": "44mm",
      "Tính năng": "Đo nhịp tim ECG, phát hiện té ngã, GPS tích hợp",
      "Thời lượng pin": "Lên đến 18 giờ sử dụng liên tục"
    });
  }
  
  if (product.category === 'smartphones' || product.category === 'tablets') {
    return JSON.stringify({
      "Màn hình": "Màn hình IPS LCD / OLED chất lượng cao",
      "Hệ điều hành": product.category === 'smartphones' ? "Android" : "iOS / iPadOS",
      "Camera": "Camera chính độ phân giải cao, hỗ trợ HDR",
      "Thương hiệu": product.brand || "Khác",
      "Pin": "Dung lượng pin lớn dùng cả ngày"
    });
  }
  if (product.category === 'laptops') {
    return JSON.stringify({
      "CPU": "Intel Core / AMD Ryzen cấu hình mạnh mẽ",
      "RAM": "8 GB / 16 GB",
      "Ổ cứng": "SSD 256 GB / 512 GB siêu tốc",
      "Màn hình": "Màn hình tràn viền độ phân giải cao",
      "Thương hiệu": product.brand || "Khác"
    });
  }
  return JSON.stringify({
    "Thương hiệu": product.brand || "Khác",
    "Loại thiết bị": "Phụ kiện thông minh chính hãng",
    "Tính năng nổi bật": "Tiện dụng, độ bền cao, thiết kế hiện đại"
  });
};

const run = async () => {
  try {
    console.log('Bắt đầu đồng bộ cơ sở dữ liệu và tải dữ liệu mẫu...');
    await sequelize.authenticate();
    console.log('Kết nối database thành công.');

    const categories = ['smartphones', 'tablets', 'laptops', 'mobile-accessories'];
    let totalAdded = 0;

    for (const cat of categories) {
      console.log(`Đang tải dữ liệu cho danh mục: ${cat}...`);
      const res = await fetch(`https://dummyjson.com/products/category/${cat}`);
      if (!res.ok) {
        throw new Error(`Lỗi kết nối dummyjson cho danh mục: ${cat}`);
      }
      const data = await res.json();
      console.log(`Tìm thấy ${data.products.length} sản phẩm.`);

      for (const p of data.products) {
        // Skip TV Studio Camera Pedestal as it is a professional tv setup, not consumer tech accessories
        if (p.title.includes('Camera Pedestal')) {
          continue;
        }

        const name = translateTitle(p.title);
        
        // Check if product already exists to make script idempotent
        const existing = await SanPham.findOne({ where: { TenSP: name } });
        if (existing) {
          console.log(`Sản phẩm "${name}" đã tồn tại. Bỏ qua.`);
          continue;
        }

        const categoryId = getCategoryId(p.category, p.title);
        const price = convertPrice(p.price);
        const description = translateDescription(p.title, p.description);
        const specs = getSpecs(p);

        // Create SanPham in DB
        const createdProduct = await SanPham.create({
          TenSP: name,
          GiaBan: price,
          AnhMinhHoa: p.thumbnail || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500',
          MoTa: description,
          ThongSo: specs,
          SoLuongTon: p.stock || 20,
          TrangThai: 'Đang bán',
          MaDM: categoryId
        });

        // Add additional images to HINHANH table
        if (p.images && p.images.length > 0) {
          const imageRecords = p.images.slice(0, 3).map((img, idx) => ({
            DuongDan: img,
            KichThuoc: '800x600',
            MaSP: createdProduct.MaSP
          }));
          await HinhAnh.bulkCreate(imageRecords);
        }

        console.log(`Đã thêm thành công sản phẩm: ${name} (${price.toLocaleString('vi-VN')} đ) vào MaDM: ${categoryId}`);
        totalAdded++;
      }
    }

    console.log(`Hoàn thành! Đã nạp thành công thêm ${totalAdded} sản phẩm mới từ Fake API vào cơ sở dữ liệu.`);
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu từ Fake API:', error);
    process.exit(1);
  }
};

run();
