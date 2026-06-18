/**
 * @file supplierAccessQuery.js
 * @description Shared React Query cache for supplier nav state (dedupes navbar + section).
 */
import { getAuthToken } from '@/lib/auth';
import {
  fetchSupplierAccessSnapshot,
  getSupplierAccessUserId,
  readCachedSupplierSnapshot,
} from '@/lib/supplierPortal';

export const SUPPLIER_ACCESS_QUERY_KEY = 'supplier-access';

export function supplierAccessQueryKey(user) {
  const userId = getSupplierAccessUserId(user);
  return userId ? [SUPPLIER_ACCESS_QUERY_KEY, userId] : [SUPPLIER_ACCESS_QUERY_KEY];
}

/** Ensures Firebase session is ready before supplier APIs run (fixes refresh race). */
export async function fetchSupplierAccessForNav() {
  const token = await getAuthToken();
  if (!token) {
    const error = new Error('Authentication is not ready yet.');
    error.code = 'AUTH_NOT_READY';
    throw error;
  }
  return fetchSupplierAccessSnapshot();
}

export function getSupplierAccessInitialData(user) {
  const cached = readCachedSupplierSnapshot(user);
  if (!cached) return undefined;

  return {
    ...cached,
    statusData: null,
    statusError: null,
    statusNotFound: false,
    methods: [],
    route: null,
  };
}

export function prefetchSupplierAccess(queryClient, user) {
  const userId = getSupplierAccessUserId(user);
  if (!queryClient || !userId) return Promise.resolve();

  return queryClient.prefetchQuery({
    queryKey: supplierAccessQueryKey(user),
    queryFn: fetchSupplierAccessForNav,
    staleTime: 1000 * 30,
  });
}

export function invalidateSupplierAccess(queryClient, user) {
  const userId = getSupplierAccessUserId(user);
  if (!queryClient || !userId) return Promise.resolve();

  return queryClient.invalidateQueries({
    queryKey: [SUPPLIER_ACCESS_QUERY_KEY, userId],
  });
}
