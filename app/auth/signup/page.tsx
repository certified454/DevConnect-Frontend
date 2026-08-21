'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { COUNTRIES, type Country } from '@/lib/countries';

export default function SignUpPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [country, setCountry] = useState<Country>(
    COUNTRIES.find((item) => item.code === 'US') ?? COUNTRIES[0]
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const signupUrl = `${apiBaseUrl}/api/auth/register`;

  const addSkill = (
    value: string,
    list: string[],
    setter: (value: string[]) => void,
    max: number,
    setInput: (value: string) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed || list.includes(trimmed) || list.length >= max) return;
    setter([...list, trimmed]);
    setInput('');
  };

  const removeSkill = (value: string, list: string[], setter: (value: string[]) => void) => {
    setter(list.filter((item) => item !== value));
  };

  const handleUsernameChange = (value: string) => {
    const cleaned = value.trim().replace(/^@+/, '');
    setUsername(`@${cleaned}`);
  };

  const getPasswordStrength = (value: string) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  };

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Unable to convert file to base64.'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsDataURL(file);
    });

  const handleProfilePicPick = async () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64String = await convertFileToBase64(file);
      setProfilePic(base64String);
    } catch (error) {
      showToast(
        'Failed',
        error instanceof Error ? error.message : 'Unable to process the selected image.',
        'error'
      );
    }
  };

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
          <ToastTitle className={`text-sl font-semibold ${
            action === 'success' ? 'text-emerald-400' : 'text-red-400'
          }`}>{title}</ToastTitle>
          <ToastDescription className="text-xs opacity-90">{message}</ToastDescription>
        </Toast>
      ),
      placement: 'top',
      duration: 5000,
    });
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor =
    passwordStrength <= 1
      ? 'bg-red-500'
      : passwordStrength === 2
        ? 'bg-amber-500'
        : passwordStrength === 3
          ? 'bg-emerald-500'
          : 'bg-emerald-600';
  const strengthLabel =
    passwordStrength <= 1
      ? 'Weak'
      : passwordStrength === 2
        ? 'Fair'
        : passwordStrength === 3
          ? 'Good'
          : 'Strong';

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      showToast('Action Required', 'You must accept the Terms of Use and Privacy Policy to continue.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          phoneNumber: `${country.dialCode}${phone.replace(/\D/g, '')}`,
          country,
          profilePic,
          password,
          confirmPassword,
          acceptedTerms,
        }),
      });

      const contentType = res.headers.get('content-type') ?? '';
      const data =
        contentType.includes('application/json') && res.status !== 204
          ? await res.json()
          : null;

      if (!res.ok) {
        const message =
          data?.message ||
          (await res.text()) ||
          'Signup failed with an unexpected response.';
        showToast('Failed', message, 'error');
        return;
      }

      showToast(
        'Successful',
        data?.message || 'Account created successfully. Check your email for the verification code.',
        'success'
      );
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      showToast(
        'Failed',
        error instanceof Error
          ? error.message
          : 'Unable to reach signup endpoint.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
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
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Sign up
              </p>
              <h2 className="mt-2 md:text-2xl text-1xl font-semibold text-slate-900 sm:text-3xl">
                Create your account
              </h2>
            </div>
            <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
              Back home
            </Link>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Profile Picture Picker & Live Preview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Profile picture
              </label>
              <div className="flex flex-row gap-3 sm:flex-row sm:items-center">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-slate-200 flex items-center justify-center text-slate-400">
                  {profilePic ? (
                    <img src={profilePic} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-center text-slate-400">Profile here</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-3 ml-3">
                  <button
                    type="button"
                    onClick={handleProfilePicPick}
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Select profile picture
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="@yourexample"
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

            {/* Country Selector */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="country" className="mb-2 block text-sm font-medium text-slate-700">
                Country
              </label>
              <select
                id="country"
                value={country.code}
                onChange={(e) => {
                  const selectedCountry = COUNTRIES.find((item) => item.code === e.target.value);
                  if (selectedCountry) {
                    setCountry(selectedCountry);
                  }
                }}
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none"
              >
                {COUNTRIES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} ({item.dialCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="signup-phone" className="mb-2 block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-2xl bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-600">
                  {country.dialCode}
                </span>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s()-]/g, ''))}
                  placeholder="456-789-0123"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
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
              {password ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                    <div className={`h-1.5 rounded-full transition-all ${strengthColor}`} style={{ width: `${(passwordStrength / 4) * 100}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{strengthLabel}</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mt-1 text-sm text-emerald-700">
                    <span className="font-bold md:text-lg text-sm">Recommended:</span> You can add your languages and frameworks later on your profile to join hangouts.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms of Use & Privacy Policy Agreement */}
            <label htmlFor="terms" className="flex items-start gap-3 cursor-pointer text-sm text-slate-600">
              <input
                id="terms"
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                I have read and agree to the{' '}
                <Link href="/terms" target="_blank" className="font-semibold text-emerald-600 underline hover:text-emerald-700">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="font-semibold text-emerald-600 underline hover:text-emerald-700">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !acceptedTerms}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
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