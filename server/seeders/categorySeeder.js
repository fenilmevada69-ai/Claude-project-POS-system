'use strict';

/**
 * Category Seeder — Lumina POS
 * Run from the /server directory:
 *   node seeders/categorySeeder.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const CATEGORIES = [
  { name: 'Electronics',     color: '#6366f1', icon: 'cpu' },
  { name: 'Audio',           color: '#8b5cf6', icon: 'headphones' },
  { name: 'Lifestyle',       color: '#ec4899', icon: 'star' },
  { name: 'Accessories',     color: '#f59e0b', icon: 'tag' },
  { name: 'Wearables',       color: '#10b981', icon: 'watch' },
  { name: 'Food & Beverage', color: '#f97316', icon: 'coffee' },
];

const seed = async () => {
  try {
    // ── 1. Connect ────────────────────────────────────────────────────────────
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const cat of CATEGORIES) {
      const exists = await Category.findOne({ name: cat.name });
      if (exists) {
        console.log(`⚠️  "${cat.name}" already exists — skipping.`);
        skipped++;
      } else {
        await Category.create(cat);
        console.log(`✅ Created category: ${cat.name}`);
        created++;
      }
    }

    console.log(`\n📦 Done — ${created} created, ${skipped} skipped.`);
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
