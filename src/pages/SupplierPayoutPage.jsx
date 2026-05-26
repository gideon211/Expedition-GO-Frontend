import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthToken } from "@/lib/auth";
import {
  getMyPayoutMethods,
  addPayoutMethod,
  deletePayoutMethod,
  setDefaultPayoutMethod,
} from "@/api/payout";
import companyLogo from "@/assets/images/new_logo.png";

const PAYOUT_TYPES = [
  {
    key: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: Landmark,
    description: "Receive payouts directly to your bank account via wire or ACH.",
  },
  {
    key: "MOBILE_MONEY",
    label: "Mobile Money",
    icon: Smartphone,
    description: "Receive payouts to your mobile money wallet (MTN, Orange, Airtel, etc.).",
  },
  {
    key: "PAYPAL",
    label: "PayPal",
    icon: Wallet,
    description: "Receive payouts to your PayPal account.",
  },
];

const MOBILE_PROVIDERS = [
  "MTN",
  "Orange",
  "Airtel",
  "Vodafone",
  "Safaricom",
  "Tigo",
  "Other",
];

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
      <Input
        className="border-0 bg-transparent px-3 shadow-none focus:ring-0"
        {...props}
      />
    </div>
  );
}

function BankTransferForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    iban: "",
    bankName: "",
    bankCountry: "",
    bankAddress: "",
    routingNumber: "",
    swiftCode: "",
    sortCode: "",
    branchCode: "",
    currency: "USD",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.accountName.trim()) return alert("Account name is required");
    if (!form.accountNumber.trim() && !form.iban.trim()) return alert("Account number or IBAN is required");
    if (!form.bankName.trim()) return alert("Bank name is required");
    if (!form.bankCountry.trim()) return alert("Bank country is required");
    onSubmit({ type: "BANK_TRANSFER", ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FieldLabel required>Account Holder Name</FieldLabel>
        <StyledInput
          icon={CreditCard}
          placeholder="e.g. John Doe"
          value={form.accountName}
          onChange={(e) => update("accountName", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel required>Account Number</FieldLabel>
        <StyledInput
          icon={CreditCard}
          placeholder="e.g. 1234567890"
          value={form.accountNumber}
          onChange={(e) => update("accountNumber", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>IBAN (if applicable)</FieldLabel>
        <StyledInput
          icon={CreditCard}
          placeholder="e.g. GB82 WEST 1234 5698 7654 32"
          value={form.iban}
          onChange={(e) => update("iban", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel required>Bank Name</FieldLabel>
        <StyledInput
          icon={Building2}
          placeholder="e.g. Chase Bank"
          value={form.bankName}
          onChange={(e) => update("bankName", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel required>Bank Country Code</FieldLabel>
        <StyledInput
          icon={Globe}
          placeholder="2-letter code, e.g. US, GH, NG"
          maxLength={2}
          value={form.bankCountry}
          onChange={(e) => update("bankCountry", e.target.value.toUpperCase())}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Bank Address</FieldLabel>
        <StyledInput
          icon={Building2}
          placeholder="e.g. 270 Park Ave, New York, NY"
          value={form.bankAddress}
          onChange={(e) => update("bankAddress", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Routing Number</FieldLabel>
        <StyledInput
          placeholder="e.g. 021000021"
          value={form.routingNumber}
          onChange={(e) => update("routingNumber", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>SWIFT/BIC Code</FieldLabel>
        <StyledInput
          placeholder="e.g. CHASUS33"
          value={form.swiftCode}
          onChange={(e) => update("swiftCode", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Sort Code</FieldLabel>
        <StyledInput
          placeholder="e.g. 12-34-56"
          value={form.sortCode}
          onChange={(e) => update("sortCode", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Branch Code</FieldLabel>
        <StyledInput
          placeholder="e.g. 001"
          value={form.branchCode}
          onChange={(e) => update("branchCode", e.target.value)}
        />
      </div>
      <div>
        <FieldLabel>Currency</FieldLabel>
        <StyledInput
          placeholder="e.g. USD, GHS, NGN"
          value={form.currency}
          onChange={(e) => update("currency", e.target.value.toUpperCase())}
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
            "Save Bank Transfer Method"
          )}
        </Button>
      </div>
    </form>
  );
}

function MobileMoneyForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    mobileProvider: "",
    mobileNumber: "",
    currency: "USD",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.mobileProvider) return alert("Mobile provider is required");
    if (!form.mobileNumber.trim()) return alert("Mobile number is required");
    onSubmit({ type: "MOBILE_MONEY", ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FieldLabel required>Mobile Provider</FieldLabel>
        <select
          className="h-11 w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 text-sm shadow-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
          value={form.mobileProvider}
          onChange={(e) => update("mobileProvider", e.target.value)}
        >
          <option value="">Select provider</option>
          {MOBILE_PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <FieldLabel required>Mobile Number</FieldLabel>
        <StyledInput
          icon={Smartphone}
          placeholder="e.g. +233 20 123 4567"
          value={form.mobileNumber}
          onChange={(e) => update("mobileNumber", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Currency</FieldLabel>
        <StyledInput
          placeholder="e.g. USD, GHS"
          value={form.currency}
          onChange={(e) => update("currency", e.target.value.toUpperCase())}
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
            "Save Mobile Money Method"
          )}
        </Button>
      </div>
    </form>
  );
}

function PayPalForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    paypalEmail: "",
    currency: "USD",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.paypalEmail.trim()) return alert("PayPal email is required");
    onSubmit({ type: "PAYPAL", ...form });
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
          onChange={(e) => update("paypalEmail", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Currency</FieldLabel>
        <StyledInput
          placeholder="e.g. USD"
          value={form.currency}
          onChange={(e) => update("currency", e.target.value.toUpperCase())}
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
            "Save PayPal Method"
          )}
        </Button>
      </div>
    </form>
  );
}

function ExistingMethodCard({ method, onDelete, onSetDefault }) {
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
              {method.type === "BANK_TRANSFER" && method.bankName}
              {method.type === "MOBILE_MONEY" && method.mobileProvider}
              {method.type === "PAYPAL" && "PayPal"}
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
            {method.type === "BANK_TRANSFER" && (
              <>
                {method.accountName} · {method.accountNumber ? `****${method.accountNumber.slice(-4)}` : "—"}
              </>
            )}
            {method.type === "MOBILE_MONEY" && method.mobileNumber}
            {method.type === "PAYPAL" && method.paypalEmail}
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
          onClick={() => onDelete(method.id)}
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
  const [activeTab, setActiveTab] = useState("BANK_TRANSFER");
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadMethods();
  }, []);

  async function loadMethods() {
    setListLoading(true);
    try {
      const res = await getMyPayoutMethods();
      setMethods(res.data?.methods || []);
    } catch {
      setMethods([]);
    } finally {
      setListLoading(false);
    }
  }

  async function handleAdd(payload) {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await addPayoutMethod(payload);
      setSuccess("Payout method added successfully. Redirecting to dashboard...");
      await loadMethods();
      setTimeout(async () => {
        const token = await getAuthToken();
        if (token) {
          window.location.href = `https://supplier.travioafrica.com/auth/callback?token=${encodeURIComponent(token)}`;
        } else {
          window.location.href = "https://supplier.travioafrica.com";
        }
      }, 1200);
    } catch (err) {
      setError(err?.message || "Failed to add payout method. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to remove this payout method?")) return;
    try {
      await deletePayoutMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      setSuccess("Payout method removed.");
    } catch (err) {
      setError(err?.message || "Failed to remove payout method.");
    }
  }

  async function handleSetDefault(id) {
    try {
      await setDefaultPayoutMethod(id);
      setSuccess("Default payout method updated.");
      await loadMethods();
    } catch (err) {
      setError(err?.message || "Failed to update default method.");
    }
  }

  const renderForm = () => {
    switch (activeTab) {
      case "BANK_TRANSFER":
        return <BankTransferForm onSubmit={handleAdd} loading={loading} />;
      case "MOBILE_MONEY":
        return <MobileMoneyForm onSubmit={handleAdd} loading={loading} />;
      case "PAYPAL":
        return <PayPalForm onSubmit={handleAdd} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button
            onClick={() => navigate("/supplier/signin")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <img
            src={companyLogo}
            alt="TravioAfrica"
            className="h-auto w-[140px] object-contain"
          />
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Payout Setup
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your application has been approved! Add at least one payout method to start receiving payments.
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
                onDelete={handleDelete}
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

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-2">
          {PAYOUT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setError("");
                  setSuccess("");
                }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50/60 ring-1 ring-emerald-200"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`size-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                />
                <span
                  className={`text-xs font-bold ${isActive ? "text-emerald-800" : "text-slate-600"}`}
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
      </div>
    </div>
  );
}
