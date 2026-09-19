'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [codeSnippet, setCodeSnippet] = useState('');
  const [language, setLanguage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const normalized = t.startsWith('#') ? t : `#${t}`;
    if (tags.includes(normalized)) return;
    setTags((s) => [...s, normalized]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((s) => s.filter((item) => item !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImage = e.target.files?.[0];
    if (!selectedImage) return;

    if (!selectedImage.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      e.target.value = '';
      return;
    }

    setError(null);
    setImage(selectedImage);
  };

  const removeImage = () => {
    setImage(null);
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
        router.push('/auth/signin');
        return;
      }

      // The backend reads the uploaded file from req.file, so send multipart/form-data.
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('codeSnippet', codeSnippet);
      formData.append('language', language);
      formData.append('tags', JSON.stringify(tags));
      if (image) {
        // This field name must match the backend's multer upload.single(...) field.
        formData.append('image', image);
      }

      const res = await fetch(`${apiBaseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to create post.');
      }

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
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
            Back home
          </Link>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="title" className="mb-2 block text-sm font-semibold text-slate-700">Topic Title <span className="text-red-500">*</span></label>
              <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How do you structure a scalable Next.js app?" className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="content" className="mb-2 block text-sm font-semibold text-slate-700">What do you want to discuss? <span className="text-red-500">*</span></label>
              <textarea id="content" required rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe the problem, idea, question, or discussion you want the community to engage with..." className="w-full resize-none border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="codeSnippet" className="mb-2 block text-sm font-semibold text-slate-700">Code Snippet <span className="text-xs font-normal text-slate-500">(optional)</span></label>
              <textarea id="codeSnippet" rows={5} value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} placeholder="// Paste code block here..." className="w-full resize-none border-0 bg-transparent font-mono text-xs text-slate-900 outline-none placeholder:text-slate-400" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="language" className="mb-2 block text-sm font-semibold text-slate-700">Code Language</label>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none">
                <option value="">Select language (optional)</option>
                {programmingLanguages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="tags" className="mb-2 block text-sm font-semibold text-slate-700">Tags <span className="text-xs font-normal text-slate-500">(add and press Enter)</span></label>
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag) => <button key={tag} type="button" onClick={() => removeTag(tag)} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{tag} ×</button>)}
              </div>
              <input id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Add tags, e.g. performance, react" className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <label htmlFor="image" className="mb-2 block text-sm font-semibold text-slate-700">Cover Image <span className="text-xs font-normal text-slate-500">(optional, max 5 MB)</span></label>
              <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100" />
              {imagePreview && (
                <div className="relative mt-3">
                  <img src={imagePreview} alt="Selected cover preview" className="h-40 w-full rounded-xl object-cover" />
                  <button type="button" onClick={removeImage} className="absolute right-2 top-2 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-medium text-white hover:bg-slate-900">Remove</button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
              <p className="text-sm font-semibold text-emerald-800">Before you publish</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-emerald-700"><li>Make the title clear and specific.</li><li>Give enough context so people can reply meaningfully.</li><li>Format any code snippets properly.</li></ul>
            </div>

            <div className="pt-2"><button type="submit" disabled={loading} className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50">{loading ? 'Publishing...' : 'Publish topic'}</button></div>
          </div>
        </form>
      </div>
    </main>
  );
}
