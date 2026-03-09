'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createTask } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { PlusCircle, X, Loader2 } from 'lucide-react';

const CATEGORIES = ['Design', 'Development', 'Marketing', 'Writing', 'Data', 'Business', 'Other'];

export default function PostTaskPage() {
  const { user }            = useAuth();
  const router              = useRouter();
  const [loading, setLoading]     = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm]     = useState({
    title:          '',
    description:    '',
    category:       '',
    duration:       '',
    compensation:   'Unpaid / Portfolio',
    skillsRequired: [],
  });

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skillsRequired.includes(s)) {
      setForm({ ...form, skillsRequired: [...form.skillsRequired, s] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skillsRequired: form.skillsRequired.filter((s) => s !== skill) });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.skillsRequired.length === 0) return toast.error('Add at least one required skill');
    setLoading(true);
    try {
      const res = await createTask(form);
      toast.success('Task posted! 🚀');
      router.push(`/tasks/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-dark mb-2">Post a Task</h1>
        <p className="text-slate-light">Share what you need help with and find the right contributor</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-dark mb-1.5">Task Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="e.g. Build a landing page in React"
              className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-dark mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required
              placeholder="Describe the task, deliverables, and what you expect..."
              rows={4} className="input resize-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-dark mb-1.5">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required className="input">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-dark mb-1.5">Duration *</label>
              <input name="duration" value={form.duration} onChange={handleChange} required
                placeholder="e.g. 1 week, 2-3 days"
                className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-dark mb-1.5">Compensation</label>
            <input name="compensation" value={form.compensation} onChange={handleChange}
              placeholder="e.g. Unpaid / Portfolio, Certificate"
              className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-dark mb-1.5">Skills Required *</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill and press Enter"
                className="input flex-1"
              />
              <button type="button" onClick={addSkill}
                className="btn-ghost px-4">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.skillsRequired.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-blush text-rose px-3 py-1 rounded-full text-sm">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            {loading ? 'Posting...' : 'Post Task'}
          </button>

        </form>
      </div>
    </div>
  );
}