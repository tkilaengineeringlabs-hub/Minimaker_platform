import Link from "next/link";
import { BrandLogo } from "~/components/BrandLogo";
import type { ComponentProps } from "react";
import React, { useEffect, useRef, useState } from "react";
import type { Tab } from "./BottomBar";
import { useBottomBarItems } from "./BottomBar";
import { MoreMenuPanel } from "~/components/MoreMenu";

const LeftBarMoreMenuSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" {...props}>
      <rect x="10" y="10" width="10" height="10" rx="3" fill="#00ACC1" />
      <rect x="26" y="10" width="10" height="10" rx="3" fill="#1E293B" />
      <rect x="10" y="26" width="10" height="10" rx="3" fill="#1E293B" />
      <rect x="26" y="26" width="10" height="10" rx="3" fill="#00838F" />
    </svg>
  );
};

export const LeftBar = ({ selectedTab }: { selectedTab: Tab | null }) => {
  const [moreMenuShown, setMoreMenuShown] = useState(false);
  const moreMenuRef = useRef<HTMLLIElement | null>(null);
  const bottomBarItems = useBottomBarItems();

  useEffect(() => {
    if (!moreMenuShown) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (moreMenuRef.current?.contains(event.target as Node)) return;
      setMoreMenuShown(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreMenuShown(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreMenuShown]);

  return (
    <nav className="maker-sidebar fixed bottom-0 left-0 top-0 z-[70] hidden flex-col gap-5 border-r-2 border-[#e5e5e5] bg-white p-3 md:flex lg:w-64 lg:p-5">
      <Link
        href="/learn"
        className="mb-4 ml-2 mt-4 hidden w-[190px] transition hover:-translate-y-0.5 lg:block"
        aria-label="Mini Maker Labs"
      >
        <BrandLogo className="w-full" priority />
      </Link>

      <ul className="flex flex-col items-stretch gap-3">
        {bottomBarItems.map((item) => (
          <li key={item.href} className="flex flex-1">
            <Link
              href={item.href}
              className={[
                "maker-sidebar-link flex grow items-center gap-3 rounded-xl px-2 py-1 text-sm font-extrabold uppercase tracking-[0.02em] transition",
                item.name === selectedTab
                  ? "border-2 border-[#00ACC1] bg-[#E0F7FA] text-[#00838F]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-[#00838F]",
              ].join(" ")}
            >
              {item.icon}{" "}
              <span className="sr-only lg:not-sr-only">{item.name}</span>
            </Link>
          </li>
        ))}

        <li ref={moreMenuRef} className="relative flex flex-1">
          <button
            className={[
              "maker-sidebar-link flex grow items-center gap-3 rounded-xl px-2 py-1 font-extrabold uppercase tracking-[0.02em] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8ff5ff]/70",
              moreMenuShown
                ? "bg-[#071014] text-[#5eeaf0]"
                : "text-gray-500 hover:bg-gray-100 hover:text-[#00838F]",
            ].join(" ")}
            onClick={() => setMoreMenuShown((x) => !x)}
            aria-expanded={moreMenuShown}
            aria-haspopup="menu"
          >
            <LeftBarMoreMenuSvg />{" "}
            <span className="hidden text-sm lg:inline">Más</span>
          </button>

          <div
            className={[
              "fixed bottom-4 z-[80] md:left-[88px] lg:left-[272px]",
              moreMenuShown ? "block" : "hidden",
            ].join(" ")}
          >
            <MoreMenuPanel onRequestClose={() => setMoreMenuShown(false)} />
          </div>
        </li>
      </ul>
    </nav>
  );
};
