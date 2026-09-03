const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@trello.com' });
    if (existing) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@1234', salt);

    await User.create({
      username: 'admin',
      email: 'admin@trello.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created!');
    console.log('Email: admin@trello.com');
    console.log('Password: Admin@1234');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
