import Link from 'next/link';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export const metadata = {
  title: 'Terms of Service — DevConnect',
  description:
    'Terms of service for DevConnect. Rules and guidelines for using the platform.',
  openGraph: {
    title: 'DevConnect Terms of Service',
    description: 'Platform rules, acceptable use, and legal terms for DevConnect users.',
    url: 'https://your-domain.com/company/terms',
  },
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service - DevConnect',
    url: 'https://your-domain.com/company/terms',
  };

  const sections = [
    {
      id: 'eligibility',
      num: '1',
      title: 'Eligibility',
      content:
        'To use certain features of the Platform, you must be at least 13 years of age (or the minimum age required in your jurisdiction). By using DevConnect, you represent and warrant that you have the legal capacity to enter into these Terms.',
    },
    {
      id: 'account-registration',
      num: '2',
      title: 'Account Registration',
      content:
        'To access key features, you must register for an account. You agree to provide accurate, current, and complete information and maintain its accuracy.',
      bullets: [
        'Providing accurate and up-to-date account information.',
        'Keeping your password and authentication credentials secure.',
        'Maintaining the security of your account and access tokens.',
        'Taking responsibility for all activity performed through your account.',
        'Immediately notifying DevConnect if you believe your account has been compromised.',
      ],
      extra:
        'You must not create an account using another person’s identity or impersonate another individual, developer, organization, or company. DevConnect reserves the right to suspend or terminate accounts that violate these Terms.',
    },
    {
      id: 'acceptable-use',
      num: '4',
      title: 'Acceptable Use',
      lead: 'You agree to use DevConnect responsibly and lawfully. You must not use the Platform to:',
      bullets: [
        'Harass, threaten, abuse, or intimidate other users.',
        'Discriminate against or target people based on protected characteristics.',
        'Publish malicious, fraudulent, or intentionally misleading content.',
        'Upload malware, viruses, ransomware, or other harmful software.',
        'Attempt to gain unauthorized access to another user’s account or data.',
        'Attempt to compromise DevConnect’s servers, APIs, databases, or infrastructure.',
        'Perform unauthorized security testing or attacks against the Platform.',
        'Spam users or distribute unsolicited promotional messages.',
        'Impersonate another person or organization.',
        'Share content that violates applicable laws.',
        'Distribute sexually explicit content where prohibited by the Platform or applicable law.',
        'Use DevConnect to facilitate illegal activities.',
        'Scrape, harvest, or collect user information without authorization.',
        'Circumvent security, rate limits, authentication, or other technical protections.',
      ],
    },
    {
      id: 'developer-content',
      num: '5',
      title: 'Developer Content',
      lead: 'Users may create and share content including posts, questions, answers, comments, code snippets, project information, images, videos, messages, live-stream content, and developer profiles.',
      paragraphs: [
        'You retain ownership of content that you create and submit to DevConnect. ',
        'By submitting content to DevConnect, you grant DevConnect a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, transmit, and technically process that content as necessary to operate, maintain, and improve the Platform. ',
        'This license does not transfer ownership of your intellectual property to DevConnect. ',
        'You are responsible for ensuring that you have the necessary rights and permissions for content you upload.',
      ],
    },
    {
      id: 'code-and-open-source',
      num: '6',
      title: 'Code and Open-Source Content',
      paragraphs: [
        'DevConnect may allow users to share source code and other technical materials. ',
        'You remain responsible for the licenses and permissions associated with code you upload. ',
        'Users should not assume that code shared on DevConnect is free to copy, modify, redistribute, or use commercially unless the applicable license or creator’s permission allows it.',
      ],
    },
    {
      id: 'messaging-and-communication',
      num: '7',
      title: 'Messaging and Communication',
      lead: 'DevConnect may provide direct messaging, group communication, comments, notifications, and real-time communication. You must use these features responsibly. Do not use messaging features to:',
      bullets: [
        'Harass users.',
        'Send spam.',
        'Conduct scams or fraud.',
        'Distribute malware.',
        'Attempt to obtain another person’s credentials.',
        'Send unlawful or abusive content.',
      ],
      extra: 'DevConnect may take appropriate action when violations are reported or detected.',
    },
    {
      id: 'live-streaming',
      num: '8',
      title: 'Live Streaming',
      lead: 'Where live-streaming is available, streamers are responsible for the content they broadcast. You must not use DevConnect live streams to distribute:',
      bullets: [
        'Illegal content.',
        'Malware or malicious code.',
        'Harassment or threats.',
        'Fraudulent schemes.',
        'Content that violates the rights of others.',
        'Content that violates applicable laws.',
      ],
      extra: 'DevConnect may stop, restrict, or remove streams that violate these Terms.',
    },
    {
      id: 'user-safety-and-reporting',
      num: '9',
      title: 'User Safety and Reporting',
      paragraphs: [
        'If you encounter content or behavior that violates these Terms, you may report it through the reporting mechanisms provided by DevConnect. ',
        'DevConnect may investigate reports and take appropriate action, including removing content, restricting features, suspending accounts, or terminating accounts.',
      ],
    },
    {
      id: 'intellectual-property',
      num: '10',
      title: 'Intellectual Property',
      paragraphs: [
        'The DevConnect name, logo, branding, software, interface, design, documentation, and other original Platform materials are owned by DevConnect or its licensors unless otherwise stated. ',
        'You may not copy, modify, distribute, sell, or commercially exploit DevConnect’s proprietary materials without appropriate authorization.',
      ],
    },
    {
      id: 'third-party-services',
      num: '11',
      title: 'Third-Party Services',
      paragraphs: [
        'DevConnect may integrate with third-party services such as authentication providers, cloud storage providers, payment providers, analytics services, communication services, or other external platforms. ',
        'Your use of those services may be subject to their own terms and privacy policies. ',
        'DevConnect is not responsible for the independent practices or availability of third-party services.',
      ],
    },
    {
      id: 'platform-availability',
      num: '12',
      title: 'Platform Availability',
      lead: 'We aim to keep DevConnect available and reliable, but we do not guarantee that the Platform will always be:',
      bullets: [
        'Available',
        'Error-free',
        'Secure',
        'Uninterrupted',
        'Free from bugs or technical problems',
      ],
      extra: 'DevConnect may temporarily suspend services for maintenance, upgrades, security issues, or other operational reasons.',
    },
    {
      id: 'security',
      num: '13',
      title: 'Security',
      paragraphs: [
        'We take reasonable measures to protect the Platform and user information. ',
        'However, no internet service can guarantee absolute security. You acknowledge that using an online platform involves certain security risks.',
      ],
    },
    {
      id: 'account-suspension-and-termination',
      num: '14',
      title: 'Account Suspension and Termination',
      lead: 'DevConnect may suspend or terminate your account if:',
      bullets: [
        'You violate these Terms.',
        'You engage in fraudulent or harmful behavior.',
        'Your activity threatens the security of the Platform or its users.',
        'Required by applicable law.',
        'Your account is involved in abuse or misuse of the Platform.',
      ],
      extra: 'You may stop using DevConnect at any time. Where appropriate, we may provide notice before taking action, but we may act immediately when necessary to protect users, the Platform, or comply with legal obligations.',
    },
    {
      id: 'disclaimer',
      num: '15',
      title: 'Disclaimer',
      paragraphs: [
        'DevConnect is provided on an “as is” and “as available” basis to the extent permitted by law. ',
        'We do not guarantee that information shared by users is accurate, complete, reliable, or suitable for your particular situation. ',
        'Technical advice, code, recommendations, and other user-generated information should be independently reviewed before being used in production systems.',
      ],
    },
    {
      id: 'limitation-of-liability',
      num: '16',
      title: 'Limitation of Liability',
      paragraphs: [
        'To the maximum extent permitted by applicable law, DevConnect and its developers, operators, contributors, and service providers will not be responsible for indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. ',
        'Nothing in these Terms excludes liability that cannot legally be excluded under applicable law.',
      ],
    },
    {
      id: 'changes-to-these-terms',
      num: '17',
      title: 'Changes to These Terms',
      paragraphs: [
        'We may update these Terms as DevConnect evolves. ',
        'When significant changes are made, we may provide notice through the Platform or other appropriate means. ',
        'Your continued use of DevConnect after the updated Terms become effective constitutes acceptance of the revised Terms. ',
      ],
    },
    {
      id: 'governing-law',
      num: '18',
      title: 'Governing Law',
      paragraphs: [
        'These Terms will be interpreted according to applicable laws and regulations governing DevConnect and its users. ',
        'Where required, disputes will be handled by the courts or dispute-resolution mechanisms having appropriate jurisdiction.',
      ],
    },
    {
      id: 'contact',
      num: '19',
      title: 'Contact',
      paragraphs: [
        'If you have questions, concerns, or complaints regarding these Terms, please contact the DevConnect team through the official contact channel provided on the Platform.',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        {/* Header Hero Section */}
        <div className="mb-10 overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-12">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Terms Of Use
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            DevConnect Terms of Service
          </h1>
          <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
            Welcome to DevConnect. These Terms of Service (<strong className="text-slate-900">“Terms”</strong>) govern your access to and use of the DevConnect platform, including our website, mobile applications, APIs, communication features, posts, notifications, live-streaming features, and other services we provide collectively (<strong className="text-slate-900">“The Platform”</strong>).
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 text-xs text-slate-500 sm:text-sm">
            <span>Last updated: August 2026</span>
            <span className="font-medium text-emerald-600">Effective Immediately</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="space-y-8 lg:col-span-12">
            {sections.map((section) => (
              <Box
                key={section.id}
                id={section.id}
                className="group rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition hover:border-emerald-200/80 hover:shadow-md sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-sm font-bold text-emerald-800">
                    {section.num}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {section.title}
                  </h2>
                </div>

                {section.lead && (
                  <Text className="mt-4 text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
                    {section.lead}
                  </Text>
                )}

                {section.content && (
                  <Text className="mt-4 text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
                    {section.content}
                  </Text>
                )}

                {section.paragraphs && (
                  <div className="mt-4 space-y-3">
                    {section.paragraphs.map((p, idx) => (
                      <Text
                        key={idx}
                        className="text-sm font-normal leading-relaxed text-slate-600 sm:text-base"
                      >
                        {p}
                      </Text>
                    ))}
                  </div>
                )}

                {section.bullets && (
                  <ul className="mt-4 space-y-2.5 pl-2">
                    {section.bullets.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 sm:text-base">
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.extra && (
                  <Text className="mt-4 border-l-2 border-emerald-500/40 pl-4 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                    {section.extra}
                  </Text>
                )}
              </Box>
            ))}

            {/* Footer Acknowledgment Card */}
            <div className="mt-12 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900 to-slate-900 p-8 text-white shadow-xl sm:p-10">
              <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Acknowledgment
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100/80 sm:text-base">
                By using DevConnect, you acknowledge that you have read, understood, and agreed to these Terms of Service.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                  Accept & Continue
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
      </div>
    </main>
  );
}