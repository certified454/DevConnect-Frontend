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

export default function SupportPage() {
  const router = useRouter();
  const toast = useToast();

  const [inquiryType, setInquiryType] = useState<
    'support' | 'partnership' | 'sponsorship'
  >('support');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
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
      showToast('Action Required', 'Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryType,
          name,
          email,
          organization,
          subject,
          message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit request.');
      }

      showToast(
        'Message Sent',
        'Thank you for reaching out! We will get back to you shortly.',
        'success'
      );

      // Reset form
      setName('');
      setEmail('');
      setOrganization('');
      setSubject('');
      setMessage('');
    } catch (error) {
      showToast(
        'Submission Failed',
        error instanceof Error ? error.message : 'Unable to send message.',
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
              Get in Touch
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Support & Partnerships
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
          
          {/* Left Column: Quick Cards & Infos */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <h2 className="text-base font-semibold text-emerald-950">
                Partner & Sponsor DevConnect
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                Are you looking to host developer events, sponsor hackathons, or integrate your engineering tools with our community? Let’s collaborate!
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Need Help with Your Account?
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-5">
                For login issues, verification help, or bug reports, select <strong>General Support</strong> in the form and detail your request.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Community Guidelines
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-5">
                Ensure all communications adhere to our community principles.{' '}
                <Link
                  href="/community/guideline"
                  className="font-medium text-emerald-600 underline hover:text-emerald-700"
                >
                  Read Guidelines
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Inquiry Type Selector Tabs */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Inquiry Type
                </label>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
                  {(['support', 'partnership', 'sponsorship'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInquiryType(type)}
                      className={`rounded-xl py-2 text-xs font-semibold capitalize transition ${
                        inquiryType === type
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
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
                    placeholder="alex@company.com"
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {(inquiryType === 'partnership' || inquiryType === 'sponsorship') && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Organization / Company Name
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Acme Corp or Community Name"
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    inquiryType === 'sponsorship'
                      ? 'Event Sponsorship Proposal'
                      : inquiryType === 'partnership'
                        ? 'Integration Partnership Idea'
                        : 'Help with account verification'
                  }
                  className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us a bit about your goals, proposal, or support needs..."
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