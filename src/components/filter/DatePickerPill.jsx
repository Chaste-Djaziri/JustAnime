import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faXmark } from "@fortawesome/free-solid-svg-icons";

const MONTHS = [
  { val: "1", label: "Jan" },
  { val: "2", label: "Feb" },
  { val: "3", label: "Mar" },
  { val: "4", label: "Apr" },
  { val: "5", label: "May" },
  { val: "6", label: "Jun" },
  { val: "7", label: "Jul" },
  { val: "8", label: "Aug" },
  { val: "9", label: "Sep" },
  { val: "10", label: "Oct" },
  { val: "11", label: "Nov" },
  { val: "12", label: "Dec" },
];

const YEARS = Array.from({ length: 40 }, (_, i) => String(2027 - i));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

function DatePickerPill({
  label = "Start Date",
  year = "",
  month = "",
  day = "",
  onDateChange,
  onClear,
}) {
  const dateInputRef = useRef(null);

  // Format YYYY-MM-DD for native picker value
  const nativePickerValue =
    year && month && day
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : "";

  const handleNativeChange = (e) => {
    const val = e.target.value;
    if (!val) {
      onClear?.();
      return;
    }
    const [y, m, d] = val.split("-");
    if (y && m && d) {
      onDateChange?.({
        year: y,
        month: String(Number(m)),
        day: String(Number(d)),
      });
    }
  };

  const handleCalendarClick = () => {
    try {
      if (dateInputRef.current?.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current?.click();
      }
    } catch (_) {
      dateInputRef.current?.click();
    }
  };

  const hasDate = Boolean(year || month || day);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-[#18181b] hover:bg-[#222226] border border-zinc-700/60 rounded-xl px-3 py-2 transition-all shrink-0 relative group">
      <span className="text-xs font-bold text-white tracking-wide shrink-0 select-none">
        {label}:
      </span>

      {/* Year Select */}
      <select
        value={year}
        onChange={(e) => onDateChange?.({ year: e.target.value, month, day })}
        className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 transition-colors ${
          year ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <option value="" className="bg-zinc-900 text-zinc-400">
          Year
        </option>
        {YEARS.map((y) => (
          <option key={y} value={y} className="bg-zinc-900 text-white">
            {y}
          </option>
        ))}
      </select>

      {/* Month Select */}
      <select
        value={month}
        onChange={(e) => onDateChange?.({ year, month: e.target.value, day })}
        className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 transition-colors ${
          month ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <option value="" className="bg-zinc-900 text-zinc-400">
          Month
        </option>
        {MONTHS.map((m) => (
          <option key={m.val} value={m.val} className="bg-zinc-900 text-white">
            {m.label}
          </option>
        ))}
      </select>

      {/* Day Select */}
      <select
        value={day}
        onChange={(e) => onDateChange?.({ year, month, day: e.target.value })}
        className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 transition-colors ${
          day ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <option value="" className="bg-zinc-900 text-zinc-400">
          Day
        </option>
        {DAYS.map((d) => (
          <option key={d} value={d} className="bg-zinc-900 text-white">
            {d}
          </option>
        ))}
      </select>

      {/* Native Calendar Picker Icon / Trigger */}
      <button
        type="button"
        onClick={handleCalendarClick}
        className="text-zinc-400 hover:text-white transition-colors p-1 text-xs shrink-0"
        title="Open interactive calendar"
      >
        <FontAwesomeIcon icon={faCalendarDays} />
      </button>

      {/* Invisible HTML5 date picker */}
      <input
        ref={dateInputRef}
        type="date"
        value={nativePickerValue}
        onChange={handleNativeChange}
        className="sr-only absolute opacity-0 pointer-events-none"
        tabIndex={-1}
      />

      {/* Clear Button */}
      {hasDate && (
        <button
          type="button"
          onClick={onClear}
          className="text-zinc-500 hover:text-white transition-colors p-0.5 text-[10px] shrink-0 ml-0.5"
          title="Clear date"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
}

export default React.memo(DatePickerPill);
