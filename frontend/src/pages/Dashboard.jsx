import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingUp, Target, Repeat, ArrowUpRight, ArrowDownRight, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [wealth, setWealth] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, wealthRes, habitsRes, goalsRes] = await Promise.all([
          api.get('/summary/monthly'),
          api.get('/wealth/overview'),
          api.get('/habits'),
          api.get('/goals')
        ]);
        setSummary(sumRes.data.summary);
        setWealth(wealthRes.data.wealth);
        setHabits(habitsRes.data.habits.slice(0, 4));
        setGoals(goalsRes.data.goals.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your financial overview for this month</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between"><p className="text-sm text-gray-500">Monthly Income</p><div className="p-2 rounded-lg bg-green-50 text-green-600"><ArrowUpRight className="w-4 h-4" /></div></div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary?.totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between"><p className="text-sm text-gray-500">Monthly Expenses</p><div className="p-2 rounded-lg bg-red-50 text-red-600"><ArrowDownRight className="w-4 h-4" /></div></div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary?.totalExpense)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between"><p className="text-sm text-gray-500">Net Savings</p><div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Wallet className="w-4 h-4" /></div></div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary?.netSavings)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between"><p className="text-sm text-gray-500">Net Worth</p><div className="p-2 rounded-lg bg-purple-50 text-purple-600"><TrendingUp className="w-4 h-4" /></div></div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(wealth?.netWorth)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Repeat className="w-5 h-5 text-primary-600" /> Active Habits</h2>
            <Link to="/habits" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-3">No habits yet</p>
              <Link to="/habits" className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium"><PlusCircle className="w-4 h-4" /> Create your first habit</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium">{h.name}</p><p className="text-xs text-gray-500 capitalize">{h.frequency}</p></div>
                  <p className="text-sm font-semibold text-primary-600">{h.currentStreak} day streak</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Target className="w-5 h-5 text-primary-600" /> Savings Goals</h2>
            <Link to="/goals" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-3">No goals set</p>
              <Link to="/goals" className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium"><PlusCircle className="w-4 h-4" /> Set a savings goal</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(g => (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-medium">{g.name}</span><span className="text-gray-500">{g.progressPercent}%</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${g.progressPercent}%` }} /></div>
                  <p className="text-xs text-gray-400 mt-1">{formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
