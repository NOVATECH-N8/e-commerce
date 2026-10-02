/**
 * Script sao chép toàn bộ dữ liệu từ SQLite (database.sqlite) sang MySQL (ecommerce_db)
 * Sử dụng: node migrate-sqlite-to-mysql.js
 */
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

async function migrateData() {
  console.log('--- Bắt đầu di chuyển dữ liệu từ SQLite sang MySQL ---');

  if (!process.env.DB_PASS && process.env.DB_PASS !== '') {
    console.warn('LƯU Ý: Chưa có DB_PASS trong file .env, nếu MySQL có mật khẩu xin hãy điền vào .env trước.');
  }

  // 1. Kết nối nguồn: SQLite
  const sqlite = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

  // 2. Kết nối đích: MySQL
  const mysql = new Sequelize(
    process.env.DB_NAME || 'ecommerce_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '89hieutk',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false
    }
  );

  try {
    // Đảm bảo database MySQL tồn tại
    const mysqlDriver = require('mysql2/promise');
    const conn = await mysqlDriver.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });
    const dbName = process.env.DB_NAME || 'ecommerce_db';
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.end();
    console.log(`✓ Đã kết nối MySQL và chuẩn bị database '${dbName}'`);

    // Kiểm tra kết nối
    await sqlite.authenticate();
    await mysql.authenticate();

    // Lấy danh sách bảng trong SQLite
    const [tables] = await sqlite.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    console.log(`Tìm thấy ${tables.length} bảng trong SQLite:`, tables.map(t => t.name).join(', '));

    // Đồng bộ cấu trúc bảng từ models
    const models = require('./models');
    await models.sequelize.sync({ force: false });

    // Thứ tự nạp bảng tôn trọng khóa ngoại
    const migrationOrder = [
      'NGUOIDUNG',
      'DANHMUC',
      'SANPHAM',
      'HINHANH',
      'GIOHANG',
      'CHITIETGIOHANG',
      'VOUCHER',
      'DONHANG',
      'CHITIETDONHANG',
      'DANHGIA'
    ];

    for (const tableName of migrationOrder) {
      try {
        const [rows] = await sqlite.query(`SELECT * FROM \`${tableName}\``);
        if (rows.length === 0) continue;

        console.log(`Đang chuyển bảng ${tableName}: ${rows.length} dòng...`);
        for (const row of rows) {
          const columns = Object.keys(row).map(c => `\`${c}\``).join(', ');
          const placeholders = Object.keys(row).map(() => '?').join(', ');
          const values = Object.values(row);

          await mysql.query(
            `REPLACE INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`,
            { replacements: values }
          );
        }
        console.log(`✓ Hoàn tất bảng ${tableName}`);
      } catch (tableErr) {
        console.warn(`Lưu ý bảng ${tableName}:`, tableErr.message);
      }
    }

    console.log('\n🎉 DI CHUYỂN DỮ LIỆU TỪ SQLITE SANG MYSQL THÀNH CÔNG!');
  } catch (err) {
    console.error('Lỗi trong quá trình di chuyển:', err);
  } finally {
    await sqlite.close();
    await mysql.close();
  }
}

migrateData();
