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

export default function ContactPage() {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      showToast('Action Required', 'Please complete all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to send message.');
      }

      showToast(
        'Message Sent',
        'Thank you for reaching out! We will get back to you shortly.',
        'success'
      );

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      showToast(
        'Submission Failed',
        error instanceof Error ? error.message : 'Unable to dispatch message.',
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
              Reach Out
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Contact Us
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
          
          {/* Left Column: Direct Contact Info */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <h2 className="text-base font-semibold text-slate-900">
                Direct Communication
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Have questions, general feedback, or need direct assistance? Send us a quick message or reach out via email.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-slate-800">support@devconnect.com</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Time</p>
                <p className="text-sm font-medium text-slate-800">Within 24–48 hours</p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <h3 className="text-sm font-semibold text-emerald-950">Looking for Partnerships?</h3>
              <p className="mt-1 text-xs text-emerald-900 leading-5">
                For sponsorship inquiries or corporate integrations, check our{' '}
                <Link
                  href="/community/support"
                  className="font-semibold text-emerald-700 underline hover:text-emerald-800"
                >
                  Partnership Hub
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                />
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
                    <span>Sending message...</span>
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Navigation */}
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