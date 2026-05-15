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
  { name: 'Logitech Mouse M170', sku: 'LOG-M170', categoryName: 'Electronics', price: 799, costPrice: 500, stock: 35 },
  { name: 'Mechanical Keyboard K380', sku: 'KEY-K380', categoryName: 'Electronics', price: 2499, costPrice: 1500, stock: 20 },
  { name: 'Studio Headphones HD50', sku: 'AUD-HD50', categoryName: 'Audio', price: 3999, costPrice: 2200, stock: 15 },
  { name: 'Eco Water Bottle 750ml', sku: 'ECO-001', categoryName: 'Lifestyle', price: 599, costPrice: 250, stock: 142 },
  { name: 'Smart Watch V2', sku: 'WEAR-045', categoryName: 'Wearables', price: 8999, costPrice: 5500, stock: 8 },
  { name: 'Pro Earbuds TWS', sku: 'AUD-TWS01', categoryName: 'Audio', price: 1999, costPrice: 900, stock: 45 },
  { name: 'Leather Wallet Slim', sku: 'ACC-022', categoryName: 'Accessories', price: 999, costPrice: 400, stock: 60 },
  { name: 'Bluetooth Speaker Mini', sku: 'AUD-SPK05', categoryName: 'Audio', price: 1499, costPrice: 700, stock: 4 },
  { name: 'Power Bank 20000mAh', sku: 'PWR-099', categoryName: 'Electronics', price: 1299, costPrice: 700, stock: 25 },
  { name: 'USB-C Hub 7-in-1', sku: 'HUB-UC07', categoryName: 'Electronics', price: 2199, costPrice: 1100, stock: 18 },
  { name: 'Laptop Stand Aluminium', sku: 'ACC-LS01', categoryName: 'Accessories', price: 1799, costPrice: 900, stock: 30 },
  { name: 'Webcam HD 1080p', sku: 'CAM-HD01', categoryName: 'Electronics', price: 2999, costPrice: 1600, stock: 12 },
  { name: 'Desk Lamp LED', sku: 'LMP-LED01', categoryName: 'Lifestyle', price: 899, costPrice: 450, stock: 50 },
  { name: 'Phone Stand Adjustable', sku: 'ACC-PS01', categoryName: 'Accessories', price: 399, costPrice: 150, stock: 0 },
  { name: 'Wireless Charger 15W', sku: 'CHG-W15', categoryName: 'Electronics', price: 1599, costPrice: 800, stock: 22 },
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
      // Check if product already exists by SKU
      const exists = await Product.findOne({ sku: p.sku });
      if (exists) {
        console.log(`⚠️  Product with SKU ${p.sku} already exists — skipping.`);
        continue;
      }

      const categoryId = categoryMap[p.categoryName];
      if (!categoryId) {
        console.warn(`⚠️  Category "${p.categoryName}" not found for product "${p.name}". Skipping.`);
        continue;
      }

      const newProduct = {
        name: p.name,
        sku: p.sku,
        category: categoryId,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        taxRate: 18,
        isActive: true,
        lowStockThreshold: 10,
      };

      await Product.create(newProduct);
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
