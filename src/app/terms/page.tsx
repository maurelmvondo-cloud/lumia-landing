import { PageShell } from "@/components/PageShell";

const LAST_UPDATED = "April 12, 2026";

const sections = [
  {
    title: "1. Acceptance of terms",
    content: `By accessing or using Lumia ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not use the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By creating an account, you confirm that you are at least 13 years old and have the legal capacity to enter into this agreement.`,
  },
  {
    title: "2. Description of service",
    content: `Lumia is an AI-powered productivity assistant that helps you work across multiple AI models, manage documents in a personal Vault, and automate workflows. The Service is provided by Oria Agency and is accessible at getlumia.ca and through native macOS and iOS apps.`,
  },
  {
    title: "3. Account registration",
    content: `You must create an account to use most features of Lumia. You agree to:
• Provide accurate and complete information during registration.
• Choose a unique username that does not impersonate another person or entity.
• Keep your password secure and not share your account credentials.
• Notify us immediately at oria.agency.ai@gmail.com if you suspect unauthorized access to your account.

You are responsible for all activity that occurs under your account.`,
  },
  {
    title: "4. Subscriptions and billing",
    content: `Lumia offers the following plans:
• Free: Limited access with a prompt quota.
• Early Access Monthly: $10 USD/month — unlimited access.
• Founding Member (Lifetime): $99 USD one-time — permanent unlimited access.

Payments are processed by Stripe. By subscribing, you authorize us to charge your payment method on the applicable billing cycle. All prices are in USD and exclude applicable taxes.

Monthly subscriptions auto-renew until cancelled. You can cancel at any time from your account settings — cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods.

Lifetime purchases are non-refundable after 14 days from purchase.`,
  },
  {
    title: "5. Acceptable use",
    content: `You agree not to use Lumia to:
• Violate any applicable law or regulation.
• Upload content that is illegal, harmful, threatening, abusive, defamatory, or infringes third-party rights.
• Attempt to reverse-engineer, decompile, or extract the source code of the Service.
• Use automated scripts to scrape, crawl, or excessively query the Service.
• Resell or sublicense access to the Service without our written consent.
• Upload malware or attempt to compromise the security of the platform.

We reserve the right to suspend or terminate accounts that violate these rules without notice.`,
  },
  {
    title: "6. Content ownership",
    content: `You retain full ownership of all content you upload to Lumia (documents, vault items, conversation data). By uploading content, you grant Lumia a limited license to process and display it solely for the purpose of providing the Service to you.

We do not use your private content to train AI models. We do not claim intellectual property rights over your content.`,
  },
  {
    title: "7. Intellectual property",
    content: `The Lumia name, logo, and the original content, features, and functionality of the Service are owned by Oria Agency and are protected by copyright, trademark, and other applicable intellectual property laws.

You may not copy, modify, distribute, or create derivative works based on the Service without our express written permission.`,
  },
  {
    title: "8. Third-party services",
    content: `Lumia integrates with third-party AI providers (OpenAI, Google, Anthropic), payment processors (Stripe), and infrastructure services (Supabase, Vercel). Your use of these integrations is subject to their respective terms of service. We are not responsible for the availability, accuracy, or conduct of third-party services.`,
  },
  {
    title: "9. Limitation of liability",
    content: `To the fullest extent permitted by law, Oria Agency shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.

The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or secure.

Our total liability to you for any claim arising out of these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "10. Termination",
    content: `We may terminate or suspend your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.

You may delete your account at any time. Upon termination, your right to use the Service immediately ceases. Sections on intellectual property, limitation of liability, and governing law survive termination.`,
  },
  {
    title: "11. Governing law",
    content: `These Terms are governed by and construed in accordance with the laws of the Province of Quebec, Canada, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Quebec.`,
  },
  {
    title: "12. Changes to terms",
    content: `We may update these Terms from time to time. We'll notify you by email at least 14 days before material changes take effect. Continued use of the Service after changes constitutes your acceptance of the new Terms.`,
  },
];

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-[#6B6480]">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-base text-[#6B6480] leading-relaxed">
            Please read these terms carefully before using Lumia. They govern your use of
            the Service and outline both your rights and ours.
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
              <h2 className="text-base font-bold mb-3" style={{ color: "#0F0A1E" }}>
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
          <p className="text-sm font-semibold text-[#0F0A1E] mb-1">Questions about these terms?</p>
          <p className="text-sm text-[#6B6480]">
            Email us at{" "}
            <a href="mailto:oria.agency.ai@gmail.com" className="text-[#567EFC] hover:underline">
              oria.agency.ai@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </PageShell>
  );
}
