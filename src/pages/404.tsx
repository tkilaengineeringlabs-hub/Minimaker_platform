import type { NextPage } from "next";
import Link from "next/link";
import { LanguageHeader } from "~/components/LanguageHeader";

const NotFoundPage: NextPage = () => {
  return (
    <main className="min-h-screen bg-cyan-50">
      <LanguageHeader />
      <section className="mx-auto flex min-h-[calc(100vh-70px)] max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-6xl shadow-sm">
          🧰
        </div>
        <h1 className="text-4xl font-black text-gray-800">
          ¡Ups! Esta página no existe.
        </h1>
        <p className="mt-3 text-lg font-bold text-gray-500">
          Parece que esta ruta todavía no está lista para construir.
        </p>
        <Link
          className="mt-7 rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-6 py-3 font-black uppercase text-white transition hover:brightness-105"
          href="/learn"
        >
          Volver a aprender
        </Link>
      </section>
    </main>
  );
};

export default NotFoundPage;
