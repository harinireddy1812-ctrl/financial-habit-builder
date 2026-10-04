import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, CheckCircle, Flame, Trash2, Repeat } from 'lucide-react';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily' });

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data.habits);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHabits(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/habits', form);
      toast.success('Habit created!');
      setShowModal(false);
      setForm({ name: '', description: '', frequency: 'daily' });
      fetchHabits();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleLog = async (id) => {
    try {
      const res = await api.post(`/habits/${id}/log`, {});
      toast.success(`Logged! Current streak: ${res.data.currentStreak}`);
      fetchHabits();
    } catch (err) { toast.error(err.response?.data?.message || 'Already logged today'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      toast.success('Habit removed');
      fetchHabits();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Financial Habits</h1><p className="text-gray-500 mt-1">Build consistency with daily, weekly or monthly habits</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium">
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
       habits.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No habits yet</h3>
          <p className="text-gray-500 mb-4">Start with something simple like "Save ₹100 daily"</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg"><Plus className="w-4 h-4" /> Create Habit</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(h => (
            <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-semibold">{h.name}</h3><p className="text-xs text-gray-500 capitalize mt-0.5">{h.frequency} habit</p></div>
                <button onClick={() => handleDelete(h.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
              {h.description && <p className="text-sm text-gray-600 mb-4">{h.description}</p>}
              <div className="flex items-center gap-4 mb-4 mt-auto">
                <div className="flex items-center gap-1.5 text-orange-500"><Flame className="w-4 h-4" /><span className="text-sm font-semibold">{h.currentStreak} day streak</span></div>
                <span className="text-xs text-gray-400">Best: {h.longestStreak}</span>
              </div>
              <button onClick={() => handleLog(h.id)} className="w-full flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-2.5 rounded-lg">
                <CheckCircle className="w-4 h-4" /> Mark as Done Today
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Habit</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Save ₹50 daily" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
