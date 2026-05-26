import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMyPayouts } from "@/api/payout";
import { apiRequest } from "@/api/client";
import companyLogo from "@/assets/images/new_logo.png";

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-sky-50 text-sky-700 border-sky-200",
    PROCESSING: "bg-violet-50 text-violet-700 border-violet-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
    CANCELLED: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const icons = {
    PENDING: Clock,
    APPROVED: CheckCircle2,
    PROCESSING: LoaderCircle,
    PAID: BadgeCheck,
    FAILED: XCircle,
    CANCELLED: XCircle,
  };
  const Icon = icons[status] || Clock;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${styles[status] || styles.PENDING}`}
    >
      <Icon className="size-3" />
      {status}
    </span>
  );
}

function PayoutMethodIcon({ type }) {
  if (type === "BANK_TRANSFER") return <Landmark className="size-4 text-slate-500" />;
  if (type === "MOBILE_MONEY") return <Smartphone className="size-4 text-slate-500" />;
  if (type === "PAYPAL") return <Wallet className="size-4 text-slate-500" />;
  return <Wallet className="size-4 text-slate-500" />;
}

export default function SupplierEarningsPage() {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState({ totalEarned: 0, totalPayouts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsSummary, setEarningsSummary] = useState({
    totalEarnings: 0,
    totalCommission: 0,
    totalRevenue: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    loadPayouts();
    loadEarnings();
  }, []);

  async function loadPayouts() {
    setLoading(true);
    try {
      const res = await getMyPayouts({ limit: 50 });
      setPayouts(res.data?.payouts || []);
      setSummary(res.data?.summary || { totalEarned: 0, totalPayouts: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load payouts.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEarnings() {
    setEarningsLoading(true);
    try {
      const res = await apiRequest("/suppliers/earnings", { method: "GET", auth: true });
      const data = res.data || {};
      setEarningsSummary({
        totalEarnings: data.summary?.totalEarnings || 0,
        totalCommission: data.summary?.totalCommission || 0,
        totalRevenue: data.summary?.totalRevenue || 0,
        totalBookings: data.summary?.totalBookings || 0,
      });
    } catch {
      // Non-critical; earnings endpoint may not be available
    } finally {
      setEarningsLoading(false);
    }
  }

  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING" || p.status === "APPROVED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const paidTotal = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
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

      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Earnings & Payouts
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your bookings, commissions, and payout status.
            </p>
          </div>
          <Button
            onClick={() => navigate("/supplier/payout")}
            variant="outline"
            className="h-10 gap-2 rounded-lg text-sm font-semibold"
          >
            <Wallet className="size-4" />
            Manage Payout Methods
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <TrendingUp className="size-4" />
              Total Earnings
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              ${Number(earningsSummary.totalEarnings || summary.totalEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <DollarSign className="size-4" />
              Paid Out
            </div>
            <p className="text-2xl font-extrabold text-emerald-700">
              ${Number(paidTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Clock className="size-4" />
              Pending
            </div>
            <p className="text-2xl font-extrabold text-amber-700">
              ${Number(pendingTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <BadgeCheck className="size-4" />
              Bookings
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {earningsSummary.totalBookings || summary.totalPayouts || 0}
            </p>
          </div>
        </div>

        {/* Payout History */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">Payout History</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <LoaderCircle className="size-4 animate-spin" />
              Loading payouts...
            </div>
          ) : payouts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-slate-50">
                  <Wallet className="size-6 text-slate-300" />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">No payouts yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Once your tours are booked and confirmed, payouts will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Booking</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {p.booking?.tour?.title || "Tour"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {p.booking?.bookingNumber || p.id?.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PayoutMethodIcon type={p.payoutMethod?.type} />
                          <span className="text-slate-600">
                            {p.payoutMethod?.type === "BANK_TRANSFER" && p.payoutMethod?.bankName}
                            {p.payoutMethod?.type === "MOBILE_MONEY" && p.payoutMethod?.mobileProvider}
                            {p.payoutMethod?.type === "PAYPAL" && "PayPal"}
                            {!p.payoutMethod && "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString()
                          : p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
