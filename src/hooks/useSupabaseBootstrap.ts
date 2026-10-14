import { useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { getMyUnlockedKitIds } from "~/services/kitService";
import { getProfile } from "~/services/profileService";
import { getMyLearningProgress } from "~/services/progressService";
import { useBoundStore } from "~/hooks/useBoundStore";
import type { UserRole } from "~/types/supabase";
import type { LearningPathId } from "~/utils/learningPaths";
import { writeUnlockedKitIds } from "~/utils/kits";

export const useSupabaseBootstrap = () => {
  const logIn = useBoundStore((x) => x.logIn);
  const logOut = useBoundStore((x) => x.logOut);
  const setName = useBoundStore((x) => x.setName);
  const setUsername = useBoundStore((x) => x.setUsername);
  const setSupabaseUser = useBoundStore((x) => x.setSupabaseUser);
  const setProgressByPath = useBoundStore((x) => x.setProgressByPath);
  const setTotalXp = useBoundStore((x) => x.setTotalXp);

  useEffect(() => {
    if (supabase === null) return;

    const hydrateSession = async (userId: string, email: string) => {
      const [profile, progress, unlockedKitIds] = await Promise.all([
        getProfile(userId),
        getMyLearningProgress(),
        getMyUnlockedKitIds(),
      ]);
      const role = profile?.role ?? "student";
      const displayName =
        profile?.display_name ?? email.split("@")[0] ?? "Maker";
      const progressByPath = progress.reduce(
        (result, row) => ({
          ...result,
          [row.path_id]: row.completed_lessons,
        }),
        {} as Partial<Record<LearningPathId, number>>,
      );
      const totalXp = progress.reduce((total, row) => total + row.xp, 0);

      setSupabaseUser({ id: userId, email, role: role as UserRole });
      setName(displayName);
      setUsername(displayName.replace(/ +/g, "-").toLowerCase());
      setProgressByPath(progressByPath);
      setTotalXp(totalXp);
      writeUnlockedKitIds(unlockedKitIds);
      logIn();
    };

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user !== undefined) {
        void hydrateSession(user.id, user.email ?? "");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || session === null) {
        logOut();
        return;
      }

      void hydrateSession(session.user.id, session.user.email ?? "");
    });

    return () => subscription.unsubscribe();
  }, [
    logIn,
    logOut,
    setName,
    setProgressByPath,
    setSupabaseUser,
    setTotalXp,
    setUsername,
  ]);
};
