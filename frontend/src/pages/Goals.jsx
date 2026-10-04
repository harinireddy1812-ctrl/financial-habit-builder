import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Target, Trash2, PlusCircle } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '0', deadline: '', category: 'Emergency Fund' });
  const [addAmount, setAddAmount] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.goals);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', form);
      toast.success('Goal created!');
      setShowModal(false);
      setForm({ name: '', targetAmount: '', currentAmount: '0', deadline: '', category: 'Emergency Fund' });
      fetchGoals();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/goals/${showAddMoney}/progress`, { amount: addAmount });
      toast.success('Progress updated!');
      setShowAddMoney(null);
      setAddAmount('');
      fetchGoals();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      toast.success('Goal deleted');
      fetchGoals();
    } catch { toast.error('Failed'); }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Savings Goals</h1><p className="text-gray-500 mt-1">Set targets and track your progress</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
       goals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No goals yet</h3>
          <p className="text-gray-500 mb-4">Create goals like Emergency Fund, Vacation, etc.</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg"><Plus className="w-4 h-4" /> Create Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map(g => (
            <div key={g.id} className={`bg-white rounded-xl border p-5 ${g.isCompleted ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-semibold">{g.name}</h3><p className="text-xs text-gray-500 mt-0.5">{g.category}</p></div>
                <div className="flex items-center gap-2">
                  {g.isCompleted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Completed</span>}
                  <button onClick={() => handleDelete(g.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-600">{formatCurrency(g.currentAmount)}</span><span className="font-medium">{g.progressPercent}%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-3"><div className={`h-3 rounded-full ${g.isCompleted ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${g.progressPercent}%` }} /></div>
                <p className="text-xs text-gray-400 mt-1.5">Target: {formatCurrency(g.targetAmount)}</p>
              </div>
              {!g.isCompleted && (
                <button onClick={() => setShowAddMoney(g.id)} className="w-full flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-2 rounded-lg text-sm">
                  <PlusCircle className="w-4 h-4" /> Add Money
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Create Savings Goal</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Goal Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Emergency Fund" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹) *</label>
                <input type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMoney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Add Money to Goal</h2>
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} required min="1" autoFocus className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddMoney(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
