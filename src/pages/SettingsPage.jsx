import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { Settings, Bell, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    day: "",
    month: "",
    year: ""
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    marketing: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [notificationChanges, setNotificationChanges] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (!user) {
      navigate("/signin", { replace: true });
    } else {
      setIsAuthorized(true);
    }
  }, [user, loading, navigate]);

  // Don't render anything until we know if user is authorized
  if (loading || !isAuthorized) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setNotificationChanges(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setHasChanges(false);
  };

  const handleNotificationSave = () => {
    setNotificationChanges(false);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-white">
        <Navbar />
      </div>
      
      {/* Navbar spacer */}
      <div className="h-[58px] sm:h-[96px] lg:h-[104px]" />

      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1520px] px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-bold text-slate-900 mb-8" style={{ fontSize: 'clamp(1.75rem, 2.5vw + 0.5rem, 2.25rem)' }}>Settings</h1>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Profile Card */}
              <div className="mb-6 rounded-lg bg-[color:var(--brand-green)] p-6 text-white lg:mb-0">
                <div className="text-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="mx-auto mb-4 size-16 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full border-4 border-white bg-[color:var(--brand-mist)] text-2xl font-bold text-[color:var(--brand-green)]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="font-bold text-slate-900" style={{ fontSize: 'clamp(1.25rem, 2vw + 0.5rem, 1.75rem)' }}>{user?.name || "User"}</h2>
                  <p className="text-sm text-white/80">Account</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                    activeTab === "personal"
                      ? "bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Settings className="size-5" />
                  <span>Personal details</span>
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                    activeTab === "notifications"
                      ? "bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Bell className="size-5" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                    activeTab === "payment"
                      ? "bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard className="size-5" />
                  <span>Saved cards</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Personal Details Tab */}
              {activeTab === "personal" && (
                <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
                  <h2 className="mb-6 font-bold text-slate-900" style={{ fontSize: 'clamp(1.25rem, 1.8vw + 0.5rem, 1.75rem)' }}>Profile Details</h2>

                  {/* Name Fields */}
                  <div className="mb-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-[color:var(--brand-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-green)]/20"
                          placeholder="First Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-[color:var(--brand-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-green)]/20"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <h3 className="mb-4 font-bold text-slate-900" style={{ fontSize: 'clamp(1rem, 1.2vw + 0.5rem, 1.25rem)' }}>Contact Details</h3>
                  <div className="mb-8 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Email
                      </label>
                      <div className="rounded-lg bg-slate-100 px-4 py-2.5 text-slate-600 cursor-not-allowed">
                        {formData.email}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:border-[color:var(--brand-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-green)]/20"
                        placeholder="Mobile Phone"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <h3 className="mb-4 font-bold text-slate-900" style={{ fontSize: 'clamp(1rem, 1.2vw + 0.5rem, 1.25rem)' }}>Date of birth</h3>
                  <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Day
                      </label>
                      <select
                        name="day"
                        value={formData.day}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[color:var(--brand-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-green)]/20"
                      >
                        <option value="">Day</option>
                        {days.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Month
                      </label>
                      <select
                        name="month"
                        value={formData.month}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[color:var(--brand-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-green)]/20"
                      >
                        <option value="">Month</option>
                        {months.map((month, index) => (
                          <option key={index} value={index + 1}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Year
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[color:var(--brand-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-green)]/20"
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`rounded-lg px-6 py-2.5 font-semibold text-white transition ${
                      hasChanges
                        ? "bg-[color:var(--brand-green)] hover:bg-[color:var(--brand-green)]/90 cursor-pointer"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    Save
                  </button>

                  {/* Delete Account */}
                  <div className="mt-12 border-t border-slate-200 pt-8">
                    <button className="text-sm font-semibold text-red-600 transition hover:text-red-700">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
                  <h2 className="mb-6 font-bold text-slate-900" style={{ fontSize: 'clamp(1.25rem, 1.8vw + 0.5rem, 1.75rem)' }}>Notification Preferences</h2>
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
                      <input 
                        type="checkbox" 
                        checked={notifications.email}
                        onChange={() => handleNotificationChange('email')}
                        className="size-5 rounded border-slate-300 text-[color:var(--brand-green)]" 
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-600">Receive updates about your bookings</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
                      <input 
                        type="checkbox" 
                        checked={notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                        className="size-5 rounded border-slate-300 text-[color:var(--brand-green)]" 
                      />
                      <div>
                        <p className="font-semibold text-slate-900">SMS Notifications</p>
                        <p className="text-sm text-slate-600">Get SMS alerts for important updates</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
                      <input 
                        type="checkbox" 
                        checked={notifications.marketing}
                        onChange={() => handleNotificationChange('marketing')}
                        className="size-5 rounded border-slate-300 text-[color:var(--brand-green)]" 
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Marketing Emails</p>
                        <p className="text-sm text-slate-600">Receive promotional offers and deals</p>
                      </div>
                    </label>
                  </div>
                  <button
                    onClick={handleNotificationSave}
                    disabled={!notificationChanges}
                    className={`rounded-lg px-6 py-2.5 font-semibold text-white transition ${
                      notificationChanges
                        ? "bg-[color:var(--brand-green)] hover:bg-[color:var(--brand-green)]/90 cursor-pointer"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {/* Payment Tab */}
              {activeTab === "payment" && (
                <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
                  <h2 className="mb-6 font-bold text-slate-900" style={{ fontSize: 'clamp(1.25rem, 1.8vw + 0.5rem, 1.75rem)' }}>Saved Cards</h2>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Visa ending in 4242</p>
                          <p className="text-sm text-slate-600">Expires 12/25</p>
                        </div>
                        <button className="text-sm font-semibold text-red-600 hover:text-red-700">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button className="w-full rounded-lg border-2 border-dashed border-[color:var(--brand-green)] py-4 font-semibold text-[color:var(--brand-green)] transition hover:bg-[color:var(--brand-mist)]">
                      + Add New Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
