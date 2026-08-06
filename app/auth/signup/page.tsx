'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_33%),linear-gradient(135deg,_#f8fafc_0%,_#f0fdf4_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:flex-row">
        <section className="bg-slate-950 p-8 text-white lg:w-[44%] lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300">
            Join the circle
          </div>

          <h1 className="mt-6 md:text-3xl text-1xl font-semibold leading-tight sm:text-4xl">
            Create your DevConnect identity.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            Start your journey with a vibrant community of builders, mentors, and founders who genuinely care about growth and collaboration.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Build your professional profile',
              'Share ideas with real developers',
              'Stay inspired by meaningful conversations and hangouts',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Sign up
              </p>
              <h2 className="mt-2 md:text-2xl text-1xl font-semibold text-slate-900 sm:text-3xl">
                Create your account
              </h2>
            </div>
            <Link href="/" className="text-sm font-medium text-slate-500 transition mt-6 hover:text-emerald-600">
              Back home
            </Link>
          </div>

          <form className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sighter tech"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="signup-password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-sm font-medium text-emerald-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span>I agree to the community guidelines and privacy policy.</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Create account
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or join with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
              Google
            </button>
            <button type="button" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
              GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-emerald-600 transition hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
