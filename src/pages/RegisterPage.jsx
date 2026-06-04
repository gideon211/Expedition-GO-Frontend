/**
 * @file RegisterPage.jsx
 * @description Consumer registration route (/register). Wraps AuthForm in AuthShell layout.
 *
 * @see lib/auth.js — registerWithEmail
 */
import { useTranslation } from "react-i18next";
import AuthShell from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageGate } from "@/components/auth/AuthPageGate";
import { registerWithEmail } from "@/lib/auth";

function RegisterPage() {
  const { t } = useTranslation();
  
  return (
    <AuthPageGate label={t("auth.loadingRegister")}>
    <AuthShell
      badgeLabel={t('auth.register')}
      title={t('auth.createYourAccount')}
      description={t('auth.registerDesc')}
      footerText={t('auth.alreadyHaveAccount')}
      footerLinkLabel={t('auth.signInHere')}
      footerLinkTo="/signin"
    >
      <AuthForm
        mode="register"
        onSubmit={({ name, email, password }) => registerWithEmail(name, email, password)}
        submitLabel={t('auth.createAccount')}
      />
    </AuthShell>
    </AuthPageGate>
  );
}

export default RegisterPage;
