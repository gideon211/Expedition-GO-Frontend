import { useEffect, useState } from "react";
import "./loader.css";

export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader" />
    </div>
  );
}
