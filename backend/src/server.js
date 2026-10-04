require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { loadDB, saveDB } = require('./utils/db');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

async function seedAdmin() {
  const db = loadDB();
  const adminExists = db.users.find(u => u.email === 'admin@fht.com');
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin123', 10);
    db.users.push({
      id: 1,
      uuid: 'admin-uuid-001',
      name: 'Admin User',
      email: 'admin@fht.com',
      password: hashed,
      phone: '',
      role: 'admin',
      createdAt: new Date().toISOString(),
      financialProfile: { monthlyIncome: 0, currency: 'INR', riskTolerance: 'moderate' }
    });
    saveDB(db);
    console.log('✅ Admin user seeded: admin@fht.com / admin123');
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Financial Habit Tracker API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  await seedAdmin();
});
