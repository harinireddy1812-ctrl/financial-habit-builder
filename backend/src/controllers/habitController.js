const { loadDB, saveDB, getNextId } = require('../utils/db');

const createHabit = (req, res) => {
  try {
    const { name, description, frequency, targetValue, unit } = req.body;
    if (!name || !frequency) return res.status(400).json({ success: false, message: 'Name and frequency are required' });

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({ success: false, message: 'Frequency must be daily, weekly or monthly' });
    }

    const db = loadDB();
    const newHabit = {
      id: getNextId('habits'),
      userId: req.user.id,
      name,
      description: description || '',
      frequency,
      targetValue: targetValue || 1,
      unit: unit || 'times',
      currentStreak: 0,
      longestStreak: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    db.habits.push(newHabit);
    saveDB(db);
    res.status(201).json({ success: true, message: 'Habit created', habit: newHabit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getHabits = (req, res) => {
  try {
    const db = loadDB();
    const habits = db.habits.filter(h => h.userId === req.user.id && h.isActive);
    res.json({ success: true, habits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const logHabit = (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const { date, value, notes } = req.body;
    const db = loadDB();
    const habit = db.habits.find(h => h.id === habitId && h.userId === req.user.id);
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const logDate = date || new Date().toISOString().split('T')[0];
    const existingLog = db.habitLogs.find(l => l.habitId === habitId && l.date === logDate && l.userId === req.user.id);
    if (existingLog) return res.status(400).json({ success: false, message: 'Already logged for this date' });

    const newLog = {
      id: getNextId('habitLogs'),
      habitId,
      userId: req.user.id,
      date: logDate,
      value: value || 1,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    db.habitLogs.push(newLog);

    const sortedLogs = db.habitLogs.filter(l => l.habitId === habitId).sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 1;
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const curr = new Date(sortedLogs[i].date);
      const prev = new Date(sortedLogs[i + 1].date);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if ((habit.frequency === 'daily' && diffDays === 1) ||
          (habit.frequency === 'weekly' && diffDays <= 7) ||
          (habit.frequency === 'monthly' && diffDays <= 31)) {
        streak++;
      } else break;
    }
    habit.currentStreak = streak;
    if (streak > habit.longestStreak) habit.longestStreak = streak;

    saveDB(db);
    res.status(201).json({ success: true, message: 'Habit logged successfully', log: newLog, currentStreak: habit.currentStreak });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getHabitProgress = (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const db = loadDB();
    const habit = db.habits.find(h => h.id === habitId && h.userId === req.user.id);
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    const logs = db.habitLogs.filter(l => l.habitId === habitId).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, habit, logs, totalCompletions: logs.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteHabit = (req, res) => {
  try {
    const db = loadDB();
    const habit = db.habits.find(h => h.id === parseInt(req.params.id) && h.userId === req.user.id);
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    habit.isActive = false;
    saveDB(db);
    res.json({ success: true, message: 'Habit deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createHabit, getHabits, logHabit, getHabitProgress, deleteHabit };
