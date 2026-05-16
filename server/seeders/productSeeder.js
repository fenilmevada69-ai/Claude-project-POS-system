'use strict';

/**
 * Product Seeder — Lumina POS
 * Run from the /server directory:
 *   node seeders/productSeeder.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const seedProducts = [
  { name: 'Logitech Mouse M170', sku: 'LOG-M170', barcode: '8901234567904', categoryName: 'Electronics', price: 799, costPrice: 500, stock: 35 },
  { name: 'Gaming Laptop Pro', sku: 'TECH-089', barcode: '8901234567891', categoryName: 'Electronics', price: 65000, costPrice: 55000, stock: 5 },
  { name: 'Studio Headphones HD50', sku: 'AUD-HD50', barcode: '8901234567892', categoryName: 'Audio', price: 3999, costPrice: 2200, stock: 15 },
  { name: 'Eco Water Bottle 750ml', sku: 'ECO-001', barcode: '8901234567890', categoryName: 'Lifestyle', price: 599, costPrice: 250, stock: 142 },
  { name: 'Smart Watch V2', sku: 'WEAR-045', barcode: '8901234567893', categoryName: 'Wearables', price: 8999, costPrice: 5500, stock: 8 },
  { name: 'Pro Earbuds TWS', sku: 'AUD-TWS01', barcode: '8901234567894', categoryName: 'Audio', price: 1999, costPrice: 900, stock: 45 },
  { name: 'Leather Wallet Slim', sku: 'ACC-022', barcode: '8901234567895', categoryName: 'Accessories', price: 999, costPrice: 400, stock: 60 },
  { name: 'Bluetooth Speaker Mini', sku: 'AUD-SPK05', barcode: '8901234567896', categoryName: 'Audio', price: 1499, costPrice: 700, stock: 4 },
  { name: 'Power Bank 20000mAh', sku: 'PWR-099', barcode: '8901234567897', categoryName: 'Electronics', price: 1299, costPrice: 700, stock: 25 },
  { name: 'USB-C Hub 7-in-1', sku: 'HUB-UC07', barcode: '8901234567898', categoryName: 'Electronics', price: 2199, costPrice: 1100, stock: 18 },
  { name: 'Laptop Stand Aluminium', sku: 'ACC-LS01', barcode: '8901234567899', categoryName: 'Accessories', price: 1799, costPrice: 900, stock: 30 },
  { name: 'Webcam HD 1080p', sku: 'CAM-HD01', barcode: '8901234567900', categoryName: 'Electronics', price: 2999, costPrice: 1600, stock: 12 },
  { name: 'Desk Lamp LED', sku: 'LMP-LED01', barcode: '8901234567901', categoryName: 'Lifestyle', price: 899, costPrice: 450, stock: 50 },
  { name: 'Phone Stand Adjustable', sku: 'ACC-PS01', barcode: '8901234567902', categoryName: 'Accessories', price: 399, costPrice: 150, stock: 10 },
  { name: 'Wireless Charger 15W', sku: 'CHG-W15', barcode: '8901234567903', categoryName: 'Electronics', price: 1599, costPrice: 800, stock: 22 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Fetch all categories to map names to ObjectIds
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    let createdCount = 0;

    for (const p of seedProducts) {
      const categoryId = categoryMap[p.categoryName];
      if (!categoryId) {
        console.warn(`⚠️  Category "${p.categoryName}" not found for product "${p.name}". Skipping.`);
        continue;
      }

      const productData = {
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        category: categoryId,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        taxRate: 18,
        isActive: true,
        lowStockThreshold: 10,
      };

      // Check if product already exists by SKU
      const exists = await Product.findOne({ sku: p.sku });
      if (exists) {
        await Product.updateOne({ sku: p.sku }, productData);
        console.log(`🔄 Updated product: ${p.name} (SKU: ${p.sku})`);
        createdCount++;
        continue;
      }

      await Product.create(productData);
      console.log(`✅ Created product: ${p.name} (SKU: ${p.sku})`);
      createdCount++;
    }

    if (createdCount === seedProducts.length) {
      console.log(`✅ ${createdCount} products seeded successfully`);
    } else {
      console.log(`\n📦 Done — ${createdCount} products created.`);
    }
  } catch (err) {
    console.error('❌ Seeder failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(process.exitCode ?? 0);
  }
};

seed();
