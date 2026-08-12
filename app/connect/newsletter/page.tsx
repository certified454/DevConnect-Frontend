'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from '@/components/ui/toast';

export default function NewsletterPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Web Architecture',
    'AI & Tooling',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTopics = [
    'Web Architecture',
    'Mobile Development',
    'Backend & Cloud',
    'AI & Tooling',
    'Community Highlights',
  ];

  const recentEditions = [
    {
      issue: 'Issue #42',
      date: 'August 10, 2026',
      title: 'Scaling Real-Time Audio & Next.js 16 Highlights',
      snippet:
        'A deep dive into WebSockets vs. WebRTC for live sports streaming, plus key takeaways from top community projects.',
    },
    {
      issue: 'Issue #41',
      date: 'August 03, 2026',
      title: 'Monetization Models & High-Performance UI Layouts',
      snippet:
        'Balancing rewarded ad limits with tier pricing, alongside tips for optimizing Tailwind layouts on mobile viewports.',
    },
    {
      issue: 'Issue #40',
      date: 'July 27, 2026',
      title: 'Predictive Algorithms & MongoDB Schema Design',
      snippet:
        'How developers build custom statistical engines and keep data pipelines resilient under heavy request loads.',
    },
  ];

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  const showToast = (title: string, msg: string, action: 'success' | 'error') => {
    toast.show({
      render: ({ id }) => (
        <Toast
          key={id}
          action={action}
          className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-4 text-white transition-all ${
            action === 'success'
              ? 'bg-emerald-950/75 border-emerald-500/40 shadow-emerald-950/20'
              : 'bg-red-950/75 border-red-500/40 shadow-red-950/20'
          }`}
        >
          <ToastTitle
            className={`text-sm font-semibold ${
              action === 'success' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {title}
          </ToastTitle>
          <ToastDescription className="text-xs opacity-90">{msg}</ToastDescription>
        </Toast>
      ),
      placement: 'top',
      duration: 5000,
    });
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast('Action Required', 'Please provide a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          frequency,
          topics: selectedTopics,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to subscribe.');
      }

      showToast(
        'Subscribed!',
        'Check your inbox to confirm your newsletter subscription.',
        'success'
      );

      setEmail('');
    } catch (error) {
      showToast(
        'Subscription Failed',
        error instanceof Error ? error.message : 'Unable to complete subscription.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 sm:p-10 border-b border-slate-200">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
              Stay Informed
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
              DevConnect Dispatch
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Back
          </button>
        </div>

        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-12">
          
          {/* Subscription Form Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <h2 className="text-base font-semibold text-emerald-950">
                Curated Developer Intelligence
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                Get high-signal tech breakdowns, architecture case studies, community updates, and project spotlights delivered directly to your inbox. No spam, ever.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Delivery Frequency */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Cadence
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                  {(['weekly', 'monthly'] as const).map((cadence) => (
                    <button
                      key={cadence}
                      type="button"
                      onClick={() => setFrequency(cadence)}
                      className={`rounded-xl py-2 text-xs font-semibold capitalize transition ${
                        frequency === cadence
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cadence} Digest
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Preferences */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Topics of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  'Subscribe to Dispatch'
                )}
              </button>
            </form>
          </div>

          {/* Archive / Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Recent Editions
              </h2>
              <span className="text-xs text-slate-400">Archive</span>
            </div>

            <div className="space-y-3">
              {recentEditions.map((edition) => (
                <div
                  key={edition.issue}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-emerald-200 hover:bg-white"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-600">
                      {edition.issue}
                    </span>
                    <span>{edition.date}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-slate-800">
                    {edition.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-5">
                    {edition.snippet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-10 py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DevConnect. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/company/terms" className="hover:text-emerald-600 underline">
              Terms
            </Link>
            <Link href="/company/privacy" className="hover:text-emerald-600 underline">
              Privacy
            </Link>
            <Link href="/community/guideline" className="hover:text-emerald-600 underline">
              Guidelines
            </Link>
            <Link href="/connect/contact" className="hover:text-emerald-600 underline">
              Contact
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}