import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  AlertCircle,
  Clock,
  ChevronRight,
  CalendarCheck,
  Star,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/axios";

const BOOKING_STATUS_COLORS = {
  CONFIRMED: "#00d67f",
  PENDING: "#ffc400",
  CANCELLED: "#dc3545",
  REFUNDED: "#298dff",
  AWAITING_CONFIRMATION: "#f97316",
};

function StatCard({ title, value, change, isPositive, icon: Icon, color, loading }) {
  return (
    <div className="bg-white rounded-lg border border-[#eaeaea] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          <Icon size={20} className={color.replace("bg-", "text-")} />
        </div>
        {!loading && change !== undefined && change !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-[#00d67f]" : "text-[#dc3545]"}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-[#f8fafc] rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-[#1e293b]">{value}</p>
      )}
      <p className="text-sm text-[#64748b] mt-1">{title}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#eaeaea] rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-[#1e293b] mb-1">{label}</p>
        <p className="text-xs text-[#64748b]">
          Revenue: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await api.get("/suppliers/dashboard");
        setData(response.data?.data || response.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Derive stats from real data
  const profile = data?.supplierProfile || {};
  const stats = data?.stats || {};
  const recentBookings = data?.recentActivity?.bookings || [];
  const recentReviews = data?.recentActivity?.reviews || [];
  const monthlyRevenue = data?.analytics?.monthlyRevenue || [];

  // Calculate totals
  const totalRevenue = profile.totalEarnings || stats?.revenue?._sum?.supplierPayout || 0;
  const totalBookings = profile.totalBookings || stats?.revenue?._count || 0;
  const totalTours = stats?.tours?.reduce((sum, t) => sum + (t._count || 0), 0) || 0;

  // Booking status breakdown for pie chart
  const bookingStatusData = (stats?.bookings || []).map((b) => ({
    name: b.status.replace(/_/g, " "),
    value: b._count,
    color: BOOKING_STATUS_COLORS[b.status] || "#9e9e9e",
  }));

  // Format monthly revenue for chart
  const revenueChartData = monthlyRevenue.map((m) => ({
    month: new Date(m.month).toLocaleString("default", { month: "short" }),
    revenue: Number(m.revenue) || 0,
  })).reverse();

  // Pending items derived from real data
  const pendingBookings = (stats?.bookings || []).find((b) => b.status === "PENDING" || b.status === "AWAITING_CONFIRMATION")?._count || 0;
  const pendingReviews = recentReviews.filter((r) => r.status === "PENDING").length;

  const PENDING_ITEMS = [
    { label: "Awaiting Confirmation", count: pendingBookings, route: "/bookings?tab=AWAITING_CONFIRMATION", color: "text-[#ffc400]", bg: "bg-[#fffbeb]" },
    { label: "Recent Reviews", count: recentReviews.length, route: "/reviews", color: "text-[#044b3b]", bg: "bg-[#f0fdf4]" },
    { label: "Total Products", count: totalTours, route: "/products", color: "text-[#1d4ed8]", bg: "bg-[#eff6ff]" },
    { label: "Total Bookings", count: totalBookings, route: "/bookings", color: "text-[#7c3aed]", bg: "bg-[#f5f3ff]" },
  ];

  // Top performing tours from recent bookings
  const tourPerformance = {};
  recentBookings.forEach((b) => {
    const title = b.tour?.title || "Unknown";
    if (!tourPerformance[title]) {
      tourPerformance[title] = { name: title, bookings: 0, revenue: 0 };
    }
    tourPerformance[title].bookings += 1;
    tourPerformance[title].revenue += Number(b.total) || 0;
  });
  const topTours = Object.values(tourPerformance)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-[#64748b]">
          <Loader2 size={32} className="animate-spin text-[#044b3b]" />
          <p className="text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-800">Failed to load dashboard</p>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs font-medium text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#1e293b]">Dashboard</h1>
        <p className="text-sm text-[#64748b] mt-1">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          isPositive={true}
          icon={DollarSign}
          color="bg-[#044b3b]"
          loading={loading}
        />
        <StatCard
          title="Active Bookings"
          value={totalBookings.toLocaleString()}
          change={8.2}
          isPositive={true}
          icon={ShoppingCart}
          color="bg-[#0f766e]"
          loading={loading}
        />
        <StatCard
          title="Total Products"
          value={totalTours.toLocaleString()}
          change={3}
          isPositive={true}
          icon={Package}
          color="bg-[#18ddef]"
          loading={loading}
        />
        <StatCard
          title="Avg. Rating"
          value={profile.averageRating ? `${profile.averageRating} ★` : "—"}
          change={-2.1}
          isPositive={false}
          icon={Star}
          color="bg-[#ffc400]"
          loading={loading}
        />
      </div>

      {/* Quick Actions / Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {PENDING_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className={`flex items-center justify-between p-4 rounded-lg border border-[#eaeaea] hover:shadow-md transition-all text-left ${item.bg}`}
          >
            <div>
              <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
              <p className="text-sm text-[#64748b] mt-0.5">{item.label}</p>
            </div>
            <ChevronRight size={18} className="text-[#9e9e9e]" />
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#eaeaea] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">Revenue Trend</h3>
            <span className="text-xs text-[#64748b]">Last 12 months</span>
          </div>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#044b3b" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#044b3b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#044b3b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-[#9e9e9e]">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg border border-[#eaeaea] p-5">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Booking Status</h3>
          {bookingStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {bookingStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#64748b]">{item.name}</span>
                    </span>
                    <span className="font-medium text-[#1e293b]">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#9e9e9e]">
              No booking data yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg border border-[#eaeaea] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">Recent Bookings</h3>
            <button
              onClick={() => navigate("/bookings")}
              className="text-xs text-[#044b3b] font-medium hover:underline flex items-center gap-1"
            >
              View All
              <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaeaea]">
                  <th className="text-left py-2 text-xs font-semibold text-[#64748b] uppercase">Booking</th>
                  <th className="text-left py-2 text-xs font-semibold text-[#64748b] uppercase">Customer</th>
                  <th className="text-left py-2 text-xs font-semibold text-[#64748b] uppercase">Amount</th>
                  <th className="text-left py-2 text-xs font-semibold text-[#64748b] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-[#eaeaea] last:border-0 hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3">
                        <p className="text-sm font-medium text-[#044b3b]">{booking.bookingNumber || booking.id?.slice(0, 8)}</p>
                        <p className="text-xs text-[#64748b]">{formatDate(booking.selectedDate)}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-[#1e293b]">{booking.customer?.name || "—"}</p>
                        <p className="text-xs text-[#64748b] truncate max-w-[150px]">{booking.tour?.title || "—"}</p>
                      </td>
                      <td className="py-3 font-medium text-[#1e293b]">{formatCurrency(booking.total)}</td>
                      <td className="py-3">
                        <StatusBadge status={booking.status} label={booking.status?.replace(/_/g, " ")} size="sm" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-[#9e9e9e]">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Tours */}
        <div className="bg-white rounded-lg border border-[#eaeaea] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">Top Performing Tours</h3>
            <button
              onClick={() => navigate("/performance")}
              className="text-xs text-[#044b3b] font-medium hover:underline flex items-center gap-1"
            >
              View Details
              <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-4">
            {topTours.length > 0 ? (
              topTours.map((tour, index) => (
                <div key={tour.name} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-[#64748b]">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#1e293b]">{tour.name}</p>
                      <span className="text-xs text-[#64748b]">{tour.bookings} bookings</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f8fafc] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#044b3b]"
                        style={{ width: `${topTours[0]?.bookings ? (tour.bookings / topTours[0].bookings) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#9e9e9e]">
                No tour performance data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
