/**
 * @file SupplierPayoutPage.jsx
 * @description Supplier payout methods management (/supplier/payout).
 *   Approved suppliers are redirected to supplier.travioafrica.com/login instead.
 *
 * @see api/payout.js
 */
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Landmark,
  Smartphone,
  Wallet,
  ArrowLeft,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Star,
  Globe,
  Building2,
  CreditCard,
  Mail,
  BadgeCheck,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { invalidateSupplierAccess } from '@/api/supplierAccessQuery';
import { useAuth } from '@/components/auth/AuthProvider';
import { refreshStoredUserFromBackend } from '@/lib/auth';
import {
  fetchSupplierAccessSnapshot,
  isSupplierActive,
  isSupplierApproved,
  persistSupplierNavState,
  redirectToSupplierPortalLogin,
  requiresPayoutSetup,
  resolveSupplierNavState,
  SUPPLIER_SIGNIN_PATH,
} from '@/lib/supplierPortal';
import {
  getMyPayoutMethods,
  addPayoutMethod,
  deletePayoutMethod,
  setDefaultPayoutMethod,
  parseCreatedPayoutMethod,
} from '@/api/payout';
import companyLogo from '@/assets/images/new_logo.png';

const PAYOUT_TYPES = [
  {
    key: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    icon: Landmark,
    description: 'Receive payouts directly to your bank account via wire transfer.',
  },
  {
    key: 'PAYPAL',
    label: 'PayPal',
    icon: Wallet,
    description: 'Receive payouts to your PayPal account.',
  },
];

/** Shape payload to match Expedition-Go-Backend-v2 payoutMethodController validation. */
function buildPayoutPayload(data) {
  const currency = (data.currency || 'USD').trim().toUpperCase();

  if (data.type === 'BANK_TRANSFER') {
    const payload = {
      type: 'BANK_TRANSFER',
      currency,
      accountName: data.accountName?.trim(),
      bankName: data.bankName?.trim(),
      bankCountry: data.bankCountry?.trim().toUpperCase(),
    };

    const accountNumber = data.accountNumber?.trim();
    const iban = data.iban?.trim();
    if (accountNumber) payload.accountNumber = accountNumber;
    if (iban) payload.iban = iban;

    const optionalFields = ['bankAddress', 'routingNumber', 'swiftCode', 'sortCode', 'branchCode'];
    for (const field of optionalFields) {
      const value = data[field]?.trim();
      if (value) payload[field] = value;
    }

    return payload;
  }

  if (data.type === 'PAYPAL') {
    return {
      type: 'PAYPAL',
      currency,
      paypalEmail: data.paypalEmail?.trim().toLowerCase(),
    };
  }

  return { type: data.type, currency };
}

function validateBankTransferForm(form) {
  if (!form.accountName?.trim()) return 'Account holder name is required.';
  if (!form.accountNumber?.trim() && !form.iban?.trim()) {
    return 'Account number or IBAN is required.';
  }
  if (!form.bankName?.trim()) return 'Bank name is required.';
  if (!form.bankCountry?.trim()) return 'Bank country code is required (e.g. GH, US).';
  if (form.bankCountry.trim().length !== 2) {
    return 'Bank country must be a 2-letter ISO code (e.g. GH, NG, US).';
  }
  return null;
}

function validatePayPalForm(form) {
  const email = form.paypalEmail?.trim();
  if (!email) return 'PayPal email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid PayPal email address.';
  }
  return null;
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

function StyledInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
      {Icon && <Icon className="size-4 shrink-0 text-slate-400" />}
      <Input className="border-0 bg-transparent px-3 shadow-none focus:ring-0" {...props} />
    </div>
  );
}

function BankTransferForm({ onSubmit, onValidationError, loading }) {
  const [form, setForm] = useState({
    accountName: '',
    accountNumber: '',
    iban: '',
    bankName: '',
    bankCountry: '',
    bankAddress: '',
    routingNumber: '',
    swiftCode: '',
    sortCode: '',
    branchCode: '',
    currency: 'USD',
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateBankTransferForm(form);
    if (validationError) {
      onValidationError?.(validationError);
      return;
    }
    onSubmit(buildPayoutPayload({ type: 'BANK_TRANSFER', ...form }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FieldLabel required>Account Holder Name</FieldLabel>
        <StyledInput
          icon={CreditCard}
          placeholder="e.g. John Doe"
          value={form.accountName}
          onChange={(e) => update('accountName', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel required>Account Number</FieldLabel>
        <StyledInput
          icon={CreditCard}
          placeholder="e.g. 1234567890"
          value={form.accountNumber}
          onChange={(e) => update('accountNumber', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>IBAN (if applicable)</FieldLabel>
        <StyledInput
          icon={CreditCard}
          placeholder="e.g. GB82 WEST 1234 5698 7654 32"
          value={form.iban}
          onChange={(e) => update('iban', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel required>Bank Name</FieldLabel>
        <StyledInput
          icon={Building2}
          placeholder="e.g. Chase Bank"
          value={form.bankName}
          onChange={(e) => update('bankName', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel required>Bank Country Code</FieldLabel>
        <StyledInput
          icon={Globe}
          placeholder="2-letter code, e.g. US, GH, NG"
          maxLength={2}
          value={form.bankCountry}
          onChange={(e) => update('bankCountry', e.target.value.toUpperCase())}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Bank Address</FieldLabel>
        <StyledInput
          icon={Building2}
          placeholder="e.g. 270 Park Ave, New York, NY"
          value={form.bankAddress}
          onChange={(e) => update('bankAddress', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Routing Number</FieldLabel>
        <StyledInput
          placeholder="e.g. 021000021"
          value={form.routingNumber}
          onChange={(e) => update('routingNumber', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>SWIFT/BIC Code</FieldLabel>
        <StyledInput
          placeholder="e.g. CHASUS33"
          value={form.swiftCode}
          onChange={(e) => update('swiftCode', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Sort Code</FieldLabel>
        <StyledInput
          placeholder="e.g. 12-34-56"
          value={form.sortCode}
          onChange={(e) => update('sortCode', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Branch Code</FieldLabel>
        <StyledInput
          placeholder="e.g. 001"
          value={form.branchCode}
          onChange={(e) => update('branchCode', e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Currency</FieldLabel>
        <StyledInput
          placeholder="e.g. USD, GHS, NGN"
          value={form.currency}
          onChange={(e) => update('currency', e.target.value.toUpperCase())}
        />
      </div>
      <div className="sm:col-span-2">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg text-base font-semibold"
        >
          {loading ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : (
            'Save Bank Transfer Method'
          )}
        </Button>
      </div>
    </form>
  );
}

function PayPalForm({ onSubmit, onValidationError, loading }) {
  const [form, setForm] = useState({
    paypalEmail: '',
    currency: 'USD',
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validatePayPalForm(form);
    if (validationError) {
      onValidationError?.(validationError);
      return;
    }
    onSubmit(buildPayoutPayload({ type: 'PAYPAL', ...form }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FieldLabel required>PayPal Email</FieldLabel>
        <StyledInput
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          value={form.paypalEmail}
          onChange={(e) => update('paypalEmail', e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Currency</FieldLabel>
        <StyledInput
          placeholder="e.g. USD"
          value={form.currency}
          onChange={(e) => update('currency', e.target.value.toUpperCase())}
        />
      </div>
      <div className="sm:col-span-2">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg text-base font-semibold"
        >
          {loading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : 'Save PayPal Method'}
        </Button>
      </div>
    </form>
  );
}

function getPayoutMethodLabel(method) {
  if (!method) return 'this payout method';
  if (method.type === 'BANK_TRANSFER') {
    return method.bankName || 'Bank transfer';
  }
  if (method.type === 'PAYPAL') {
    return method.paypalEmail || 'PayPal';
  }
  if (method.type === 'MOBILE_MONEY') {
    return method.mobileProvider || 'Mobile money';
  }
  return 'this payout method';
}

function ExistingMethodCard({ method, onDeleteRequest, onSetDefault }) {
  const iconMap = {
    BANK_TRANSFER: Landmark,
    MOBILE_MONEY: Smartphone,
    PAYPAL: Wallet,
  };
  const Icon = iconMap[method.type] || CreditCard;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-slate-50">
          <Icon className="size-5 text-slate-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900">
              {method.type === 'BANK_TRANSFER' && method.bankName}
              {method.type === 'MOBILE_MONEY' && method.mobileProvider}
              {method.type === 'PAYPAL' && 'PayPal'}
            </p>
            {method.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                <Star className="size-3 fill-emerald-600 text-emerald-600" />
                Default
              </span>
            )}
            {method.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                <BadgeCheck className="size-3 text-sky-600" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                <Clock className="size-3 text-amber-600" />
                Pending Verification
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {method.type === 'BANK_TRANSFER' && (
              <>
                {method.accountName} ·{' '}
                {method.accountNumber ? `****${method.accountNumber.slice(-4)}` : '—'}
              </>
            )}
            {method.type === 'MOBILE_MONEY' && method.mobileNumber}
            {method.type === 'PAYPAL' && method.paypalEmail}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!method.isDefault && onSetDefault && (
          <button
            onClick={() => onSetDefault(method.id)}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            title="Set as default"
          >
            Set Default
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteRequest(method)}
          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          title="Remove"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function SupplierPayoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('BANK_TRANSFER');
  const [methods, setMethods] = useState([]);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [statusChecking, setStatusChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hasSavedMethod = methods.length > 0;
  const payoutComplete = hasSavedMethod && isSupplierApproved(reviewStatus);

  async function syncSupplierNav(snapshot) {
    if (user && snapshot) {
      persistSupplierNavState(user, resolveSupplierNavState(user, snapshot));
    }
    await invalidateSupplierAccess(queryClient, user);
  }

  useEffect(() => {
    let cancelled = false;

    fetchSupplierAccessSnapshot()
      .then((snapshot) => {
        if (cancelled) return;

        if (snapshot.reviewStatus && !requiresPayoutSetup(snapshot.reviewStatus)) {
          navigate(SUPPLIER_SIGNIN_PATH, { replace: true });
          return;
        }

        if (snapshot.route === 'portal') {
          redirectToSupplierPortalLogin();
          return;
        }

        setReviewStatus(snapshot.reviewStatus);
        setMethods(snapshot.methods);
        setShowAddForm(snapshot.methods.length === 0);
        setListLoading(false);
        setStatusChecking(false);
      })
      .catch(() => {
        if (!cancelled) {
          setListLoading(false);
          setStatusChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function refreshMethods() {
    setListLoading(true);
    try {
      const snapshot = await fetchSupplierAccessSnapshot();
      setMethods(snapshot.methods);
      setReviewStatus(snapshot.reviewStatus);
      if (snapshot.methods.length > 0) {
        setShowAddForm(false);
      }
    } catch {
      setMethods([]);
    } finally {
      setListLoading(false);
    }
  }

  async function handleAdd(payload) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await addPayoutMethod(payload);
      const created = parseCreatedPayoutMethod(res);

      const snapshot = await fetchSupplierAccessSnapshot();
      if (!snapshot.hasPayout) {
        throw new Error(
          'Payout details were not saved. Check your connection and try again, or contact support.'
        );
      }

      setMethods(snapshot.methods);
      setReviewStatus(snapshot.reviewStatus);
      setShowAddForm(false);
      await refreshStoredUserFromBackend();
      await syncSupplierNav(snapshot);

      if (created?.id && !snapshot.methods.some((m) => m.id === created.id)) {
        setMethods((prev) => [...prev, created]);
      }

      if (isSupplierActive(snapshot.reviewStatus)) {
        setSuccess('Payout method saved. Opening your supplier dashboard...');
        redirectToSupplierPortalLogin();
        return;
      }

      if (isSupplierApproved(snapshot.reviewStatus)) {
        setSuccess(
          'Payout method saved to your supplier profile. Your account is pending admin activation.'
        );
        return;
      }

      setSuccess('Payout method saved successfully.');
    } catch (err) {
      setError(err?.message || 'Failed to add payout method. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeletePayout() {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    setError('');
    try {
      await deletePayoutMethod(deleteTarget.id);
      setMethods((prev) => {
        const next = prev.filter((m) => m.id !== deleteTarget.id);
        if (next.length === 0) setShowAddForm(true);
        return next;
      });
      setSuccess('Payout method removed.');
      setDeleteTarget(null);
      const snapshot = await fetchSupplierAccessSnapshot();
      await syncSupplierNav(snapshot);
    } catch (err) {
      setError(err?.message || 'Failed to remove payout method.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleSetDefault(id) {
    try {
      await setDefaultPayoutMethod(id);
      setSuccess('Default payout method updated.');
      await refreshMethods();
      await invalidateSupplierAccess(queryClient, user);
    } catch (err) {
      setError(err?.message || 'Failed to update default method.');
    }
  }

  const reportValidationError = (message) => {
    setSuccess('');
    setError(message);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'BANK_TRANSFER':
        return (
          <BankTransferForm
            onSubmit={handleAdd}
            onValidationError={reportValidationError}
            loading={loading}
          />
        );
      case 'PAYPAL':
        return (
          <PayPalForm
            onSubmit={handleAdd}
            onValidationError={reportValidationError}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  if (statusChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoaderCircle className="size-6 animate-spin text-[color:var(--brand-green)]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-screen flex-col bg-white"
    >
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete payout method?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-800">
                {getPayoutMethodLabel(deleteTarget)}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteLoading}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleteLoading}
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmDeletePayout}
            >
              {deleteLoading ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete payout method'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button
            onClick={() => navigate('/', { state: { postAuthSplash: true } })}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <img src={companyLogo} alt="TravioAfrica" className="h-auto w-[140px] object-contain" />
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50">
              <BadgeCheck className="size-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Payout Setup</h1>
          <p className="mt-2 text-sm text-slate-500">
            {payoutComplete
              ? 'Your payout method is on file. Finance will verify it before your dashboard is activated.'
              : 'Your application has been approved! Add at least one payout method (Bank Transfer or PayPal) to continue.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Existing methods */}
        {listLoading ? (
          <div className="mb-8 flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
            <LoaderCircle className="size-4 animate-spin" />
            Loading payout methods...
          </div>
        ) : methods.length > 0 ? (
          <div className="mb-8 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Saved Payout Methods
            </h3>
            {methods.map((m) => (
              <ExistingMethodCard
                key={m.id}
                method={m}
                onDeleteRequest={setDeleteTarget}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
            <p className="text-sm text-slate-500">
              No payout methods saved yet. Add your first one below.
            </p>
          </div>
        )}

        {payoutComplete && (
          <div className="mb-8 space-y-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
            <p className="text-sm text-amber-900">
              <strong>Payout setup complete.</strong> Your bank details are saved in our system. You
              do not need to submit the form again. An admin will verify your method and activate
              your supplier dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                onClick={() => navigate(SUPPLIER_SIGNIN_PATH)}
              >
                View application status
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-slate-300 bg-white"
                onClick={() => navigate('/', { state: { postAuthSplash: true } })}
              >
                Back to homepage
              </Button>
            </div>
          </div>
        )}

        {hasSavedMethod && !showAddForm ? (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline"
            >
              Add another payout method
            </button>
          </div>
        ) : null}

        {showAddForm && (
          <>
            {/* Tabs */}
            <div className="mb-6 grid grid-cols-2 gap-2">
              {PAYOUT_TYPES.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setActiveTab(t.key);
                      setError('');
                      setSuccess('');
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition ${
                      isActive
                        ? 'border-emerald-200 bg-emerald-50/60 ring-1 ring-emerald-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`size-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                    />
                    <span
                      className={`text-xs font-bold ${isActive ? 'text-emerald-800' : 'text-slate-600'}`}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="mb-1 text-base font-bold text-slate-900">
                {PAYOUT_TYPES.find((t) => t.key === activeTab)?.label}
              </h3>
              <p className="mb-6 text-sm text-slate-500">
                {PAYOUT_TYPES.find((t) => t.key === activeTab)?.description}
              </p>
              {renderForm()}
            </div>
          </>
          )}
      </div>
    </motion.div>
  );
}
