const { loadDB, saveDB, getNextId } = require('../utils/db');

const addInvestment = (req, res) => {
  try {
    const { name, type, amount, currentValue, purchaseDate, notes } = req.body;
    if (!name || !amount) return res.status(400).json({ success: false, message: 'Name and amount are required' });

    const db = loadDB();
    const newInv = {
      id: getNextId('investments'),
      userId: req.user.id,
      name,
      type: type || 'Other',
      amount: parseFloat(amount),
      currentValue: parseFloat(currentValue) || parseFloat(amount),
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    db.investments.push(newInv);
    saveDB(db);
    res.status(201).json({ success: true, message: 'Investment added', investment: newInv });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getInvestments = (req, res) => {
  try {
    const db = loadDB();
    const investments = db.investments.filter(i => i.userId === req.user.id);
    res.json({ success: true, investments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateInvestment = (req, res) => {
  try {
    const invId = parseInt(req.params.id);
    const { currentValue, notes } = req.body;
    const db = loadDB();
    const inv = db.investments.find(i => i.id === invId && i.userId === req.user.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Investment not found' });
    if (currentValue !== undefined) inv.currentValue = parseFloat(currentValue);
    if (notes !== undefined) inv.notes = notes;
    saveDB(db);
    res.json({ success: true, message: 'Investment updated', investment: inv });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteInvestment = (req, res) => {
  try {
    const db = loadDB();
    const index = db.investments.findIndex(i => i.id === parseInt(req.params.id) && i.userId === req.user.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Investment not found' });
    db.investments.splice(index, 1);
    saveDB(db);
    res.json({ success: true, message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getWealthOverview = (req, res) => {
  try {
    const db = loadDB();
    const userId = req.user.id;

    const goals = db.goals.filter(g => g.userId === userId);
    const totalGoalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    const investments = db.investments.filter(i => i.userId === userId);
    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
    const totalCurrentValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const investmentGain = totalCurrentValue - totalInvested;

    const allIncomes = db.incomes.filter(i => i.userId === userId);
    const allExpenses = db.expenses.filter(e => e.userId === userId);
    const lifetimeIncome = allIncomes.reduce((sum, i) => sum + i.amount, 0);
    const lifetimeExpense = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const estimatedCash = Math.max(0, lifetimeIncome - lifetimeExpense - totalInvested);
    const netWorth = estimatedCash + totalCurrentValue + totalGoalSavings;

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mIncome = allIncomes.filter(inc => inc.date.startsWith(monthStr)).reduce((s, x) => s + x.amount, 0);
      const mExpense = allExpenses.filter(exp => exp.date.startsWith(monthStr)).reduce((s, x) => s + x.amount, 0);
      months.push({ month: monthStr, income: mIncome, expense: mExpense, savings: mIncome - mExpense });
    }

    res.json({
      success: true,
      wealth: {
        estimatedCash,
        totalInvested,
        totalCurrentValue,
        investmentGain,
        totalGoalSavings,
        netWorth,
        monthlyTrend: months,
        investmentCount: investments.length,
        goalCount: goals.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addInvestment, getInvestments, updateInvestment, deleteInvestment, getWealthOverview };
