'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from '@/components/ui/toast';

const languageOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C#', 'C++', 'C',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Rust', 'Scala', 'Elixir',
  'Haskell', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS', 'Shell', 'Bash',
  'PowerShell', 'Lua', 'Perl', 'Objective-C', 'Assembly', 'Groovy', 'F#',
  'Solidity', 'Julia', 'Zig', 'Elm', 'CoffeeScript', 'Fortran', 'Ada',
  'VHDL', 'Verilog',
];

const frameworkOptions = [
  'React', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'NestJS', 'Vue', 'Nuxt.js', 'Svelte', 'SvelteKit', 'Angular', 'Laravel',
  'Spring Boot', 'ASP.NET Core', 'Ruby on Rails', 'Phoenix', 'Gin', 'Beego',
  'Echo', 'Fiber', 'Actix', 'Rocket', 'Tauri', 'Electron', 'Flutter',
  'React Native', 'Expo', 'Qt', 'WinUI', 'GTK', 'Unity', 'Unreal Engine',
  'TensorFlow', 'PyTorch', 'Pandas', 'Scikit-learn', 'LangChain', 'OpenCV',
  'Tailwind CSS', 'Bootstrap', 'MUI', 'Chakra UI', 'shadcn/ui', 'Ant Design',
  'Bulma', 'Semantic UI', 'HTMX', 'Alpine.js', 'Stimulus', 'Remix', 'Astro',
  'Gatsby', 'Vite', 'Webpack', 'TurboRepo', 'Nx', 'Docker', 'Kubernetes',
  'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI',
  'CircleCI', 'AWS', 'Azure', 'GCP', 'Firebase', 'Supabase', 'Appwrite',
  'Prisma', 'Drizzle', 'TypeORM', 'Mongoose', 'SQLAlchemy', 'Hibernate',
  'GraphQL', 'gRPC', 'Kafka', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MySQL',
  'MongoDB', 'SQLite', 'Elasticsearch',
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

function getApiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('authToken') ??
    window.sessionStorage.getItem('authToken') ??
    window.localStorage.getItem('token') ??
    ''
  );
}

export default function UpdateAccountPage() {
  const router = useRouter();
  const toast = useToast();

  const apiBase = getApiBase();
  const currentUserUrl = `${apiBase}/api/auth/current-user`;
  const updateAccountUrl = `${apiBase}/api/auth/update-account`;

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [languageInput, setLanguageInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');

  const [existingUsername, setExistingUsername] = useState('');
  const [existingPhoneNumber, setExistingPhoneNumber] = useState('');

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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    fetch(currentUserUrl, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const u = data?.user ?? data;
        if (!u) return;

        setExistingUsername(u.username ?? '');
        setExistingPhoneNumber(u.phoneNumber ?? '');

        const langs: string[] = Array.isArray(u.languages)
          ? u.languages
          : Array.isArray(u.language)
            ? u.language
            : [];
        const fws: string[] = Array.isArray(u.frameworks)
          ? u.frameworks
          : Array.isArray(u.framework)
            ? u.framework
            : [];

        setSelectedLanguages(langs.slice(0, MAX_LANGUAGES));
        setSelectedFrameworks(fws.slice(0, MAX_FRAMEWORKS));

        const initialRatings: Record<string, number> = {};
        [...langs, ...fws].forEach((skill) => { initialRatings[skill] = 3; });
        setRatings(initialRatings);
      })
      .catch((err) => console.error('getCurrentUser error:', err))
      .finally(() => setLoadingProfile(false));
  }, [currentUserUrl, router]);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (selectedLanguages.length === 0 && selectedFrameworks.length === 0) {
      showToast('Action Required', 'Please add at least one language or framework.', 'error');
      return;
    }

    const token = getToken();
    if (!token) { router.push('/auth/signin'); return; }

    setIsLoading(true);
    try {
      const res = await fetch(updateAccountUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: existingUsername,
          phoneNumber: existingPhoneNumber,
          languages: selectedLanguages,
          frameworks: selectedFrameworks,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Update failed');
      }
      showToast('Successful', data?.message || 'Account updated successfully.', 'success');
      window.location.href = '/';
    } catch (err: any) {
      showToast('Failed', err?.message || 'Failed to update account.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefbf6_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Complete profile
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Add the languages and frameworks you work with so we can connect you with people who share your stack.
            </p>
          </div>
        </div>

        {loadingProfile ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
            Loading your profile...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
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

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
              <button type="button" onClick={() => router.push('/')} className="text-sm text-slate-600 hover:text-slate-800">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}