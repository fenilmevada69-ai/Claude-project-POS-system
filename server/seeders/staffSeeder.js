require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedStaff = async () => {
  try {
    await connectDB();

    const staff = [
      {
        name: "Sara Manager",
        email: "manager@lumina.pos",
        password: "Manager2026!",
        role: "manager"
      },
      {
        name: "Alex Cashier",
        email: "alex@lumina.pos",
        password: "Cashier2026!",
        role: "cashier"
      },
      {
        name: "Priya Cashier",
        email: "priya@lumina.pos",
        password: "Cashier2026!",
        role: "cashier"
      }
    ];

    for (const s of staff) {
      const exists = await User.findOne({ email: s.email });
      if (!exists) {
        await User.create(s);
        console.log(`Created staff: ${s.name}`);
      } else {
        console.log(`Staff already exists: ${s.name}`);
      }
    }

    console.log('Staff seeding completed');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedStaff();
