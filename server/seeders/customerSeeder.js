require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const connectDB = require('../config/db');

const seedCustomers = async () => {
  try {
    await connectDB();

    const customers = [
      {
        name: "Rahul Sharma",
        phone: "9876543210",
        email: "rahul@example.com",
        address: "A-101, Sky Heights, Ahmedabad",
        loyaltyPoints: 150,
        totalSpent: 15000,
        ordersCount: 5
      },
      {
        name: "Sneha Patel",
        phone: "9988776655",
        email: "sneha@example.com",
        address: "B-202, Green Valley, Surat",
        loyaltyPoints: 45,
        totalSpent: 4500,
        ordersCount: 2
      },
      {
        name: "Ankit Gupta",
        phone: "9123456789",
        email: "ankit@example.com",
        address: "C-303, Royal Residency, Vadodara",
        loyaltyPoints: 320,
        totalSpent: 32000,
        ordersCount: 12
      }
    ];

    for (const c of customers) {
      const exists = await Customer.findOne({ phone: c.phone });
      if (!exists) {
        await Customer.create(c);
        console.log(`Created customer: ${c.name}`);
      } else {
        console.log(`Customer already exists: ${c.name}`);
      }
    }

    console.log('Customer seeding completed');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedCustomers();
