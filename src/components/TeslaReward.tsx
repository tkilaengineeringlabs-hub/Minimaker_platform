import { useEffect, useState } from "react";

export const TeslaCoilIcon = ({
  size = 34,
  muted = false,
}: {
  size?: number;
  muted?: boolean;
}) => {
  const primary = muted ? "#CBD5E1" : "#00ACC1";
  const dark = muted ? "#94A3B8" : "#1E293B";
  const spark = muted ? "#E2E8F0" : "#FACC15";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect x="17" y="20" width="14" height="18" rx="3" fill={primary} />
      <path
        d="M16 24h16M16 29h16M16 34h16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="13" y="38" width="22" height="5" rx="2.5" fill={dark} />
      <path
        d="M24 20V9"
        stroke={dark}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="8" r="4" fill={primary} />
      <path
        d="M28 5c5 0 8 3 8 7M20 5c-5 0-8 3-8 7"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M25 2l-5 11h5l-3 9 8-12h-5l4-8h-4z"
        fill={spark}
      />
    </svg>
  );
};

export const TeslasModal = ({
  isShown,
  teslas,
  onClose,
}: {
  isShown: boolean;
  teslas: number;
  onClose: () => void;
}) => {
  const [rewardNoticeShown, setRewardNoticeShown] = useState(false);

  useEffect(() => {
    if (!isShown) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isShown, onClose]);

  useEffect(() => {
    if (!isShown) setRewardNoticeShown(false);
  }, [isShown]);

  if (!isShown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <section className="relative mx-4 flex max-h-[calc(100vh-32px)] w-[calc(100%-32px)] max-w-md flex-col overflow-y-auto rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 text-gray-800 shadow-xl">
        <button
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-2xl font-black text-gray-400 transition hover:bg-gray-100"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="flex flex-col items-center gap-3 pr-8 text-center">
          <TeslaCoilIcon size={70} />
          <h2 className="text-2xl font-black">⚡ Teslas</h2>
          <p className="text-lg font-black text-[#00838f]">
            Tienes {teslas} Teslas
          </p>
          <p className="text-sm font-bold leading-5 text-gray-500">
            Gana Teslas completando retos y proyectos Maker.
          </p>
        </div>

        <section className="mt-5 rounded-2xl bg-cyan-50 p-4">
          <h3 className="font-black text-gray-800">¿Cómo consigo Teslas?</h3>
          <ul className="mt-3 grid gap-2 text-sm font-bold text-gray-600">
            <li>🏆 Completa retos</li>
            <li>🔧 Termina proyectos</li>
            <li>🤖 Construye con tus kits</li>
            <li>🔥 Participa en desafíos Maker</li>
          </ul>
        </section>

        <p className="mt-4 text-sm font-bold leading-5 text-gray-500">
          Usa tus Teslas para desbloquear recompensas dentro de Mini Maker.
        </p>
        <p className="mt-2 text-xs font-bold leading-5 text-gray-400">
          Más adelante podrás usarlos para accesorios de avatar, skins de robot,
          elementos cosméticos, retos especiales y contenido bonus.
        </p>

        {rewardNoticeShown && (
          <p className="mt-4 rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-700">
            Las recompensas Maker estarán disponibles próximamente.
          </p>
        )}

        <button
          className="mt-5 rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-5 py-3 font-black uppercase text-white transition hover:brightness-105"
          onClick={() => setRewardNoticeShown(true)}
        >
          Ver recompensas
        </button>
      </section>
    </div>
  );
};
