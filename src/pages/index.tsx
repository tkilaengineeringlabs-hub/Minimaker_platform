import { type NextPage } from "next";
import Link from "next/link";
import React, { useState } from "react";
import { LanguageHeader } from "~/components/LanguageHeader";
import { MakerWorkbench } from "~/components/MakerWorkbench";
import { BrandLogo } from "~/components/BrandLogo";
import { LoginScreen, useLoginScreen } from "~/components/LoginScreen";

type ModalState = "HIDDEN" | "SCHOOLS";
type ProjectType = "rover" | "game" | "invent" | "circuit";

const displayFont =
  "'Jersey 10', 'Courier New', monospace";
const uiFont =
  "Arial, Helvetica, system-ui, sans-serif";

const projectCards: Array<{
  type: ProjectType;
  title: string;
  description: string;
}> = [
  {
    type: "rover",
    title: "ROBOT",
    description: "Haz que cobre vida.",
  },
  {
    type: "game",
    title: "VIDEOJUEGO",
    description: "Crea tu propio mundo.",
  },
  {
    type: "invent",
    title: "INVENTO",
    description: "Convierte una idea en realidad.",
  },
  {
    type: "circuit",
    title: "CIRCUITO",
    description: "Enciende, conecta y experimenta.",
  },
];

const tools = ["Micro:bit", "Arduino", "Python", "Raspberry Pi"];

const Home: NextPage = () => {
  const { loginScreenState, setLoginScreenState } = useLoginScreen();
  const [modal, setModal] = useState<ModalState>("HIDDEN");

  const openLogin = () => setLoginScreenState("LOGIN");
  const openSchoolsModal = () => setModal("SCHOOLS");

  return (
    <main
      className="maker-landing min-h-screen overflow-x-hidden bg-[#f7faf8] text-[#071014]"
      style={{ fontFamily: uiFont }}
    >
      <LanguageHeader
        openLogin={openLogin}
        openSchoolsModal={openSchoolsModal}
      />

      <section className="maker-workbench relative isolate overflow-hidden px-4 pb-14 pt-[118px] sm:px-6 lg:px-8">
        <WorkbenchDetails />

        <div className="relative mx-auto grid min-h-[calc(100vh-118px)] max-w-7xl items-center gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative z-10 max-w-[600px] pb-4 lg:-translate-y-5">
            <h1 className="maker-hero-title text-[clamp(3.5rem,8.5vw,7.5rem)] font-normal uppercase leading-[0.92] tracking-normal text-[#071014]">
              <span className="block">Construye</span>
              <span className="ml-5 block text-[0.68em] text-[#113240] sm:ml-12">
                algo
              </span>
              <span
                className="mt-3 inline-block border-4 border-[#071014] bg-[#071014] px-4 pb-3 pt-4 text-[0.34em] leading-tight text-white shadow-[8px_8px_0_#08d9d6] sm:px-5"
                style={{ fontFamily: displayFont }}
              >
                increíble.
              </span>
            </h1>

            <p className="mt-8 text-[clamp(1.25rem,2.3vw,2rem)] font-black leading-tight text-[#00838f]">
              Robots. Videojuegos. Electrónica. Código.
            </p>
            <p className="mt-4 max-w-xl text-lg font-bold leading-8 text-[#33444c]">
              Aprende tecnología construyendo proyectos que realmente funcionan.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/register" className="maker-primary-button">
                Empezar a construir
              </Link>
              <a href="#proyectos" className="maker-secondary-button">
                Ver proyectos
              </a>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:min-h-[560px]">
            <MakerWorkbench />
          </div>
        </div>
      </section>

      <section
        id="proyectos"
        className="relative border-y-2 border-[#071014] bg-[#fffdf6] px-4 py-9 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            className="text-[clamp(1rem,2vw,1.55rem)] font-black uppercase tracking-[0.08em]"
            style={{ fontFamily: displayFont }}
          >
            Elige qué quieres construir
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {projectCards.map((card) => (
              <ProjectBuildCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section id="kits" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          <OpenKitBox />
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.18em] text-[#00838f]"
              style={{ fontFamily: displayFont }}
            >
              Kits Mini Maker
            </p>
            <h2 className="mt-4 text-[clamp(2.6rem,5vw,5.2rem)] font-black uppercase leading-[0.9]">
              Abre. Construye. Aprende.
            </h2>
            <p className="mt-5 max-w-xl text-xl font-bold leading-8 text-[#33444c]">
              Cada Kit Mini Maker combina piezas reales con aventuras
              interactivas dentro de la plataforma.
            </p>
            <Link href="/register" className="maker-primary-button mt-8">
              Descubrir los kits
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-[#071014] bg-[#e8fffd] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2
            className="max-w-3xl text-[clamp(1.35rem,2.8vw,2.6rem)] font-black uppercase leading-tight"
            style={{ fontFamily: displayFont }}
          >
            Herramientas que aprenderás a dominar
          </h2>
          <div className="mt-7 flex flex-wrap gap-4">
            {tools.map((tool) => (
              <span
                key={tool}
                className="border-2 border-b-[6px] border-[#071014] bg-white px-5 py-4 text-sm font-black uppercase shadow-[0_0_0_0_#071014]"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-[#071014] bg-[#e8fffd] px-4 py-7 text-[#071014] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-black uppercase sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo className="w-[152px] sm:w-[176px]" />
          <span>Construir. Inventar. Probar. Volver a intentar.</span>
        </div>
      </footer>

      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />

      {modal === "SCHOOLS" && (
        <ComingSoonModal
          title="Mini Maker para escuelas"
          description="Muy pronto podrás conocer las opciones para escuelas, grupos y salones Maker."
          onClose={() => setModal("HIDDEN")}
        />
      )}
    </main>
  );
};

export default Home;

const ProjectBuildCard = ({
  type,
  title,
  description,
}: {
  type: ProjectType;
  title: string;
  description: string;
}) => (
  <article className="group grid min-h-[205px] grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-2xl border-2 border-b-[7px] border-[#071014] bg-white transition duration-150 hover:-translate-y-1 active:translate-y-[3px] active:border-b-2">
    <div className="flex flex-col justify-between p-5">
      <h3
        className="text-sm font-black uppercase tracking-[0.12em] text-[#00838f]"
        style={{ fontFamily: displayFont }}
      >
        {title}
      </h3>
      <p className="mt-4 text-2xl font-black leading-tight text-[#071014]">
        {description}
      </p>
    </div>
    <div className="relative border-l-2 border-[#071014] bg-[#f7faf8]">
      <ProjectMiniScene type={type} />
    </div>
  </article>
);

const ProjectMiniScene = ({ type }: { type: ProjectType }) => {
  if (type === "game") {
    return (
      <>
        <div className="absolute left-5 top-7 h-20 w-24 border-4 border-[#071014] bg-[#071014] p-2 shadow-[5px_5px_0_#08d9d6]">
          <div className="h-full w-full bg-[#ffe45c]">
            <span className="absolute left-10 top-14 h-5 w-5 bg-[#ff9f1c]" />
            <span className="absolute bottom-6 left-9 h-3 w-14 bg-[#08d9d6]" />
          </div>
        </div>
        <div className="absolute bottom-8 right-5 h-11 w-24 rounded-2xl border-4 border-[#071014] bg-white">
          <span className="absolute left-4 top-4 h-1 w-7 bg-[#071014]" />
          <span className="absolute left-7 top-[9px] h-7 w-1 bg-[#071014]" />
          <span className="absolute right-6 top-4 h-3 w-3 rounded-full bg-[#08d9d6]" />
        </div>
      </>
    );
  }

  if (type === "invent") {
    return (
      <>
        <div className="absolute left-6 top-8 h-16 w-16 rounded-full border-[6px] border-[#071014] bg-[#ffe45c] shadow-[5px_5px_0_#071014]" />
        <div className="absolute right-7 top-16 h-12 w-12 rounded-full border-[5px] border-[#071014] bg-[#08d9d6]" />
        <div className="absolute bottom-9 left-12 h-14 w-28 rounded-xl border-4 border-[#071014] bg-[#d7d1c2]" />
        <div className="absolute bottom-16 left-20 h-20 w-24 rotate-[-16deg] rounded-t-full border-4 border-b-0 border-[#ff9f1c]" />
      </>
    );
  }

  if (type === "circuit") {
    return (
      <>
        <div className="absolute left-5 top-8 grid h-28 w-32 grid-cols-5 gap-1 rounded-xl border-4 border-[#071014] bg-white p-3 shadow-[5px_5px_0_#071014]">
          {Array.from({ length: 20 }).map((_, index) => (
            <span key={index} className="rounded-full bg-[#071014]" />
          ))}
        </div>
        <div className="absolute bottom-10 right-6 h-10 w-10 rounded-full border-4 border-[#071014] bg-[#fbff75] shadow-[0_0_0_7px_rgba(255,228,92,0.45)]" />
        <div className="absolute bottom-14 left-16 h-16 w-28 rounded-t-full border-4 border-b-0 border-[#08d9d6]" />
      </>
    );
  }

  return (
    <>
      <div className="absolute left-7 top-14 h-20 w-28 rounded-2xl border-4 border-[#071014] bg-[#08d9d6] shadow-[6px_6px_0_#071014]" />
      <div className="absolute left-10 top-9 flex gap-2 rounded-xl border-4 border-[#071014] bg-white px-3 py-2">
        <span className="h-4 w-4 rounded-full border-2 border-[#071014] bg-[#08d9d6]" />
        <span className="h-4 w-4 rounded-full border-2 border-[#071014] bg-[#08d9d6]" />
      </div>
      <div className="absolute bottom-9 left-3 h-12 w-12 rounded-full border-4 border-[#071014] bg-[#262626]" />
      <div className="absolute bottom-9 right-5 h-12 w-12 rounded-full border-4 border-[#071014] bg-[#262626]" />
    </>
  );
};

const OpenKitBox = () => (
  <div className="relative min-h-[390px]">
    <div
      className="absolute left-[6%] top-6 flex h-32 w-[62%] rotate-[-7deg] flex-col justify-center rounded-2xl border-[5px] border-[#071014] bg-[#08d9d6] pl-8 text-sm font-black uppercase leading-7 shadow-[10px_11px_0_#071014]"
      style={{ fontFamily: displayFont }}
    >
      <span>Mini</span>
      <span>Maker</span>
    </div>
    <div className="absolute bottom-4 left-0 right-0 h-64 rounded-[28px] border-[5px] border-[#071014] bg-white shadow-[12px_13px_0_#071014]">
      <div
        className="absolute left-7 top-9 h-32 w-24 rotate-[5deg] border-4 border-[#071014] bg-[#fff6d6] p-4 text-[11px] font-black uppercase leading-5"
        style={{ fontFamily: displayFont }}
      >
        01
        <br />
        Guía
      </div>
      <div className="absolute left-40 top-9 h-24 w-32 rounded-xl border-4 border-[#071014] bg-[#145847]">
        <span className="absolute left-5 top-5 h-4 w-4 rounded-full bg-[#ffe45c]" />
        <span className="absolute bottom-5 right-5 h-4 w-4 rounded-full bg-[#ffe45c]" />
        <span className="absolute left-12 top-8 h-9 w-12 border-2 border-white bg-[#071014]" />
      </div>
      <div className="absolute bottom-9 left-44 h-14 w-14 rounded-full border-4 border-[#071014] bg-[#262626]" />
      <div className="absolute bottom-9 left-64 h-14 w-14 rounded-full border-4 border-[#071014] bg-[#262626]" />
      <div className="absolute right-12 top-10 h-20 w-32 rotate-[13deg] rounded-t-full border-4 border-b-0 border-[#ff9f1c]" />
      <div className="absolute bottom-8 right-8 grid h-24 w-32 place-items-center rounded-2xl border-4 border-[#071014] bg-[#e8fffd]">
        <ProjectMiniScene type="rover" />
      </div>
    </div>
  </div>
);

const WorkbenchDetails = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 opacity-[0.42] [background-image:linear-gradient(rgba(7,16,20,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(7,16,20,0.055)_1px,transparent_1px)] [background-size:28px_28px]" />
    <div className="absolute left-8 top-40 h-5 w-5 rotate-12 rounded-full border-[3px] border-[#071014]/30" />
    <div className="absolute right-[8%] top-40 h-8 w-20 rotate-[-18deg] rounded-full border-[3px] border-[#ff9f1c]/55 border-b-0" />
    <div className="absolute bottom-28 left-[7%] h-8 w-28 rotate-6 border-2 border-[#071014]/20" />
    <div className="absolute right-[4%] top-[52%] h-16 w-16 rounded-full border-[10px] border-[#071014]/10" />
    <div className="absolute left-[37%] top-32 h-3 w-28 bg-[#08d9d6]/25" />
    <div
      className="absolute bottom-20 right-[18%] text-xs font-black text-[#00838f]/45"
      style={{ fontFamily: displayFont }}
    >
      010101
    </div>
  </div>
);

const ComingSoonModal = ({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071014]/50 p-4">
    <section className="w-full max-w-sm rounded-2xl border-2 border-b-[7px] border-[#071014] bg-white p-6 text-center shadow-none">
      <h2 className="text-2xl font-black text-[#071014]">{title}</h2>
      <p className="mt-3 font-bold leading-7 text-[#33444c]">{description}</p>
      <button className="maker-primary-button mt-5 w-full" onClick={onClose}>
        Entendido
      </button>
    </section>
  </div>
);
