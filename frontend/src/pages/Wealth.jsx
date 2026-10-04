import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const INV_TYPES = ['Stocks', 'Mutual Funds', 'Crypto', 'Fixed Deposit', 'Gold', 'PPF', 'Other'];

export default function Wealth() {
  const [wealth, setWealth] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Mutual Funds', amount: '', currentValue: '', purchaseDate: '' });

  const fetchData = async () => {
    try {
      const [wRes, iRes] = await Promise.all([api.get('/wealth/overview'), api.get('/investments')]);
      setWealth(wRes.data.wealth);
      setInvestments(iRes.data.investments);
    } catch { toast.error('Failed to load wealth data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/investments', { ...form, currentValue: form.currentValue || form.amount });
      toast.success('Investment added');
      setShowModal(false);
      setForm({ name: '', type: 'Mutual Funds', amount: '', currentValue: '', purchaseDate: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment?')) return;
    try {
      await api.delete(`/investments/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Wealth Analytics</h1><p className="text-gray-500 mt-1">Track your net worth and investments</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium">
          <Plus className="w-4 h-4" /> Add Investment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl p-5">
          <p className="text-primary-100 text-sm">Estimated Net Worth</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(wealth?.netWorth)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-500 text-sm">Cash / Liquid</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(wealth?.estimatedCash)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-500 text-sm">Investments Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(wealth?.totalCurrentValue)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-500 text-sm">Goal Savings</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(wealth?.totalGoalSavings)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-lg font-semibold">Your Investments</h2></div>
        {investments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No investments tracked yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-right px-5 py-3 font-medium">Invested</th>
                  <th className="text-right px-5 py-3 font-medium">Current Value</th>
                  <th className="text-right px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investments.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{inv.name}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{inv.type}</span></td>
                    <td className="px-5 py-3 text-right">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatCurrency(inv.currentValue)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
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
            <h2 className="text-lg font-semibold mb-4">Add Investment</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Nifty 50 Index Fund" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none">
                  {INV_TYPES.map(t => <option key={t}>{t}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Invested (₹) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                  <input type="number" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
