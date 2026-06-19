/**
 * @file SupplierRegisterPage.jsx
 * @description Supplier application entry (/supplier/register). Renders SupplierApplicationForm.
 *   Approved suppliers are sent to payout setup before dashboard access.
 *
 * @see components/supplier/SupplierApplicationForm.jsx
 * @see api/supplier.js
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { SupplierApplicationForm } from '@/components/supplier/SupplierApplicationForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupplierApplicationStatus } from '@/api/supplier';
import {
  fetchSupplierAccessSnapshot,
  redirectToSupplierPortalLogin,
  SUPPLIER_PAYOUT_PATH,
} from '@/lib/supplierPortal';
import companyLogo from '@/assets/images/new_logo.png';

function SupplierRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setCheckingStatus(true);

    fetchSupplierAccessSnapshot()
      .then((snapshot) => {
        if (cancelled) return;

        if (snapshot.route === 'portal') {
          redirectToSupplierPortalLogin();
          return;
        }

        if (snapshot.route === 'payout') {
          navigate(SUPPLIER_PAYOUT_PATH, { replace: true });
        }
      })
      .catch((err) => {
        if (err?.status === 401) return;
        // No application yet — show the registration form
      })
      .finally(() => {
        if (!cancelled) setCheckingStatus(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.uid, user?.email]);

  if (authLoading || checkingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoaderCircle className="size-6 animate-spin text-[color:var(--brand-green)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-[720px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/" state={{ postAuthSplash: true }} className="inline-block">
            <img
              src={companyLogo}
              alt="TravioAfrica"
              className="h-auto w-[200px] object-contain sm:w-[220px]"
            />
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t('supplierAuth.registerTitle', 'Join as a Supplier')}
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            {t(
              'supplierAuth.registerDesc',
              'Complete your supplier application to list tours, reach travellers across Africa, and manage bookings from one dashboard.'
            )}
          </p>
        </div>

        {/* Form */}
        <SupplierApplicationForm />

        {/* Footer */}
        <p className="mt-10 text-center text-sm text-slate-500">
          {t('supplierAuth.alreadyHaveAccount', 'Already have a supplier account?')}{' '}
          <Link
            to="/supplier/signin"
            className="font-semibold text-[color:var(--brand-green)] hover:underline"
          >
            {t('supplierAuth.signInHere', 'Sign in here')}
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          By submitting this application, you agree to our{' '}
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
    </div>
  );
}

export default SupplierRegisterPage;
