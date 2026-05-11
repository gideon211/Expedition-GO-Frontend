import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BrandLoader from "@/components/ui/BrandLoader";
import { useAuth } from "@/components/auth/AuthProvider";

function SignOutPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    let mounted = true;

    signOut()
      .catch(() => {})
      .finally(() => {
        if (!mounted) {
          return;
        }

        navigate("/", { replace: true, state: { showLogoutToast: true } });
      });

    return () => {
      mounted = false;
    };
  }, [signOut, navigate]);

  return <BrandLoader fullScreen label="Signing out" />;
}

export default SignOutPage;
