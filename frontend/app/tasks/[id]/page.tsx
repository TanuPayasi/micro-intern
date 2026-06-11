'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  category: string;
  duration: string;
  compensation: string;
  status: string;
  applicantsCount: number;
  postedBy: {
    _id: string;
    name: string;
    email: string;
    bio: string;
    skills: string[];
  };
}

interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  suggestion: string;
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [applied, setApplied] = useState(false);
  const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);
  const [analyzingSkills, setAnalyzingSkills] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`);
      if (!res.ok) throw new Error('Task not found');
      const data = await res.json();
      setTask(data);
    } catch (err) {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const generateCoverNote = async () => {
    if (!task || !token) return;
    setGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-cover-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          skillsRequired: task.skillsRequired,
          userSkills: user?.skills || [],
          userName: user?.name || '',
        }),
      });
      const data = await res.json();
      setCoverNote(data.coverNote);
    } catch (err) {
      alert('Failed to generate cover note');
    } finally {
      setGenerating(false);
    }
  };

  const analyzeSkillGap = async () => {
    if (!task || !token) return;
    setAnalyzingSkills(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-skill-gap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskTitle: task.title,
          skillsRequired: task.skillsRequired,
          userSkills: user?.skills || [],
        }),
      });
      const data = await res.json();
      setSkillGap(data);
    } catch (err) {
      alert('Failed to analyze skills');
    } finally {
      setAnalyzingSkills(false);
    }
  };

  const applyToTask = async () => {
    if (!coverNote.trim()) return alert('Please write or generate a cover note first');
    if (!token) return router.push('/login');
    setApplying(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId: id, coverNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApplied(true);
    } catch (err: any) {
      alert(err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 70) return 'Strong Match';
    if (percentage >= 40) return 'Partial Match';
    return 'Low Match';
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-400">{error}</div>;
  if (!task) return null;

  const isOwner = user?._id === task.postedBy._id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1 text-sm"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-medium bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
              {task.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{task.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Posted by {task.postedBy.name}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            task.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {task.status}
          </span>
        </div>

        <p className="text-gray-700 leading-relaxed mb-6">{task.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Duration</p>
            <p className="text-sm font-medium text-gray-700">{task.duration}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Compensation</p>
            <p className="text-sm font-medium text-gray-700">{task.compensation}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Skills Required</p>
          <div className="flex flex-wrap gap-2">
            {task.skillsRequired.map((skill) => (
              <span key={skill} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">{task.applicantsCount} applicants</p>
      </div>

      {user && !isOwner && task.status === 'open' && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Check Your Fit</h2>
              <button
                onClick={analyzeSkillGap}
                disabled={analyzingSkills}
                className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition"
              >
                {analyzingSkills ? 'Analyzing...' : 'Analyze My Skills'}
              </button>
            </div>

            {!skillGap && !analyzingSkills && (
              <p className="text-sm text-gray-400">
                Click analyze to see how your skills match this task.
              </p>
            )}

            {skillGap && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getMatchLabel(skillGap.matchPercentage)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {skillGap.matchPercentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all ${getMatchColor(skillGap.matchPercentage)}`}
                    style={{ width: `${skillGap.matchPercentage}%` }}
                  />
                </div>

                {skillGap.matchedSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">You have</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGap.matchedSkills.map((skill) => (
                        <span key={skill} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {skillGap.missingSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">You're missing</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGap.missingSkills.map((skill) => (
                        <span key={skill} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full">
                          ✗ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {skillGap.suggestion}
                </p>
              </div>
            )}
          </div>

          {!applied ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply to this Task</h2>

              <div className="flex justify-end mb-2">
                <button
                  onClick={generateCoverNote}
                  disabled={generating}
                  className="text-sm text-pink-500 hover:text-pink-600 disabled:opacity-50"
                >
                  {generating ? 'Generating...' : '✨ Generate with AI'}
                </button>
              </div>

              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Write your cover note here..."
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none mb-4"
              />

              <button
                onClick={applyToTask}
                disabled={applying || !coverNote.trim()}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <p className="text-green-600 font-medium">Application submitted successfully!</p>
              <p className="text-green-500 text-sm mt-1">The task owner will review your application.</p>
            </div>
          )}
        </>
      )}

      {isOwner && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-blue-600 text-sm">This is your task. Go to your dashboard to manage applications.</p>
        </div>
      )}
    </div>
  );
}