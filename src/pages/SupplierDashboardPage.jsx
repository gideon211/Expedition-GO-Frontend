import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Landmark,
  Smartphone,
  TrendingUp,
  DollarSign,
  BadgeCheck,
  ShoppingBag,
  Star,
  Settings,
  ChevronRight,
  LayoutDashboard,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupplierApplicationStatus } from "@/api/supplier";
import { getMyPayoutMethods } from "@/api/payout";
import { apiRequest } from "@/api/client";
import companyLogo from "@/assets/images/new_logo.png";

function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const toneStyles = {
    slate: "bg-white border-slate-200 text-slate-900",
    emerald: "bg-emerald-50/60 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50/60 border-amber-200 text-amber-900",
    sky: "bg-sky-50/60 border-sky-200 text-sky-900",
  };
  const iconStyles = {
    slate: "text-slate-500 bg-slate-100",
    emerald: "text-emerald-600 bg-emerald-100",
    amber: "text-amber-600 bg-amber-100",
    sky: "text-sky-600 bg-sky-100",
  };
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneStyles[tone]}`}>
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-70">
        <div className={`flex size-6 items-center justify-center rounded-md ${iconStyles[tone]}`}>
          <Icon className="size-3.5" />
        </div>
        {label}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, href, tone = "slate" }) {
  const navigate = useNavigate();
  const toneMap = {
    slate: "hover:border-slate-300 hover:bg-slate-50/50",
    emerald: "hover:border-emerald-200 hover:bg-emerald-50/40",
    sky: "hover:border-sky-200 hover:bg-sky-50/40",
    amber: "hover:border-amber-200 hover:bg-amber-50/40",
  };
  return (
    <button
      onClick={() => navigate(href)}
      className={`flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition ${toneMap[tone]}`}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-slate-50">
        <Icon className="size-5 text-slate-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <ChevronRight className="size-4 text-slate-400" />
    </button>
  );
}

export default function SupplierDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [methods, setMethods] = useState([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalCommission: 0,
    totalRevenue: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const [statusRes, methodsRes, earningsRes] = await Promise.allSettled([
        getSupplierApplicationStatus(),
        getMyPayoutMethods().catch(() => ({ data: { methods: [] } })),
        apiRequest("/suppliers/earnings", { method: "GET", auth: true }).catch(() => ({ data: {} })),
      ]);

      if (statusRes.status === "fulfilled") {
        const data = statusRes.value.data || {};
        setProfile(data.supplierProfile || data);
      } else {
        setError("Failed to load supplier profile.");
        setLoading(false);
        return;
      }

      if (methodsRes.status === "fulfilled") {
        setMethods(methodsRes.value.data?.methods || []);
      }

      if (earningsRes.status === "fulfilled") {
        const summary = earningsRes.value.data?.summary || {};
        setEarnings({
          totalEarnings: summary.totalEarnings || 0,
          totalCommission: summary.totalCommission || 0,
          totalRevenue: summary.totalRevenue || 0,
          totalBookings: summary.totalBookings || 0,
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const businessInfo = profile?.businessInfo || {};
  const reviewStatus = profile?.status || profile?.reviewStatus || "PENDING";
  const isApproved = reviewStatus === "APPROVED" || reviewStatus === "ACTIVE";
  const isActive = reviewStatus === "ACTIVE";
  const displayName = businessInfo.displayName || businessInfo.legalBusinessName || "Supplier";
  const hasPayoutMethod = methods.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/40">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <LayoutDashboard className="size-4" />
              Home
            </button>
          </div>
          <img
            src={companyLogo}
            alt="TravioAfrica"
            className="h-auto w-[140px] object-contain"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/supplier/payout")}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
              title="Payout Settings"
            >
              <Settings className="size-5" />
            </button>
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {displayName?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <LoaderCircle className="size-5 animate-spin" />
            Loading your dashboard...
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        <CheckCircle2 className="size-3" />
                        Active Supplier
                      </span>
                    ) : isApproved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                        <CheckCircle2 className="size-3" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        <Clock className="size-3" />
                        {reviewStatus}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Welcome back, {displayName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Here&apos;s what&apos;s happening with your supplier account.
                  </p>
                </div>
                {!hasPayoutMethod && isApproved && (
                  <Button
                    onClick={() => navigate("/supplier/payout")}
                    className="h-11 shrink-0 gap-2 rounded-lg text-sm font-semibold"
                  >
                    <Wallet className="size-4" />
                    Add Payout Method
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={DollarSign}
                label="Total Earnings"
                value={`$${Number(earnings.totalEarnings).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                tone="emerald"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Bookings"
                value={earnings.totalBookings}
                tone="sky"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Revenue"
                value={`$${Number(earnings.totalRevenue).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                tone="slate"
              />
              <StatCard
                icon={Wallet}
                label="Payout Methods"
                value={methods.length}
                tone={methods.length > 0 ? "emerald" : "amber"}
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <QuickActionCard
                icon={TrendingUp}
                title="Earnings & Payouts"
                description="View your earnings history, commissions, and payout status."
                href="/supplier/earnings"
                tone="emerald"
              />
              <QuickActionCard
                icon={Wallet}
                title="Payout Methods"
                description="Manage your bank, mobile money, and PayPal accounts."
                href="/supplier/payout"
                tone="sky"
              />
              <QuickActionCard
                icon={BadgeCheck}
                title="Account Status"
                description="View your application status and business details."
                href="/supplier/signin"
                tone="slate"
              />
            </div>

            {/* Payout Methods Summary */}
            {methods.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Saved Payout Methods
                </h3>
                <div className="space-y-3">
                  {methods.map((m) => {
                    const iconMap = {
                      BANK_TRANSFER: Landmark,
                      MOBILE_MONEY: Smartphone,
                      PAYPAL: Wallet,
                    };
                    const Icon = iconMap[m.type] || Wallet;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-white">
                            <Icon className="size-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {m.type === "BANK_TRANSFER" && m.bankName}
                              {m.type === "MOBILE_MONEY" && m.mobileProvider}
                              {m.type === "PAYPAL" && "PayPal"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {m.type === "BANK_TRANSFER" && m.accountName}
                              {m.type === "MOBILE_MONEY" && m.mobileNumber}
                              {m.type === "PAYPAL" && m.paypalEmail}
                            </p>
                          </div>
                        </div>
                        {m.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            <Star className="size-3 fill-emerald-600 text-emerald-600" />
                            Default
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Business Info Summary */}
            {businessInfo.legalBusinessName && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Business Details
                </h3>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between rounded-xl bg-slate-50/60 px-4 py-3">
                    <span className="text-slate-500">Legal Name</span>
                    <span className="font-semibold text-slate-900">{businessInfo.legalBusinessName}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50/60 px-4 py-3">
                    <span className="text-slate-500">Display Name</span>
                    <span className="font-semibold text-slate-900">{businessInfo.displayName || "—"}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50/60 px-4 py-3">
                    <span className="text-slate-500">Country</span>
                    <span className="font-semibold text-slate-900">{businessInfo.country || "—"}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50/60 px-4 py-3">
                    <span className="text-slate-500">Business Type</span>
                    <span className="font-semibold text-slate-900 capitalize">{businessInfo.businessType || "—"}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
