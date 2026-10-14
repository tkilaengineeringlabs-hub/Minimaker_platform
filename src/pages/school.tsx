import type { NextPage } from "next";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createClassroom,
  getProfileFromRelation,
  getSchoolOverview,
  type SchoolOverview,
} from "~/services/classroomService";
import type { Profile } from "~/types/supabase";
import { useBoundStore } from "~/hooks/useBoundStore";

const demoSchool = {
  name: "Mini Maker Academy",
  code: "MMA-001",
  teachers: 1,
  students: 8,
  classrooms: [
    {
      id: "demo-mini-makers-a",
      name: "Mini Makers A",
      teacherName: "Profesor Demo",
      classCode: "MMA-A01",
      students: 8,
    },
  ],
};

const School: NextPage = () => {
  const supabaseUserId = useBoundStore((x) => x.supabaseUserId);
  const role = useBoundStore((x) => x.role);
  const [overview, setOverview] = useState<SchoolOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadOverview = useCallback(async () => {
    if (supabaseUserId === null || role !== "school_admin") {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await getSchoolOverview(supabaseUserId);
    setOverview(data);
    setError(data === null ? "No encontramos datos reales de escuela." : "");
    setLoading(false);
  }, [role, supabaseUserId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const teachers = useMemo(
    () =>
      overview?.members
        .filter((member) => member.role === "teacher")
        .map((member) => getProfileFromRelation(member.profiles))
        .filter((profile): profile is Profile => profile !== null) ?? [],
    [overview],
  );

  const summary = overview
    ? {
        name: overview.school.name,
        code: overview.school.code,
        teachers: overview.members.filter((member) => member.role === "teacher")
          .length,
        students: overview.members.filter((member) => member.role === "student")
          .length,
        classrooms: overview.classrooms.map((classroom) => {
          const teacher = getProfileFromRelation(classroom.profiles);

          return {
            id: classroom.id,
            name: classroom.name,
            teacherName: teacher?.display_name ?? "Profesor sin asignar",
            classCode: classroom.class_code,
            students: classroom.classroom_students?.length ?? 0,
          };
        }),
      }
    : demoSchool;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b-2 border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#00acc1]">
              {overview ? "Datos reales" : "Modo demo"}
            </p>
            <h1 className="mt-1 text-3xl font-black text-gray-800">
              Panel de Escuela
            </h1>
            <p className="mt-1 font-bold text-gray-500">
              {summary.name} · {summary.code}
            </p>
          </div>
          <Link
            href="/profile"
            className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white px-5 py-3 text-center font-black uppercase text-gray-500 transition hover:bg-gray-50"
          >
            Volver al perfil
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        {loading && (
          <div className="rounded-2xl bg-white p-5 font-bold text-gray-500">
            Cargando...
          </div>
        )}
        {error !== "" && (
          <div className="rounded-2xl bg-yellow-50 p-5 font-bold text-yellow-700">
            {error} Mostrando datos demo.
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SchoolStat emoji="🏫" label="Escuela" value={summary.name} />
          <SchoolStat
            emoji="👩‍🏫"
            label="Profesores"
            value={`${summary.teachers}`}
          />
          <SchoolStat emoji="👨‍🎓" label="Alumnos" value={`${summary.students}`} />
          <SchoolStat
            emoji="🧪"
            label="Grupos"
            value={`${summary.classrooms.length}`}
          />
        </section>

        <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-800">Grupos</h2>
              <p className="font-bold text-gray-500">
                Códigos temporales para organizar clases Maker.
              </p>
            </div>
            <button
              className="rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-5 py-3 font-black uppercase text-white transition hover:brightness-105 disabled:opacity-60"
              onClick={() => setCreateModalOpen(true)}
            >
              Crear grupo
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {summary.classrooms.map((classroom) => (
              <article
                key={classroom.id}
                className="rounded-2xl border-2 border-gray-200 bg-slate-50 p-5"
              >
                <h3 className="text-xl font-black text-gray-800">
                  {classroom.name}
                </h3>
                <div className="mt-3 grid gap-2 font-bold text-gray-600">
                  <p>{classroom.students} alumnos</p>
                  <p>{classroom.teacherName}</p>
                  <p className="text-[#00838f]">Código {classroom.classCode}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {createModalOpen && (
        <CreateClassroomModal
          overview={overview}
          teachers={teachers}
          onClose={() => setCreateModalOpen(false)}
          onCreated={() => {
            setCreateModalOpen(false);
            void loadOverview();
          }}
        />
      )}
    </div>
  );
};

export default School;

const SchoolStat = ({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) => (
  <article className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 shadow-sm">
    <div className="text-3xl">{emoji}</div>
    <div className="mt-3 truncate text-2xl font-black text-gray-800">
      {value}
    </div>
    <div className="text-sm font-bold text-gray-500">{label}</div>
  </article>
);

const CreateClassroomModal = ({
  overview,
  teachers,
  onClose,
  onCreated,
}: {
  overview: SchoolOverview | null;
  teachers: Profile[];
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [name, setName] = useState("Mini Makers B");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [classCode, setClassCode] = useState("MMA-B01");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (overview === null) {
      setMessage("Conecta Supabase y entra como school_admin para guardar.");
      return;
    }

    setLoading(true);
    const result = await createClassroom({
      schoolId: overview.school.id,
      name,
      teacherId,
      classCode,
    });
    setLoading(false);

    if (result.ok) {
      onCreated();
      return;
    }

    setMessage(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 sm:items-center sm:justify-center">
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <section className="relative w-full max-w-lg rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-800">Crear grupo</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 font-bold text-gray-700">
            Nombre del grupo
            <input
              className="rounded-2xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-[#00acc1]"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="grid gap-2 font-bold text-gray-700">
            Profesor
            <select
              className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#00acc1]"
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
            >
              {teachers.length === 0 ? (
                <option value="">Profesor Demo</option>
              ) : (
                teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.display_name}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="grid gap-2 font-bold text-gray-700">
            Código
            <input
              className="rounded-2xl border-2 border-gray-200 px-4 py-3 uppercase outline-none focus:border-[#00acc1]"
              value={classCode}
              onChange={(event) => setClassCode(event.target.value.toUpperCase())}
            />
          </label>
        </div>

        {message !== "" && (
          <p className="mt-4 rounded-2xl bg-yellow-50 px-4 py-3 font-bold text-yellow-700">
            {message}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl px-4 py-3 font-black uppercase text-gray-400 transition hover:bg-gray-100"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-4 py-3 font-black uppercase text-white transition hover:brightness-105 disabled:opacity-60"
            onClick={() => void submit()}
            disabled={loading || name.trim() === "" || classCode.trim() === ""}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </section>
    </div>
  );
};
