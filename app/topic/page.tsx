'use client';

import Link from 'next/link';
import { useState } from 'react';

const categories = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'AI/ML', 'Design', 'Product', 'Community'];

export default function CreateTopicPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, description, category, tags, isDraft });
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
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
            Back home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="title" className="mb-2 block text-sm font-semibold text-slate-700">
                Topic title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How do you structure a scalable Next.js app?"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
                What do you want to discuss?
              </label>
              <textarea
                id="description"
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem, idea, question, or discussion you want the community to engage with..."
                className="w-full resize-none border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="category" className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
              >
                <option value="">Choose a category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="tags" className="mb-2 block text-sm font-semibold text-slate-700">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nextjs, react, performance"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <p className="mt-2 text-xs text-slate-500">Separate tags with commas.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isDraft}
                  onChange={() => setIsDraft((prev) => !prev)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Save as draft first</span>
              </label>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Drafts are great when you want to refine the topic before publishing it live.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
              <p className="text-sm font-semibold text-emerald-800">Before you publish</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-emerald-700">
                <li>Make the title clear and specific.</li>
                <li>Give enough context so people can reply meaningfully.</li>
                <li>Use relevant tags so the right people discover it.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                {isDraft ? 'Save draft' : 'Publish topic'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
