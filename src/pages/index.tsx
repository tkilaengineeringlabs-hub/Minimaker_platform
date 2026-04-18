import { type NextPage } from "next";
import Link from "next/link";
import React from "react";
import { LanguageHeader } from "~/components/LanguageHeader";
import { useLoginScreen, LoginScreen } from "~/components/LoginScreen";
import _bgSnow from "../../public/bg-snow.svg";
import type { StaticImageData } from "next/image";
import { LanguageCarousel } from "~/components/LanguageCarousel";

const bgSnow = _bgSnow as StaticImageData;

const Home: NextPage = () => {
  const { loginScreenState, setLoginScreenState } = useLoginScreen();

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-[#235390] text-white"
      style={{ backgroundImage: `url(${bgSnow.src})` }}
    >
      <LanguageHeader />

      <div className="flex w-full flex-col items-center justify-center gap-3 px-4 py-16 md:flex-row md:gap-36">
        
        {/* IMAGEN */}
        <img
          src="/robot.svg"
          alt="robot"
          className="h-fit w-7/12 md:w-[360px]"
        />

        {/* CONTENIDO */}
        <div>
          <p className="mb-6 max-w-[600px] text-center text-3xl font-bold md:mb-12">
            Programa. Construye. Automatiza.
            <br />
            Aprende robótica y programación de verdad
          </p>

          <div className="mx-auto mt-4 flex w-fit flex-col items-center gap-3">
            
            <Link
              href="/register"
              className="w-full rounded-2xl border-b-4 border-green-700 bg-green-600 px-10 py-3 text-center font-bold uppercase transition hover:border-green-600 hover:bg-green-500 md:min-w-[320px]"
            >
              Comenzar
            </Link>

            <button
              className="w-full rounded-2xl border-2 border-b-4 border-[#042c60] bg-[#235390] px-8 py-3 font-bold uppercase transition hover:bg-[#204b82] md:min-w-[320px]"
              onClick={() => setLoginScreenState("LOGIN")}
            >
              Entrar a mi cuenta
            </button>

          </div>
        </div>
      </div>

      <LanguageCarousel />

      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />
    </main>
  );
};

export default Home;