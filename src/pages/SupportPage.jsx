import { useEffect } from "react";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";

export default function SupportPage() {
  useEffect(() => {
    // Load Tawk.to chatbot script (guarded to avoid duplicate widgets in dev/strict-mode).
    if (typeof window === "undefined") return;

    const TAUK_SCRIPT_ID = "tawk-to-support-script";
    const TAUK_SRC = "https://embed.tawk.to/644922ef31ebfa0fe7fa8b14/1guur0u4t";

    // Keep the widget hidden until the user clicks "Start Chat".
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function onLoad() {
      if (typeof window.Tawk_API?.hideWidget === "function") {
        window.Tawk_API.hideWidget();
      }
    };
    window.Tawk_API.onChatMinimized = function onChatMinimized() {
      if (typeof window.Tawk_API?.hideWidget === "function") {
        window.Tawk_API.hideWidget();
      }
    };
    window.Tawk_API.onChatHidden = function onChatHidden() {
      if (typeof window.Tawk_API?.hideWidget === "function") {
        window.Tawk_API.hideWidget();
      }
    };

    const existingScript = document.getElementById(TAUK_SCRIPT_ID);
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = TAUK_SCRIPT_ID;
    script.async = true;
    script.src = TAUK_SRC;
    script.setAttribute("crossorigin", "anonymous");
    document.body.appendChild(script);

    // Hide widget when leaving Support page so it never persists on other pages.
    return () => {
      if (typeof window !== "undefined" && window.Tawk_API) {
        if (typeof window.Tawk_API.minimize === "function") {
          window.Tawk_API.minimize();
        }
        if (typeof window.Tawk_API.hideWidget === "function") {
          window.Tawk_API.hideWidget();
        }
      }
    };
  }, []);

  const handleStartChat = () => {
    if (typeof window === "undefined") return;

    const tryOpen = (attempt) => {
      const tawk = window.Tawk_API;
      if (!tawk) {
        // Widget may not be ready yet—retry a few times.
        if (attempt < 10) setTimeout(() => tryOpen(attempt + 1), 300);
        return;
      }

      // Show and open only from this button click.
      if (typeof tawk.showWidget === "function") tawk.showWidget();
      if (typeof tawk.unhideWidget === "function") tawk.unhideWidget();
      if (typeof tawk.maximize === "function") return tawk.maximize();
      if (typeof tawk.openWidget === "function") return tawk.openWidget();
    };

    tryOpen(0);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white">
        <Navbar />
      </div>
      
      {/* Navbar spacer */}
      <div className="h-[58px] sm:h-[96px] lg:h-[104px]" />

      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1520px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="font-bold tracking-tight text-slate-900 mb-4" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}>Support Center</h1>
            <p className="text-slate-600" style={{ fontSize: 'clamp(1rem, 1.2vw + 0.5rem, 1.25rem)' }}>
              We're here to help. Use Start Chat below to begin a conversation with our support team.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* FAQ Section */}
            <div className="rounded-lg border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>Frequently Asked Questions</h2>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[color:var(--brand-green)] font-bold">•</span>
                  <span>How do I book a tour?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[color:var(--brand-green)] font-bold">•</span>
                  <span>What is your cancellation policy?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[color:var(--brand-green)] font-bold">•</span>
                  <span>How can I modify my booking?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[color:var(--brand-green)] font-bold">•</span>
                  <span>What payment methods do you accept?</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="rounded-lg border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>Contact Information</h2>
              <div className="space-y-4 text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p>support@expeditiongo.com</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Phone</p>
                  <p>+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Hours</p>
                  <p>24/7 Support Available</p>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="rounded-lg border border-slate-200 p-6 bg-[color:var(--brand-mist)]">
              <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)' }}>Live Chat Support</h2>
              <p className="text-slate-700 mb-4">
                Our support team is available 24/7 to assist you. Click Start Chat to begin.
              </p>
              <button
                type="button"
                onClick={handleStartChat}
                className="w-full rounded-lg bg-[color:var(--brand-green)] px-4 py-2 font-semibold text-white transition hover:bg-[color:var(--brand-green)]/90"
              >
                Start Chat
              </button>
            </div>
          </div>

          {/* Help Topics */}
          <div className="mt-12">
            <h2 className="font-bold text-slate-900 mb-6" style={{ fontSize: 'clamp(1.375rem, 2vw + 0.5rem, 1.875rem)' }}>Help Topics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4 hover:border-[color:var(--brand-green)] transition cursor-pointer">
                <h3 className="font-semibold text-slate-900">Booking & Reservations</h3>
                <p className="text-sm text-slate-600 mt-1">Learn how to search, book, and manage your tours</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 hover:border-[color:var(--brand-green)] transition cursor-pointer">
                <h3 className="font-semibold text-slate-900">Payment & Billing</h3>
                <p className="text-sm text-slate-600 mt-1">Information about payments, refunds, and invoices</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 hover:border-[color:var(--brand-green)] transition cursor-pointer">
                <h3 className="font-semibold text-slate-900">Account & Profile</h3>
                <p className="text-sm text-slate-600 mt-1">Manage your account settings and preferences</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 hover:border-[color:var(--brand-green)] transition cursor-pointer">
                <h3 className="font-semibold text-slate-900">Technical Support</h3>
                <p className="text-sm text-slate-600 mt-1">Get help with app or website issues</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
