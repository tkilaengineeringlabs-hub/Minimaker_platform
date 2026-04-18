import Link from "next/link";
import { useBoundStore } from "~/hooks/useBoundStore";

export type Tab = "LAB" | "KITS" | "PERFIL" | "Leaderboards";

type BottomBarItem = {
  name: Tab;
  href: string;
  icon: JSX.Element;
};

export const useBottomBarItems = () => {
  const loggedIn = useBoundStore((x) => x.loggedIn);

  const bottomBarItems: BottomBarItem[] = [
    {
      name: "LAB",
      href: "/learn",
      icon: (
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          className="h-[50px] w-[50px]"
        >
          {/* Placa base (PCB Verde) */}
          <rect x="4" y="6" width="34" height="32" rx="3" fill="#15803D" />
          
          {/* Puertos borde superior (Micro HDMI, Power) */}
          <rect x="8" y="4" width="6" height="4" rx="1" fill="#CBD5E1" />
          <rect x="16" y="4" width="6" height="4" rx="1" fill="#CBD5E1" />
          <rect x="24" y="4" width="4" height="4" fill="#334155" />
          
          {/* Puertos apilados borde derecho (Ethernet, USB) */}
          <rect x="36" y="10" width="8" height="10" rx="1" fill="#94A3B8" /> {/* Ethernet */}
          <rect x="38" y="12" width="6" height="6" fill="#0F172A" />
          
          <rect x="36" y="22" width="8" height="6" rx="1" fill="#3B82F6" /> {/* USB 3.0 Azul */}
          <rect x="38" y="24" width="4" height="2" fill="#1D4ED8" />
          
          <rect x="36" y="30" width="8" height="6" rx="1" fill="#CBD5E1" /> {/* USB 2.0 */}
          <rect x="38" y="32" width="4" height="2" fill="#475569" />

          {/* Procesador Central (SoC) */}
          <rect x="15" y="15" width="14" height="14" rx="2" fill="#0F172A" />
          <circle cx="22" cy="22" r="3" stroke="#334155" strokeWidth="1.5" fill="none" />
          
          {/* Pines GPIO (Borde inferior) */}
          <rect x="6" y="36" width="26" height="4" fill="#1E293B" />
          <path d="M 8 36v4 M 11 36v4 M 14 36v4 M 17 36v4 M 20 36v4 M 23 36v4 M 26 36v4 M 29 36v4" stroke="#FBBF24" strokeWidth="1" />
          
          {/* Detalles / LEDs rojos y amarillos */}
          <circle cx="10" cy="12" r="2" fill="#EF4444" />
          <circle cx="10" cy="18" r="1.5" fill="#FBBF24" />
        </svg>
      ),
    },
    {
      name: "KITS",
      href: "/shop",
      icon: (
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          className="h-[50px] w-[50px]"
        >
          {/* Paredes traseras internas de la caja */}
          <path d="M 8 20 L 23 14 L 38 20 L 23 26 Z" fill="#B45309" />
          <path d="M 8 20 L 23 14 L 23 2 L 8 8 Z" fill="#F59E0B" /> 

          {/* Componentes asomándose */}
          <rect x="14" y="9" width="12" height="16" rx="1" fill="#22C55E" transform="rotate(15 20 17)" /> {/* Placa verde */}
          <rect x="16" y="11" width="8" height="6" rx="1" fill="#1E293B" transform="rotate(15 20 17)" /> {/* Chip */}
          <rect x="25" y="12" width="8" height="10" rx="1" fill="#94A3B8" /> {/* Motor */}
          <circle cx="29" cy="14" r="3" fill="#475569" />

          {/* Paredes frontales de la caja */}
          <path d="M 8 20 L 23 28 L 38 20 L 38 36 L 23 44 L 8 36 Z" fill="#F59E0B" />
          <path d="M 23 28 L 23 44" stroke="#D97706" strokeWidth="2" />

          {/* Solapas abiertas frontales */}
          <path d="M 8 20 L 23 28 L 12 38 L 2 28 Z" fill="#FCD34D" />
          <path d="M 38 20 L 23 28 L 34 38 L 44 28 Z" fill="#FCD34D" />

          {/* Cinta de empaque */}
          <path d="M 21 28 L 25 28 L 25 40 L 21 38 Z" fill="#FEF3C7" opacity="0.8" />
        </svg>
      ),
    },
    {
      name: "PERFIL",
      href: loggedIn ? "/profile" : "/learn?sign-up",
      icon: (
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          className="h-[50px] w-[50px]"
        >
          {/* Brillo de fondo sutil */}
          <circle cx="23" cy="23" r="20" fill="#00ACC1" fillOpacity="0.1" />
          
          {/* Hombros (Estructura base) */}
          <path d="M 10 44 C 10 36 15 34 23 34 C 31 34 36 36 36 44" fill="#1E293B" />
          <path d="M 14 44 C 14 38 18 37 23 37 C 28 37 32 38 32 44" fill="#334155" />
          
          {/* Cuello mecánico */}
          <rect x="19" y="30" width="8" height="8" fill="#94A3B8" />
          
          {/* Antena superior */}
          <rect x="22" y="4" width="2" height="8" fill="#CBD5E1" />
          <circle cx="23" cy="4" r="3" fill="#00ACC1" />

          {/* Cabeza (Carcasa Blanca Moderna) */}
          <rect x="10" y="12" width="26" height="22" rx="10" fill="#F8FAFC" />
          
          {/* Módulos auditivos (Cyan) */}
          <rect x="6" y="18" width="5" height="10" rx="2" fill="#00ACC1" />
          <rect x="35" y="18" width="5" height="10" rx="2" fill="#00ACC1" />
          
          {/* Visor Facial Oscuro */}
          <rect x="12" y="16" width="22" height="12" rx="5" fill="#0F172A" />
          
          {/* Ojos LED (Turquesa brillante) */}
          <ellipse cx="18" cy="22" rx="3" ry="4" fill="#00ACC1" />
          <ellipse cx="28" cy="22" rx="3" ry="4" fill="#00ACC1" />
        </svg>
      ),
    },
  ];

  if (loggedIn) {
    bottomBarItems.splice(1, 0, {
      name: "Leaderboards",
      href: "/leaderboard",
      icon: (
        <svg 
          width="46" 
          height="46" 
          viewBox="0 0 46 46" 
          fill="none" 
          className="h-[50px] w-[50px]"
        >
          <path d="M23 4 L40 10 L37 30 C35 38 26 43 23 44 C20 43 11 38 9 30 L6 10 L23 4 Z" fill="#FEC701" />
          <path d="M23 8 L35 13 L33 28 C31 34 25 38 23 39 C21 38 15 34 13 28 L11 13 L23 8 Z" fill="#FDE047" />
          <path d="M23 14 L26 20 L32 21 L27 25 L29 31 L23 28 L17 31 L19 25 L14 21 L20 20 Z" fill="#EAB308" />
          <circle cx="23" cy="22" r="3" fill="#FFFFFF" />
        </svg>
      ),
    });
  }

  return bottomBarItems;
};

export const BottomBar = ({ selectedTab }: { selectedTab: Tab | null }) => {
  const bottomBarItems = useBottomBarItems();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t-2 border-[#e5e5e5] bg-white md:hidden">
      <ul className="flex h-[88px]">
        {bottomBarItems.map((item) => {
          return (
            <li
              key={item.href}
              className="flex flex-1 items-center justify-center"
            >
              <Link
                href={item.href}
                className={
                  item.name === selectedTab
                    ? "rounded-xl border-2 border-[#84d8ff] bg-[#ddf4ff] px-2 py-1"
                    : "px-2 py-1"
                }
              >
                {item.icon}
                <span className="sr-only">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};