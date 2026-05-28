/**
 * @file SupplierPortalRedirectPage.jsx
 * @description Hands off an authenticated ACTIVE supplier to the external dashboard
 *   with a Firebase token so the portal does not stall on "Verifying your session".
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BrandLoader from "@/components/ui/BrandLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import { waitForAuthToken } from "@/lib/auth";
import {
  buildSupplierPortalHandoffUrl,
  fetchSupplierAccessSnapshot,
  isSupplierPortalReady,
  SUPPLIER_PAYOUT_PATH,
  SUPPLIER_PORTAL_LOGIN_URL,
  SUPPLIER_SIGNIN_PATH,
} from "@/lib/supplierPortal";

export default function SupplierPortalRedirectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate(SUPPLIER_SIGNIN_PATH, { replace: true });
      return;
    }

    let cancelled = false;

    async function handoff() {
      try {
        const snapshot = await fetchSupplierAccessSnapshot();

        if (cancelled) return;

        if (!isSupplierPortalReady(snapshot.reviewStatus, snapshot.hasPayout)) {
          if (snapshot.route === "payout") {
            navigate(SUPPLIER_PAYOUT_PATH, { replace: true });
            return;
          }
          navigate(SUPPLIER_SIGNIN_PATH, { replace: true });
          return;
        }

        const token = await waitForAuthToken(8000);
        if (cancelled) return;

        if (!token) {
          setError(
            t(
              "supplierAuth.portalHandoffAuthError",
              "We could not verify your session. Please sign in again."
            )
          );
          return;
        }

        window.location.replace(buildSupplierPortalHandoffUrl(token));
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.message ||
            t(
              "supplierAuth.portalHandoffError",
              "Could not open your supplier dashboard. Please try again."
            )
        );
      }
    }

    handoff();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, navigate, t]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <p className="mb-4 max-w-md text-sm text-rose-600">{error}</p>
        <a
          href={SUPPLIER_PORTAL_LOGIN_URL}
          className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline"
        >
          {t("supplierAuth.openPortalSignIn", "Open supplier portal sign-in")}
        </a>
      </div>
    );
  }

  return (
    <BrandLoader
      fullScreen
      label={t(
        "supplierAuth.openingDashboard",
        "Opening your supplier dashboard..."
      )}
    />
  );
}
