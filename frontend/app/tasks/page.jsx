'use client';
import { useState, useEffect } from 'react';
import TaskCard from '../../components/TaskCard';
import FilterBar from '../../components/FilterBar';
import { getTasks } from '../../lib/api';
import { Loader2 } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        const res = await getTasks(params);
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-dark mb-2">Browse Tasks</h1>
        <p className="text-slate-light">Find micro-internships that match your skills</p>
      </div>

      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-rose" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-mid font-medium">No tasks found</p>
          <p className="text-slate-light text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}

    </div>
  );
}