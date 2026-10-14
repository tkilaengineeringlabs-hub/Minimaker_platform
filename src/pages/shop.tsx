import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";
import { kits, type KitData } from "~/utils/kits";

const Shop: NextPage = () => {
  const [selectedKit, setSelectedKit] = useState<KitData | null>(null);
  const [purchaseNoticeShown, setPurchaseNoticeShown] = useState(false);

  const closeModal = () => {
    setSelectedKit(null);
    setPurchaseNoticeShown(false);
  };

  return (
    <div>
      <TopBar backgroundColor="bg-[#00acc1]" borderColor="border-[#00838f]" />
      <LeftBar selectedTab="TIENDA" />

      <div className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12">
        <main className="flex max-w-4xl grow flex-col px-4 pb-28 sm:px-0">
          <header className="border-b-2 border-gray-200 py-7">
            <h1 className="text-3xl font-bold text-gray-800">
              Mini Maker Shop
            </h1>
            <p className="mt-2 text-lg font-medium text-gray-500">
              Elige tu próximo proyecto y sigue construyendo.
            </p>
          </header>

          <section className="grid gap-5 py-6 md:grid-cols-2">
            {kits.map((kit) => (
              <ProductCard
                key={kit.id}
                kit={kit}
                onViewKit={() => setSelectedKit(kit)}
              />
            ))}
          </section>
        </main>

        <RightBar />
      </div>

      <BottomBar selectedTab="TIENDA" />
      <ProductModal
        kit={selectedKit}
        purchaseNoticeShown={purchaseNoticeShown}
        onClose={closeModal}
        onBuy={() => setPurchaseNoticeShown(true)}
        onAcknowledge={() => setPurchaseNoticeShown(false)}
      />
    </div>
  );
};

export default Shop;

const ProductCard = ({
  kit,
  onViewKit,
}: {
  kit: KitData;
  onViewKit: () => void;
}) => {
  return (
    <article className="flex flex-col gap-5 rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-5xl">
          {kit.emoji}
        </div>
        {kit.label && (
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-right text-xs font-bold uppercase text-[#00838f]">
            {kit.label}
          </span>
        )}
      </div>

      <div className="flex grow flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-800">{kit.name}</h2>
        <p className="font-medium text-gray-500">{kit.shopDescription}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <ProductMeta label="Edad" value={kit.age} />
        <ProductMeta label="Nivel" value={kit.difficulty} />
      </div>

      <div className="flex items-center justify-between gap-4 border-t-2 border-gray-100 pt-4">
        <div className="text-2xl font-bold text-gray-800">{kit.price}</div>
        <button
          className="rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-5 py-3 font-bold uppercase text-white transition hover:brightness-105"
          onClick={onViewKit}
        >
          Ver kit
        </button>
      </div>
    </article>
  );
};

const ProductMeta = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border-2 border-gray-200 px-3 py-2">
      <div className="text-xs font-bold uppercase text-gray-400">{label}</div>
      <div className="font-bold text-gray-700">{value}</div>
    </div>
  );
};

const ProductModal = ({
  kit,
  purchaseNoticeShown,
  onClose,
  onBuy,
  onAcknowledge,
}: {
  kit: KitData | null;
  purchaseNoticeShown: boolean;
  onClose: () => void;
  onBuy: () => void;
  onAcknowledge: () => void;
}) => {
  const isShown = kit !== null;

  return (
    <div
      className={[
        "fixed inset-0 z-40 flex items-end justify-center p-4 transition sm:items-center",
        isShown ? "" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!isShown}
    >
      <button
        className={[
          "absolute inset-0 bg-black transition",
          isShown ? "opacity-50" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-label="Cerrar detalle del kit"
      ></button>

      {kit && (
        <section className="relative flex max-h-[90vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-5xl">
                {kit.emoji}
              </div>
              <div>
                {kit.label && (
                  <span className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase text-[#00838f]">
                    {kit.label}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-gray-800">{kit.name}</h2>
                <p className="mt-2 font-medium text-gray-500">
                  {kit.shopDescription}
                </p>
              </div>
            </div>
            <button
              className="rounded-full px-2 text-2xl font-bold text-gray-400 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <ProductMeta label="Edad" value={kit.age} />
            <ProductMeta label="Nivel" value={kit.difficulty} />
            <ProductMeta label="Precio" value={kit.price} />
          </div>

          <section className="grid gap-5 sm:grid-cols-2">
            <DetailList title="Incluye" items={kit.features} />
            <DetailList title="Qué aprenderá" items={kit.childWillLearn} />
          </section>

          {purchaseNoticeShown && (
            <div className="rounded-xl bg-cyan-50 p-4 font-bold text-[#00838f]">
              Las compras en línea estarán disponibles próximamente.
              <button
                className="mt-3 block rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-4 py-2 text-white transition hover:brightness-105"
                onClick={onAcknowledge}
              >
                Entendido
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t-2 border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Link
              className="flex items-center justify-center rounded-2xl border-2 border-b-4 border-gray-300 bg-white px-4 py-3 font-bold uppercase text-gray-500 transition hover:bg-gray-50"
              href="/kits"
            >
              Ya tengo este kit
            </Link>
            <button
              className="rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-4 py-3 font-bold uppercase text-white transition hover:brightness-105"
              onClick={onBuy}
            >
              Comprar kit
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

const DetailList = ({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) => {
  return (
    <div className="rounded-2xl border-2 border-gray-200 p-4">
      <h3 className="font-bold uppercase text-gray-400">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 font-medium text-gray-600">
            <span className="font-bold text-[#00acc1]">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
