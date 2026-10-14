import dayjs from "dayjs";
import { useEffect } from "react";
import { useBoundStore } from "~/hooks/useBoundStore";
import { ChevronLeftSvg, ChevronRightSvg } from "./Svgs";
import { range } from "~/utils/array-utils";

const getCalendarDays = (now: dayjs.Dayjs): (number | null)[][] => {
  const startOfMonth = now.startOf("month");
  const calendarDays: (number | null)[][] = [];
  const firstWeekEndDate = 8 - startOfMonth.day();
  const firstWeek = [
    ...range(0, startOfMonth.day()).map(() => null),
    ...range(1, firstWeekEndDate),
  ];
  calendarDays.push(firstWeek);
  for (
    let weekStartDate = firstWeekEndDate;
    weekStartDate <= now.daysInMonth();
    weekStartDate += 7
  ) {
    calendarDays.push(
      range(weekStartDate, weekStartDate + 7).map((date) =>
        date <= now.daysInMonth() ? date : null,
      ),
    );
  }
  return calendarDays;
};

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const formatCalendarMonth = (now: dayjs.Dayjs): string =>
  `${monthNames[now.month()]} ${now.year()}`;

export const Calendar = ({
  now,
  setNow,
}: {
  now: dayjs.Dayjs;
  setNow: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
}) => {
  const isActiveDay = useBoundStore((x) => x.isActiveDay);
  const formattedNowMonth = formatCalendarMonth(now);
  const staticNow = dayjs();
  const calendarDays = getCalendarDays(now);
  return (
    <article className="flex w-full flex-col rounded-xl border-2 border-gray-200 p-2 text-gray-400 sm:p-3">
      <header className="flex items-center justify-between gap-2">
        <button
          className="flex h-8 w-8 scale-75 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100"
          onClick={() => setNow((now) => now.add(-1, "month"))}
        >
          <ChevronLeftSvg />
          <span className="sr-only">Ir al mes anterior</span>
        </button>
        <h3 className="text-sm font-black uppercase text-gray-500 sm:text-base">
          {formattedNowMonth}
        </h3>
        <button
          className="flex h-8 w-8 scale-75 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100"
          onClick={() => setNow((now) => now.add(1, "month"))}
        >
          <ChevronRightSvg />
          <span className="sr-only">Ir al mes siguiente</span>
        </button>
      </header>
      <div className="mt-2 grid grid-cols-7 gap-1 px-1 text-xs font-black sm:text-sm">
        {"DLMXJVS".split("").map((day, i) => {
          return (
            <div key={i} className="flex h-7 items-center justify-center">
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex flex-col gap-1 px-1 pb-1">
        {calendarDays.map((week, i) => {
          return (
            <div key={i} className="grid grid-cols-7 gap-1">
              {week.map((date, i) => {
                const isActiveDate =
                  date !== null && isActiveDay(now.date(date));
                const isCurrentDate =
                  date === staticNow.date() &&
                  now.month() === staticNow.month() &&
                  now.year() === staticNow.year();
                return (
                  <div
                    key={i}
                    className={[
                      "flex h-7 w-full items-center justify-center rounded-full text-sm font-bold sm:h-8",
                      isActiveDate
                        ? "bg-orange-400 text-white"
                        : isCurrentDate
                          ? "bg-gray-300 text-gray-600"
                          : "",
                    ].join(" ")}
                  >
                    {date}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </article>
  );
};

export const StreakModal = ({
  isShown,
  now,
  setNow,
  onClose,
}: {
  isShown: boolean;
  now: dayjs.Dayjs;
  setNow: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!isShown) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isShown, onClose]);

  if (!isShown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <section className="relative mx-4 flex max-h-[calc(100vh-32px)] w-[calc(100%-32px)] max-w-lg flex-col overflow-y-auto rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 text-black shadow-xl sm:p-5">
        <button
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-2xl font-black text-gray-400 transition hover:bg-gray-100"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="pr-10 text-center">
          <h2 className="text-xl font-black text-gray-800">Racha</h2>
          <p className="mt-2 text-sm font-bold leading-5 text-gray-500">
            Construye, programa o completa actividades para mantener activa tu
            Racha Maker.
          </p>
        </div>
        <div className="mt-4">
          <Calendar now={now} setNow={setNow} />
        </div>
      </section>
    </div>
  );
};
