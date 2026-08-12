import Link from 'next/link';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export const metadata = {
  title: 'Privacy Policy — DevConnect',
  description:
    'DevConnect Privacy Policy. Learn how we collect, use, store, and protect your personal data and developer profile information.',
  openGraph: {
    title: 'DevConnect Privacy Policy',
    description: 'Data privacy principles, security standards, and user rights for DevConnect.',
    url: 'https://your-domain.com/company/privacy',
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - DevConnect',
    url: 'https://your-domain.com/company/privacy',
  };

  const sections = [
    {
      id: 'information-we-collect',
      num: '1',
      title: 'Information We Collect',
      lead: 'Depending on how you use DevConnect, we may collect several types of information:',
      subsections: [
        {
          heading: 'Account Information',
          bullets: [
            'Name and Username',
            'Email address',
            'Password or authentication credentials',
            'Profile photograph',
            'Developer profile information (biography, skills, and technologies)',
            'Other optional details added to your profile',
          ],
        },
        {
          heading: 'Content You Provide',
          bullets: [
            'Posts, questions, answers, and comments',
            'Code snippets and project information',
            'Images, videos, and uploaded materials',
            'Direct messages and live-stream content',
          ],
        },
        {
          heading: 'Technical & Usage Information',
          bullets: [
            'IP address and device type',
            'Browser type and operating system',
            'Application version and log information',
            'Approximate location derived from network details',
            'Platform usage metrics, diagnostics, and error reports',
          ],
        },
        {
          heading: 'Communications',
          bullets: [
            'Information provided when contacting DevConnect support or submitting requests.',
          ],
        },
      ],
    },
    {
      id: 'how-we-use-information',
      num: '2',
      title: 'How We Use Your Information',
      lead: 'We process collected information for the following operational and security purposes:',
      bullets: [
        'Creating and managing your account and authenticating logins.',
        'Providing platform features, developer profiles, and real-time interaction.',
        'Enabling direct communication, notifications, and live-streaming tools.',
        'Storing, rendering, and processing user-generated content.',
        'Improving system performance, features, and overall stability.',
        'Detecting and preventing fraud, abuse, spam, and technical security threats.',
        'Troubleshooting system issues and complying with legal obligations.',
      ],
    },
    {
      id: 'public-profile-information',
      num: '3',
      title: 'Public Profile Information',
      paragraphs: [
        'Information you add to your developer profile may be visible to other members or the public.',
        'Before publishing details on your profile, ensure you are comfortable making that information accessible to others.',
        'Do not publish sensitive personal data that you wish to keep private.',
      ],
    },
    {
      id: 'messages-and-private-content',
      num: '4',
      title: 'Messages and Private Content',
      paragraphs: [
        'DevConnect processes private messages and non-public communications strictly to deliver requested messaging features, ensure system security, prevent abuse, and satisfy legal obligations.',
        'Private communications are never treated as public profile content.',
      ],
    },
    {
      id: 'cookies-and-similar-technologies',
      num: '5',
      title: 'Cookies and Similar Technologies',
      lead: 'We use cookies, local storage, and session tokens to:',
      bullets: [
        'Keep your login session active and secure.',
        'Remember system preferences and application state.',
        'Analyze platform performance and usage trends.',
        'Protect accounts against unauthorized access or rate abuses.',
      ],
      extra: 'You can control or disable cookie storage through your device or browser settings.',
    },
    {
      id: 'how-we-share-information',
      num: '6',
      title: 'How We Share Information',
      lead: 'We do not sell your personal data. We only share information with trustworthy third-party infrastructure providers that facilitate platform operations, including:',
      bullets: [
        'Cloud hosting, database, and object storage providers.',
        'Authentication, security, and real-time communication services.',
        'Notification and diagnostic monitoring utilities.',
      ],
      extra: 'We may also disclose information when required by law, legal process, or to protect the safety and security of DevConnect and its users.',
    },
    {
      id: 'data-security',
      num: '7',
      title: 'Data Security',
      paragraphs: [
        'We implement strict technical and organizational measures to safeguard your information against unauthorized access, loss, misuse, or alteration.',
        'Protections include access controls, encryption, infrastructure monitoring, and authentication tokens.',
        'However, no web system can guarantee absolute security.',
      ],
    },
    {
      id: 'data-retention',
      num: '8',
      title: 'Data Retention',
      paragraphs: [
        'We retain information for as long as necessary to provide platform services, maintain your active account, comply with regulatory requirements, prevent abuse, and settle legal disputes.',
        'Retention timelines vary depending on the category of data.',
      ],
    },
    {
      id: 'your-privacy-rights',
      num: '9',
      title: 'Your Privacy Rights',
      lead: 'Depending on your location, you may exercise legal rights regarding your personal data, including:',
      bullets: [
        'Accessing a copy of your personal data.',
        'Correcting inaccuracies or updating profile details.',
        'Requesting account deletion or data erasure.',
        'Restricting or objecting to specific data processing activities.',
        'Withdrawing consent where processing relies on your approval.',
      ],
    },
    {
      id: 'account-deletion',
      num: '10',
      title: 'Account Deletion',
      paragraphs: [
        'You can request account deletion directly via account settings or by contacting our team.',
        'Upon account termination, certain data may be retained for legitimate legal compliance, audit, or fraud prevention requirements.',
      ],
    },
    {
      id: 'childrens-privacy',
      num: '11',
      title: "Children's Privacy",
      paragraphs: [
        'DevConnect is not intended for children in violation of applicable laws.',
        'If you suspect a child has provided unauthorized personal information, please contact us for immediate investigation and removal.',
      ],
    },
    {
      id: 'third-party-services',
      num: '12',
      title: 'Third-Party Services',
      paragraphs: [
        'DevConnect incorporates third-party authentication, hosting, database, and infrastructure providers. These services process data under their respective privacy policies and service agreements.',
      ],
    },
    {
      id: 'international-data-transfers',
      num: '13',
      title: 'International Data Transfers',
      paragraphs: [
        'Because DevConnect relies on global cloud networks, your data may be processed or stored on servers outside your country of residence under standard protection safeguards.',
      ],
    },
    {
      id: 'changes-to-this-privacy-policy',
      num: '14',
      title: 'Changes to This Privacy Policy',
      paragraphs: [
        'We may revise this policy periodically as our platform evolves. Material updates will be announced directly on the Platform alongside the updated effective date.',
      ],
    },
    {
      id: 'contact-us',
      num: '15',
      title: 'Contact Us',
      paragraphs: [
        'If you have questions, privacy concerns, or data requests, please reach out through our official platform communication channels.',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-12">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Privacy Policy
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            DevConnect Privacy Policy
          </h1>
          <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
            DevConnect respects your privacy and is committed to protecting the information you provide when using our platform. This policy outlines what data we collect, why we collect it, how we protect it, and your choices.
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 text-xs text-slate-500 sm:text-sm">
            <span>Last Updated: August 8, 2026</span>
            <span className="font-medium text-emerald-600">Effective</span>
          </div>
        </div>

        {/* Section List */}
        <div className="space-y-8">
          {sections.map((sec) => (
            <Box
              key={sec.id}
              id={sec.id}
              className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition hover:border-emerald-200/80 hover:shadow-md sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-sm font-bold text-emerald-800">
                  {sec.num}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {sec.title}
                </h2>
              </div>

              {sec.lead && (
                <Text className="mt-4 text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
                  {sec.lead}
                </Text>
              )}

              {sec.paragraphs && (
                <div className="mt-4 space-y-3">
                  {sec.paragraphs.map((p, idx) => (
                    <Text key={idx} className="text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
                      {p}
                    </Text>
                  ))}
                </div>
              )}

              {sec.subsections && (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {sec.subsections.map((sub, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                      <h3 className="text-base font-bold text-slate-900">{sub.heading}</h3>
                      <ul className="mt-3 space-y-2">
                        {sub.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-600 sm:text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {sec.bullets && (
                <ul className="mt-4 space-y-2.5 pl-2">
                  {sec.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 sm:text-base">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.extra && (
                <Text className="mt-4 border-l-2 border-emerald-500/40 pl-4 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                  {sec.extra}
                </Text>
              )}
            </Box>
          ))}

          {/* Bottom Acknowledgment Card */}
          <div className="mt-12 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900 to-slate-900 p-8 text-white shadow-xl sm:p-10">
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Privacy Engagement
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100/80 sm:text-base">
              By using DevConnect, you acknowledge that you have reviewed this Privacy Policy and understand how your information is handled.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/company/terms"
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                View Terms of Service
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}