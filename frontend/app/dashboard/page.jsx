'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  getMyTasks, getMyApplications, getTaskApplications,
  updateApplicationStatus, deleteTask
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase, FileText, Check, X,
  ChevronDown, ChevronUp, Loader2, Trash2, Eye
} from 'lucide-react';

const statusColors = {
  pending:       'bg-peach text-orange-700',
  accepted:      'bg-mint text-green-700',
  rejected:      'bg-red-50 text-red-600',
  open:          'bg-mint text-green-700',
  'in-progress': 'bg-sky text-blue-700',
  completed:     'bg-lavender text-plum',
  closed:        'bg-gray-100 text-gray-600',
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router                         = useRouter();
  const [tab, setTab]                  = useState('my-tasks');
  const [myTasks, setMyTasks]          = useState([]);
  const [myApps, setMyApps]            = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [taskApps, setTaskApps]        = useState({});
  const [loading, setLoading]          = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, appsRes] = await Promise.all([
          getMyTasks(),
          getMyApplications(),
        ]);
        setMyTasks(tasksRes.data);
        setMyApps(appsRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleExpandTask = async (taskId) => {
    if (expandedTask === taskId) { setExpandedTask(null); return; }
    setExpandedTask(taskId);
    if (!taskApps[taskId]) {
      try {
        const res = await getTaskApplications(taskId);
        setTaskApps((prev) => ({ ...prev, [taskId]: res.data }));
      } catch (err) {
        toast.error('Failed to load applications');
      }
    }
  };

  const handleUpdateStatus = async (appId, status, taskId) => {
    try {
      await updateApplicationStatus(appId, { status });
      setTaskApps((prev) => ({
        ...prev,
        [taskId]: prev[taskId].map((a) => a._id === appId ? { ...a, status } : a),
      }));
      toast.success(`Application ${status}!`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(taskId);
      setMyTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-rose" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-dark mb-1">
          Welcome, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-light">Manage your tasks and applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Tasks Posted',      val: myTasks.length,                                      color: 'bg-blush' },
          { label: 'Open Tasks',        val: myTasks.filter((t) => t.status === 'open').length,   color: 'bg-mint' },
          { label: 'Applications Sent', val: myApps.length,                                       color: 'bg-lavender' },
          { label: 'Accepted',          val: myApps.filter((a) => a.status === 'accepted').length, color: 'bg-sky' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl font-bold text-slate-dark">{s.val}</div>
            <div className="text-xs text-slate-mid mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: 'my-tasks',        label: 'My Tasks',        icon: Briefcase },
          { key: 'my-applications', label: 'My Applications', icon: FileText  },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white text-rose shadow-sm'
                : 'text-slate-light hover:text-slate-mid'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* MY TASKS TAB */}
      {tab === 'my-tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-slate-light">{myTasks.length} task{myTasks.length !== 1 ? 's' : ''} posted</p>
            <Link href="/tasks/post" className="btn-primary text-sm py-2">+ Post New Task</Link>
          </div>

          {myTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="text-3xl mb-3">📋</div>
              <p className="text-slate-mid font-medium">No tasks yet</p>
              <Link href="/tasks/post" className="text-rose text-sm mt-2 inline-block hover:underline">
                Post your first task →
              </Link>
            </div>
          ) : (
            myTasks.map((task) => (
              <div key={task._id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => handleExpandTask(task._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-dark truncate">{task.title}</h3>
                      <span className={`badge text-xs ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-light">
                      {task.applicantsCount || 0} applicant{task.applicantsCount !== 1 ? 's' : ''} · {task.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Link href={`/tasks/${task._id}`} onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-sky/50 rounded-lg transition-colors text-slate-light hover:text-blue-600">
                      <Eye size={16} />
                    </Link>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-light hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                    {expandedTask === task._id
                      ? <ChevronUp size={16} className="text-slate-light" />
                      : <ChevronDown size={16} className="text-slate-light" />
                    }
                  </div>
                </div>

                {/* Applications for this task */}
                {expandedTask === task._id && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50/30">
                    <h4 className="text-sm font-semibold text-slate-dark mb-3">Applications</h4>
                    {!taskApps[task._id] ? (
                      <div className="flex items-center gap-2 text-slate-light text-sm">
                        <Loader2 size={14} className="animate-spin" /> Loading...
                      </div>
                    ) : taskApps[task._id].length === 0 ? (
                      <p className="text-sm text-slate-light">No applications yet</p>
                    ) : (
                      <div className="space-y-3">
                        {taskApps[task._id].map((app) => (
                          <div key={app._id} className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-slate-dark text-sm">{app.applicant?.name}</span>
                                  <span className={`badge text-xs ${statusColors[app.status]}`}>{app.status}</span>
                                </div>
                                <p className="text-sm text-slate-light line-clamp-2">{app.coverNote}</p>
                              </div>
                              {app.status === 'pending' && (
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleUpdateStatus(app._id, 'accepted', task._id)}
                                    className="p-1.5 bg-mint rounded-lg hover:bg-green-200 transition-colors">
                                    <Check size={14} className="text-green-700" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(app._id, 'rejected', task._id)}
                                    className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <X size={14} className="text-red-500" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* MY APPLICATIONS TAB */}
      {tab === 'my-applications' && (
        <div className="space-y-3">
          {myApps.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="text-3xl mb-3">🚀</div>
              <p className="text-slate-mid font-medium">No applications yet</p>
              <Link href="/tasks" className="text-rose text-sm mt-2 inline-block hover:underline">
                Browse tasks →
              </Link>
            </div>
          ) : (
            myApps.map((app) => (
              <div key={app._id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/tasks/${app.task?._id}`}
                        className="font-semibold text-slate-dark hover:text-rose transition-colors">
                        {app.task?.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-light mb-2">
                      <span>{app.task?.category}</span>
                      <span>·</span>
                      <span>by {app.task?.postedBy?.name}</span>
                      <span>·</span>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-mid line-clamp-2">{app.coverNote}</p>
                    {app.feedback && (
                      <div className="mt-2 p-3 bg-sky/20 rounded-xl text-sm text-slate-mid">
                        <span className="font-medium">Feedback: </span>{app.feedback}
                      </div>
                    )}
                  </div>
                  <span className={`badge text-xs shrink-0 ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}