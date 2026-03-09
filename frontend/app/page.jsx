'use client';
import Link from 'next/link';
import { ArrowRight, Briefcase, Users, Star, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Briefcase, title: 'Post Tasks', desc: 'Share what you need help with — design, dev, marketing and more.', color: 'bg-blush' },
  { icon: Users, title: 'Find Contributors', desc: 'Browse skilled people ready to contribute and learn.', color: 'bg-lavender' },
  { icon: Star, title: 'Build Portfolio', desc: 'Gain real experience and collect reviews to showcase.', color: 'bg-mint' },
  { icon: Zap, title: 'Skill Swap', desc: 'Trade skills instead of cash — collaborate and grow together.', color: 'bg-sky' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cream">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blush text-rose text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Zap size={13} />
          Skill Swap & Micro-Internship Marketplace
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-dark mb-5 leading-tight">
          Learn by doing.<br />
          <span className="text-rose">Grow by sharing.</span>
        </h1>
        <p className="text-slate-mid text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Post micro-tasks, apply with your skills, and build real-world experience — one collaboration at a time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/tasks" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
            Browse Tasks
            <ArrowRight size={16} />
          </Link>
          {user ? (
            <Link href="/tasks/post" className="btn-ghost flex items-center gap-2 text-base px-7 py-3">
              Post a Task
            </Link>
          ) : (
            <Link href="/signup" className="btn-ghost flex items-center gap-2 text-base px-7 py-3">
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { val: '100+', label: 'Tasks Posted' },
            { val: '500+', label: 'Contributors' },
            { val: '50+', label: 'Skills Available' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl py-4 shadow-soft">
              <div className="text-2xl font-bold text-rose">{s.val}</div>
              <div className="text-sm text-slate-light mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-dark text-center mb-8">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-soft border border-gray-50">
              <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon size={18} className="text-slate-dark" />
              </div>
              <h3 className="font-semibold text-slate-dark mb-2">{f.title}</h3>
              <p className="text-slate-light text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-lavender/30 rounded-3xl p-8 border border-lavender">
          <h2 className="text-2xl font-bold text-slate-dark mb-3">
            Ready to start?
          </h2>
          <p className="text-slate-mid mb-6">Join the community and start building today.</p>
          <Link href={user ? '/tasks' : '/signup'} className="btn-primary inline-flex items-center gap-2 text-base px-7 py-3">
            {user ? 'Find Tasks' : 'Create Free Account'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}