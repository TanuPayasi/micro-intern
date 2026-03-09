'use client';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Design', 'Development', 'Marketing', 'Writing', 'Data', 'Business', 'Other'];

export default function FilterBar({ search, setSearch, category, setCategory }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">

      {/* Search */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light" />
        <input
          type="text"
          placeholder="Search tasks, skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              category === cat
                ? 'bg-rose text-white shadow-sm'
                : 'bg-white text-slate-mid border border-gray-200 hover:border-rose hover:text-rose'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

    </div>
  );
}