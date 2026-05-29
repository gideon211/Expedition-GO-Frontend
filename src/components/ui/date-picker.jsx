/**
 * @file date-picker.jsx
 * @description Polished single-date picker (react-day-picker) with dd-MM-yyyy display.
 */
import { useMemo, useState } from "react";
import { format, isAfter, isBefore, isValid, parse, startOfDay } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./date-picker.css";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Radix select replacement for react-day-picker native year/month dropdowns. */
function CalendarDropdown({ options = [], value, onChange, disabled, className }) {
  const stringValue = value !== undefined && value !== null ? String(value) : undefined;

  return (
    <Select
      modal={false}
      value={stringValue}
      onValueChange={(newValue) => {
        onChange?.({ target: { value: newValue } });
      }}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-9 min-w-[5.5rem] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        position="popper"
        sideOffset={4}
        align="start"
        className="z-[200] max-h-[min(16rem,50vh)]"
      >
        {options.map((option) => (
          <SelectItem
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const DISPLAY_DATE_FORMAT = "dd-MM-yyyy";
export const STORAGE_DATE_FORMAT = "yyyy-MM-dd";

export function parseStoredDate(value) {
  if (!value) return undefined;
  const parsed = parse(value, STORAGE_DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function formatDateForStorage(date) {
  if (!date || !isValid(date)) return "";
  return format(date, STORAGE_DATE_FORMAT);
}

export function formatDateForDisplay(value) {
  const date = parseStoredDate(value);
  return date ? format(date, DISPLAY_DATE_FORMAT) : "";
}

/**
 * @param {object} props
 * @param {string} [props.value] Stored as yyyy-MM-dd
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {Date} [props.maxDate]
 * @param {Date} [props.minDate]
 * @param {string} [props.className]
 * @param {string} [props.id]
 */
export function DatePicker({
  value = "",
  onChange,
  placeholder = "dd-mm-yyyy",
  disabled = false,
  maxDate = new Date(),
  minDate = new Date(1920, 0, 1),
  className,
  id,
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseStoredDate(value), [value]);
  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const fromYear = minDate.getFullYear();
  const toYear = maxDate.getFullYear();

  const dayModifiers = useMemo(
    () => ({
      passed: (date) => isBefore(startOfDay(date), todayStart),
      upcoming: (date) => isAfter(startOfDay(date), todayStart),
    }),
    [todayStart]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-[1.4rem] border border-slate-300 bg-white px-4 text-sm shadow-sm transition",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--brand-green)]/10 focus-visible:border-[color:var(--brand-green)]/35",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value ? "text-slate-900" : "text-slate-400",
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-slate-400" />
            <span className="truncate">
              {value ? formatDateForDisplay(value) : placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="z-50 w-auto overflow-visible border-0 p-0 shadow-none"
        align="start"
        side="top"
        sideOffset={8}
        collisionPadding={16}
      >
        <div className="brand-day-picker overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(formatDateForStorage(date));
              if (date) setOpen(false);
            }}
            disabled={{ after: maxDate, before: minDate }}
            modifiers={dayModifiers}
            modifiersClassNames={{
              passed: "rdp-passed",
              upcoming: "rdp-upcoming",
            }}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            defaultMonth={selected || maxDate}
            showOutsideDays
            fixedWeeks
            components={{ Dropdown: CalendarDropdown }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
