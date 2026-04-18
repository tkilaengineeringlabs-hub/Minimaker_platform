import Link from "next/link";
import type { ComponentProps } from "react";
import React, { useState } from "react";
import type { Tab } from "./BottomBar";
import { useBottomBarItems } from "./BottomBar";
import type { LoginScreenState } from "./LoginScreen";
import { LoginScreen } from "./LoginScreen";
import { useBoundStore } from "~/hooks/useBoundStore";

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
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const logOut = useBoundStore((x) => x.logOut);

  const [moreMenuShown, setMoreMenuShown] = useState(false);
  const [loginScreenState, setLoginScreenState] =
    useState<LoginScreenState>("HIDDEN");

  const bottomBarItems = useBottomBarItems();

  return (
    <>
      <nav className="fixed bottom-0 left-0 top-0 hidden flex-col gap-5 border-r-2 border-[#e5e5e5] bg-white p-3 md:flex lg:w-64 lg:p-5">
        
        {/* LOGO TEXTUAL BIOMAKERS */}
        <Link
          href="/learn"
          className="mb-5 ml-5 mt-5 hidden text-3xl font-extrabold lg:block tracking-tight"
        >
          <span className="text-[#00ACC1]">Bio</span><span className="text-[#1E293B]">Makers</span>
        </Link>
        
        <ul className="flex flex-col items-stretch gap-3">
          {bottomBarItems.map((item) => {
            return (
              <li key={item.href} className="flex flex-1">
                {item.name === selectedTab ? (
                  <Link
                    href={item.href}
                    className="flex grow items-center gap-3 rounded-xl border-2 border-[#00ACC1] bg-[#E0F7FA] px-2 py-1 text-sm font-bold uppercase text-[#00838F]"
                  >
                    {item.icon}{" "}
                    <span className="sr-only lg:not-sr-only">{item.name}</span>
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className="flex grow items-center gap-3 rounded-xl px-2 py-1 text-sm font-bold uppercase text-gray-500 hover:bg-gray-100"
                  >
                    {item.icon}{" "}
                    <span className="sr-only lg:not-sr-only">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
          <div
            className="relative flex grow cursor-default items-center gap-3 rounded-xl px-2 py-1 font-bold uppercase text-gray-500 hover:bg-gray-100"
            onClick={() => setMoreMenuShown((x) => !x)}
            onMouseEnter={() => setMoreMenuShown(true)}
            onMouseLeave={() => setMoreMenuShown(false)}
            role="button"
            tabIndex={0}
          >
            <LeftBarMoreMenuSvg />{" "}
            <span className="hidden text-sm lg:inline">Hub</span>
            <div
              className={[
                "absolute left-full top-[-10px] min-w-[300px] rounded-2xl border-2 border-gray-200 bg-white text-left text-gray-500 shadow-xl",
                moreMenuShown ? "" : "hidden",
              ].join(" ")}
            >
              <div className="flex flex-col py-2">
                <Link
                  className="flex items-center gap-4 px-5 py-3 text-left uppercase hover:bg-gray-50"
                  href="https://schools.duolingo.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* ÍCONO: PC CON CÓDIGO (Escuelas Maker) */}
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                    <rect x="2" y="4" width="20" height="12" rx="2" fill="#1E293B" />
                    <path d="M8 20h8m-4-4v4" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Símbolos de código < / > */}
                    <polyline points="9 8 6 10 9 12" stroke="#00ACC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="15 8 18 10 15 12" stroke="#00ACC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="13" y1="7" x2="11" y2="13" stroke="#00ACC1" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Escuelas maker
                </Link>
                <Link
                  className="flex items-center gap-4 px-5 py-3 text-left uppercase hover:bg-gray-50"
                  href="https://podcast.duolingo.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* ÍCONO: RADAR TECNOLÓGICO (Explorar) */}
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                    <circle cx="12" cy="12" r="10" fill="#0F172A" />
                    <circle cx="12" cy="12" r="6" stroke="#00838F" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="12" cy="12" r="2" fill="#00ACC1" />
                    {/* Haz de escaneo */}
                    <path d="M12 12 L22 12 A10 10 0 0 0 12 2 Z" fill="#00ACC1" fillOpacity="0.3" />
                    <path d="M12 12 L20 4" stroke="#00ACC1" strokeWidth="2" strokeLinecap="round" />
                    {/* Punto detectado */}
                    <circle cx="16" cy="8" r="1.5" fill="#FBBF24" />
                  </svg>
                  Explorar
                </Link>
              </div>
              <div className="flex flex-col border-t-2 border-gray-100 py-2">
                {!loggedIn && (
                  <button
                    className="px-5 py-3 text-left uppercase hover:bg-gray-50"
                    onClick={() => setLoginScreenState("SIGNUP")}
                  >
                    Crear perfil técnico
                  </button>
                )}
                <Link
                  className="px-5 py-3 text-left uppercase hover:bg-gray-50"
                  href={loggedIn ? "/settings/account" : "/settings/sound"}
                >
                  Configuración
                </Link>
                <Link
                  className="px-5 py-3 text-left uppercase hover:bg-gray-50"
                  href="https://support.duolingo.com/hc/en-us"
                >
                  Centro de ayuda
                </Link>
                {!loggedIn && (
                  <button
                    className="px-5 py-3 text-left uppercase hover:bg-gray-50 text-[#00ACC1] font-bold"
                    onClick={() => setLoginScreenState("LOGIN")}
                  >
                    Acceder
                  </button>
                )}
                {loggedIn && (
                  <button
                    className="px-5 py-3 text-left uppercase hover:bg-gray-50 text-red-500 font-bold"
                    onClick={logOut}
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        </ul>
      </nav>
      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />
    </>
  );
};