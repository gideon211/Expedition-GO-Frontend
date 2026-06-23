/**
 * @file CheckoutPage.jsx
 * @description Multi-step checkout page: Activity, Contact, Payment.
 *   Pulls the active cart item and renders the reference-image layout
 *   for each step, including a green stepper, payment method selection,
 *   and a shared order summary.
 *
 * @see pages/CartPage.jsx
 * @see contexts/CartContext.jsx
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Clock,
  Star,
  Users,
  CalendarDays,
  Globe,
  CheckCircle2,
  ThumbsUp,
  Tag,
  CreditCard,
  User,
  Mail,
  Phone,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Navbar } from '@/components/homepage/Navbar';
import { Footer } from '@/components/homepage/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';

import paypalLogo from '@/assets/images/paypal_pay.svg';
import googlePayLogo from '@/assets/images/google_pay.svg';
import mastercardLogo from '@/assets/images/mastercard.svg';
import amexLogo from '@/assets/images/americanexpress_pay.svg';

const STEPS = [
  { id: 'activity', label: 'Activity' },
  { id: 'contact', label: 'Contact' },
  { id: 'payment', label: 'Payment' },
];

const STEP_COLOR = '#39AD6A';

const formatRemainingTime = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const formatLongDateTime = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const formatSummaryDateTime = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const formatCancellationCutoff = (dateString) => {
  const date = new Date(dateString);
  const cutoff = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  return cutoff.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

function Stepper({ currentStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mx-auto mb-8 w-full max-w-2xl sm:mb-10">
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div
          className="absolute left-0 right-0 top-1/2 -z-10 h-[2px] -translate-y-1/2 rounded-full"
          style={{ backgroundColor: '#e2e8f0' }}
        />
        {/* Active line */}
        <div
          className="absolute left-0 top-1/2 -z-10 h-[2px] -translate-y-1/2 rounded-full transition-all duration-500"
          style={{
            width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
            backgroundColor: STEP_COLOR,
          }}
        />

        {STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
              <span
                className="flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors"
                style={{
                  backgroundColor: isActive || isCompleted ? STEP_COLOR : 'white',
                  color: isActive || isCompleted ? 'white' : '#64748b',
                  border: isActive || isCompleted ? 'none' : '2px solid #cbd5e1',
                }}
              >
                {isCompleted ? <CheckCircle2 className="size-5" /> : index + 1}
              </span>
              <span
                className={`text-xs font-semibold sm:text-sm ${
                  isActive || isCompleted ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderSummary({ item, contact, prices, currentStep }) {
  const totalTravelers =
    (item.adults || 0) +
    (item.seniors || 0) +
    (item.youths || 0) +
    (item.children || 0) +
    (item.infants || 0);

  const travelerLabel = `${totalTravelers} ${totalTravelers === 1 ? 'adult' : 'travelers'}`;

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex gap-4">
        <img
          src={item.image}
          alt={item.title}
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-snug text-slate-900 sm:text-base">
            {item.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-3 ${
                    i < Math.round(Number(item.rating) || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-900">
              {Number(item.rating) || 0}
            </span>
            <span className="text-xs text-slate-500">({Number(item.reviews) || 0})</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
              Only 1 spot left
            </span>
            <span className="inline-flex items-center rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
              Top rated
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Globe className="size-4 text-slate-400" />
          <span>Language: {item.language || 'English'}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-400" />
              <span>{formatSummaryDateTime(item.selectedDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-slate-400" />
              <span className="capitalize">{travelerLabel}</span>
            </div>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600"
          >
            Change
          </button>
        </div>
      </div>

      {currentStep !== 'activity' && contact.firstName && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">
                {contact.firstName} {contact.lastName}
              </p>
              <p>{contact.email}</p>
              <p>{contact.phone}</p>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {prices.hasDiscount && prices.savings > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm font-semibold">
            Save {prices.savingsFormatted} with the activity provider's special offer
          </p>
        </div>
      )}

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <div className="flex gap-3 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-slate-900">Free cancellation</p>
            <p className="text-slate-500">
              Cancel before 8:00 AM on {formatCancellationCutoff(item.selectedDate)} for a full
              refund
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-sm">
          <ThumbsUp className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-slate-900">Great value</p>
            <p className="text-slate-500">
              Customers rated this {Number(item.rating) || 5}/5 for value for money
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <button
          type="button"
          className="flex w-full items-center gap-2 text-sm font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600"
        >
          <Tag className="size-4" />
          Enter promo or gift code
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between rounded-lg bg-slate-100 p-4">
        <span className="text-lg font-bold text-slate-900">Total</span>
        <div className="text-right">
          {prices.hasDiscount && (
            <span className="block text-sm text-slate-500 line-through">
              {prices.originalFormatted}
            </span>
          )}
          <span className="block text-2xl font-bold text-rose-600">
            {prices.discountedFormatted}
          </span>
          <span className="text-xs font-medium text-emerald-700">All taxes and fees included</span>
        </div>
      </div>
    </aside>
  );
}

function ActivityStep({ item, now, onNext }) {
  const [pickupOption, setPickupOption] = useState(null);
  const remainingMs = Math.max(0, Number(item.expiresAt) - now);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg bg-rose-50 px-4 py-3 text-rose-700">
        <Clock className="size-5 shrink-0" />
        <p className="text-sm font-semibold sm:text-base">
          We'll hold your spot for {formatRemainingTime(remainingMs)} minutes.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
        <Lock className="size-4" />
        <span>Checkout is fast and secure</span>
      </div>

      <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <img
          src={item.image}
          alt={item.title}
          className="h-24 w-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{formatLongDateTime(item.selectedDate)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
          Do you know where you want to be picked up?
        </h3>

        <div className="mt-5 space-y-3">
          {['yes', 'no'].map((value) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                pickupOption === value
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="pickup"
                value={value}
                checked={pickupOption === value}
                onChange={() => setPickupOption(value)}
                className="size-5 accent-slate-900"
              />
              <span className="font-semibold text-slate-900">
                {value === 'yes' ? "Yes, I can add it now" : "I don't know yet"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full max-w-sm bg-blue-600 py-6 text-base font-semibold !text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
      >
        Next: Personal details
      </Button>
    </div>
  );
}

function ContactStep({ contact, onChange, onNext, onBack }) {
  const isComplete =
    contact.firstName.trim() && contact.lastName.trim() && contact.email.trim() && contact.phone.trim();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">Personal details</h2>
        <p className="mt-1 text-slate-500">Booking details will be sent to this contact.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">First name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={contact.firstName}
                onChange={(e) => onChange({ ...contact, firstName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-900"
                placeholder="First name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Last name</label>
            <input
              type="text"
              value={contact.lastName}
              onChange={(e) => onChange({ ...contact, lastName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="Last name"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-900">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={contact.email}
                onChange={(e) => onChange({ ...contact, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-900"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-900">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => onChange({ ...contact, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-900"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!isComplete}
            className="w-full bg-blue-600 py-6 text-base font-semibold !text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:px-10"
          >
            Next: Payment
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodOption({ id, label, icon, selected, onSelect, children }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        selected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
      }`}
    >
      <label
        className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-4 sm:px-5 ${
          selected ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="paymentMethod"
            value={id}
            checked={selected}
            onChange={() => onSelect(id)}
            className="size-5 accent-blue-600"
          />
          <span className="font-semibold text-slate-900">{label}</span>
        </div>
        <div className="shrink-0">{icon}</div>
      </label>
      {selected && children && <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-4 sm:px-5">{children}</div>}
    </div>
  );
}

function CardPaymentForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900">Card number</label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600"
            placeholder="1234 1234 1234 1234"
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">VISA</span>
          <img src={mastercardLogo} alt="Mastercard" className="h-5 rounded border border-slate-200 bg-white px-1 py-0.5" />
          <img src={amexLogo} alt="Amex" className="h-5 rounded border border-slate-200 bg-white px-1 py-0.5" />
          <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">DISCOVER</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">Expiry (MM/YY)</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
            placeholder="MM/YY"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">CVV</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
            placeholder="123"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900">Name on card</label>
        <input
          type="text"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
          placeholder="Name on card"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 pt-1">
        <input type="checkbox" className="size-4 rounded border-slate-300 accent-blue-600" defaultChecked />
        <span className="text-sm font-semibold text-slate-900">Save your payment details</span>
      </label>

      <Button className="mt-2 w-full bg-blue-600 py-6 text-base font-semibold !text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
        <Lock className="size-4" />
        Pay now
      </Button>

      <p className="text-center text-xs text-slate-500">Payments are secure and encrypted</p>
    </div>
  );
}

function PaymentStep({ item, now, onBack }) {
  const [method, setMethod] = useState('card');
  const remainingMs = Math.max(0, Number(item.expiresAt) - now);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg bg-rose-50 px-4 py-3 text-rose-700">
        <Clock className="size-5 shrink-0" />
        <p className="text-sm font-semibold sm:text-base">
          We'll hold your spot for {formatRemainingTime(remainingMs)} minutes.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-900">Select a payment method</h2>

        <div className="mt-5 space-y-3">
          <PaymentMethodOption
            id="card"
            label="Debit or credit card"
            icon={<CreditCard className="size-6 text-slate-600" />}
            selected={method === 'card'}
            onSelect={setMethod}
          >
            <CardPaymentForm />
          </PaymentMethodOption>

          <PaymentMethodOption
            id="paypal"
            label="PayPal"
            icon={<img src={paypalLogo} alt="PayPal" className="h-5" />}
            selected={method === 'paypal'}
            onSelect={setMethod}
          >
            <Button className="w-full bg-[#ffc439] py-6 text-base font-bold text-[#003087] transition hover:bg-[#ffb820]">
              PayPal
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              By continuing, you agree to{' '}
              <a href="#" className="font-semibold text-slate-900 underline">
                GetYourGuide's general terms and conditions
              </a>
              . Read more on the{' '}
              <a href="#" className="font-semibold text-slate-900 underline">
                right of withdrawal
              </a>{' '}
              and information on the applicable{' '}
              <a href="#" className="font-semibold text-slate-900 underline">
                travel law
              </a>
              .
            </p>
          </PaymentMethodOption>

          <PaymentMethodOption
            id="googlepay"
            label="Google Pay"
            icon={<img src={googlePayLogo} alt="Google Pay" className="h-5" />}
            selected={method === 'googlepay'}
            onSelect={setMethod}
          >
            <Button className="w-full bg-black py-6 text-base font-semibold !text-white transition hover:bg-slate-900">
              Buy with{' '}
              <span className="ml-1 inline-flex items-center font-bold">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-amber-500">o</span>
                <span className="text-blue-500">g</span>
                <span className="text-green-500">l</span>
                <span className="text-red-500">e</span>
                <span className="ml-1 text-white">Pay</span>
              </span>
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              By continuing, you agree to{' '}
              <a href="#" className="font-semibold text-slate-900 underline">
                GetYourGuide's general terms and conditions
              </a>
              . Read more on the{' '}
              <a href="#" className="font-semibold text-slate-900 underline">
                right of withdrawal
              </a>{' '}
              and information on the applicable{' '}
              <a href="#" className="font-semibold text-slate-900 underline">
                travel law
              </a>
              .
            </p>
          </PaymentMethodOption>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onBack}
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="size-4" />
        Back
      </Button>
    </div>
  );
}

function EmptyCartState({ onBack }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-slate-100">
        <Clock className="size-8 text-slate-400" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">Your cart is empty</h2>
      <p className="mt-2 text-sm text-slate-500">Add a tour to your cart to start the checkout process.</p>
      <Button onClick={onBack} className="mt-6 w-full">
        Browse tours
      </Button>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { convertPrice } = useCurrency();
  const [currentStep, setCurrentStep] = useState('activity');
  const [now, setNow] = useState(Date.now());
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    document.title = 'Checkout: Customer Information';
    return () => {
      document.title = 'TravioAfrica';
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const activeItem = useMemo(() => {
    if (!cart.length) return null;
    const first = cart[0];
    const remainingMs = Number(first.expiresAt) - now;
    if (remainingMs <= 0) return null;
    return first;
  }, [cart, now]);

  const prices = useMemo(() => {
    if (!activeItem) {
      return {
        original: 0,
        discounted: 0,
        savings: 0,
        hasDiscount: false,
        originalFormatted: convertPrice(0).formatted,
        discountedFormatted: convertPrice(0).formatted,
        savingsFormatted: convertPrice(0).formatted,
      };
    }

    const original =
      typeof activeItem.price === 'number'
        ? activeItem.price
        : Number.parseFloat(String(activeItem.price).replace(/[^\d.]/g, '')) || 0;
    const discounted =
      activeItem.finalPrice != null
        ? typeof activeItem.finalPrice === 'number'
          ? activeItem.finalPrice
          : Number.parseFloat(String(activeItem.finalPrice).replace(/[^\d.]/g, '')) || 0
        : original;

    const hasDiscount = discounted < original;
    const savings = hasDiscount ? original - discounted : 0;

    return {
      original,
      discounted,
      savings,
      hasDiscount,
      originalFormatted: convertPrice(original).formatted,
      discountedFormatted: convertPrice(discounted).formatted,
      savingsFormatted: convertPrice(savings).formatted,
    };
  }, [activeItem, convertPrice]);

  const handleNext = () => {
    if (currentStep === 'activity') setCurrentStep('contact');
    else if (currentStep === 'contact') setCurrentStep('payment');
  };

  const handleBack = () => {
    if (currentStep === 'contact') setCurrentStep('activity');
    else if (currentStep === 'payment') setCurrentStep('contact');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'activity':
        return <ActivityStep item={activeItem} now={now} onNext={handleNext} />;
      case 'contact':
        return (
          <ContactStep
            contact={contact}
            onChange={setContact}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'payment':
        return <PaymentStep item={activeItem} now={now} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="mx-auto w-full flex-1 max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <Stepper currentStep={currentStep} />

        {cart.length === 0 ? (
          <EmptyCartState onBack={() => navigate('/tours')} />
        ) : !activeItem ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-50">
              <Clock className="size-8 text-rose-500" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">Your cart has expired</h2>
            <p className="mt-2 text-sm text-slate-500">
              Items are held for 25 minutes. Please add the tour again.
            </p>
            <Button onClick={() => navigate('/cart')} className="mt-6 w-full">
              Back to cart
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8"
            >
              {renderStepContent()}
              <OrderSummary
                item={activeItem}
                contact={contact}
                prices={prices}
                currentStep={currentStep}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CheckoutPage;
