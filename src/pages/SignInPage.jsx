/**
 * @file SignInPage.jsx
 * @description Consumer sign-in route (/signin). Wraps AuthForm in AuthShell layout.
 *   On success, redirects to HomePage with post-auth splash state.
 *
 * @see lib/auth.js — signInWithEmail
 */
import { useTranslation } from "react-i18next";
import AuthShell from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageGate } from "@/components/auth/AuthPageGate";
import { signInWithEmail } from "@/lib/auth";

function SignInPage() {
  const { t } = useTranslation();
  
  return (
    <AuthPageGate label={t("auth.loadingSignIn")}>
    <AuthShell
      badgeLabel={t('auth.signIn')}
      title={t('auth.welcomeBack')}
      description={t('auth.signInDesc')}
      footerText={t('auth.needNewAccount')}
      footerLinkLabel={t('auth.registerHere')}
      footerLinkTo="/register"
    >
      <AuthForm
        mode="signin"
        onSubmit={({ email, password }) => signInWithEmail(email, password)}
        submitLabel={t('auth.signInButton')}
      />
    </AuthShell>
    </AuthPageGate>
  );
}

export default SignInPage;
