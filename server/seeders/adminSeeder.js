'use strict';

/**
 * Admin User Seeder — Lumina POS
 * Run from the /server directory:
 *   node seeders/adminSeeder.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN = {
  name: 'Admin User',
  email: 'admin@lumina.pos',
  password: 'Admin2026!',   // Will be bcrypt-hashed by the User model's pre-save hook
  role: 'admin',
  isActive: true,
};

const seed = async () => {
  try {
    // ── 1. Connect ────────────────────────────────────────────────────────────
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // ── 2. Guard: skip if admin already exists ────────────────────────────────
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log('⚠️  Admin user already exists — skipping creation.');
      return;
    }

    // ── 3. Create admin (password hashed via pre-save hook in User model) ─────
    await User.create(ADMIN);
    console.log('✅ Admin user created');
    console.log(`   📧  Email   : ${ADMIN.email}`);
    console.log(`   🔑  Password: ${ADMIN.password}`);
    console.log(`   🎭  Role    : ${ADMIN.role}`);

  } catch (err) {
    console.error('❌ Seeder failed:', err.message);
    process.exitCode = 1;
  } finally {
    // ── 4. Disconnect & exit ──────────────────────────────────────────────────
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(process.exitCode ?? 0);
  }
};

seed();
