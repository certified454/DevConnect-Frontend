'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const programmingLanguages = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'java',
  'cpp',
  'go',
  'rust',
  'php',
  'sql',
];

export default function CreateTopicPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const normalized = t.startsWith('#') ? t : `#${t}`;
    if (tags.includes(normalized)) return;
    setTags((s) => [...s, normalized]);
    setTagInput('');
  };

  const removeTag = (t: string) => {
    setTags((s) => s.filter((x) => x !== t));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Post title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        setLoading(false);
        router.push('/auth/signin');
        return;
      }

      const res = await fetch(`${apiBaseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          language,
          tags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to create post.');
      };
      
      router.push('/');
    } catch (err: any) {
      console.error('Create Post Error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_33%),linear-gradient(135deg,_#f8fafc_0%,_#f0fdf4_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Create topic</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Share your idea, ask a question, or open a space for developers to collaborate around a real problem.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Back home
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Main Inputs */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="title" className="mb-2 block text-sm font-semibold text-slate-700">
                Topic Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How do you structure a scalable Next.js app?"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="content" className="mb-2 block text-sm font-semibold text-slate-700">
                What do you want to discuss? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the problem, idea, question, or discussion you want the community to engage with..."
                className="w-full resize-none border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Sidebar Options */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="language" className="mb-2 block text-sm font-semibold text-slate-700">
                Code Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
              >
                <option value="">Select language (optional)</option>
                {programmingLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="tags" className="mb-2 block text-sm font-semibold text-slate-700">
                Tags <span className="text-xs font-normal text-slate-500">(add and press Enter)</span>
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag(t)}
                    className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                  >
                    {t} ×
                  </button>
                ))}
              </div>
              <input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags, e.g. performance, react"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish topic'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
