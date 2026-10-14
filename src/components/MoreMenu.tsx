import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useState } from "react";
import { useBoundStore } from "~/hooks/useBoundStore";
import { signOut } from "~/services/authService";

type MoreMenuPanelProps = {
  onRequestClose?: () => void;
};

type SoonModal = "HIDDEN" | "EXPLORE" | "HELP";

const uiFont =
  '"Arial Rounded MT Bold", "Trebuchet MS", var(--font-sans), system-ui, sans-serif';
const displayFont =
  '"Courier New", Monaco, Menlo, ui-monospace, SFMono-Regular, monospace';

export const MoreMenuPanel = ({ onRequestClose }: MoreMenuPanelProps) => {
  const router = useRouter();
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const role = useBoundStore((x) => x.role);
  const logOut = useBoundStore((x) => x.logOut);
  const [soonModal, setSoonModal] = useState<SoonModal>("HIDDEN");

  const schoolHref =
    role === "school_admin" ? "/school" : "/profile#escuelas-maker";

  const logout = () => {
    logOut();
    void signOut();
    void router.push("/?login");
  };

  return (
    <>
      <div
        className="relative z-10 max-h-[calc(100vh-32px)] w-[min(340px,calc(100vw-32px))] overflow-y-auto rounded-[18px] border-2 border-[#071014] bg-[#fffefa] p-3 text-left text-[#29343d] shadow-[7px_7px_0_#071014]"
        style={{ fontFamily: uiFont }}
      >
        <MenuGroup title="Mi espacio">
          <MenuLink
            href="/profile"
            icon="🪪"
            label="Perfil Maker"
            onClick={onRequestClose}
          />
          <MenuLink
            href="/portfolio"
            icon="🛠️"
            label="Mi Portafolio Maker"
            onClick={onRequestClose}
          />
        </MenuGroup>

        <MenuGroup title="Comunidad">
          <MenuLink
            href={schoolHref}
            icon="🏫"
            label="Escuelas Maker"
            onClick={onRequestClose}
          />
          <MenuButton
            icon="🧭"
            label="Explorar"
            onClick={() => setSoonModal("EXPLORE")}
          />
        </MenuGroup>

        <MenuGroup title="Soporte">
          <MenuLink
            href="/settings"
            icon="⚙️"
            label="Configuración"
            onClick={onRequestClose}
          />
          <MenuButton
            icon="❓"
            label="Centro de ayuda"
            onClick={() => setSoonModal("HELP")}
          />
        </MenuGroup>

        <div className="mt-2 border-t-2 border-gray-100 pt-2">
          {!loggedIn ? (
            <Link
              href="/login"
              className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 text-[15px] font-extrabold text-[#00838f] transition hover:border-[#8deff1] hover:bg-[#e7fbfb]"
              onClick={onRequestClose}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#9deff1] bg-[#e7fbfb] text-xl text-[#00838f]">
                →
              </span>
              Acceder
            </Link>
          ) : (
            <button
              className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 text-[15px] font-extrabold text-red-500 transition hover:border-red-100 hover:bg-red-50"
              onClick={() => {
                onRequestClose?.();
                logout();
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-red-100 bg-red-50 text-xl">
                ×
              </span>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      <ExploreModal
        isShown={soonModal === "EXPLORE"}
        onClose={() => setSoonModal("HIDDEN")}
      />
      <HelpModal
        isShown={soonModal === "HELP"}
        onClose={() => setSoonModal("HIDDEN")}
      />
    </>
  );
};

const MenuGroup = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="border-b-2 border-[#edf0f2] py-2 last:border-b-0">
    <h3
      className="px-3 pb-1 text-[11px] font-black uppercase tracking-[0.28em] text-[#8b96a3]"
      style={{ fontFamily: displayFont }}
    >
      {title}
    </h3>
    <div className="grid gap-1.5">{children}</div>
  </section>
);

const menuItemClassName =
  "flex min-h-[56px] w-full items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2 text-[15px] font-extrabold tracking-[0.01em] text-[#465160] transition hover:border-[#8deff1] hover:bg-[#e7fbfb] hover:text-[#00838f] active:translate-y-[1px]";

const MenuIcon = ({ icon }: { icon: string }) => (
  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#e4eaef] bg-[#f3f7f9] text-lg shadow-[2px_2px_0_#d5dee5]">
    {icon}
  </span>
);

const MenuLink = ({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  onClick?: () => void;
}) => (
  <Link href={href} className={menuItemClassName} onClick={onClick}>
    <MenuIcon icon={icon} />
    {label}
  </Link>
);

const MenuButton = ({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) => (
  <button className={menuItemClassName} onClick={onClick}>
    <MenuIcon icon={icon} />
    {label}
  </button>
);

const ExploreModal = ({
  isShown,
  onClose,
}: {
  isShown: boolean;
  onClose: () => void;
}) => {
  if (!isShown) return null;

  return (
    <SimpleModal title="Explorar" onClose={onClose}>
      <p className="font-semibold text-gray-500">
        Muy pronto podrás descubrir proyectos, retos e ideas creadas por la
        comunidad Maker.
      </p>
    </SimpleModal>
  );
};

const HelpModal = ({
  isShown,
  onClose,
}: {
  isShown: boolean;
  onClose: () => void;
}) => {
  if (!isShown) return null;

  return (
    <SimpleModal title="Centro de ayuda" onClose={onClose}>
      <p className="font-semibold text-gray-500">
        ¿Necesitas ayuda con tus kits, cursos o cuenta?
      </p>
      <div className="mt-4 grid gap-3">
        {[
          "🧰 Ayuda con un Kit",
          "📚 Ayuda con una lección",
          "👤 Ayuda con mi cuenta",
        ].map((label) => (
          <div
            key={label}
            className="rounded-xl border-2 border-[#dfe6eb] bg-[#f7faf8] px-4 py-3 font-extrabold text-[#465160]"
          >
            {label}
            <p className="mt-1 text-sm font-semibold text-gray-400">
              Esta sección estará disponible próximamente.
            </p>
          </div>
        ))}
      </div>
    </SimpleModal>
  );
};

const SimpleModal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
    <section
      className="w-full max-w-sm rounded-[18px] border-2 border-[#071014] bg-[#fffefa] p-6 text-center shadow-[7px_7px_0_#071014]"
      style={{ fontFamily: uiFont }}
    >
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
