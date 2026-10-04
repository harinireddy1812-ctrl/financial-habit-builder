const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const financeController = require('../controllers/financeController');
const habitController = require('../controllers/habitController');
const goalController = require('../controllers/goalController');
const wealthController = require('../controllers/wealthController');
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateToken, authController.getProfile);
router.put('/auth/profile', authenticateToken, authController.updateProfile);

// Income
router.post('/incomes', authenticateToken, financeController.addIncome);
router.get('/incomes', authenticateToken, financeController.getIncomes);
router.delete('/incomes/:id', authenticateToken, financeController.deleteIncome);

// Expenses
router.post('/expenses', authenticateToken, financeController.addExpense);
router.get('/expenses', authenticateToken, financeController.getExpenses);
router.delete('/expenses/:id', authenticateToken, financeController.deleteExpense);

// Summary
router.get('/summary/monthly', authenticateToken, financeController.getMonthlySummary);

// Habits
router.post('/habits', authenticateToken, habitController.createHabit);
router.get('/habits', authenticateToken, habitController.getHabits);
router.post('/habits/:id/log', authenticateToken, habitController.logHabit);
router.get('/habits/:id/progress', authenticateToken, habitController.getHabitProgress);
router.delete('/habits/:id', authenticateToken, habitController.deleteHabit);

// Goals
router.post('/goals', authenticateToken, goalController.createGoal);
router.get('/goals', authenticateToken, goalController.getGoals);
router.patch('/goals/:id/progress', authenticateToken, goalController.updateGoalProgress);
router.delete('/goals/:id', authenticateToken, goalController.deleteGoal);

// Wealth / Investments
router.post('/investments', authenticateToken, wealthController.addInvestment);
router.get('/investments', authenticateToken, wealthController.getInvestments);
router.put('/investments/:id', authenticateToken, wealthController.updateInvestment);
router.delete('/investments/:id', authenticateToken, wealthController.deleteInvestment);
router.get('/wealth/overview', authenticateToken, wealthController.getWealthOverview);

// Admin
router.get('/admin/users', authenticateToken, isAdmin, adminController.getAllUsers);
router.get('/admin/analytics', authenticateToken, isAdmin, adminController.getAnalytics);
router.delete('/admin/users/:id', authenticateToken, isAdmin, adminController.deleteUser);

// Health
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Financial Habit Tracker API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
