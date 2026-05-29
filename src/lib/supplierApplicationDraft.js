/**
 * @file supplierApplicationDraft.js
 * @description Persists in-progress supplier registration in sessionStorage and localStorage.
 *   sessionStorage: same-tab refresh; cleared when the tab closes.
 *   localStorage: survives new tabs and browser restarts.
 *   On load, the draft with the latest updatedAt wins.
 *   Drafts stay keyed to the last signed-in user after logout (localStorage last-user pointer).
 */

const DRAFT_PREFIX = "supplier_application_draft:";
const LAST_DRAFT_USER_KEY = "supplier_application_draft_last_user";
const STEPS_COUNT = 5;

const STORAGES = [
  { name: "session", get: () => sessionStorage },
  { name: "local", get: () => localStorage },
];

export function createEmptySupplierApplicationForm() {
  return {
    businessInfo: {
      legalBusinessName: "",
      displayName: "",
      businessType: "",
      country: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
      },
      website: "",
      phoneNumber: "",
    },
    operatingInfo: {
      tourCategories: [],
      destinations: [],
      languages: [],
      yearsInBusiness: "",
      cancellationPolicy: "",
      meetingStyle: "",
    },
    representativeInfo: {
      fullName: "",
      email: "",
      dateOfBirth: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
      },
      idType: "",
      idDocument: null,
    },
    businessDocuments: {
      registrationDocument: null,
      taxDocument: null,
      proofOfAddress: null,
      licenses: [],
    },
    compliance: {
      acceptedTerms: false,
      agreedToPayoutTerms: false,
    },
  };
}

function draftStorageKey(userId) {
  const id = String(userId || "").trim();
  return `${DRAFT_PREFIX}${id || "anonymous"}`;
}

/** Remember who last saved a draft so logout does not lose progress. */
export function rememberDraftUserId(userId) {
  const id = String(userId || "").trim();
  if (!id || typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_DRAFT_USER_KEY, id);
  } catch {
    // ignore
  }
}

export function getLastDraftUserId() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_DRAFT_USER_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Stable key for load/save — stays on the signed-in user after logout.
 * @param {{ uid?: string; email?: string } | null | undefined} user
 */
export function resolveDraftUserId(user) {
  return user?.uid ?? user?.email ?? getLastDraftUserId() ?? null;
}

/** Promote pre-login (anonymous) draft when the user signs in. */
export function migrateAnonymousDraftToUser(userId) {
  if (!userId || typeof window === "undefined") return;

  const userKey = draftStorageKey(userId);
  const anonKey = draftStorageKey(null);

  let userDraft = null;
  let anonDraft = null;

  for (const { get } of STORAGES) {
    const storage = get();
    const u = readRawDraft(storage, userKey);
    const a = readRawDraft(storage, anonKey);
    if (u && (!userDraft || u.updatedAt >= userDraft.updatedAt)) userDraft = u;
    if (a && (!anonDraft || a.updatedAt >= anonDraft.updatedAt)) anonDraft = a;
  }

  if (!anonDraft) return;

  const shouldMigrate =
    !userDraft || anonDraft.updatedAt > userDraft.updatedAt;

  if (!shouldMigrate) {
    for (const { get } of STORAGES) {
      try {
        get().removeItem(anonKey);
      } catch {
        // ignore
      }
    }
    return;
  }

  const payload = {
    step: anonDraft.step,
    form: serializeFormForDraft(anonDraft.form),
    updatedAt: Date.now(),
  };

  for (const { get } of STORAGES) {
    writeRawDraft(get(), userKey, payload);
    try {
      get().removeItem(anonKey);
    } catch {
      // ignore
    }
  }
}

/** Strip File objects — they cannot be stored in the browser. */
function serializeFormForDraft(form) {
  return {
    ...form,
    representativeInfo: {
      ...form.representativeInfo,
      idDocument: null,
    },
    businessDocuments: {
      registrationDocument: null,
      taxDocument: null,
      proofOfAddress: null,
      licenses: [],
    },
  };
}

function normalizeDraftPayload(parsed) {
  if (!parsed || typeof parsed !== "object") return null;

  const step = Number(parsed.step);
  const safeStep =
    Number.isFinite(step) && step >= 0 && step < STEPS_COUNT ? Math.floor(step) : 0;
  const updatedAt = Number(parsed.updatedAt) || 0;

  return {
    step: safeStep,
    form: mergeSupplierApplicationDraft(parsed.form),
    updatedAt,
  };
}

function readRawDraft(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return normalizeDraftPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeRawDraft(storage, key, payload) {
  try {
    storage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function mergeSupplierApplicationDraft(saved) {
  const empty = createEmptySupplierApplicationForm();
  if (!saved || typeof saved !== "object") return empty;

  return {
    businessInfo: {
      ...empty.businessInfo,
      ...saved.businessInfo,
      address: { ...empty.businessInfo.address, ...saved.businessInfo?.address },
    },
    operatingInfo: {
      ...empty.operatingInfo,
      ...saved.operatingInfo,
      tourCategories: Array.isArray(saved.operatingInfo?.tourCategories)
        ? saved.operatingInfo.tourCategories
        : [],
      destinations: Array.isArray(saved.operatingInfo?.destinations)
        ? saved.operatingInfo.destinations
        : [],
      languages: Array.isArray(saved.operatingInfo?.languages)
        ? saved.operatingInfo.languages
        : [],
    },
    representativeInfo: {
      ...empty.representativeInfo,
      ...saved.representativeInfo,
      idDocument: null,
      address: {
        ...empty.representativeInfo.address,
        ...saved.representativeInfo?.address,
      },
    },
    businessDocuments: { ...empty.businessDocuments },
    compliance: { ...empty.compliance, ...saved.compliance },
  };
}

/**
 * @param {string | undefined} userId
 * @returns {{ step: number; form: ReturnType<typeof createEmptySupplierApplicationForm> } | null}
 */
export function loadSupplierApplicationDraft(userId) {
  if (typeof window === "undefined") return null;

  const key = draftStorageKey(userId);
  let best = null;

  for (const { get } of STORAGES) {
    const draft = readRawDraft(get(), key);
    if (!draft) continue;
    if (!best || draft.updatedAt >= best.updatedAt) {
      best = draft;
    }
  }

  if (!best) return null;

  return { step: best.step, form: best.form };
}

/**
 * @param {string | undefined} userId
 * @param {{ step: number; form: object }} draft
 */
export function saveSupplierApplicationDraft(userId, draft) {
  if (typeof window === "undefined") return;

  if (userId) rememberDraftUserId(userId);

  const step = Number(draft?.step);
  const safeStep =
    Number.isFinite(step) && step >= 0 && step < STEPS_COUNT ? Math.floor(step) : 0;

  const payload = {
    step: safeStep,
    form: serializeFormForDraft(draft.form),
    updatedAt: Date.now(),
  };

  const key = draftStorageKey(userId);
  for (const { get } of STORAGES) {
    writeRawDraft(get(), key, payload);
  }
}

/** @param {string | undefined} userId */
export function clearSupplierApplicationDraft(userId) {
  if (typeof window === "undefined") return;

  const key = draftStorageKey(userId);
  for (const { get } of STORAGES) {
    try {
      get().removeItem(key);
    } catch {
      // ignore
    }
  }
}
