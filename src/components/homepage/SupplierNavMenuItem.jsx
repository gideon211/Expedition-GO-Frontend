/**
 * @file SupplierNavMenuItem.jsx
 * @description User-menu supplier entry: List an experience link.
 */
import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/components/auth/AuthProvider";
import { useSupplierNav } from "@/hooks/useSupplierNav";

export function SupplierNavMenuItem({ onNavigate, className }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { href, loading } = useSupplierNav(user);

  const baseClassName =
    className ||
    "flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900";

  if (loading) {
    return (
      <span
        className={`${baseClassName} opacity-50`}
        aria-busy="true"
        aria-label={t("nav.becomeSupplier", "List an experience")}
      />
    );
  }

  return (
    <Link to={href} onClick={onNavigate} className={baseClassName}>
      <Store className="size-4" />
      <span>{t("nav.becomeSupplier", "List an experience")}</span>
    </Link>
  );
}
