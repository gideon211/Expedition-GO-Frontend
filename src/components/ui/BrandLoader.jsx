export function BrandLoader({ fullScreen = false, label = "Loading..." }) {
  const wrapperClass = fullScreen
    ? "fixed inset-0 z-[120] flex items-center justify-center bg-white"
    : "flex items-center justify-center";

  return (
    <div className={wrapperClass} role="status" aria-live="polite" aria-label={label}>
      <div className="brand-loader">
        <div className="brand-loader__fill-wrap">
          <div className="brand-loader__fill">
            <span className="brand-loader__travio">Travio</span>
            <span className="brand-loader__africa">Africa</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandLoader;
