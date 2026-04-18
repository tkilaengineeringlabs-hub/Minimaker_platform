import Link from "next/link";
import { LanguageDropDown } from "./LanguageDropDown";

export const LanguageHeader = () => {
  return (
    <header className="fixed left-0 right-0 top-0 mx-auto flex min-h-[70px] max-w-5xl items-center justify-between bg-[#235390] px-10 font-bold text-white">
      
      <Link href="/">
        <img
          src="/logotipo mini maker labs blanco.png"
          alt="logo"
          className="h-16 cursor-pointer"
        />
      </Link>

      {/* 🔥 Dropdown */}
      <div className="text-sm">
        <span className="mr-2"></span>
        <LanguageDropDown />
      </div>

    </header>
  );
};