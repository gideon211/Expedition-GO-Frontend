import { useState } from "react";
import { AlertCircle, Mail, Lock, UserRound, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithGoogle } from "@/lib/auth";

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

function LoadingSpinner() {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-15" />
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-current border-t-transparent will-change-transform"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      />
    </span>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
            times: [0, 0.2, 0.6, 1],
          }}
        />
      ))}
    </span>
  );
}

function Field({ icon: Icon, label, disabled, ...props }) {
  return (
    <label className="block">
      <span
        className={`mb-2 block text-sm font-semibold transition-colors ${disabled ? "text-slate-400" : "text-slate-700"}`}
      >
        {label}
      </span>
      <div
        className={`flex items-center rounded-[1.4rem] border bg-slate-50 px-4 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 ${disabled ? "border-slate-100 opacity-50" : "border-slate-200"}`}
      >
        <Icon
          className={`h-4 w-4 transition-colors ${disabled ? "text-slate-300" : "text-slate-400"}`}
        />
        <Input
          className="border-0 bg-transparent px-3 shadow-none focus:border-0 focus:ring-0"
          disabled={disabled}
          {...props}
        />
      </div>
    </label>
  );
}

export function AuthForm({
  mode,
  onSubmit,
  submitLabel,
  alternateLabel,
  alternateHref,
  alternateAction,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [wantsToBeSupplier, setWantsToBeSupplier] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isRegister = mode === "register" || mode === "supplierRegister";
  const isSupplierRegister = mode === "supplierRegister";
  const isBusy = loading || googleLoading;

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError(t("auth.errorEmailPassword"));
      return;
    }

    if (isRegister && form.password !== form.confirmPassword) {
      setError(t("auth.errorPasswordMatch"));
      return;
    }

    if (isSupplierRegister && !wantsToBeSupplier) {
      setError(
        t("supplierAuth.errorConfirmSupplier", "Please confirm that you want to become a supplier."),
      );
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess(
        isRegister
          ? t("auth.successAccountCreated")
          : t("auth.successWelcomeBack"),
      );

      navigate("/", {
        state: {
          postAuthSplash: true,
          splashKind: isRegister ? "register" : "signin",
          handoffId: Date.now(),
        },
      });
    } catch (submissionError) {
      setError(submissionError.message || t("auth.errorRequest"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const result = await signInWithGoogle();

      // signInWithGoogle redirects the page for backend auth — skip navigate
      if (result?.redirected) return;

      setSuccess(t("auth.successGoogleSignIn"));

      navigate("/", {
        state: { postAuthSplash: true, splashKind: "signin", handoffId: Date.now() },
      });
    } catch (submissionError) {
      setError(submissionError.message || t("auth.errorGoogleSignIn"));
    } finally {
      setGoogleLoading(false);
    }
  }

  const loadingLabel = isRegister ? "Creating account" : "Signing in";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AnimatePresence mode="wait">
        {isRegister ? (
          <motion.div
            key="name-field"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Field
              autoComplete="name"
              disabled={isBusy}
              icon={UserRound}
              label={t("auth.fullName")}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ama Mensah"
              value={form.name}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Field
        autoComplete="email"
        disabled={isBusy}
        icon={Mail}
        label={t("auth.emailAddress")}
        onChange={(event) => updateField("email", event.target.value)}
        placeholder="you@example.com"
        type="email"
        value={form.email}
      />

      <Field
        autoComplete={isRegister ? "new-password" : "current-password"}
        disabled={isBusy}
        icon={Lock}
        label={t("auth.password")}
        onChange={(event) => updateField("password", event.target.value)}
        placeholder="Enter your password"
        type="password"
        value={form.password}
      />

      <AnimatePresence mode="wait">
        {isRegister ? (
          <motion.div
            key="confirm-field"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Field
              autoComplete="new-password"
              disabled={isBusy}
              icon={Lock}
              label={t("auth.confirmPassword")}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              placeholder="Confirm your password"
              type="password"
              value={form.confirmPassword}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isSupplierRegister ? (
          <motion.div
            key="supplier-checkbox"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <label className="flex items-start gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm cursor-pointer transition hover:border-primary/30">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={wantsToBeSupplier}
                  onChange={(e) => setWantsToBeSupplier(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[color:var(--brand-green)] focus:ring-[color:var(--brand-green)]"
                />
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">
                  {t(
                    "supplierAuth.wantToBecomeSupplier",
                    "I want to become a supplier and list my tours/experiences",
                  )}
                </span>
              </div>
            </label>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 overflow-hidden rounded-[1.3rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-[1.3rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {success}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="overflow-hidden rounded-[1.4rem]">
        <motion.div
          whileTap={{ scale: loading ? 1 : 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            className="relative h-12 w-full text-base"
            disabled={isBusy}
            type="submit"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="submit-loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2.5"
                >
                  <LoadingSpinner />
                  <span className="inline-flex items-baseline gap-0.5">
                    {loadingLabel}
                    <LoadingDots />
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="submit-idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {submitLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {t("auth.orContinueWith")}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-[1.4rem]">
        <motion.div
          whileTap={{ scale: googleLoading ? 1 : 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            className="relative h-12 w-full"
            disabled={isBusy}
            onClick={handleGoogleSignIn}
            type="button"
            variant="outline"
          >
            <AnimatePresence mode="wait">
              {googleLoading ? (
                <motion.span
                  key="google-loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2.5"
                >
                  <LoadingSpinner />
                  <span className="inline-flex items-baseline gap-0.5">
                    Connecting to Google
                    <LoadingDots />
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="google-idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2"
                >
                  <span>{t("auth.google")}</span>
                  <GoogleIcon />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      <p className="text-center text-sm text-slate-600">
        {alternateLabel}{" "}
        <Link
          className="font-semibold text-primary hover:underline"
          to={alternateHref}
        >
          {alternateAction}
        </Link>
      </p>
    </form>
  );
}
