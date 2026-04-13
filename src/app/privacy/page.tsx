import { PageShell } from "@/components/PageShell";

const LAST_UPDATED = "April 12, 2026";

const sections = [
  {
    title: "1. Who we are",
    content: `Lumia is an AI-powered productivity application operated by Oria Agency ("we", "our", "us"). Our website is getlumia.ca. If you have any questions about this policy, contact us at oria.agency.ai@gmail.com.`,
  },
  {
    title: "2. What data we collect",
    content: `We collect data you provide directly:
• Account information: email address, username, and password (hashed — we never store plaintext passwords).
• Profile data: display name, professional role, and tool preferences you set during onboarding.
• Content you upload: documents, files, and vault items stored in Lumia.
• Conversations: messages you exchange with Lumia AI, stored to enable conversation history.
• Payment data: billing information processed by Stripe — we never store raw card numbers.

We also collect data automatically:
• Usage data: features used, session duration, and error logs to improve the product.
• Device info: browser type, OS, and general geolocation (country/region level only).`,
  },
  {
    title: "3. How we use your data",
    content: `We use your data to:
• Provide and improve the Lumia service.
• Personalize your AI experience based on your role and preferences.
• Process payments and manage your subscription.
• Send product updates and important account notifications (you can opt out of marketing emails at any time).
• Detect abuse and enforce our Terms of Service.
• Comply with legal obligations.

We do not sell your data to third parties. We do not use your vault documents or conversations to train AI models.`,
  },
  {
    title: "4. Data storage and security",
    content: `Your data is stored in Supabase (hosted on AWS in the US). Vault documents and conversation history are stored in encrypted databases with row-level security — only you can access your own data.

We use industry-standard security practices: TLS in transit, encrypted storage at rest, and strict access controls. However, no system is 100% secure and we cannot guarantee absolute security.`,
  },
  {
    title: "5. Data sharing",
    content: `We share your data only with trusted sub-processors necessary to operate Lumia:
• Supabase — database and authentication infrastructure.
• Stripe — payment processing.
• Google (Gemini API) — AI inference for certain features.
• OpenAI — AI inference for certain features.
• Vercel — website hosting.
• n8n (self-hosted) — workflow automation.

Each sub-processor is bound by data processing agreements and applicable privacy law.`,
  },
  {
    title: "6. Cookies",
    content: `We use essential session cookies to keep you signed in. We do not use tracking or advertising cookies. You can clear cookies at any time in your browser settings — this will sign you out.`,
  },
  {
    title: "7. Your rights",
    content: `Depending on your location, you may have rights to:
• Access the personal data we hold about you.
• Request correction or deletion of your data.
• Object to or restrict certain processing.
• Data portability (receive your data in a machine-readable format).
• Withdraw consent at any time.

To exercise any of these rights, email oria.agency.ai@gmail.com. We'll respond within 30 days.`,
  },
  {
    title: "8. Data retention",
    content: `We retain your account data for as long as your account is active. If you delete your account, we permanently delete your personal data within 30 days, except where we're required to retain it by law (e.g. billing records for 7 years).`,
  },
  {
    title: "9. Children",
    content: `Lumia is not intended for users under 13 years old. We do not knowingly collect data from children. If you believe a child has provided us with personal data, contact us immediately.`,
  },
  {
    title: "10. Changes to this policy",
    content: `We may update this policy as the product evolves. We'll notify you by email and update the "Last updated" date above for material changes. Continued use of Lumia after changes constitutes acceptance.`,
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#567EFC" }}
          >
            Legal
          </p>
          <h1
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#0F0A1E", letterSpacing: "-0.5px" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-[#6B6480]">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-base text-[#6B6480] leading-relaxed">
            Your privacy matters to us. This policy explains what data Lumia collects,
            how we use it, and what rights you have over it. We keep it plain — no legal jargon.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl bg-white border p-7"
              style={{
                borderColor: "rgba(86,126,252,0.12)",
                boxShadow: "0 2px 24px rgba(86,126,252,0.06)",
              }}
            >
              <h2
                className="text-base font-bold mb-3"
                style={{ color: "#0F0A1E" }}
              >
                {section.title}
              </h2>
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: "#6B6480" }}
              >
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div
          className="mt-10 rounded-2xl p-7 text-center"
          style={{ background: "linear-gradient(135deg, #567EFC15, #EB5E5E10)" }}
        >
          <p className="text-sm font-semibold text-[#0F0A1E] mb-1">Questions about your privacy?</p>
          <p className="text-sm text-[#6B6480]">
            Email us at{" "}
            <a href="mailto:oria.agency.ai@gmail.com" className="text-[#567EFC] hover:underline">
              oria.agency.ai@gmail.com
            </a>{" "}
            — we respond within 2 business days.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
