import type { NextPage } from "next";
import Link from "next/link";
import { LanguageHeader } from "~/components/LanguageHeader";
import _bgSnow from "../../public/bg-snow.svg";
import type { StaticImageData } from "next/image";

const bgSnow = _bgSnow as StaticImageData;

const courses = [
  { 
    name: "Starter", 
    desc: "Descubre cómo funciona la tecnología y empieza a crear",
    icon: "/icons/mic.png" 
  },
  { 
    name: "Maker", 
    desc: "Construye proyectos reales con código y hardware",
    icon: "/icons/ardui.png" 
  },
  { 
    name: "Builder", 
    desc: "Diseña sistemas y automatiza el mundo real",
    icon: "/icons/raspb.png" 
  },
  { 
    name: "Pro", 
    desc: "Crea soluciones completas como un ingeniero",
    icon: "/icons/microbit.svg" 
  },
  
];

const Register: NextPage = () => {
  return (
    <main
      className="flex min-h-screen flex-col items-center bg-[#235390] text-white"
      style={{ backgroundImage: `url(${bgSnow.src})` }}
    >
      <LanguageHeader />

      <div className="container flex grow flex-col items-center justify-center gap-20 px-4 py-16">
        
        <h1 className="mt-20 text-center text-3xl font-extrabold tracking-tight text-white">
          ¿Qué quieres aprender?
        </h1>

        <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-x-2 gap-y-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          
          {courses.map((course) => (
            <Link
              key={course.name}
              href="/learn"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-gray-400 px-5 py-8 text-xl font-bold hover:bg-gray-300 hover:bg-opacity-20 transition"
            >
              <img
                src={course.icon}
                alt={course.name}
                className="w-17 h-17 object-contain"
              />

              <span>{course.name}</span>

              <p className="text-xs text-center opacity-80 max-w-[160px]">
                {course.desc}
              </p>
            </Link>
          ))}

        </section>
      </div>
    </main>
  );
};

export default Register;