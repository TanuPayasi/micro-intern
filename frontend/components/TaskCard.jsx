import Link from 'next/link';
import { Clock, Users } from 'lucide-react';

const categoryColors = {
  Design:      'bg-blush text-rose',
  Development: 'bg-sky text-blue-600',
  Marketing:   'bg-peach text-orange-600',
  Writing:     'bg-mint text-green-600',
  Data:        'bg-lavender text-plum',
  Business:    'bg-yellow-100 text-yellow-700',
  Other:       'bg-gray-100 text-gray-600',
};

export default function TaskCard({ task }) {
  const colorClass = categoryColors[task.category] || categoryColors.Other;

  return (
    <Link href={`/tasks/${task._id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`badge ${colorClass}`}>{task.category}</span>
          <span className="text-xs text-slate-light">
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-dark text-base mb-2 line-clamp-2 flex-1">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-slate-light text-sm mb-4 line-clamp-2">
          {task.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {task.skillsRequired?.slice(0, 3).map((skill, i) => (
            <span key={i} className="badge bg-cream text-slate-mid border border-gray-100">
              {skill}
            </span>
          ))}
          {task.skillsRequired?.length > 3 && (
            <span className="badge bg-gray-50 text-slate-light">
              +{task.skillsRequired.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-light pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{task.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{task.applicantsCount || 0} applied</span>
          </div>
        </div>

        {/* Posted by */}
        <div className="mt-2 text-xs text-slate-light">
          by <span className="text-rose font-medium">{task.postedBy?.name || 'Unknown'}</span>
        </div>

      </div>
    </Link>
  );
}