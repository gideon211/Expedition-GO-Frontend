/**
 * @file AuthPageGate.jsx
 * @description Plays the full TravioAfrica brand wipe once, then reveals the auth form.
 *   Pairs with NavigationContext.navigateWithLoader from navbar / auth links.
 */
import { useCallback, useState } from "react";
import BrandLoader from "@/components/ui/BrandLoader";
import { useNavigationLoader } from "@/contexts/NavigationContext";

export function AuthPageGate({ label, children }) {
  const { hideLoader } = useNavigationLoader();
  const [ready, setReady] = useState(false);

  const handleBrandComplete = useCallback(() => {
    hideLoader();
    setReady(true);
  }, [hideLoader]);

  if (!ready) {
    return (
      <BrandLoader fullScreen once label={label} onComplete={handleBrandComplete} />
    );
  }

  return children;
}
