'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SocialPage() {
  const router = useRouter();

  const socialLinks = [
    {
      name: 'GitHub',
      handle: '@DevConnect',
      description: 'Explore open-source projects, public repositories, and platform tools.',
      url: 'https://github.com/certified454/DevConnect-Frontend',
      badge: 'Open Source',
      color: 'hover:border-slate-800 hover:bg-slate-900 hover:text-white',
    },
    {
      name: 'Facebook Page',
      handle: 'DevConnect',
      description: 'Follow us on facebook to keep upto date',
      url: 'https://facebook.com',
      badge: 'Update',
      color: 'hover:border-indigo-400 hover:bg-indigo-50/50',
    },
    {
      name: 'X (Twitter)',
      handle: '@DevConnectApp',
      description: 'Follow product announcements, feature updates, and developer highlights.',
      url: 'https://x.com',
      badge: 'News',
      color: 'hover:border-sky-400 hover:bg-sky-50/50',
    },
    {
      name: 'Whatsapp',
      handle: 'DevConnect',
      description: 'Connect with software leaders, founders, and career opportunists.',
      url: 'https://chat.whatsapp.com/G5T3Q3CTMANIYAAgsWjqxB?s=cl&p=a&ilr=1',
      badge: 'Community',
      color: 'hover:border-blue-400 hover:bg-blue-50/50',
    },
    {
      name: 'YouTube',
      handle: 'DevConnect Studio',
      description: 'Watch video podcasts, community tech talks, and app feature demos.',
      url: 'https://youtube.com',
      badge: 'Media',
      color: 'hover:border-red-400 hover:bg-red-50/50',
    },
    {
      name: 'Reddit / Subreddit',
      handle: 'r/DevConnect',
      description: 'Participate in asynchronous Q&As, stack discussions, and feedback threads.',
      url: 'https://reddit.com',
      badge: 'Forum',
      color: 'hover:border-orange-400 hover:bg-orange-50/50',
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 sm:p-10 border-b border-slate-200">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
              Community Hub
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Connect Across Platforms
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

        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Introductory Highlight */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-emerald-950">
                Join the Online Ecosystem
              </h2>
              <p className="mt-1 text-sm text-emerald-900 leading-6 max-w-2xl">
                Stay connected beyond the core app. Follow our official channels for live events, product roadmaps, release announcements, and active peer discussions.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="shrink-0 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
            >
              Create Account
            </Link>
          </div>

          {/* Grid of Social Channels */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-200 ${item.color}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-current">
                      {item.badge}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 group-hover:text-current">
                      {item.handle}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-current">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600 group-hover:text-current/80">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 group-hover:text-current">
                  <span>Visit Channel</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </a>
            ))}
          </div>

          {/* Quick Notice */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-xs text-amber-900 leading-5">
            <span className="font-semibold">Official Channels Only:</span> Please be cautious of impersonators. All official DevConnect announcements and updates are distributed strictly through the channels listed on this page.
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