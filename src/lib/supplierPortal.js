/**
 * @file supplierPortal.js
 * @description External supplier dashboard URLs and approval-status helpers.
 */
import { getMyPayoutMethods } from '@/api/payout';
import { getSupplierApplicationStatus } from '@/api/supplier';
import { waitForAuthToken } from '@/lib/auth';

/** Active suppliers manage tours via the external supplier dashboard. */
export const SUPPLIER_PORTAL_ORIGIN =
  import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://supplier.travioafrica.com';

export const SUPPLIER_PORTAL_LOGIN_URL = `${SUPPLIER_PORTAL_ORIGIN}/login`;

/** Cross-domain SSO entry — dashboard AuthCallback expects ?token= */
export const SUPPLIER_PORTAL_AUTH_CALLBACK_URL = `${SUPPLIER_PORTAL_ORIGIN}/auth/callback`;

/** In-app handoff route (passes Firebase token before opening the portal). */
export const SUPPLIER_PORTAL_PATH = '/supplier/portal';

export const SUPPLIER_PAYOUT_PATH = '/supplier/payout';
export const SUPPLIER_SIGNIN_PATH = '/supplier/signin';

export function buildSupplierPortalHandoffUrl(idToken) {
  const token = String(idToken || '').trim();
  if (!token) return SUPPLIER_PORTAL_LOGIN_URL;
  return `${SUPPLIER_PORTAL_AUTH_CALLBACK_URL}?token=${encodeURIComponent(token)}`;
}

/**
 * Normalize API payloads from GET /suppliers/application/status.
 * @returns {{ profile: object, status: string } | null}
 */
export function parseSupplierStatusResponse(statusResponse) {
  if (!statusResponse || typeof statusResponse !== 'object') return null;

  const payload = statusResponse.data ?? statusResponse;
  const profile =
    payload?.supplierProfile ??
    payload?.profile ??
    (payload?.status || payload?.id ? payload : null);

  if (!profile || typeof profile !== 'object') return null;
  if (!profile.status && !profile.id) return null;

  return {
    profile,
    status: profile.status || 'PENDING',
  };
}

function isSupplierApplicationNotFoundError(error) {
  if (!error) return false;
  if (error.status === 404) return true;
  const message = String(error.message || '').toLowerCase();
  return message.includes('no supplier application');
}

/** Whether this account has started or completed supplier onboarding. */
export function userHasSupplierApplication(user, snapshot = {}) {
  return Boolean(snapshot.parsed) || userHasSupplierRole(user) || Boolean(snapshot.hasPayout);
}

/** Homepage / marketing CTA path for the current auth + supplier state. */
export function getSupplierEntryHref({ user, href }) {
  if (!user) return SUPPLIER_SIGNIN_PATH;
  return href || '/supplier/register';
}

export function userHasSupplierRole(user) {
  return Array.isArray(user?.roles) && user.roles.includes('supplier');
}

export function userIsSupplierAccount(user, statusResponse) {
  return Boolean(parseSupplierStatusResponse(statusResponse)) || userHasSupplierRole(user);
}

export function normalizeReviewStatus(status) {
  if (!status || typeof status !== 'string') return null;
  return status.trim().toUpperCase();
}

export function getSupplierReviewStatus(statusResponse) {
  return normalizeReviewStatus(parseSupplierStatusResponse(statusResponse)?.status) ?? 'PENDING';
}

export function isSupplierApproved(status) {
  return status === 'APPROVED';
}

export function isSupplierActive(status) {
  return status === 'ACTIVE';
}

/** External dashboard is only for ACTIVE suppliers who have set up payout. */
export function isSupplierPortalReady(status, hasPayoutMethod = true) {
  return isSupplierActive(status) && hasPayoutMethod;
}

export function requiresPayoutSetup(status) {
  return isSupplierApproved(status) || isSupplierActive(status);
}

export function extractPayoutMethods(payload) {
  if (!payload || typeof payload !== 'object') return [];

  const data = payload.data ?? payload;
  if (Array.isArray(data?.methods)) return data.methods;
  if (Array.isArray(data)) return data;

  return [];
}

export function hasSavedPayoutMethods(methodsOrPayload) {
  if (Array.isArray(methodsOrPayload)) {
    return methodsOrPayload.length > 0;
  }
  return extractPayoutMethods(methodsOrPayload).length > 0;
}

export async function supplierHasPayoutMethod() {
  try {
    const response = await getMyPayoutMethods();
    return hasSavedPayoutMethods(response);
  } catch {
    return false;
  }
}

/**
 * Single request bundle for supplier status + payout methods (avoids duplicate API calls).
 */
export async function fetchSupplierAccessSnapshot() {
  const token = await waitForAuthToken();
  if (!token) {
    const error = new Error('You are not logged in! Please log in to get access.');
    error.status = 401;
    throw error;
  }

  const [statusResult, payoutResult] = await Promise.allSettled([
    getSupplierApplicationStatus(),
    getMyPayoutMethods(),
  ]);

  const statusData = statusResult.status === 'fulfilled' ? statusResult.value : null;
  const statusError = statusResult.status === 'rejected' ? statusResult.reason : null;

  if (statusError?.status === 401) throw statusError;

  const statusNotFound = isSupplierApplicationNotFoundError(statusError);

  const parsed = parseSupplierStatusResponse(statusData);
  const methods =
    payoutResult.status === 'fulfilled' ? extractPayoutMethods(payoutResult.value) : [];
  const profilePayoutInfo = parsed?.profile?.payoutInfo;
  const hasProfilePayout =
    profilePayoutInfo &&
    typeof profilePayoutInfo === 'object' &&
    Object.keys(profilePayoutInfo).length > 0;
  const hasPayout = methods.length > 0 || hasProfilePayout;

  let reviewStatus = normalizeReviewStatus(parsed?.status);
  if (!reviewStatus && hasPayout) {
    reviewStatus = 'APPROVED';
  }

  return {
    statusData,
    statusError: statusError && !statusNotFound ? statusError : null,
    statusNotFound,
    parsed,
    reviewStatus,
    methods,
    hasPayout,
    hasApplication: Boolean(parsed) || hasPayout,
    route: resolveSupplierRoute(reviewStatus, hasPayout),
  };
}

/**
 * Resolve post-auth route for a supplier by status and payout setup.
 * @returns {"portal"|"payout"|"signin"}
 */
export function resolveSupplierRoute(reviewStatus, hasPayoutMethod) {
  const hasPayout = typeof hasPayoutMethod === 'boolean' ? hasPayoutMethod : false;

  if (isSupplierActive(reviewStatus)) {
    return hasPayout ? 'portal' : 'payout';
  }

  if (isSupplierApproved(reviewStatus)) {
    return hasPayout ? 'signin' : 'payout';
  }

  return 'signin';
}

/** Fallback status payload when the API is unavailable but the user has the supplier role. */
export function buildFallbackSupplierStatus(status = 'PENDING') {
  return {
    data: {
      supplierProfile: {
        status,
      },
    },
  };
}

/**
 * Navbar menu variant for the signed-in user's supplier entry point.
 */
export function getSupplierNavMenuVariant({
  hasApplication,
  portalReady,
  hasPayout,
  reviewStatus,
}) {
  if (portalReady) {
    return { variant: 'dashboard', reason: null };
  }

  if (hasApplication) {
    if (!hasPayout) {
      return { variant: 'pending', reason: 'payout' };
    }
    if (!isSupplierActive(reviewStatus)) {
      return { variant: 'pending', reason: 'activation' };
    }
    return { variant: 'pending', reason: 'review' };
  }

  return { variant: 'become', reason: null };
}

/**
 * Navbar / menu link for the signed-in user's supplier entry point.
 */
export function getSupplierNavTarget({ hasApplication, portalReady, needsPayout, hasPayout }) {
  if (portalReady) {
    return {
      href: SUPPLIER_PORTAL_PATH,
      external: false,
      isSupplier: true,
    };
  }

  if (needsPayout || (hasApplication && !hasPayout)) {
    return {
      href: SUPPLIER_PAYOUT_PATH,
      external: false,
      isSupplier: true,
    };
  }

  if (hasApplication) {
    return {
      href: SUPPLIER_SIGNIN_PATH,
      external: false,
      isSupplier: true,
    };
  }

  return {
    href: '/supplier/register',
    external: false,
    isSupplier: false,
  };
}

export async function redirectToSupplierPortalLogin() {
  if (typeof window === 'undefined') return;

  const token = await waitForAuthToken(8000);
  window.location.replace(token ? buildSupplierPortalHandoffUrl(token) : SUPPLIER_PORTAL_LOGIN_URL);
}

/**
 * Context-aware sign-in toast for supplier portal (avoids generic "apply" for active suppliers).
 * @returns {{ key: string, defaultMessage: string, variant: "success" | "info" } | null}
 */
export function resolveSupplierSignInToast(snapshot, user) {
  if (!snapshot || snapshot.statusError) return null;

  const { reviewStatus, hasPayout } = snapshot;
  const hasApplication = userHasSupplierApplication(user, snapshot);

  if (isSupplierPortalReady(reviewStatus, hasPayout)) {
    return {
      key: 'supplierAuth.successPortalReady',
      defaultMessage: 'Signed in successfully. Opening your supplier dashboard...',
      variant: 'success',
    };
  }

  if (!hasApplication) {
    return {
      key: 'supplierAuth.successApplyRequired',
      defaultMessage: 'Signed in successfully. Apply to become a supplier to access the dashboard.',
      variant: 'success',
    };
  }

  if (!hasPayout) {
    return {
      key: 'supplierAuth.infoSetupPayout',
      defaultMessage:
        'Add your payout method to access the supplier dashboard. Dashboard access is enabled after admin approval.',
      variant: 'info',
    };
  }

  if (!isSupplierActive(reviewStatus)) {
    if (isSupplierApproved(reviewStatus)) {
      return {
        key: 'supplierAuth.infoAwaitingActivation',
        defaultMessage:
          'Your payout method is saved. Your supplier dashboard will be available after admin approval.',
        variant: 'info',
      };
    }

    return {
      key: 'supplierAuth.infoPendingApproval',
      defaultMessage:
        'Your application is under review. Your supplier dashboard will be available after admin approval.',
      variant: 'info',
    };
  }

  return {
    key: 'supplierAuth.successSignedIn',
    defaultMessage: 'Signed in successfully.',
    variant: 'success',
  };
}

export function getSupplierAccessUserId(user) {
  return user?.uid ?? user?.id ?? null;
}

const NAV_CACHE_PREFIX = 'supplier-nav:';

function readNavCache(userId) {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${NAV_CACHE_PREFIX}${userId}`);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;

    // Ignore legacy cache that stored menuVariant without snapshot fields.
    if (data.menuVariant && data.reviewStatus === undefined && data.hasPayout === undefined) {
      return null;
    }

    return {
      reviewStatus: normalizeReviewStatus(data.reviewStatus),
      hasPayout: Boolean(data.hasPayout),
      hasApplication: Boolean(data.hasApplication),
      updatedAt: data.updatedAt ?? 0,
    };
  } catch {
    return null;
  }
}

function writeNavCache(userId, snapshot) {
  if (!userId || typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${NAV_CACHE_PREFIX}${userId}`, JSON.stringify(snapshot));
  } catch {
    // Ignore quota / private mode errors.
  }
}

/** Cached API snapshot for instant nav on reload (recomputed, not stale labels). */
export function readCachedSupplierSnapshot(user) {
  const userId = getSupplierAccessUserId(user);
  if (!userId) return null;

  const cached = readNavCache(userId);
  if (!cached) return null;

  return {
    reviewStatus: cached.reviewStatus,
    hasPayout: cached.hasPayout,
    hasApplication: cached.hasApplication,
    parsed: cached.reviewStatus ? { status: cached.reviewStatus } : null,
  };
}

export function clearSupplierNavCache(user) {
  const userId = getSupplierAccessUserId(user);
  if (!userId || typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(`${NAV_CACHE_PREFIX}${userId}`);
  } catch {
    // Ignore.
  }
}

function createBecomeNavState() {
  return {
    hasApplication: false,
    hasPayout: false,
    portalReady: false,
    needsPayout: false,
    reviewStatus: null,
    menuVariant: 'become',
    pendingReason: null,
    href: '/supplier/register',
    external: false,
    isSupplier: false,
  };
}

/** Build navbar state from user + API snapshot (single source of truth). */
export function resolveSupplierNavState(user, snapshot) {
  if (!user) return createBecomeNavState();

  const hasApplication =
    userHasSupplierApplication(user, snapshot) || Boolean(snapshot?.hasApplication);
  const reviewStatus = snapshot?.reviewStatus ?? null;
  const hasPayout = Boolean(snapshot?.hasPayout);
  const needsPayout = (reviewStatus === 'APPROVED' || reviewStatus === 'ACTIVE') && !hasPayout;
  const portalReady = isSupplierPortalReady(reviewStatus, hasPayout);
  const { variant: menuVariant, reason: pendingReason } = getSupplierNavMenuVariant({
    hasApplication,
    portalReady,
    hasPayout,
    reviewStatus,
  });
  const navTarget = getSupplierNavTarget({
    hasApplication,
    portalReady,
    needsPayout,
    hasPayout,
  });

  return {
    hasApplication,
    hasPayout,
    portalReady,
    needsPayout,
    reviewStatus,
    menuVariant,
    pendingReason,
    ...navTarget,
    isSupplier: menuVariant !== 'become',
  };
}

/** Instant nav label before / between network requests (cache, role, or profile hint). */
export function getOptimisticSupplierNavState(user) {
  if (!user) return createBecomeNavState();

  const cachedSnapshot = readCachedSupplierSnapshot(user);
  if (cachedSnapshot) {
    return resolveSupplierNavState(user, cachedSnapshot);
  }

  const profileStatus = normalizeReviewStatus(user?.supplierProfile?.status);
  if (profileStatus || userHasSupplierRole(user)) {
    return resolveSupplierNavState(user, {
      parsed: profileStatus ? { status: profileStatus } : null,
      reviewStatus: profileStatus || 'PENDING',
      hasPayout: false,
      hasApplication: true,
    });
  }

  return createBecomeNavState();
}

export function persistSupplierNavState(user, state) {
  const userId = getSupplierAccessUserId(user);
  if (!userId || !state) return;

  writeNavCache(userId, {
    reviewStatus: state.reviewStatus,
    hasPayout: state.hasPayout,
    hasApplication: state.hasApplication,
    updatedAt: Date.now(),
  });
}
