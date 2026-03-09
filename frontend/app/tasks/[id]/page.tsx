'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getTask, applyToTask, generateCoverNote } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Clock, Users, Tag, ArrowLeft, Send, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const categoryColors = {
  Design:      'bg-blush text-rose',
  Development: 'bg-sky text-blue-600',
  Marketing:   'bg-peach text-orange-600',
  Writing:     'bg-mint text-green-600',
  Data:        'bg-lavender text-plum',
  Business:    'bg-yellow-100 text-yellow-700',
  Other:       'bg-gray-100 text-gray-600',
};

const statusColors = {
  open:          'bg-mint text-green-700',
  'in-progress': 'bg-sky text-blue-700',
  completed:     'bg-lavender text-plum',
  closed:        'bg-gray-100 text-gray-600',
};

export default function TaskDetailPage() {
  const { id }                        = useParams();
  const { user }                      = useAuth();
  const router                        = useRouter();
  const [task, setTask]               = useState(null);
  const [coverNote, setCoverNote]     = useState('');
  const [applying, setApplying]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [generating, setGenerating]   = useState(false);

  useEffect(() => {
    getTask(id)
      .then((res) => setTask(res.data))
      .catch(() => toast.error('Task not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return router.push('/login');
    if (!coverNote.trim()) return toast.error('Please write a cover note');
    setApplying(true);
    try {
      await applyToTask({ taskId: id, coverNote });
      toast.success('Application submitted! 🎉');
      setShowForm(false);
      setCoverNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  const handleGenerateCoverNote = async () => {
    if (!user) return router.push('/login');
    setGenerating(true);
    try {
      const res = await generateCoverNote({
        taskTitle:        task.title,
        taskDescription:  task.description,
        skillsRequired:   task.skillsRequired,
        userSkills:       user.skills || [],
        userName:         user.name,
      });
      setCoverNote(res.data.coverNote);
      toast.success('Cover note generated! ✨ Feel free to edit it');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-rose" />
    </div>
  );

  if (!task) return (
    <div className="text-center py-20">
      <p className="text-slate-mid">Task not found.</p>
    </div>
  );

  const isOwner    = user?._id === task.postedBy?._id;
  const colorClass = categoryColors[task.category] || categoryColors.Other;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      <Link href="/tasks" className="inline-flex items-center gap-2 text-slate-light hover:text-rose text-sm mb-6 transition-colors">
        <ArrowLeft size={15} />
        Back to Tasks
      </Link>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-8 mb-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className={`badge ${colorClass}`}>{task.category}</span>
          <span className={`badge ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>
            {task.status}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-dark mb-4">{task.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-light mb-5">
          <span className="flex items-center gap-1.5"><Clock size={14} />{task.duration}</span>
          <span className="flex items-center gap-1.5"><Users size={14} />{task.applicantsCount} applicants</span>
          <span className="flex items-center gap-1.5"><Tag size={14} />{task.compensation}</span>
        </div>

        <p className="text-slate-mid leading-relaxed mb-6 whitespace-pre-line">{task.description}</p>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-dark mb-2">Skills Required</h3>
          <div className="flex flex-wrap gap-2">
            {task.skillsRequired?.map((skill, i) => (
              <span key={i} className="badge bg-lavender text-plum">{skill}</span>
            ))}
          </div>
        </div>

        {/* Posted By */}
        <div className="pt-5 border-t border-gray-50">
          <p className="text-sm text-slate-light">
            Posted by <span className="text-rose font-medium">{task.postedBy?.name}</span>
          </p>
          {task.postedBy?.bio && (
            <p className="text-sm text-slate-light mt-1">{task.postedBy.bio}</p>
          )}
        </div>

      </div>

      {/* Apply Section */}
      {!isOwner && task.status === 'open' && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          {!showForm ? (
            <div className="text-center">
              <p className="text-slate-mid mb-4">Interested in this task?</p>
              <button
                onClick={() => user ? setShowForm(true) : router.push('/login')}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Send size={15} />
                Apply Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-dark">Your Application</h3>

                {/* AI Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateCoverNote}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-lavender text-plum rounded-xl text-xs font-medium hover:bg-purple-100 transition-all disabled:opacity-60"
                >
                  {generating
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Sparkles size={12} />
                  }
                  {generating ? 'Generating...' : 'Generate with AI ✨'}
                </button>
              </div>

              {/* AI generating animation */}
              {generating && (
                <div className="mb-3 p-3 bg-lavender/30 rounded-xl border border-lavender text-sm text-plum flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  AI is writing your cover note...
                </div>
              )}

              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Write your cover note here, or click 'Generate with AI ✨' to get a personalized draft..."
                rows={5}
                className="input resize-none mb-4"
                required
              />

              {/* Show AI badge if generated */}
              {coverNote && (
                <p className="text-xs text-slate-light mb-3 flex items-center gap-1">
                  <Sparkles size={11} className="text-plum" />
                  AI-generated — feel free to edit before submitting
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={applying}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60"
                >
                  {applying ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setCoverNote(''); }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isOwner && (
        <div className="bg-lavender/20 rounded-2xl border border-lavender p-5 text-center">
          <p className="text-slate-mid text-sm">This is your task.</p>
          <Link href="/dashboard" className="text-rose font-medium text-sm hover:underline mt-1 inline-block">
            Manage applications in Dashboard →
          </Link>
        </div>
      )}

    </div>
  );
}