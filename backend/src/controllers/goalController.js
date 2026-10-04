const { loadDB, saveDB, getNextId } = require('../utils/db');

const createGoal = (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category } = req.body;
    if (!name || !targetAmount) return res.status(400).json({ success: false, message: 'Name and target amount are required' });

    const db = loadDB();
    const newGoal = {
      id: getNextId('goals'),
      userId: req.user.id,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline || null,
      category: category || 'General',
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    db.goals.push(newGoal);
    saveDB(db);
    res.status(201).json({ success: true, message: 'Goal created', goal: newGoal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getGoals = (req, res) => {
  try {
    const db = loadDB();
    const goals = db.goals
      .filter(g => g.userId === req.user.id)
      .map(g => ({
        ...g,
        progressPercent: Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
      }));
    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateGoalProgress = (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount is required' });

    const db = loadDB();
    const goal = db.goals.find(g => g.id === goalId && g.userId === req.user.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.currentAmount += parseFloat(amount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.currentAmount = goal.targetAmount;
    }
    saveDB(db);
    res.json({
      success: true,
      message: 'Goal progress updated',
      goal: { ...goal, progressPercent: Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteGoal = (req, res) => {
  try {
    const db = loadDB();
    const index = db.goals.findIndex(g => g.id === parseInt(req.params.id) && g.userId === req.user.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Goal not found' });
    db.goals.splice(index, 1);
    saveDB(db);
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createGoal, getGoals, updateGoalProgress, deleteGoal };
