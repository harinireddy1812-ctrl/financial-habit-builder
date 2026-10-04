const { loadDB, saveDB, getNextId } = require('../utils/db');

const addIncome = (req, res) => {
  try {
    const { source, amount, date, notes } = req.body;
    if (!source || !amount) return res.status(400).json({ success: false, message: 'Source and amount are required' });

    const db = loadDB();
    const newIncome = {
      id: getNextId('incomes'),
      userId: req.user.id,
      source,
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    db.incomes.push(newIncome);
    saveDB(db);
    res.status(201).json({ success: true, message: 'Income added', income: newIncome });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getIncomes = (req, res) => {
  try {
    const db = loadDB();
    const incomes = db.incomes.filter(i => i.userId === req.user.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteIncome = (req, res) => {
  try {
    const db = loadDB();
    const index = db.incomes.findIndex(i => i.id === parseInt(req.params.id) && i.userId === req.user.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Income not found' });
    db.incomes.splice(index, 1);
    saveDB(db);
    res.json({ success: true, message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addExpense = (req, res) => {
  try {
    const { category, amount, date, description, notes } = req.body;
    if (!category || !amount) return res.status(400).json({ success: false, message: 'Category and amount are required' });

    const db = loadDB();
    const newExpense = {
      id: getNextId('expenses'),
      userId: req.user.id,
      category,
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: description || '',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    db.expenses.push(newExpense);
    saveDB(db);
    res.status(201).json({ success: true, message: 'Expense added', expense: newExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getExpenses = (req, res) => {
  try {
    const db = loadDB();
    let expenses = db.expenses.filter(e => e.userId === req.user.id);
    const { category, startDate, endDate } = req.query;
    if (category) expenses = expenses.filter(e => e.category === category);
    if (startDate) expenses = expenses.filter(e => e.date >= startDate);
    if (endDate) expenses = expenses.filter(e => e.date <= endDate);
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteExpense = (req, res) => {
  try {
    const db = loadDB();
    const index = db.expenses.findIndex(e => e.id === parseInt(req.params.id) && e.userId === req.user.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Expense not found' });
    db.expenses.splice(index, 1);
    saveDB(db);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMonthlySummary = (req, res) => {
  try {
    const db = loadDB();
    const userId = req.user.id;
    const now = new Date();
    const year = req.query.year || now.getFullYear();
    const month = req.query.month || (now.getMonth() + 1);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const incomes = db.incomes.filter(i => i.userId === userId && i.date.startsWith(monthStr));
    const expenses = db.expenses.filter(e => e.userId === userId && e.date.startsWith(monthStr));
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    res.json({
      success: true,
      summary: {
        month: monthStr,
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        categoryBreakdown,
        incomeCount: incomes.length,
        expenseCount: expenses.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  addIncome, getIncomes, deleteIncome,
  addExpense, getExpenses, deleteExpense,
  getMonthlySummary
};
