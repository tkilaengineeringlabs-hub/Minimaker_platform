import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LanguageHeaderProps = {
  openLogin?: () => void;
  openSchoolsModal?: () => void;
};

export const LanguageHeader = ({
  openLogin,
  openSchoolsModal,
}: LanguageHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    setMobileMenuOpen(false);
    openLogin?.();
  };

  const handleSchools = () => {
    setMobileMenuOpen(false);
    openSchoolsModal?.();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-[#071014] bg-[#fffdf6]">
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,#08d9d6_0_16%,transparent_16%_25%,#071014_25%_27%,transparent_27%_42%,#08d9d6_42%_59%,transparent_59%_78%,#071014_78%_80%,transparent_80%)]" />
      <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(90deg,rgba(8,217,214,0.34)_1px,transparent_1px),linear-gradient(rgba(8,217,214,0.34)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto grid min-h-[86px] max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[300px_1fr_auto] lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logotipo mini maker labs blanco.png"
            alt="Mini Maker Labs"
            width={232}
            height={100}
            priority
            className="h-[64px] w-auto object-contain drop-shadow-[0_2px_0_rgba(7,16,20,0.35)]"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-9 text-[13px] font-black uppercase tracking-[0.08em] text-[#071014] md:flex">
          <a className="maker-nav-link" href="#proyectos">
            Proyectos
          </a>
          <a className="maker-nav-link" href="#kits">
            Kits
          </a>
          <button className="maker-nav-link uppercase" onClick={handleSchools}>
            Escuelas
          </button>
        </nav>

        <div className="hidden items-center justify-end gap-4 md:flex">
          <button
            className="text-[13px] font-black uppercase tracking-[0.06em] text-[#071014] transition hover:text-[#00838f]"
            onClick={handleLogin}
          >
            Iniciar sesión
          </button>
          <Link href="/register" className="maker-header-button">
            Empezar
          </Link>
        </div>

        <button
          className="flex h-12 w-12 items-center justify-center justify-self-end rounded-xl border-2 border-b-4 border-[#071014] bg-white md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Abrir menú"
          aria-expanded={mobileMenuOpen}
        >
          <span className="grid gap-1.5">
            <span className="h-0.5 w-6 bg-[#071014]" />
            <span className="h-0.5 w-6 bg-[#071014]" />
            <span className="h-0.5 w-6 bg-[#071014]" />
          </span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="relative border-t-2 border-[#071014] bg-[#fffdf6] px-4 py-4 shadow-[0_8px_0_rgba(7,16,20,0.12)] md:hidden">
          <nav className="mx-auto grid max-w-sm gap-3 text-sm font-black uppercase text-[#071014]">
            <a
              href="#proyectos"
              className="rounded-xl border-2 border-[#071014] bg-white px-4 py-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Proyectos
            </a>
            <a
              href="#kits"
              className="rounded-xl border-2 border-[#071014] bg-white px-4 py-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kits
            </a>
            <button
              className="rounded-xl border-2 border-[#071014] bg-white px-4 py-3 text-left uppercase"
              onClick={handleSchools}
            >
              Escuelas
            </button>
            <button
              className="rounded-xl border-2 border-[#071014] bg-white px-4 py-3 text-left uppercase"
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>
            <Link
              href="/register"
              className="rounded-xl border-2 border-b-4 border-[#071014] bg-[#08d9d6] px-4 py-3 text-center text-[#071014]"
            >
              Empezar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
