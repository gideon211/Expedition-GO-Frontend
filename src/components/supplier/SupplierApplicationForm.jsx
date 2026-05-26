import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  Briefcase,
  UserCircle,
  FileText,
  FileImage,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Globe,
  Phone,
  MapPin,
  Link as LinkIcon,
  Calendar,
  ShieldCheck,
  BadgeCheck,
  Upload,
  X,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyAsSupplier } from "@/api/supplier";

const STEPS = [
  { key: "business", label: "Business Info", icon: Building2 },
  { key: "operating", label: "Operating Info", icon: Briefcase },
  { key: "representative", label: "Representative", icon: UserCircle },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "compliance", label: "Review & Submit", icon: ShieldCheck },
];

const BUSINESS_TYPES = [
  { value: "individual", label: "Individual / Sole Proprietor" },
  { value: "company", label: "Company / Corporation" },
  { value: "non_profit", label: "Non-Profit Organization" },
];

const COUNTRIES = [
  { code: "GH", name: "Ghana" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "TZ", name: "Tanzania" },
  { code: "UG", name: "Uganda" },
  { code: "RW", name: "Rwanda" },
  { code: "ET", name: "Ethiopia" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "OTHER", name: "Other" },
];

const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID Card" },
  { value: "drivers_license", label: "Driver's License" },
];

const MEETING_STYLES = [
  { value: "pickup", label: "Pickup from hotel/location" },
  { value: "meeting_point", label: "Meet at designated point" },
  { value: "flexible", label: "Flexible / Both options" },
];

const TOUR_CATEGORIES_OPTIONS = [
  "Adventure",
  "Cultural",
  "Nature",
  "Wildlife",
  "Historical",
  "Food & Culinary",
  "Photography",
  "Beach & Water",
  "City Tours",
  "Mountain & Hiking",
  "Luxury",
  "Family Friendly",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Dutch",
  "Portuguese",
  "Italian",
  "Arabic",
  "Swahili",
  "Zulu",
  "Akan",
  "Yoruba",
  "Hausa",
  "Igbo",
  "Amharic",
];

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="mb-8 overflow-x-auto px-4">
      <div className="flex min-w-[280px] items-center justify-center sm:min-w-0 sm:justify-between">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300 sm:size-10 ${
                    isActive
                      ? "border-[color:var(--brand-green)] bg-[color:var(--brand-green)] text-white shadow-lg"
                      : isCompleted
                        ? "border-[color:var(--brand-green)] bg-[color:var(--brand-mist)] text-[color:var(--brand-green)]"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4 sm:size-5" />
                  ) : (
                    <step.icon className="size-3.5 sm:size-4" />
                  )}
                </div>
                <span
                  className={`hidden text-xs font-semibold sm:block ${
                    isActive ? "text-[color:var(--brand-green)]" : isCompleted ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-1.5 h-px flex-1 transition-all duration-300 sm:mx-4 ${
                    isCompleted ? "bg-[color:var(--brand-green)]" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

function FormSection({ title, description, children }) {
  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function TagInput({ label, placeholder, tags, onChange, required }) {
  const [input, setInput] = useState("");

  const addTag = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  }, [input, tags, onChange]);

  const removeTag = useCallback(
    (tag) => {
      onChange(tags.filter((t) => t !== tag));
    },
    [tags, onChange]
  );

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-mist)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-green)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full hover:bg-[color:var(--brand-green)]/10"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
                if (e.key === "Backspace" && !input && tags.length > 0) {
                  removeTag(tags[tags.length - 1]);
                }
              }}
              placeholder={tags.length === 0 ? placeholder : ""}
              className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiSelect({ label, options, selected, onChange, required }) {
  const toggleOption = useCallback(
    (option) => {
      if (selected.includes(option)) {
        onChange(selected.filter((s) => s !== option));
      } else {
        onChange([...selected, option]);
      }
    },
    [selected, onChange]
  );

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-[color:var(--brand-green)] text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[color:var(--brand-green)]/30 hover:bg-[color:var(--brand-mist)]"
              }`}
            >
              {isSelected && <CheckCircle2 className="mr-1 inline size-3" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SupplierApplicationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
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
  });

  const updateForm = useCallback((section, key, value) => {
    setForm((prev) => {
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [parent]: {
              ...prev[section][parent],
              [child]: value,
            },
          },
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
  }, []);

  const validateStep = useCallback(() => {
    setError("");
    const s = STEPS[step].key;

    if (s === "business") {
      const b = form.businessInfo;
      if (!b.legalBusinessName.trim()) return setError("Legal business name is required");
      if (!b.displayName.trim()) return setError("Display name is required");
      if (!b.businessType) return setError("Business type is required");
      if (!b.country) return setError("Country is required");
      if (!b.address.line1.trim()) return setError("Address line 1 is required");
      if (!b.address.city.trim()) return setError("City is required");
      if (!b.address.state.trim()) return setError("State / Province is required");
      if (!b.address.postalCode.trim()) return setError("Postal code is required");
      if (!b.phoneNumber.trim()) return setError("Phone number is required");
    }

    if (s === "operating") {
      const o = form.operatingInfo;
      if (o.tourCategories.length === 0) return setError("Select at least one tour category");
      if (o.destinations.length === 0) return setError("Add at least one destination");
      if (o.languages.length === 0) return setError("Select at least one language");
      if (!o.yearsInBusiness || parseInt(o.yearsInBusiness, 10) < 0) return setError("Years in business is required");
      if (!o.cancellationPolicy.trim()) return setError("Cancellation policy is required");
      if (!o.meetingStyle) return setError("Meeting style is required");
    }

    if (s === "representative") {
      const r = form.representativeInfo;
      if (!r.fullName.trim()) return setError("Representative full name is required");
      if (!r.email.trim()) return setError("Representative email is required");
      if (!r.dateOfBirth) return setError("Date of birth is required");
      if (!r.address.line1.trim()) return setError("Representative address line 1 is required");
      if (!r.address.city.trim()) return setError("Representative city is required");
      if (!r.address.state.trim()) return setError("Representative state / province is required");
      if (!r.address.postalCode.trim()) return setError("Representative postal code is required");
      if (!r.idType) return setError("ID type is required");
      if (!r.idDocument) return setError("ID document image is required");
    }

    if (s === "documents") {
      const d = form.businessDocuments;
      if (!d.registrationDocument) return setError("Business registration document is required");
      if (!d.taxDocument) return setError("Tax document is required");
      if (!d.proofOfAddress) return setError("Proof of address document is required");
    }

    if (s === "compliance") {
      if (!form.compliance.acceptedTerms) return setError("You must accept the terms and conditions");
    }

    return true;
  }, [step, form]);

  const handleNext = useCallback(() => {
    if (validateStep() !== true) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [validateStep]);

  const handleBack = useCallback(() => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const normalizeWebsite = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (validateStep() !== true) return;

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const docs = form.businessDocuments;
        const rep = form.representativeInfo;

        // Build multipart/form-data payload (matches backend route/multer design)
        const payload = new FormData();

        // JSON sections as strings (required by backend Swagger spec)
        payload.append(
          "businessInfo",
          JSON.stringify({
            ...form.businessInfo,
            website: normalizeWebsite(form.businessInfo.website),
          })
        );

        payload.append(
          "operatingInfo",
          JSON.stringify({
            ...form.operatingInfo,
            yearsInBusiness: parseInt(form.operatingInfo.yearsInBusiness, 10) || 0,
          })
        );

        // Representative info without the file (idDocument is sent separately)
        payload.append(
          "representativeInfo",
          JSON.stringify({
            fullName: rep.fullName,
            email: rep.email,
            dateOfBirth: rep.dateOfBirth,
            address: rep.address,
            idType: rep.idType,
          })
        );

        payload.append(
          "payoutInfo",
          JSON.stringify({
            bankAccountName: "",
            bankCountry: "",
            payoutCurrency: "",
          })
        );

        payload.append("compliance", JSON.stringify(form.compliance));

        // Actual file uploads (processed by multer → Cloudinary)
        if (docs.registrationDocument) {
          payload.append("registrationDocument", docs.registrationDocument);
        }
        if (docs.taxDocument) {
          payload.append("taxDocument", docs.taxDocument);
        }
        if (docs.proofOfAddress) {
          payload.append("proofOfAddress", docs.proofOfAddress);
        }
        if (rep.idDocument) {
          payload.append("idDocument", rep.idDocument);
        }
        docs.licenses.forEach((file) => {
          payload.append("licenses", file);
        });

        await applyAsSupplier(payload);
        setSuccess("Your supplier application has been submitted successfully! Our team will review it and get back to you within 3-5 business days.");
      } catch (err) {
        setError(err?.message || "Failed to submit application. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [form, validateStep]
  );

  const renderBusinessInfo = () => (
    <FormSection title="Business Information" description="Tell us about your business. This information will be displayed to travellers.">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel required>Legal Business Name</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <Building2 className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="e.g. Adventure Tours Ltd"
              value={form.businessInfo.legalBusinessName}
              onChange={(e) => updateForm("businessInfo", "legalBusinessName", e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel required>Display Name</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <BadgeCheck className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="e.g. Adventure Tours"
              value={form.businessInfo.displayName}
              onChange={(e) => updateForm("businessInfo", "displayName", e.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Business Type</FieldLabel>
          <Select
            value={form.businessInfo.businessType}
            onValueChange={(value) => updateForm("businessInfo", "businessType", value)}
          >
            <SelectTrigger className="h-12 w-full rounded-[1.4rem] border border-slate-300 bg-white text-slate-900 shadow-sm">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent side="bottom" sideOffset={4}>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel required>Country</FieldLabel>
          <Select
            value={form.businessInfo.country}
            onValueChange={(value) => updateForm("businessInfo", "country", value)}
          >
            <SelectTrigger className="h-12 w-full rounded-[1.4rem] border border-slate-300 bg-white text-slate-900 shadow-sm">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent side="bottom" sideOffset={4}>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel required>Address Line 1</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <MapPin className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="Street address"
              value={form.businessInfo.address.line1}
              onChange={(e) => updateForm("businessInfo", "address.line1", e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>Address Line 2</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <MapPin className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="Apartment, suite, unit, etc. (optional)"
              value={form.businessInfo.address.line2}
              onChange={(e) => updateForm("businessInfo", "address.line2", e.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>City</FieldLabel>
          <Input
            placeholder="City"
            value={form.businessInfo.address.city}
            onChange={(e) => updateForm("businessInfo", "address.city", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel required>State / Province</FieldLabel>
          <Input
            placeholder="State / Province"
            value={form.businessInfo.address.state}
            onChange={(e) => updateForm("businessInfo", "address.state", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel required>Postal Code</FieldLabel>
          <Input
            placeholder="Postal Code"
            value={form.businessInfo.address.postalCode}
            onChange={(e) => updateForm("businessInfo", "address.postalCode", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel required>Phone Number</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <Phone className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="+1-555-123-4567"
              value={form.businessInfo.phoneNumber}
              onChange={(e) => updateForm("businessInfo", "phoneNumber", e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>Website</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <LinkIcon className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="https://yourbusiness.com"
              type="url"
              value={form.businessInfo.website}
              onChange={(e) => updateForm("businessInfo", "website", e.target.value)}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && !/^https?:\/\//i.test(val)) {
                  updateForm("businessInfo", "website", `https://${val}`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );

  const renderOperatingInfo = () => (
    <FormSection title="Operating Information" description="Tell us about the tours and experiences you offer.">
      <MultiSelect
        label="Tour Categories"
        options={TOUR_CATEGORIES_OPTIONS}
        selected={form.operatingInfo.tourCategories}
        onChange={(value) => updateForm("operatingInfo", "tourCategories", value)}
        required
      />

      <TagInput
        label="Destinations You Operate In"
        placeholder="Type a destination and press Enter"
        tags={form.operatingInfo.destinations}
        onChange={(value) => updateForm("operatingInfo", "destinations", value)}
        required
      />

      <MultiSelect
        label="Languages Offered"
        options={LANGUAGE_OPTIONS}
        selected={form.operatingInfo.languages}
        onChange={(value) => updateForm("operatingInfo", "languages", value)}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel>Years in Business</FieldLabel>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 5"
            value={form.operatingInfo.yearsInBusiness}
            onChange={(e) => updateForm("operatingInfo", "yearsInBusiness", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel required>Meeting Style</FieldLabel>
          <Select
            value={form.operatingInfo.meetingStyle}
            onValueChange={(value) => updateForm("operatingInfo", "meetingStyle", value)}
          >
            <SelectTrigger className="h-12 w-full rounded-[1.4rem] border border-slate-300 bg-white text-slate-900 shadow-sm">
              <SelectValue placeholder="Select meeting style" />
            </SelectTrigger>
            <SelectContent side="bottom" sideOffset={4}>
              {MEETING_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <FieldLabel>Cancellation Policy</FieldLabel>
        <textarea
          rows={3}
          placeholder="Describe your cancellation policy..."
          className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[color:var(--brand-green)]/35 focus:ring-4 focus:ring-[color:var(--brand-green)]/10"
          value={form.operatingInfo.cancellationPolicy}
          onChange={(e) => updateForm("operatingInfo", "cancellationPolicy", e.target.value)}
        />
      </div>
    </FormSection>
  );

  const renderRepresentativeInfo = () => (
    <FormSection title="Representative Information" description="Provide details about the primary contact person for your business.">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel required>Full Name</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <UserCircle className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="John Smith"
              value={form.representativeInfo.fullName}
              onChange={(e) => updateForm("representativeInfo", "fullName", e.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Email</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <Globe className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              type="email"
              placeholder="john@example.com"
              value={form.representativeInfo.email}
              onChange={(e) => updateForm("representativeInfo", "email", e.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Date of Birth</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <Calendar className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              type="date"
              value={form.representativeInfo.dateOfBirth}
              onChange={(e) => updateForm("representativeInfo", "dateOfBirth", e.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>ID Type</FieldLabel>
          <Select
            value={form.representativeInfo.idType}
            onValueChange={(value) => updateForm("representativeInfo", "idType", value)}
          >
            <SelectTrigger className="h-12 w-full rounded-[1.4rem] border border-slate-300 bg-white text-slate-900 shadow-sm">
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent side="bottom" sideOffset={4}>
              {ID_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <ImageUploadField
            label="ID Document"
            file={form.representativeInfo.idDocument}
            onChange={(file) => updateForm("representativeInfo", "idDocument", file)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel required>Address Line 1</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <MapPin className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="Street address"
              value={form.representativeInfo.address.line1}
              onChange={(e) => updateForm("representativeInfo", "address.line1", e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>Address Line 2</FieldLabel>
          <div className="flex items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
            <MapPin className="size-4 text-slate-400" />
            <Input
              className="border-0 bg-transparent shadow-none focus:ring-0"
              placeholder="Apartment, suite, unit, etc. (optional)"
              value={form.representativeInfo.address.line2}
              onChange={(e) => updateForm("representativeInfo", "address.line2", e.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>City</FieldLabel>
          <Input
            placeholder="City"
            value={form.representativeInfo.address.city}
            onChange={(e) => updateForm("representativeInfo", "address.city", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel required>State / Province</FieldLabel>
          <Input
            placeholder="State / Province"
            value={form.representativeInfo.address.state}
            onChange={(e) => updateForm("representativeInfo", "address.state", e.target.value)}
          />
        </div>

        <div>
          <FieldLabel required>Postal Code</FieldLabel>
          <Input
            placeholder="Postal Code"
            value={form.representativeInfo.address.postalCode}
            onChange={(e) => updateForm("representativeInfo", "address.postalCode", e.target.value)}
          />
        </div>
      </div>
    </FormSection>
  );

  function ImageUploadField({ label, file, onChange, required }) {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
      if (!file) {
        setPreview(null);
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleFileChange = (e) => {
      const selected = e.target.files?.[0];
      if (selected) onChange(selected);
    };

    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>
        {preview ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src={preview}
              alt={label}
              className="h-48 w-full object-contain"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition hover:bg-white hover:text-rose-600"
            >
              <X className="size-4" />
            </button>
            <p className="truncate px-4 pb-3 text-center text-xs text-slate-500">{file.name}</p>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 transition hover:border-[color:var(--brand-green)]/50 hover:bg-[color:var(--brand-mist)]/30">
            <Upload className="mb-2 size-8 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Click to upload an image</span>
            <span className="mt-1 text-xs text-slate-400">PNG, JPG, JPEG up to 5MB</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    );
  }

  function MultiImageUploadField({ label, files, onChange, required }) {
    const handleFileChange = (e) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length) onChange([...files, ...selected]);
    };

    const removeFile = (index) => {
      onChange(files.filter((_, i) => i !== index));
    };

    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>
        <div className="space-y-3">
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {files.map((file, index) => {
                const preview = URL.createObjectURL(file);
                return (
                  <div key={index} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <img
                      src={preview}
                      alt={file.name}
                      className="h-32 w-full object-cover"
                      onLoad={() => URL.revokeObjectURL(preview)}
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition hover:bg-white hover:text-rose-600"
                    >
                      <X className="size-3.5" />
                    </button>
                    <p className="truncate px-3 pb-2 text-center text-[10px] text-slate-500">{file.name}</p>
                  </div>
                );
              })}
            </div>
          )}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-[color:var(--brand-green)]/50 hover:bg-[color:var(--brand-mist)]/30">
            <Upload className="mb-2 size-7 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Click to upload license images</span>
            <span className="mt-1 text-xs text-slate-400">PNG, JPG, JPEG up to 5MB each</span>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    );
  }

  const renderDocuments = () => (
    <FormSection title="Documents" description="Upload images of your business verification documents. You will be able to add your payout method after your application is approved.">
      <div className="space-y-6">
        <ImageUploadField
          label="Business Registration Document"
          file={form.businessDocuments.registrationDocument}
          onChange={(file) => updateForm("businessDocuments", "registrationDocument", file)}
          required
        />

        <ImageUploadField
          label="Tax Document"
          file={form.businessDocuments.taxDocument}
          onChange={(file) => updateForm("businessDocuments", "taxDocument", file)}
          required
        />

        <ImageUploadField
          label="Proof of Address"
          file={form.businessDocuments.proofOfAddress}
          onChange={(file) => updateForm("businessDocuments", "proofOfAddress", file)}
          required
        />

        <MultiImageUploadField
          label="Business Licenses"
          files={form.businessDocuments.licenses}
          onChange={(value) => updateForm("businessDocuments", "licenses", value)}
        />
      </div>
    </FormSection>
  );

  const renderCompliance = () => (
    <FormSection title="Review & Submit" description="Please review your information and accept the terms before submitting.">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h4 className="text-sm font-bold text-slate-900">Application Summary</h4>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Business:</span>
            <span className="font-semibold text-slate-900">{form.businessInfo.legalBusinessName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Display Name:</span>
            <span className="font-semibold text-slate-900">{form.businessInfo.displayName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Country:</span>
            <span className="font-semibold text-slate-900">
              {COUNTRIES.find((c) => c.code === form.businessInfo.country)?.name || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Categories:</span>
            <span className="font-semibold text-slate-900">{form.operatingInfo.tourCategories.join(", ") || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Representative:</span>
            <span className="font-semibold text-slate-900">{form.representativeInfo.fullName || "—"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p>
          <span className="font-semibold">Note:</span> Payout information will be collected after your application is approved by our team.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 shadow-sm cursor-pointer transition hover:border-primary/30">
          <div className="mt-0.5">
            <input
              type="checkbox"
              checked={form.compliance.acceptedTerms}
              onChange={(e) => updateForm("compliance", "acceptedTerms", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[color:var(--brand-green)] focus:ring-[color:var(--brand-green)]"
            />
          </div>
          <span className="text-sm text-slate-700">
            I have read and accept the{" "}
            <span className="font-semibold text-[color:var(--brand-green)]">Terms and Conditions</span> and{" "}
            <span className="font-semibold text-[color:var(--brand-green)]">Supplier Agreement</span>.
          </span>
        </label>
      </div>

      {success && (
        <div className="rounded-[1.3rem] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Application Submitted!</p>
              <p className="mt-1">{success}</p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </FormSection>
  );

  const renderStepContent = () => {
    switch (STEPS[step].key) {
      case "business": return renderBusinessInfo();
      case "operating": return renderOperatingInfo();
      case "representative": return renderRepresentativeInfo();
      case "documents": return renderDocuments();
      case "compliance": return renderCompliance();
      default: return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} />

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8">
        {renderStepContent()}
      </div>

      {error && !success && (
        <div className="flex items-start gap-2 rounded-[1.3rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 0 || loading}
          className="h-12 px-6"
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext} disabled={loading} className="h-12 px-8">
            Next
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={loading || !!success} className="h-12 px-8">
            {loading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Submit Application
          </Button>
        )}
      </div>
    </form>
  );
}
