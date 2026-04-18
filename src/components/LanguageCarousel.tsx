import Link from "next/link";
import { ChevronLeftSvg, ChevronRightSvg } from "./Svgs";
import React, { useRef } from "react";

/**
 * Lista de tecnologías a mostrar en el carousel
 * Cada una apunta a un ícono dentro de /public/icons
 */
const techs = [
  { name: "JavaScript", icon: "/icons/javascript.svg" },
  { name: "Python", icon: "/icons/python.svg" },
  { name: "Arduino", icon: "/icons/arduino2.svg" },
  { name: "Micro:bit", icon: "/icons/microbit.svg" },
  { name: "Electrónica", icon: "/icons/board.svg" },
  { name: "Raspberry pi", icon: "/icons/raspberry.svg" },
];

export const LanguageCarousel = () => {
  /**
   * Referencia al contenedor del carousel
   * Se usa para hacer scroll horizontal programado
   */
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Función para mover el scroll del carousel
   * @param direction "left" | "right"
   */
  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = 200;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <article className="absolute bottom-0 left-0 right-0 hidden h-20 items-center justify-center bg-[#0a4a82] text-white md:flex">
      
      <div className="flex w-full max-w-5xl items-center justify-between">

        {/* BOTÓN IZQUIERDO */}
        <button
          className="opacity-50 hover:opacity-100 transition"
          onClick={() => scroll("left")}
        >
          <ChevronLeftSvg />
        </button>

        {/* LISTA DE TECNOLOGÍAS */}
        <div
          ref={containerRef}
          className="flex items-center gap-8 overflow-x-auto scrollbar-hide"
        >
          {techs.map((tech) => (
            <Link
              key={tech.name}
              href="/learn"
              className="flex items-center gap-2 whitespace-nowrap hover:scale-105 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tech.icon}
                alt={tech.name}
                className="w-8 h-8 object-contain"
              />

              <span className="text-sm font-bold uppercase">
                {tech.name}
              </span>
            </Link>
          ))}
        </div>

        {/* BOTÓN DERECHO */}
        <button
          className="opacity-50 hover:opacity-100 transition"
          onClick={() => scroll("right")}
        >
          <ChevronRightSvg />
        </button>

      </div>
    </article>
  );
};