/**
 * @file supplierProfile.js
 * @description Maps tour API supplier payloads to consumer-facing profile fields.
 */

function formatBusinessAddress(address) {
  if (!address || typeof address !== "object") return null;
  const formatted = [address.line1, address.line2, address.city, address.state, address.postalCode]
    .filter((part) => part && String(part).trim())
    .join(", ");
  return formatted || null;
}

function buildSupplierDescription(businessInfo, operatingInfo) {
  const name = businessInfo?.displayName || businessInfo?.legalBusinessName;
  const segments = [];

  if (name) segments.push(`${name} offers guided experiences`);
  if (operatingInfo?.destinations?.length) {
    segments.push(`in ${operatingInfo.destinations.slice(0, 6).join(", ")}`);
  }
  if (operatingInfo?.languages?.length) {
    segments.push(`Languages: ${operatingInfo.languages.join(", ")}`);
  }
  if (operatingInfo?.cancellationPolicy) {
    segments.push(operatingInfo.cancellationPolicy);
  }

  return segments.length ? `${segments.join(". ")}.` : null;
}

/**
 * @param {{ tour?: object; fallback?: object }} options
 */
export function mapSupplierProfile({ tour, fallback } = {}) {
  const supplier = tour?.supplier;
  const profile = supplier?.supplierProfile;
  const businessInfo = profile?.businessInfo || {};
  const representativeInfo = profile?.representativeInfo || {};
  const operatingInfo = profile?.operatingInfo || {};

  const name =
    supplier?.companyName ||
    businessInfo.displayName ||
    businessInfo.legalBusinessName ||
    supplier?.name ||
    fallback?.name ||
    null;

  return {
    supplierId: supplier?.id || tour?.supplierId || fallback?.supplierId || null,
    name,
    logo: supplier?.photoURL || supplier?.logo || fallback?.logo || "",
    email: supplier?.email || representativeInfo.email || fallback?.email || null,
    phone:
      supplier?.phone ||
      businessInfo.phoneNumber ||
      representativeInfo.phoneNumber ||
      fallback?.phone ||
      null,
    website: supplier?.website || businessInfo.website || fallback?.website || null,
    address:
      supplier?.address ||
      formatBusinessAddress(businessInfo.address) ||
      fallback?.address ||
      tour?.city ||
      null,
    description:
      supplier?.description ||
      buildSupplierDescription(businessInfo, operatingInfo) ||
      fallback?.description ||
      null,
    rating:
      supplier?.rating ??
      profile?.averageRating ??
      tour?.averageRating ??
      fallback?.rating ??
      null,
    toursCount:
      supplier?.toursCount ??
      profile?.totalBookings ??
      fallback?.toursCount ??
      0,
  };
}

export function normalizeWebsiteUrl(website) {
  if (!website || typeof website !== "string") return null;
  const trimmed = website.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
