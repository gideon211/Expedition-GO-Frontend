import { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  Camera,
  Image,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '@/components/homepage/Navbar';

function RatingCircle({ filled, onClick, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'size-8' : 'size-9';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${sizeClasses} rounded-full border-2 transition-all duration-150 ${
        filled
          ? 'border-emerald-600 bg-emerald-600'
          : 'border-emerald-600 bg-white hover:border-emerald-700'
      }`}
    />
  );
}

function StarRating({ value, onChange, count = 5 }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={`size-8 ${i < value ? 'text-emerald-600' : 'text-slate-200'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function SubRatingRow({ label, value, onChange, hasNA }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[15px] font-medium text-slate-800">{label}</span>
      <div className="flex items-center gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`size-7 rounded-full border-2 transition-all duration-150 ${
              value === i + 1
                ? 'border-emerald-600 bg-emerald-600'
                : 'border-emerald-600 bg-white hover:border-emerald-700'
            }`}
          />
        ))}
        {hasNA && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`rounded-full border px-3 py-1 text-[13px] font-medium transition ${
              value === null
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            N/A
          </button>
        )}
      </div>
    </div>
  );
}

function CompanionToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-5 py-2 text-[14px] font-medium transition ${
        active
          ? 'border-slate-800 bg-slate-800 text-white'
          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

function CategoryTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[13px] font-medium transition ${
        active
          ? 'border-slate-800 bg-slate-800 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
      }`}
    >
      {label}
    </button>
  );
}

export default function ReviewExperiencePage() {
  const { tourTitle } = useParams();
  const decodedTitle = tourTitle ? decodeURIComponent(tourTitle) : 'Cape Coast Castle, Elmina Castle & Kakum National Park Day Tour';

  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState({
    valueForMoney: 0,
    guide: 0,
    meeting: null,
  });
  const [selectedMonth, setSelectedMonth] = useState('November 2025');
  const [companions, setCompanions] = useState({
    business: false,
    couples: false,
    family: false,
    friends: false,
    solo: false,
  });
  const [activeCategory, setActiveCategory] = useState('Experience');
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [certified, setCertified] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    'Experience',
    'Admission fee',
    'Length of visit',
    'Atmosphere',
    'Crowd size',
    'Staff',
    'Best for',
  ];

  const months = [
    'June 2026', 'May 2026', 'April 2026', 'March 2026', 'February 2026',
    'January 2026', 'December 2025', 'November 2025', 'October 2025',
    'September 2025', 'August 2025', 'July 2025',
  ];

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setUploadedPhotos((prev) => [...prev, ...urls].slice(0, 12));
  };

  const removePhoto = (index) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="flex-1">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Page Heading */}
        <h1 className="mb-8 text-[28px] font-extrabold leading-tight text-slate-900 sm:text-[34px] lg:text-[38px]">
          Tell us, how was your visit?
        </h1>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          {/* ========== LEFT COLUMN ========== */}
          <aside className="shrink-0 lg:w-[340px]">
            <div className="sticky top-8 space-y-6">
              {/* Tour Info Card */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=600&q=80"
                    alt={decodedTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[15px] font-bold leading-snug text-slate-900">
                    {decodedTitle}
                  </h3>
                  <Link
                    to="/supplier/profile/expedition-go-tours-ltd"
                    className="mt-1 inline-block text-[13px] font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800 hover:decoration-emerald-500"
                  >
                    By Expedition-Go Tours Ltd
                  </Link>
                </div>
              </div>

              {/* Change Activity Link */}
              <Link
                to="/tours"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-700 transition hover:text-emerald-700"
              >
                Not the right one? Change activity
                <ChevronRight className="size-4" />
              </Link>

              {/* Become an Experience Explorer */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-start gap-3">
                  <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900">
                      Become an Experience Explorer
                    </h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                      Complete your first experience review to start earning a badge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ========== RIGHT COLUMN ========== */}
          <div className="min-w-0 flex-1 space-y-10">
            {/* Section: Overall Rating */}
            <section>
              <h2 className="mb-4 text-[17px] font-bold text-slate-900">
                How would you rate your experience?
              </h2>
              <StarRating
                value={overallRating}
                onChange={setOverallRating}
              />
            </section>

            {/* Section: Sub-ratings */}
            <section>
              <h2 className="mb-3 text-[17px] font-bold text-slate-900">
                How would you rate these?
              </h2>
              <div className="divide-y divide-slate-100">
                <SubRatingRow
                  label="Value for money"
                  value={subRatings.valueForMoney}
                  onChange={(v) => setSubRatings((p) => ({ ...p, valueForMoney: v }))}
                  hasNA={false}
                />
                <SubRatingRow
                  label="Guide"
                  value={subRatings.guide}
                  onChange={(v) => setSubRatings((p) => ({ ...p, guide: v }))}
                  hasNA={false}
                />
                <SubRatingRow
                  label="Meeting or pickup"
                  value={subRatings.meeting}
                  onChange={(v) => setSubRatings((p) => ({ ...p, meeting: v }))}
                  hasNA={true}
                />
              </div>
            </section>

            {/* Section: Date */}
            <section>
              <h2 className="mb-3 text-[17px] font-bold text-slate-900">
                When did you go?
              </h2>
              <div className="relative inline-block">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none rounded-full border-2 border-blue-500 bg-white py-2.5 pl-5 pr-12 text-[14px] font-medium text-slate-800 outline-none transition focus:border-blue-600"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </section>

            {/* Section: Travel Companions */}
            <section>
              <h2 className="mb-3 text-[17px] font-bold text-slate-900">
                Who did you go with?
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(companions).map(([key, active]) => (
                  <CompanionToggle
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    active={active}
                    onClick={() =>
                      setCompanions((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  />
                ))}
              </div>
            </section>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* Section: Write your review */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-slate-900">
                  Write your review
                </h2>
                <button
                  type="button"
                  className="grid size-5 place-items-center rounded-full border border-slate-300 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
                  title="Your review helps other travellers make informed decisions."
                >
                  <Info className="size-3" />
                </button>
              </div>

              {/* Category Tabs */}
              <div className="mb-4 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <CategoryTab
                    key={cat}
                    label={cat}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>

              {/* Review Textarea */}
              <div className="relative">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-[15px] leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 transition hover:text-emerald-700"
                  >
                    <Sparkles className="size-4" />
                    Help me write
                  </button>
                  <span className="text-[12px] text-slate-400">
                    {reviewText.length}/25 min
                  </span>
                </div>
              </div>
            </section>

            {/* Section: Title Your Review */}
            <section>
              <h2 className="mb-2 text-[17px] font-bold text-slate-900">
                Title your review
              </h2>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Give us the gist of your experience"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </section>

            {/* Section: Add Photos */}
            <section>
              <h2 className="mb-1 text-[17px] font-bold text-slate-900">
                Add some photos
              </h2>
              <p className="mb-4 text-[13px] text-slate-500">Optional</p>

              <div className="mb-4 flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-500">
                  <Camera className="size-5" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">
                    Reach a Photos milestone
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">
                    Upload your first photo to start your journey as a top contributor.
                  </p>
                </div>
              </div>

              {/* Photo Upload Area */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition hover:border-slate-400 hover:bg-slate-100"
              >
                <div className="flex flex-col items-center gap-2">
                  <Image className="size-8 text-slate-400" />
                  <span className="text-[14px] font-semibold text-slate-700">
                    Click to add photos
                  </span>
                  <span className="text-[12px] text-slate-400">
                    or drag and drop
                  </span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Uploaded Photos Preview */}
              {uploadedPhotos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${i + 1}`}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-slate-800 text-[10px] text-white transition hover:bg-slate-900"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section: Certification Checkbox */}
            <section>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certified}
                  onChange={(e) => setCertified(e.target.checked)}
                  className="mt-0.5 size-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[13px] leading-relaxed text-slate-600">
                  I certify that this review is based on my own experience and is my
                  genuine opinion of this tour experience. I understand that TravioAfrica
                  has a zero-tolerance policy on fake reviews and that my review may be
                  removed if found to violate these terms.
                </span>
              </label>
            </section>

            {/* Submit Button */}
            <button
              type="button"
              className="w-full rounded-xl bg-emerald-700 py-3.5 text-[16px] font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              Submit review
            </button>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
