const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Trello Clone API is running');
});

async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  // If no real MongoDB URI is set, spin up an in-memory instance for dev/demo
  if (!mongoUri || mongoUri.includes('localhost')) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memServer = await MongoMemoryServer.create();
      mongoUri = memServer.getUri();
      console.log('⚡ Using in-memory MongoDB (no installation needed)');
      console.log('   URI:', mongoUri);

      // Auto-seed admin user in memory mode
      await mongoose.connect(mongoUri);
      await seedAdmin();
    } catch (e) {
      // mongodb-memory-server not available, try the configured URI directly
      await mongoose.connect(mongoUri);
    }
  } else {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');
  }

  app.listen(process.env.PORT || 5000, () => {
    console.log(`\n🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
    console.log('\n📋 Admin credentials:');
    console.log('   Email:    admin@trello.com');
    console.log('   Password: Admin@1234\n');
  });
}

async function seedAdmin() {
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');

  const existing = await User.findOne({ email: 'admin@trello.com' });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Admin@1234', salt);
    await User.create({
      username: 'admin',
      email: 'admin@trello.com',
      password: hashed,
      role: 'admin'
    });
    console.log('✅ Admin user auto-seeded');
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
