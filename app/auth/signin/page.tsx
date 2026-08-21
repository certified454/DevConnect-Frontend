'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Toast, 
  ToastDescription, 
  ToastTitle,
  useToast
} from '@/components/ui/toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const toast = useToast();

  const router = useRouter();

  // API URL targeting backend route
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const signURL = `${apiBaseUrl}/api/auth/login`;

  // Function to display toast notifications
  const showToast = (title: string, message: string, action: 'success' | 'error') => {
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
          <ToastTitle className={`text-sm font-semibold ${
            action === 'success' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {title}
          </ToastTitle>
          <ToastDescription className="text-xs opacity-90">{message}</ToastDescription>
        </Toast>
      ),
      placement: 'top',
      duration: 5000,
    });
  };

  // Handle form submission for sign-in
  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(signURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMessage = data?.message || "Login failed. Please check your credentials.";
        showToast('Login Failed', errorMessage, 'error');
        return;
      }

      // Store auth token depending on 'Remember Me' preference
      if (data?.token) {
        if (rememberMe) {
          localStorage.setItem('authToken', data.token);
        } else {
          sessionStorage.setItem('authToken', data.token);
        }
      }

      showToast('Successful', data?.message || 'Signed in successfully.', 'success');
      
      router.push('/');
      router.refresh();
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Unable to connect to server. Please try again.';
      showToast('Connection Error', errMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:flex-row">
        <section className="bg-slate-950 p-8 text-white lg:w-[44%] lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
            DevConnect
          </div>

          <h1 className="mt-6 text-2xl font-semibold leading-tight sm:text-4xl">
            Welcome back to your next big connection
          </h1>

          <div className="mt-6 space-y-3">
            {[
              'Fresh opportunities shared daily',
              'Real conversations with builders',
              'And a smarter way to connect',
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
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Sign in
              </p>
              <h2 className="mt-2 text-1xl md:text-2xl font-semibold text-slate-900 sm:text-3xl">
                Access your account
              </h2>
            </div>
            <Link href="/" className="inline-flex mt-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
              Back home
            </Link>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
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
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Remember me
              </label>
              <a href="#" className="font-medium text-emerald-600 transition hover:text-emerald-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? (
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
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Need to verify your account?</p>
            <p>
              If you already created an account but did not verify it,{' '}
              <Link href="/auth/verify" className="font-semibold text-emerald-600 transition hover:text-emerald-700">
                click here to verify
              </Link>
              .
            </p>
          </div>

          <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or continue with</span>
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
            New here?{' '}
            <Link href="/auth/signup" className="font-semibold text-emerald-600 transition hover:text-emerald-700">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}