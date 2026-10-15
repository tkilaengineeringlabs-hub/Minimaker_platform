import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useBoundStore } from "~/hooks/useBoundStore";
import { signOut } from "~/services/authService";

type MoreMenuPanelProps = {
  onRequestClose?: () => void;
};

type SoonModal = "HIDDEN" | "EXPLORE" | "HELP";
type ThemeMode = "light" | "dark";

const uiFont =
  '"Arial Rounded MT Bold", "Trebuchet MS", var(--font-sans), system-ui, sans-serif';
const displayFont = '"Jersey 10", "Courier New", ui-monospace, monospace';

const setTheme = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("minimaker-theme", theme);
};

export const MoreMenuPanel = ({ onRequestClose }: MoreMenuPanelProps) => {
  const router = useRouter();
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const role = useBoundStore((x) => x.role);
  const logOut = useBoundStore((x) => x.logOut);
  const [soonModal, setSoonModal] = useState<SoonModal>("HIDDEN");
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("minimaker-theme");
    const currentTheme: ThemeMode =
      savedTheme === "dark" || document.documentElement.dataset.theme === "dark"
        ? "dark"
        : "light";
    setThemeState(currentTheme);
  }, []);

  const schoolHref =
    role === "school_admin" ? "/school" : "/profile#escuelas-maker";

  const logout = () => {
    logOut();
    void signOut();
    void router.push("/?login");
  };

  const changeTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <>
      <div
        className="maker-more-menu relative z-10 max-h-[calc(100vh-28px)] w-[min(318px,calc(100vw-28px))] overflow-y-auto rounded-[22px] border-[3px] border-[#071014] bg-[#fffefa] p-3 text-left text-[#25313b] shadow-[10px_10px_0_rgba(7,16,20,0.95),0_18px_45px_rgba(7,16,20,0.18)]"
        style={{ fontFamily: uiFont }}
        role="menu"
      >
        <div className="mb-2 flex items-center justify-between rounded-[16px] bg-[#071014] px-4 py-3 text-white">
          <div>
            <div
              className="text-[23px] leading-none tracking-[0.08em] text-[#5eeaf0]"
              style={{ fontFamily: displayFont }}
            >
              MENÚ MAKER
            </div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/55">
              Tu espacio de trabajo
            </div>
          </div>
          <div className="grid h-10 w-10 grid-cols-2 gap-1 rounded-xl border border-white/20 bg-white/10 p-2">
            <span className="rounded-sm bg-[#08d9d6]" />
            <span className="rounded-sm bg-white" />
            <span className="rounded-sm bg-white" />
            <span className="rounded-sm bg-[#08d9d6]" />
          </div>
        </div>

        <MenuGroup title="Mi espacio">
          <MenuLink href="/profile" icon="ID" label="Perfil Maker" onClick={onRequestClose} />
          <MenuLink href="/portfolio" icon="MX" label="Mi Portafolio Maker" onClick={onRequestClose} />
        </MenuGroup>

        <MenuGroup title="Comunidad">
          <MenuLink href={schoolHref} icon="ED" label="Escuelas Maker" onClick={onRequestClose} />
          <MenuButton icon="EX" label="Explorar" onClick={() => setSoonModal("EXPLORE")} />
        </MenuGroup>

        <MenuGroup title="Apariencia">
          <div className="grid grid-cols-2 gap-2 px-1 pb-1">
            <ThemeButton
              active={theme === "light"}
              label="Claro"
              icon="☀"
              onClick={() => changeTheme("light")}
            />
            <ThemeButton
              active={theme === "dark"}
              label="Oscuro"
              icon="☾"
              onClick={() => changeTheme("dark")}
            />
          </div>
        </MenuGroup>

        <MenuGroup title="Soporte">
          <MenuLink href="/settings" icon="CF" label="Configuración" onClick={onRequestClose} />
          <MenuButton icon="?" label="Centro de ayuda" onClick={() => setSoonModal("HELP")} />
        </MenuGroup>

        <div className="mt-2 border-t-2 border-[#e8ecef] pt-2">
          {!loggedIn ? (
            <Link
              href="/login"
              className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 text-[14px] font-black text-[#00838f] transition hover:border-[#8deff1] hover:bg-[#e7fbfb]"
              onClick={onRequestClose}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#08d9d6] font-black text-[#071014]">→</span>
              Acceder
            </Link>
          ) : (
            <button
              className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 text-[14px] font-black text-red-500 transition hover:border-red-100 hover:bg-red-50"
              onClick={() => {
                onRequestClose?.();
                logout();
              }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-lg">×</span>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      <ExploreModal isShown={soonModal === "EXPLORE"} onClose={() => setSoonModal("HIDDEN")} />
      <HelpModal isShown={soonModal === "HELP"} onClose={() => setSoonModal("HIDDEN")} />
    </>
  );
};

const MenuGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-b-2 border-[#edf0f2] py-2.5 last:border-b-0">
    <h3
      className="px-2 pb-1.5 text-[16px] uppercase tracking-[0.12em] text-[#6f7d89]"
      style={{ fontFamily: displayFont }}
    >
      {title}
    </h3>
    <div className="grid gap-1">{children}</div>
  </section>
);

const menuItemClassName =
  "flex min-h-[48px] w-full items-center gap-3 rounded-xl border-2 border-transparent px-2 py-1.5 text-[14px] font-black tracking-[0.01em] text-[#394956] transition hover:border-[#55dce3] hover:bg-[#e7fbfb] hover:text-[#007d89] active:translate-y-[1px]";

const MenuIcon = ({ icon }: { icon: string }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-2 border-[#cfd9df] bg-[#f4f7f8] text-[11px] font-black tracking-[0.08em] text-[#071014] shadow-[2px_2px_0_#d5dee5]">
    {icon}
  </span>
);

const MenuLink = ({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick?: () => void }) => (
  <Link href={href} className={menuItemClassName} onClick={onClick}>
    <MenuIcon icon={icon} />
    <span>{label}</span>
  </Link>
);

const MenuButton = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
  <button className={menuItemClassName} onClick={onClick}>
    <MenuIcon icon={icon} />
    <span>{label}</span>
  </button>
);

const ThemeButton = ({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) => (
  <button
    className={[
      "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-black uppercase tracking-[0.05em] transition",
      active
        ? "border-[#071014] bg-[#08d9d6] text-[#071014] shadow-[0_3px_0_#071014]"
        : "border-[#dbe3e7] bg-[#f6f8f9] text-[#65727c] hover:border-[#8deff1]",
    ].join(" ")}
    onClick={onClick}
  >
    <span className="text-base leading-none">{icon}</span>
    {label}
  </button>
);

const ExploreModal = ({ isShown, onClose }: { isShown: boolean; onClose: () => void }) => {
  if (!isShown) return null;
  return (
    <SimpleModal title="Explorar" onClose={onClose}>
      <p className="font-semibold text-gray-500">
        Muy pronto podrás descubrir proyectos, retos e ideas creadas por la comunidad Maker.
      </p>
    </SimpleModal>
  );
};

const HelpModal = ({ isShown, onClose }: { isShown: boolean; onClose: () => void }) => {
  if (!isShown) return null;
  return (
    <SimpleModal title="Centro de ayuda" onClose={onClose}>
      <p className="font-semibold text-gray-500">¿Necesitas ayuda con tus kits, cursos o cuenta?</p>
    </SimpleModal>
  );
};

const SimpleModal = ({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
    <section className="maker-more-menu w-full max-w-sm rounded-[18px] border-2 border-[#071014] bg-[#fffefa] p-6 text-center shadow-[7px_7px_0_#071014]">
      <h2 className="text-2xl font-black text-gray-800">{title}</h2>
      <div className="mt-3">{children}</div>
      <button
        className="mt-5 rounded-xl border-2 border-b-[6px] border-[#071014] bg-[#08d9d6] px-6 py-3 text-sm font-black uppercase text-[#071014] transition hover:-translate-y-0.5 hover:bg-[#35f0ec] active:translate-y-[3px] active:border-b-2"
        onClick={onClose}
      >
        Entendido
      </button>
    </section>
  </div>
);
