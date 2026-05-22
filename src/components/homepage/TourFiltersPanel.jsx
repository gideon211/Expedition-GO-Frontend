import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  SPECIALS_FILTERS,
  SPECIALS_MORE_FILTERS,
  GHANA_TOUR_CATEGORIES,
} from "./tourFiltersData";

function FilterCheckbox({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-900"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

export function TourFiltersPanel({
  panelRef,
  selectedSpecials,
  onSelectedSpecialsChange,
  selectedSubcategories,
  onSelectedSubcategoriesChange,
}) {
  const [showMoreSpecials, setShowMoreSpecials] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState([]);

  const visibleSpecials = showMoreSpecials
    ? [...SPECIALS_FILTERS, ...SPECIALS_MORE_FILTERS]
    : SPECIALS_FILTERS;

  const toggleSpecial = (id, checked) => {
    onSelectedSpecialsChange(
      checked
        ? [...selectedSpecials, id]
        : selectedSpecials.filter((value) => value !== id)
    );
  };

  const toggleSubcategory = (categoryId, subId, checked) => {
    const key = `${categoryId}:${subId}`;
    onSelectedSubcategoriesChange(
      checked
        ? [...selectedSubcategories, key]
        : selectedSubcategories.filter((value) => value !== key)
    );
  };

  const toggleCategoryExpanded = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div
      ref={panelRef}
      className="w-[min(100vw-2rem,380px)] max-h-[min(70vh,520px)] overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl"
      role="dialog"
      aria-label="Tour filters"
    >
      <div className="p-5">
        <h3 className="text-base font-bold text-slate-900">Specials</h3>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          {visibleSpecials.map((option) => (
            <FilterCheckbox
              key={option.id}
              id={`special-${option.id}`}
              label={option.label}
              checked={selectedSpecials.includes(option.id)}
              onChange={(checked) => toggleSpecial(option.id, checked)}
            />
          ))}
        </div>
        {!showMoreSpecials && (
          <button
            type="button"
            onClick={() => setShowMoreSpecials(true)}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 transition hover:text-[color:var(--brand-green)]"
          >
            Show more
            <ChevronDown className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="border-t border-slate-200" />

      <div className="p-5 pb-4">
        <h3 className="text-base font-bold text-slate-900">All Ghana Tours</h3>
        <ul className="mt-3 divide-y divide-slate-100">
          {GHANA_TOUR_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => toggleCategoryExpanded(category.id)}
                  className="flex w-full items-center justify-between gap-3 py-3.5 text-left text-sm text-slate-900 transition hover:text-[color:var(--brand-green)]"
                  aria-expanded={isExpanded}
                >
                  <span>{category.label}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {isExpanded && (
                  <div className="space-y-2.5 pb-3 pl-1">
                    {category.subcategories.map((sub) => (
                      <FilterCheckbox
                        key={sub.id}
                        id={`category-${category.id}-${sub.id}`}
                        label={sub.label}
                        checked={selectedSubcategories.includes(`${category.id}:${sub.id}`)}
                        onChange={(checked) => toggleSubcategory(category.id, sub.id, checked)}
                      />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
