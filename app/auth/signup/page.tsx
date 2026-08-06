'use client';

import Link from 'next/link';
import { useState } from 'react';

const languageOptions = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'C#',
  'C++',
  'C',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Dart',
  'Rust',
  'Scala',
  'Elixir',
  'Haskell',
  'R',
  'MATLAB',
  'SQL',
  'HTML',
  'CSS',
  'Shell',
  'Bash',
  'PowerShell',
  'Lua',
  'Perl',
  'Objective-C',
  'Assembly',
  'Groovy',
  'F#',
  'Solidity',
  'Julia',
  'Zig',
  'Elm',
  'CoffeeScript',
  'Fortran',
  'Ada',
  'VHDL',
  'Verilog',
];

const frameworkOptions = [
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'Django',
  'Flask',
  'FastAPI',
  'NestJS',
  'Vue',
  'Nuxt.js',
  'Svelte',
  'SvelteKit',
  'Angular',
  'Laravel',
  'Spring Boot',
  'ASP.NET Core',
  'Ruby on Rails',
  'Phoenix',
  'Gin',
  'Beego',
  'Echo',
  'Fiber',
  'Actix',
  'Rocket',
  'Tauri',
  'Electron',
  'Flutter',
  'React Native',
  'Expo',
  'Qt',
  'WinUI',
  'GTK',
  'Unity',
  'Unreal Engine',
  'TensorFlow',
  'PyTorch',
  'Pandas',
  'Scikit-learn',
  'LangChain',
  'OpenCV',
  'Tailwind CSS',
  'Bootstrap',
  'MUI',
  'Chakra UI',
  'shadcn/ui',
  'Ant Design',
  'Bulma',
  'Semantic UI',
  'HTMX',
  'Alpine.js',
  'Stimulus',
  'Remix',
  'Astro',
  'Gatsby',
  'Vite',
  'Webpack',
  'TurboRepo',
  'Nx',
  'Docker',
  'Kubernetes',
  'Terraform',
  'Ansible',
  'Jenkins',
  'GitHub Actions',
  'GitLab CI',
  'CircleCI',
  'AWS',
  'Azure',
  'GCP',
  'Firebase',
  'Supabase',
  'Appwrite',
  'Prisma',
  'Drizzle',
  'TypeORM',
  'Mongoose',
  'SQLAlchemy',
  'Hibernate',
  'GraphQL',
  'gRPC',
  'Kafka',
  'RabbitMQ',
  'Redis',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'SQLite',
  'Elasticsearch',
];

const MAX_LANGUAGES = 5;
const MAX_FRAMEWORKS = 8;
const ratingLabels: Record<number, string> = {
  1: 'Learning',
  2: 'Beginner',
  3: 'Comfortable',
  4: 'Strong',
  5: 'Expert',
};

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [languageInput, setLanguageInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');

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

  const updateRating = (skill: string, value: number) => {
    setRatings((prev) => ({ ...prev, [skill]: value }));
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

  const renderSkillSelector = (
    options: string[],
    value: string,
    onChange: (value: string) => void,
    onAdd: () => void,
    selectedItems: string[],
    limit: number,
    onRemove: (value: string) => void
  ) => (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
        >
          <option value="">Select one...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Add
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {selectedItems.length}/{limit} selected
      </p>

      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700">
            <span>{item}</span>
            <button type="button" onClick={() => onRemove(item)} className="text-xs text-slate-500 hover:text-emerald-700">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSelectedSkills = (selectedItems: string[]) =>
    selectedItems.map((item) => (
      <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">{item}</p>
            <p className="text-xs text-slate-500">{ratingLabels[ratings[item] ?? 3]} proficiency</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {ratings[item] ?? 3}/5
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={ratings[item] ?? 3}
          onChange={(e) => updateRating(item, Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600"
        />
      </div>
    ));

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

          <form className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="sightertech"
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
              <label htmlFor="signup-phone" className="mb-2 block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 812 345 6789"
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
                    <span className="font-bold md:text-lg text-sm">Recommended:</span> fill the signup form manually so we can connect you with people who share your stack and skills.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Languages you know</p>
                  {renderSkillSelector(
                    languageOptions,
                    languageInput,
                    setLanguageInput,
                    () => addSkill(languageInput, selectedLanguages, setSelectedLanguages, MAX_LANGUAGES, setLanguageInput),
                    selectedLanguages,
                    MAX_LANGUAGES,
                    (value) => removeSkill(value, selectedLanguages, setSelectedLanguages)
                  )}
                  <div className="mt-3 space-y-2">{renderSelectedSkills(selectedLanguages)}</div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Frameworks and tools</p>
                  {renderSkillSelector(
                    frameworkOptions,
                    frameworkInput,
                    setFrameworkInput,
                    () => addSkill(frameworkInput, selectedFrameworks, setSelectedFrameworks, MAX_FRAMEWORKS, setFrameworkInput),
                    selectedFrameworks,
                    MAX_FRAMEWORKS,
                    (value) => removeSkill(value, selectedFrameworks, setSelectedFrameworks)
                  )}
                  <div className="mt-3 space-y-2">{renderSelectedSkills(selectedFrameworks)}</div>
                </div>
              </div>
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
