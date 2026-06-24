import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCurrentUser, getAuthReturnTo, clearAuthReturnTo } from "@/lib/auth";
import companyLogo from "@/assets/images/new_logo.png";

const AUTH_STORAGE_KEY = 'expedition_go_auth';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("Invalid authentication response. Missing tokens.");
      return;
    }

    (async () => {
      try {
        const user = await fetchCurrentUser(accessToken);

        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ accessToken, refreshToken, user })
        );

        window.dispatchEvent(new Event("auth-storage-changed"));

        const redirect = getAuthReturnTo() || "/";
        clearAuthReturnTo();
        navigate(redirect, { replace: true });
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Failed to complete sign-in. Please try again.");
      }
    })();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--page-bg)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-rose-100 bg-rose-50 px-8 py-6 text-center shadow-lg"
        >
          <p className="text-rose-700">{error}</p>
          <button
            className="mt-4 text-sm font-semibold text-primary hover:underline"
            onClick={() => navigate("/signin")}
          >
            Back to sign in
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--page-bg)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[color:var(--brand-green)]/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-[color:var(--brand-green)]/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.img
            src={companyLogo}
            alt=""
            className="relative h-14 w-auto"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.p
          className="text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Completing sign-in
          <motion.span
            className="inline-block"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default AuthCallback;
