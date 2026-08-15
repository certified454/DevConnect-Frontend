'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FAQItem {
  question: string;
  answer: string;
}

type CategoryKey = 'general' | 'account' | 'posts' | 'technical';

const faqCategories: Record<
  CategoryKey,
  { label: string; items: FAQItem[] }
> = {
  general: {
    label: 'General',
    items: [
      {
        question: 'What is DevConnect?',
        answer:
          'DevConnect is a dedicated social and networking platform for developers, software engineers, and tech creators to share projects, collaborate on ideas, and connect with peers globally.',
      },
      {
        question: 'Is DevConnect free to use?',
        answer:
          'Yes, DevConnect is completely free to join. You can publish posts, share code snippets, engage in technical discussions, and join live coding challnage and stand a chance to win gift card.',
      },
      {
        question: 'Who can join the platform?',
        answer:
          'Anyone passionate about software, design, and tech—whether you are a beginner learning to code, an open-source contributor, or a seasoned lead engineer.',
      },
    ],
  },
  account: {
    label: 'Account',
    items: [
      {
        question: 'How do I verify my account?',
        answer:
          'Upon signing up, a verification email is dispatched to your inbox. Click the link provided in that email to confirm your address and activate full posting features. Note: If you do not receive the email, check your spam folder or request a resend from the account settings page.',
      },
      {
        question: 'How can I reset my password?',
        answer:
          'Go to the Sign In page and select "Forgot password?". Enter your email address to receive secure reset instructions.',
      },
      {
        question: 'How is my personal data secured?',
        answer:
          'We utilize standard end-to-end encryption and JWT token authentication protocols to protect user data and maintain session integrity across the platform.',
      },
    ],
  },
  posts: {
    label: 'Posting',
    items: [
      {
        question: 'How do I publish a new post or topic?',
        answer:
          'Click the "Create Topic" button located on the navigation bar. You can add title, description, and tech tags prior to publishing. Once submitted, your post will be visible to the community.',
      },
      {
        question: 'Can I edit or delete my content later?',
        answer:
          'Yes, you retain full control over your content. Click the action menu (...) on any of your posts to edit the text or permanently delete the entry.',
      },
    ],
  },
  technical: {
    label: 'Technical',
    items: [
      {
        question: 'What should I do if I see a "Connection Error"?',
        answer:
          'Connection warnings usually result from temporary network drops or server breakdowns. Verify your internet connection and refresh the browser window.',
      },
      {
        question: 'Where can I report platform bugs or UI glitches?',
        answer:
          'You can report any bugs directly through our Support form or submit an issue on our official community repository.',
      },
    ],
  },
};

export default function FAQPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('general');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 sm:p-10 border-b border-slate-200">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
              Knowledge Base
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Frequently Asked Questions
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
          
          {/* Left Column: Side Info Cards */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <h2 className="text-base font-semibold text-emerald-950">
                Have Specific Questions?
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                Can’t find what you’re looking for? Reach out to our team directly for account assistance, partnerships, or sponsorships.
              </p>
              <div className="mt-4">
                <Link
                  href="/company/support"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Community Standards
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-5">
                We expect all builders to maintain respectful discourse.{' '}
                <Link
                  href="/community/guideline"
                  className="font-medium text-emerald-600 underline hover:text-emerald-700"
                >
                  Read Community Guidelines
                </Link>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Privacy & Data Policies
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-5">
                Learn how your information is handled in our{' '}
                <Link
                  href="/company/privacy"
                  className="font-medium text-emerald-600 underline hover:text-emerald-700"
                >
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>

          {/* Right Column: Category Selector & Accordion */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category Selector Tabs */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Topic
              </label>
              <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
                {(Object.keys(faqCategories) as CategoryKey[]).map((catKey) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setActiveCategory(catKey);
                      setOpenIndex(0); // auto-open first item in new tab
                    }}
                    className={`rounded-xl py-2 text-xs font-semibold capitalize transition ${
                      activeCategory === catKey
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {faqCategories[catKey].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {faqCategories[activeCategory].items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 transition overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(index)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-100/60"
                    >
                      <span className="text-sm font-semibold text-slate-900 pr-2">
                        {item.question}
                      </span>
                      <span className="text-emerald-600 text-lg font-bold select-none">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-200/60 px-5 py-4 text-xs text-slate-600 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Footer Link Options */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-10 py-6 border-t border-slate-200 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DevConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/company/terms" className="hover:text-emerald-600 underline">
              Terms of Use
            </Link>
            <Link href="/company/privacy" className="hover:text-emerald-600 underline">
              Privacy Policy
            </Link>
            <Link href="/community/guideline" className="hover:text-emerald-600 underline">
              Guidelines
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}