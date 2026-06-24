/**
 * @file SupplierSignInPage.jsx
 * @description Supplier portal sign-in (/supplier/signin). Separate from consumer auth.
 *   Approved/active suppliers are redirected to supplier.travioafrica.com/login.
 */
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  LoaderCircle,
  ArrowRight,
  AlertCircle,
  Clock,
  XCircle,
  UserCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import {
  buildFallbackSupplierStatus,
  fetchSupplierAccessSnapshot,
  redirectToSupplierPortalLogin,
  resolveSupplierSignInToast,
  SUPPLIER_PAYOUT_PATH,
  userHasSupplierApplication,
} from '@/lib/supplierPortal';
import { useAuth } from '@/components/auth/AuthProvider';
import companyLogo from '@/assets/images/new_logo.png';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.805 12.23c0-.79-.068-1.545-.214-2.27H12.2v4.292h5.37a4.6 4.6 0 0 1-1.99 3.02v2.51h3.223c1.886-1.738 3.002-4.306 3.002-7.552Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 22c2.687 0 4.945-.882 6.603-2.39l-3.223-2.51c-.895.61-2.04.967-3.38.967-2.6 0-4.804-1.752-5.59-4.11H3.285v2.59A9.959 9.959 0 0 0 12.2 22Z"
        fill="#34A853"
      />
      <path
        d="M6.61 13.956A5.98 5.98 0 0 1 6.3 12c0-.68.117-1.34.31-1.956V7.454H3.285a9.966 9.966 0 0 0 0 9.092l3.325-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 5.933c1.463 0 2.773.503 3.806 1.488l2.85-2.85C17.14 2.968 14.883 2 12.2 2a9.959 9.959 0 0 0-8.915 5.454l3.325 2.59c.786-2.358 2.99-4.11 5.59-4.11Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SupplierStatusDashboard({ status, payoutComplete = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = status?.data?.supplierProfile || status?.data || {};
  const reviewStatus = profile.status || 'PENDING';
  const isRejected = reviewStatus === 'REJECTED';
  const isApproved = reviewStatus === 'APPROVED';
  const approvedAwaitingActivation = isApproved && payoutComplete;
  const adminNotes = profile.adminNotes;
  const businessInfo = profile.businessInfo;
  const reviewedAt = profile.reviewedAt;
  const reviewedBy = profile.reviewedBy;

  return (
    <div className="w-full max-w-[520px] space-y-5">
      {/* Status Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {isRejected ? (
            <div className="flex size-14 items-center justify-center rounded-full bg-rose-100">
              <XCircle className="size-7 text-rose-600" />
            </div>
          ) : approvedAwaitingActivation ? (
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100">
              <UserCheck className="size-7 text-emerald-600" />
            </div>
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-100">
              <Clock className="size-7 text-amber-600" />
            </div>
          )}

          <div>
            <p className="text-xl font-bold text-slate-900">{reviewStatus}</p>
            <p className="text-sm text-slate-500">
              {isRejected
                ? t('supplierAuth.statusRejectedDesc', 'Your application was not approved.')
                : approvedAwaitingActivation
                  ? t(
                      'supplierAuth.statusApprovedAwaitingActivation',
                      'Your payout method is saved. We will activate your supplier dashboard after review.'
                    )
                  : isApproved
                    ? t(
                        'supplierAuth.statusApprovedDesc',
                        'Your application is approved. Add a payout method before you can access your supplier dashboard.'
                      )
                    : t(
                        'supplierAuth.statusPendingDesc',
                        "Your application is under review. We'll email you when a decision is made."
                      )}
            </p>
          </div>
        </div>

        {isApproved && !payoutComplete && (
          <Button
            onClick={() => navigate(SUPPLIER_PAYOUT_PATH)}
            className="h-11 w-full rounded-lg text-sm font-semibold"
          >
            {t('supplierAuth.setupPayout', 'Set up payout method')}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        )}

        {reviewedAt && (
          <p className="mt-4 text-xs text-slate-400">
            Reviewed on {new Date(reviewedAt).toLocaleDateString()}
            {reviewedBy ? ` by ${reviewedBy}` : ''}
          </p>
        )}
      </div>

      {/* Admin Notes - rejected applications with feedback */}
      {isRejected && adminNotes && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="mb-2 flex items-center gap-2">
            <UserCheck className="size-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-emerald-800">Admin Notes</h4>
          </div>
          <p className="text-sm leading-relaxed text-emerald-700">{adminNotes}</p>
        </div>
      )}

      {/* Business Info */}
      {businessInfo && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
            Business Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Legal Name</span>
              <span className="font-semibold text-slate-900">
                {businessInfo.legalBusinessName || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Display Name</span>
              <span className="font-semibold text-slate-900">
                {businessInfo.displayName || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Country</span>
              <span className="font-semibold text-slate-900">{businessInfo.country || '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SupplierSignInPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState('email'); // "email" | "password"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) setGoogleLoading(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const [supplierStatus, setSupplierStatus] = useState(null);
  const [payoutComplete, setPayoutComplete] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const signInToastShownRef = useRef(false);

  function showSupplierSignInToast(snapshot) {
    if (signInToastShownRef.current) return;

    const toastContent = resolveSupplierSignInToast(snapshot, user);
    if (!toastContent) return;

    const message = t(toastContent.key, toastContent.defaultMessage);
    const options = { id: 'supplier-signin-toast' };

    if (toastContent.variant === 'info') {
      toast.info(message, options);
    } else {
      toast.success(message, options);
    }

    signInToastShownRef.current = true;
  }

  // Check supplier status when user is authenticated
  useEffect(() => {
    if (user) {
      setStatusLoading(true);
      setStatusError('');
      fetchSupplierAccessSnapshot()
        .then((snapshot) => {
          showSupplierSignInToast(snapshot);

          if (snapshot.statusError) {
            const message =
              snapshot.statusError?.message ||
              t(
                'supplierAuth.statusLoadError',
                "We couldn't load your supplier status. Please try again."
              );
            setStatusError(message);
            toast.error(message, { id: 'supplier-status-error' });
            return;
          }

          if (!userHasSupplierApplication(user, snapshot)) {
            navigate('/supplier/register', { replace: true });
            return;
          }

          if (snapshot.route === 'portal') {
            redirectToSupplierPortalLogin();
            return;
          }

          if (snapshot.route === 'payout') {
            navigate(SUPPLIER_PAYOUT_PATH, { replace: true });
            return;
          }

          if (!snapshot.parsed) {
            const fallbackStatus = snapshot.hasPayout ? 'APPROVED' : 'PENDING';
            setSupplierStatus(buildFallbackSupplierStatus(fallbackStatus));
            setPayoutComplete(fallbackStatus === 'APPROVED' && snapshot.hasPayout);
            return;
          }

          setSupplierStatus(snapshot.statusData);
          setPayoutComplete(snapshot.reviewStatus === 'APPROVED' && snapshot.hasPayout);
        })
        .catch((err) => {
          const message =
            err?.message ||
            t(
              'supplierAuth.statusLoadError',
              "We couldn't load your supplier status. Please try again."
            );
          setStatusError(message);
          toast.error(message, { id: 'supplier-status-error' });
        })
        .finally(() => {
          setStatusLoading(false);
        });
    } else {
      setSupplierStatus(null);
      setStatusError('');
      signInToastShownRef.current = false;
    }
  }, [user?.uid, user?.email, navigate, t]);

  function handleEmailNext(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setStep('password');
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      const message = err?.message || "We couldn't complete that request.";
      setError(message);
      toast.error(message, { id: 'supplier-signin-error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err?.message || "We couldn't complete Google sign-in.";
      setError(message);
      toast.error(message, { id: 'supplier-google-signin-error' });
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleBackToEmail() {
    setStep('email');
    setPassword('');
    setError('');
  }

  // If user is authenticated, show supplier status or prompt to apply
  if (user) {
    // Minimal loading — no branded flash before redirect
    if (statusLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white">
          <LoaderCircle className="size-6 animate-spin text-[color:var(--brand-green)]" />
        </div>
      );
    }

    if (statusError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
          <Link to="/" state={{ postAuthSplash: true }} className="mb-8 inline-block">
            <img src={companyLogo} alt="TravioAfrica" className="h-auto w-[220px] object-contain" />
          </Link>
          <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{statusError}</span>
          </div>
        </div>
      );
    }

    if (!supplierStatus) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white">
          <LoaderCircle className="size-6 animate-spin text-[color:var(--brand-green)]" />
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12"
      >
        <div className="mb-8 flex justify-center">
          <Link to="/" state={{ postAuthSplash: true }} className="inline-block">
            <img src={companyLogo} alt="TravioAfrica" className="h-auto w-[220px] object-contain" />
          </Link>
        </div>
        <SupplierStatusDashboard status={supplierStatus} payoutComplete={payoutComplete} />
      </motion.div>
    );
  }

  // Show sign-in form
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12"
    >
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/" state={{ postAuthSplash: true }} className="inline-block">
            <img src={companyLogo} alt="TravioAfrica" className="h-auto w-[220px] object-contain" />
          </Link>
        </div>

        {/* Heading */}
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          TravioAfrica Supplier Log in
        </h1>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailNext} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-[color:var(--brand-green)]/50 focus-within:ring-2 focus-within:ring-[color:var(--brand-green)]/10">
                <Mail className="size-4 text-slate-400" />
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus:ring-0"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg text-base font-semibold"
            >
              {loading ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('auth.orContinueWith', 'Or continue with')}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="h-12 w-full rounded-lg border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              {googleLoading ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <>
                  <GoogleIcon />
                  <span className="ml-2">{t('auth.google', 'Google')}</span>
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline"
                >
                  ← Back
                </button>
              </div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-[color:var(--brand-green)]/50 focus-within:ring-2 focus-within:ring-[color:var(--brand-green)]/10">
                <Lock className="size-4 text-slate-400" />
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus:ring-0"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg text-base font-semibold"
            >
              {loading ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/signin"
                className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have a supplier account?{' '}
          <Link
            to="/supplier/register"
            className="font-semibold text-[color:var(--brand-green)] hover:underline"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          By signing in, you agree to our{' '}
          <Link to="/" className="underline hover:text-slate-600">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
}

export default SupplierSignInPage;
