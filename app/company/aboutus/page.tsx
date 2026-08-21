import Link from 'next/link';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export const metadata = {
  title: 'About Us — DevConnect',
  description:
    'Learn about DevConnect, the developer ecosystem built for real-time collaboration, knowledge sharing, live audio, and community growth.',
  openGraph: {
    title: 'About DevConnect — Empowering Global Developers',
    description:
      'Connecting software engineers, designers, and creators with live streaming, real-time communication, and collaborative tools.',
    url: 'https://your-domain.com/company/about',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About DevConnect',
    url: 'https://your-domain.com/company/about',
    description:
      'DevConnect is a real-time developer platform providing community discussion, code sharing, live audio spaces, and collaborative developer networking.',
  };

  const values = [
    {
      title: 'Community First',
      description:
        'We build for developers, engineers, and technological creators. Every feature is designed to reduce friction and encourage meaningful technical collaboration.',
    },
    {
      title: 'Open Knowledge',
      description:
        'Solving complex bugs and architecting systems is easier together. We believe technical insight should be accessible, peer-reviewed, and open for discovery.',
    },
    {
      title: 'Real-Time Engagement',
      description:
        'Asynchronous posts are great, but live problem solving is faster. DevConnect bridges the gap with integrated real-time text, voice, and live video channels.',
    },
    {
      title: 'Platform Integrity',
      description:
        'We enforce strict safety and acceptable use policies to maintain a respectful, harassment-free environment focused on genuine engineering growth.',
    },
  ];

  const features = [
    {
      tag: 'Hangout & Live Stream',
      title: 'Interactive Live Spaces',
      desc: 'Host screen-share sessions, real-time code reviews, and live audio hangouts directly inside your browser.',
    },
    {
      tag: 'Knowledge Base',
      title: 'Topics & Discussions',
      desc: 'Ask questions, publish architecture breakdowns, share code snippets, and engage with community answer threads.',
    },
    {
      tag: 'Global Network',
      title: 'Developer Profiles & Connect',
      desc: 'Showcase your tech stack, link repositories, highlight open-source contributions, and message peers directly.',
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl space-y-12">
        {/* Hero Section */}
        <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-12">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            About DevConnect
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Empowering developers to connect, build, and share live.
          </h1>
          <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
            DevConnect is a unified developer platform designed to unify community discussion, code sharing, interactive spaces, and live technical collaboration into one seamless web ecosystem.
          </p>
        </div>

        {/* Mission Statement */}
        <Box className="rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Our Mission
          </h2>
          <Text className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
            Software development thrives on continuous peer learning. Traditional developer forums are often slow or isolated, while social networks lack code-native features. DevConnect merges real-time communication tools—such as voice, live screen shares, code blocks, and structured topic discussions—into a single space tailored specifically for developers.
          </Text>
        </Box>

        {/* Core Pillars / Values */}
        <div>
          <h2 className="mb-6 px-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {values.map((item, idx) => (
              <Box
                key={idx}
                className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition hover:border-emerald-200"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-800">
                  0{idx + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <Text className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {item.description}
                </Text>
              </Box>
            ))}
          </div>
        </div>

        {/* Key Platform Features */}
        <div className="rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Built for Modern Engineering Workflows
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6 transition hover:bg-slate-50"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  {feat.tag}
                </span>
                <h4 className="mt-2 text-lg font-bold text-slate-900">{feat.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900 to-slate-900 p-8 text-white shadow-xl sm:p-10">
          <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to join the community?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-emerald-100/80 sm:text-base">
            Create your account today to start sharing code, joining live hangouts, and networking with developers around the globe.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              Get Started
            </Link>
            <Link
              href="/company/terms"
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              View Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}