import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SupplierApplicationForm } from "@/components/supplier/SupplierApplicationForm";
import companyLogo from "@/assets/images/new_logo.png";

function SupplierRegisterPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-[720px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/" className="inline-block">
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
            {t("supplierAuth.registerTitle", "Join as a Supplier")}
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            {t(
              "supplierAuth.registerDesc",
              "Complete your supplier application to list tours, reach travellers across Africa, and manage bookings from one dashboard."
            )}
          </p>
        </div>

        {/* Form */}
        <SupplierApplicationForm />

        {/* Footer */}
        <p className="mt-10 text-center text-sm text-slate-500">
          {t("supplierAuth.alreadyHaveAccount", "Already have a supplier account?")}{" "}
          <Link
            to="/supplier/signin"
            className="font-semibold text-[color:var(--brand-green)] hover:underline"
          >
            {t("supplierAuth.signInHere", "Sign in here")}
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          By submitting this application, you agree to our{" "}
          <Link to="/" className="underline hover:text-slate-600">Terms</Link>
          {" "}and{" "}
          <Link to="/" className="underline hover:text-slate-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default SupplierRegisterPage;
