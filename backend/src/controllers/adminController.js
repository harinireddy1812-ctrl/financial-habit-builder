const { loadDB, saveDB } = require('../utils/db');

const getAllUsers = (req, res) => {
  try {
    const db = loadDB();
    const users = db.users.map(({ password, ...u }) => u);
    res.json({ success: true, users, total: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAnalytics = (req, res) => {
  try {
    const db = loadDB();
    const totalUsers = db.users.length;
    const totalExpenses = db.expenses.length;
    const totalIncomes = db.incomes.length;
    const totalHabits = db.habits.filter(h => h.isActive).length;
    const totalGoals = db.goals.length;
    const totalInvestments = db.investments.length;

    const activeHabits = db.habits.filter(h => h.isActive);
    const habitsWithLogs = activeHabits.filter(h => db.habitLogs.some(l => l.habitId === h.id));
    const habitCompletionRate = activeHabits.length > 0 ? Math.round((habitsWithLogs.length / activeHabits.length) * 100) : 0;

    const goalsWithProgress = db.goals.map(g => (g.currentAmount / g.targetAmount) * 100);
    const avgGoalProgress = goalsWithProgress.length > 0
      ? Math.round(goalsWithProgress.reduce((a, b) => a + b, 0) / goalsWithProgress.length)
      : 0;

    res.json({
      success: true,
      analytics: {
        totalUsers, totalExpenses, totalIncomes, totalHabits, totalGoals, totalInvestments,
        habitCompletionRate, avgGoalProgress,
        recentUsers: db.users.slice(-5).map(({ password, ...u }) => u)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const db = loadDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
    if (userId === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete your own account' });

    db.users.splice(index, 1);
    db.incomes = db.incomes.filter(i => i.userId !== userId);
    db.expenses = db.expenses.filter(e => e.userId !== userId);
    db.habits = db.habits.filter(h => h.userId !== userId);
    db.goals = db.goals.filter(g => g.userId !== userId);
    db.investments = db.investments.filter(i => i.userId !== userId);
    db.habitLogs = db.habitLogs.filter(l => l.userId !== userId);
    saveDB(db);
    res.json({ success: true, message: 'User and related data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllUsers, getAnalytics, deleteUser };
