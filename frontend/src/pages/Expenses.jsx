import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'];

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'Food', amount: '', date: '', description: '', source: '', notes: '' });

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([api.get('/expenses'), api.get('/incomes')]);
      setExpenses(expRes.data.expenses);
      setIncomes(incRes.data.incomes);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'expenses') {
        await api.post('/expenses', { category: form.category, amount: form.amount, date: form.date || undefined, description: form.description });
        toast.success('Expense added');
      } else {
        await api.post('/incomes', { source: form.source || form.description, amount: form.amount, date: form.date || undefined });
        toast.success('Income added');
      }
      setShowModal(false);
      setForm({ category: 'Food', amount: '', date: '', description: '', source: '', notes: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/${type}/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  const list = activeTab === 'expenses' ? expenses : incomes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Income & Expenses</h1><p className="text-gray-500 mt-1">Track your money in and out</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium">
          <Plus className="w-4 h-4" /> Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('expenses')} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${activeTab === 'expenses' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'}`}>Expenses ({expenses.length})</button>
        <button onClick={() => setActiveTab('income')} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${activeTab === 'income' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'}`}>Income ({incomes.length})</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> :
         list.length === 0 ? <div className="p-12 text-center text-gray-400">No {activeTab} recorded yet.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">{activeTab === 'expenses' ? 'Category' : 'Source'}</th>
                  <th className="text-left px-5 py-3 font-medium">Description</th>
                  <th className="text-right px-5 py-3 font-medium">Amount</th>
                  <th className="text-right px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600">{item.date}</td>
                    <td className="px-5 py-3"><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">{activeTab === 'expenses' ? item.category : item.source}</span></td>
                    <td className="px-5 py-3 text-gray-700">{item.description || item.notes || '—'}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${activeTab === 'expenses' ? 'text-red-600' : 'text-green-600'}`}>{activeTab === 'expenses' ? '-' : '+'}{formatCurrency(item.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(activeTab === 'expenses' ? 'expenses' : 'incomes', item.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add {activeTab === 'expenses' ? 'Expense' : 'Income'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'expenses' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} required placeholder="Salary, Freelance..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
