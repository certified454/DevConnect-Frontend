'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GuidelinesPage() {
  const router = useRouter();

  const guidelines = [
    {
      title: '1. Respect and Inclusivity',
      description:
        'Treat all community members with empathy and courtesy. We have zero tolerance for harassment, discrimination, hate speech, or personal attacks.',
    },
    {
      title: '2. Professional Collaboration',
      description:
        'Constructive feedback is welcomed and encouraged. Keep discussions productive, focus on code and architecture, and refrain from toxic behavior in public or private chats.',
    },
    {
      title: '3. Authentic Identity & Content',
      description:
        'Represent your skills and experience accurately. Do not impersonate other developers, brands, or entities. Ensure all content you share complies with intellectual property laws.',
    },
    {
      title: '4. No Spam or Aggressive Self-Promotion',
      description:
        'Share projects, tools, and links where relevant to conversations. Unsolicited cold DMs, repetitive promotional posts, or referral links without context are strictly prohibited.',
    },
    {
      title: '5. Data Protection & Security Practices',
      description:
        'Never post secrets, private keys, API credentials, or personally identifiable information (PII) belonging to yourself or others anywhere on the platform.',
    },
    {
      title: '6. Account Safety & Compliance',
      description:
        'Automated scraping, bot activity intended to manipulate rankings, or attempts to exploit platform API endpoints will result in an immediate account suspension.',
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
              DevConnect Standards
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Community Guidelines
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Close
          </button>
        </div>

        {/* Introduction */}
        <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
          <p className="text-sm leading-6 text-emerald-900 sm:text-base">
            DevConnect is designed to foster meaningful relationships, technical growth, and peer networking. By joining our platform, you agree to uphold these standards to keep the ecosystem productive, welcoming, and safe for everyone.
          </p>
        </div>

        {/* Guidelines List */}
        <div className="space-y-4">
          {guidelines.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-emerald-200 hover:bg-white"
            >
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Violation Notice */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <h3 className="text-sm font-semibold text-amber-900">Enforcement & Reporting</h3>
          <p className="mt-1 text-xs text-amber-800 leading-5">
            Violating these guidelines may result in content removal, temporary restrictions, or permanent account termination. If you encounter content or behavior that breaches these standards, please report it via the in-app menu or contact our moderation team.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p>Last updated: August 2026</p>
          <div className="flex gap-4">
            <Link href="/company/terms" className="hover:text-emerald-600 underline">
              Terms of Use
            </Link>
            <Link href="/company/privacy" className="hover:text-emerald-600 underline">
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}