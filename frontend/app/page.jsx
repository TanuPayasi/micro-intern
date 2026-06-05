'use client';

import { useState, useEffect } from 'react';
import TaskCard from '@/components/TaskCard';
import FilterBar from '@/components/FilterBar';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [category, page]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks?${params}`);
      const data = await res.json();

      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setTotalTasks(data.totalTasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTasks();
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Tasks</h1>
        <p className="text-gray-500">{totalTasks} tasks available</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search tasks or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
        >
          Search
        </button>
      </form>

      <FilterBar selected={category} onChange={handleCategoryChange} />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading tasks...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No tasks found</div>
      ) : (
        <>
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}