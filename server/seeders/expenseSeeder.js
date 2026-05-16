'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const User = require('../models/User');

const seedExpenses = [
  {
    title: 'Monthly Shop Rent',
    amount: 15000,
    category: 'rent',
    paymentMethod: 'bank',
    date: new Date(new Date().setDate(1)), // 1st of current month
    description: 'Rent for the main showroom',
  },
  {
    title: 'Electricity Bill - April',
    amount: 3200,
    category: 'utilities',
    paymentMethod: 'upi',
    date: new Date(),
    description: 'Power consumption for April 2026',
  },
  {
    title: 'Cleaning Supplies',
    amount: 850,
    category: 'supplies',
    paymentMethod: 'cash',
    date: new Date(),
    description: 'Floor cleaner and microfiber cloths',
  },
  {
    title: 'AC Maintenance',
    amount: 1200,
    category: 'maintenance',
    paymentMethod: 'cash',
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    description: 'Regular AC servicing',
  },
  {
    title: 'Staff Refreshments',
    amount: 500,
    category: 'other',
    paymentMethod: 'cash',
    date: new Date(),
    description: 'Tea and snacks for staff',
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Find an admin user to associate with expenses
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Please run adminSeeder first.');
      process.exit(1);
    }

    // Clear existing expenses if any (optional, but good for clean seed)
    await Expense.deleteMany({});
    console.log('🗑️  Cleared existing expenses');

    const expensesWithAdmin = seedExpenses.map(exp => ({
      ...exp,
      addedBy: admin._id
    }));

    await Expense.insertMany(expensesWithAdmin);
    console.log(`✅ Seeded ${seedExpenses.length} expenses successfully`);

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
