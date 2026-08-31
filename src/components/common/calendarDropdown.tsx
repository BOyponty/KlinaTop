import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getTodayISO,
  parseISODate,
  formatDateToISO,
  formatFullFrenchDate,
  formatShortDate,
  isToday,
  isYesterday,
  isFuture,
} from '../../utils/dateUtils';

interface CalendarDropdownProps {
  selectedDate: string;
  onSelectDate: (dateIso: string) => void;
  availableDatesWithData?: string[];
  className?: string;
  align?: 'left' | 'right';
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEKDAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const CalendarDropdown: React.FC<CalendarDropdownProps> = ({
  selectedDate,
  onSelectDate,
  availableDatesWithData = [],
  className = '',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month and year for calendar viewing (independent of selected date until clicked)
  const [viewYear, setViewYear] = useState<number>(() => {
    const d = parseISODate(selectedDate || getTodayISO());
    return d.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    const d = parseISODate(selectedDate || getTodayISO());
    return d.getMonth();
  });

  // When selectedDate changes outside, synchronize view if closed
  useEffect(() => {
    if (!isOpen) {
      const d = parseISODate(selectedDate || getTodayISO());
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [selectedDate, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const currentMaxYear = today.getFullYear();
    const currentMaxMonth = today.getMonth();

    // Prevent browsing too far in the future
    if (viewYear > currentMaxYear || (viewYear === currentMaxYear && viewMonth >= currentMaxMonth)) {
      return;
    }

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar grid days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

  // In JS: 0=Sun, 1=Mon, ..., 6=Sat. We want 0=Mon, ..., 6=Sun
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const totalDaysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    isoDate: string;
    isCurrentMonth: boolean;
    isFutureDate: boolean;
    hasData: boolean;
    isSelected: boolean;
    isTodayDate: boolean;
  }> = [];

  const todayIso = getTodayISO();

  // Days from previous month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const iso = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: dayNum,
      isoDate: iso,
      isCurrentMonth: false,
      isFutureDate: isFuture(iso),
      hasData: availableDatesWithData.includes(iso),
      isSelected: iso === selectedDate,
      isTodayDate: iso === todayIso,
    });
  }

  // Days from current month
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: dayNum,
      isoDate: iso,
      isCurrentMonth: true,
      isFutureDate: isFuture(iso),
      hasData: availableDatesWithData.includes(iso),
      isSelected: iso === selectedDate,
      isTodayDate: iso === todayIso,
    });
  }

  // Days from next month to complete standard 35 or 42 grid cells
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const iso = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: i,
      isoDate: iso,
      isCurrentMonth: false,
      isFutureDate: isFuture(iso),
      hasData: availableDatesWithData.includes(iso),
      isSelected: iso === selectedDate,
      isTodayDate: iso === todayIso,
    });
  }

  const handleSelectDay = (isoDate: string, isFutureDate: boolean) => {
    if (isFutureDate) return;
    onSelectDate(isoDate);
    setIsOpen(false);
  };

  const handleQuickPreset = (presetIso: string) => {
    onSelectDate(presetIso);
    const d = parseISODate(presetIso);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  const isCurrentViewMax = () => {
    const today = new Date();
    return viewYear >= today.getFullYear() && viewMonth >= today.getMonth();
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button - Looks like the stylish badge */}
      <button
        type="button"
        id="btn-calendar-picker-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2.5 bg-white border rounded-2xl px-3.5 py-2 shadow-xs transition-all cursor-pointer select-none ${
          isOpen
            ? 'border-[#0F9D58] ring-2 ring-emerald-100 bg-emerald-50/20'
            : 'border-gray-200 hover:border-[#0F9D58] hover:shadow-sm'
        }`}
        title="Cliquer pour ouvrir le calendrier et choisir un jour"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0F9D58] flex items-center justify-center">
          <CalendarIcon className="w-3.5 h-3.5 text-[#0F9D58]" />
        </div>
        <span className="text-xs font-bold text-gray-800">
          {formatFullFrenchDate(selectedDate)}
        </span>
        <span className="text-[10px] text-gray-400 font-semibold px-1.5 py-0.5 bg-gray-100 rounded-md ml-1">
          Choisir ▾
        </span>
      </button>

      {/* Popover Calendar Window */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2.5 z-50 bg-white rounded-3xl border border-gray-200 shadow-2xl p-4 w-[330px] sm:w-[350px] animate-fadeIn ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
        >
          {/* Calendar Header: Month/Year + Navigation */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-gray-900 capitalize">
                {MONTHS_FR[viewMonth]} {viewYear}
              </h4>
              <p className="text-[11px] text-gray-400">
                Sélectionnez une date à consulter
              </p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Mois précédent"
                className="p-1 rounded-lg hover:bg-white text-gray-700 hover:text-[#0F9D58] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isCurrentViewMax()}
                title="Mois suivant"
                className={`p-1 rounded-lg transition-colors ${
                  isCurrentViewMax()
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'hover:bg-white text-gray-700 hover:text-[#0F9D58] cursor-pointer'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset(todayIso)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                selectedDate === todayIso
                  ? 'bg-[#0F9D58] text-white'
                  : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0F9D58]'
              }`}
            >
              Aujourd'hui
            </button>

            <button
              type="button"
              onClick={() => {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                handleQuickPreset(formatDateToISO(y));
              }}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                isYesterday(selectedDate)
                  ? 'bg-[#0F9D58] text-white'
                  : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0F9D58]'
              }`}
            >
              Hier
            </button>

            <button
              type="button"
              onClick={() => {
                const d = new Date();
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
                d.setDate(diff);
                handleQuickPreset(formatDateToISO(d));
              }}
              className="px-2.5 py-1 rounded-xl font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0F9D58] transition-all cursor-pointer shrink-0"
            >
              Ce Lundi
            </button>

            <button
              type="button"
              onClick={() => {
                const first = new Date(viewYear, viewMonth, 1);
                handleQuickPreset(formatDateToISO(first));
              }}
              className="px-2.5 py-1 rounded-xl font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0F9D58] transition-all cursor-pointer shrink-0"
            >
              1er du mois
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS_FR.map((wkd) => (
              <span key={wkd} className="text-[11px] font-bold text-gray-400 py-1">
                {wkd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((cDay, idx) => {
              const isSelected = cDay.isSelected;
              const isToday = cDay.isTodayDate;
              const isFuture = cDay.isFutureDate;
              const isCurrentMonth = cDay.isCurrentMonth;
              const hasData = cDay.hasData;

              let btnClass = 'relative h-9 w-9 mx-auto flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all ';

              if (isSelected) {
                btnClass += 'bg-[#0F9D58] text-white shadow-md font-bold scale-105 z-10';
              } else if (isFuture) {
                btnClass += 'text-gray-300 cursor-not-allowed bg-transparent';
              } else if (isToday) {
                btnClass += 'border-2 border-[#0F9D58] text-[#0F9D58] font-bold hover:bg-emerald-50 cursor-pointer';
              } else if (isCurrentMonth) {
                btnClass += 'text-gray-800 hover:bg-gray-100 hover:text-[#0F9D58] cursor-pointer';
              } else {
                btnClass += 'text-gray-400 hover:bg-gray-50 cursor-pointer';
              }

              return (
                <button
                  key={`${cDay.isoDate}-${idx}`}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDay(cDay.isoDate, isFuture)}
                  className={btnClass}
                  title={cDay.isoDate}
                >
                  <span>{cDay.dayNumber}</span>
                  {/* Indicator dots */}
                  {hasData && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></span>
                  )}
                  {isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0F9D58]"></span>
              <span>Jour sélectionné</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-bold text-gray-500 hover:text-gray-800 px-2 py-0.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
