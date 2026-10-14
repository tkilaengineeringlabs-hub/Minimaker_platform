import dayjs from "dayjs";
import Link from "next/link";
import type { ComponentProps } from "react";
import React, { useEffect, useState } from "react";
import { useBoundStore } from "~/hooks/useBoundStore";
import { StreakModal } from "./Calendar";
import { MoreMenuPanel } from "./MoreMenu";
import { FireSvg, MoreOptionsSvg } from "./Svgs";
import { TeslaCoilIcon, TeslasModal } from "./TeslaReward";

const EmptyFireTopBarSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg width="25" height="30" viewBox="0 0 25 30" fill="none" {...props}>
      <g opacity="0.2">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.9697 2.91035C13.2187 1.96348 11.7813 1.96348 11.0303 2.91035L7.26148 7.66176L4.83362 6.36218C4.61346 6.24433 4.1221 6.09629 3.88966 6.05712C2.72329 5.86056 2.04098 6.78497 2.04447 8.03807L2.06814 16.5554C2.02313 16.9355 2 17.322 2 17.7137C2 23.2979 6.70101 27.8248 12.5 27.8248C18.299 27.8248 23 23.2979 23 17.7137C23 15.3518 22.1591 13.1791 20.7498 11.4581L13.9697 2.91035ZM11.7198 13.1888C12.0889 12.6861 12.8399 12.6861 13.209 13.1888L15.7324 16.6249C16.5171 17.4048 17 18.4679 17 19.6396C17 22.0329 14.9853 23.973 12.5 23.973C10.0147 23.973 8 22.0329 8 19.6396C8 18.6017 8.37893 17.649 9.01085 16.9029C9.0252 16.8668 9.04457 16.8315 9.06935 16.7978L11.7198 13.1888Z"
          fill="black"
        />
      </g>
    </svg>
  );
};

const AddLanguageSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg width="36" height="29" viewBox="0 0 36 29" {...props}>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g stroke="#AFAFAF">
          <path
            d="M7.743 3c-1.67 0-2.315.125-2.98.48A3.071 3.071 0 0 0 3.48 4.763c-.355.665-.48 1.31-.48 2.98v13.514c0 1.67.125 2.315.48 2.98.297.555.728.986 1.283 1.283.665.355 1.31.48 2.98.48h20.514c1.67 0 2.315-.125 2.98-.48a3.071 3.071 0 0 0 1.283-1.283c.355-.665.48-1.31.48-2.98V7.743c0-1.67-.125-2.315-.48-2.98a3.071 3.071 0 0 0-1.283-1.283c-.665-.355-1.31-.48-2.98-.48H7.743z"
            strokeWidth="2"
          />
          <g strokeLinecap="round" strokeWidth="3">
            <path d="M18 10v9M13.5 14.5h9" />
          </g>
        </g>
      </g>
    </svg>
  );
};

type MenuState = "HIDDEN" | "LANGUAGES" | "STREAK" | "TESLAS" | "MORE";

export const TopBar = ({
  backgroundColor = "bg-[#00acc1]",
  borderColor = "border-[#00838f]",
  learningPathName = "Fundamentos Maker",
  learningPathEmoji = "🤖",
  learningPathMenu,
}: {
  backgroundColor?: `bg-${string}`;
  borderColor?: `border-${string}`;
  learningPathName?: string;
  learningPathEmoji?: string;
  learningPathMenu?: React.ReactNode;
}) => {
  const [menu, setMenu] = useState<MenuState>("HIDDEN");
  const [now, setNow] = useState(dayjs());
  const streak = useBoundStore((x) => x.streak);
  const teslas = useBoundStore((x) => x.teslas);

  useEffect(() => {
    if (menu === "HIDDEN") return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu("HIDDEN");
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menu]);

  return (
    <header className="fixed z-50 h-[58px] w-full">
      <div
        className={`relative flex h-full w-full items-center justify-between border-b-2 px-[10px] transition duration-500 sm:hidden ${borderColor} ${backgroundColor}`}
      >
        <button
          onClick={() =>
            setMenu((x) => (x === "LANGUAGES" ? "HIDDEN" : "LANGUAGES"))
          }
        >
          <span className="text-3xl" aria-hidden="true">
            {learningPathEmoji}
          </span>
          <span className="sr-only">Ver ruta maker</span>
        </button>

        <button
          className="flex items-center gap-2 font-bold text-white"
          onClick={() => setMenu((x) => (x === "STREAK" ? "HIDDEN" : "STREAK"))}
          aria-label="Abrir menú de racha"
        >
          {streak > 0 ? <FireSvg /> : <EmptyFireTopBarSvg />}{" "}
          <span className={streak > 0 ? "text-white" : "text-black opacity-20"}>
            {streak}
          </span>
        </button>
        <button
          className="flex items-center gap-2 font-bold"
          onClick={() => setMenu((x) => (x === "TESLAS" ? "HIDDEN" : "TESLAS"))}
          aria-label="Abrir Teslas"
        >
          <TeslaCoilIcon size={30} muted={teslas === 0} />{" "}
          <span className={teslas > 0 ? "text-white" : "text-black opacity-20"}>
            {teslas}
          </span>
        </button>
        <MoreOptionsSvg
          onClick={() => setMenu((x) => (x === "MORE" ? "HIDDEN" : "MORE"))}
          role="button"
          tabIndex={0}
          aria-label="Abrir menú de más"
        />

        <div
          className={[
            "absolute left-0 right-0 top-full bg-white transition duration-300",
            menu === "HIDDEN" || menu === "STREAK" || menu === "TESLAS"
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          ].join(" ")}
          aria-hidden={menu === "HIDDEN"}
        >
          {((): null | JSX.Element => {
            switch (menu) {
              case "LANGUAGES":
                return learningPathMenu !== undefined ? (
                  <div className="flex p-5">{learningPathMenu}</div>
                ) : (
                  <div className="flex gap-5 p-5">
                    <div className="flex flex-col items-center justify-between gap-2">
                      <div className="rounded-2xl border-4 border-blue-400">
                        <span className="flex h-20 w-20 items-center justify-center text-5xl">
                          {learningPathEmoji}
                        </span>
                      </div>
                      <span className="font-bold">{learningPathName}</span>
                    </div>
                    <Link
                      className="flex flex-col items-center justify-between gap-2"
                      href="/register"
                    >
                      <div className="rounded-2xl border-4 border-white">
                        <AddLanguageSvg className="h-16 w-20" />
                      </div>
                      <span className="font-bold text-gray-400">Rutas</span>
                    </Link>
                  </div>
                );

              case "STREAK":
                return null;

              case "TESLAS":
                return null;

              case "MORE":
                return (
                  <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/30 p-4 pt-[74px]">
                    <button
                      className="absolute inset-0 cursor-default"
                      onClick={() => setMenu("HIDDEN")}
                      aria-label="Cerrar menú de más"
                    />
                    <MoreMenuPanel onRequestClose={() => setMenu("HIDDEN")} />
                  </div>
                );

              case "HIDDEN":
                return null;
            }
          })()}
          <div
            className={[
              "absolute left-0 top-full h-screen w-screen bg-black opacity-30",
              menu === "HIDDEN" ||
              menu === "STREAK" ||
              menu === "TESLAS" ||
              menu === "MORE"
                ? "pointer-events-none"
                : "",
              menu === "MORE" ? "hidden" : "",
            ].join(" ")}
            onClick={() => setMenu("HIDDEN")}
            aria-label="Ocultar menú"
            role="button"
          ></div>
        </div>
      </div>
      <StreakModal
        isShown={menu === "STREAK"}
        now={now}
        setNow={setNow}
        onClose={() => setMenu("HIDDEN")}
      />
      <TeslasModal
        isShown={menu === "TESLAS"}
        teslas={teslas}
        onClose={() => setMenu("HIDDEN")}
      />
    </header>
  );
};
