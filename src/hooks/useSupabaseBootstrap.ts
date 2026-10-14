import { useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { getMyUnlockedKitIds } from "~/services/kitService";
import { getProfile } from "~/services/profileService";
import { getMyLearningProgress } from "~/services/progressService";
import { useBoundStore } from "~/hooks/useBoundStore";
import type { LearningPathId } from "~/utils/learningPaths";

export const useSupabaseBootstrap = () => {
  useEffect(() => {
    if (supabase === null) return;
    let active = true;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const clearUserData = () => {
      const store = useBoundStore.getState();
      store.logOut();
      store.setProgressByPath({});
      store.setTotalXp(0);
    };

    const hydrateSession = async (
      userId: string,
      email: string,
      current: number,
    ) => {
      try {
        const [profile, progress, kitIds] = await Promise.all([
          getProfile(userId),
          getMyLearningProgress(userId),
          getMyUnlockedKitIds(userId),
        ]);
        if (!active || current !== revision) return;
        if (profile === null)
          throw new Error("No se pudo cargar el perfil Maker.");

        const progressByPath = progress.reduce(
          (result, row) => ({
            ...result,
            [row.path_id]: row.completed_lessons,
          }),
          {} as Partial<Record<LearningPathId, number>>,
        );
        const store = useBoundStore.getState();
        store.setSupabaseUser({ id: userId, email, role: profile.role });
        store.setName(profile.display_name);
        store.setUsername(
          profile.display_name.replace(/ +/g, "-").toLowerCase(),
        );
        store.setProgressByPath(progressByPath);
        store.setTotalXp(progress.reduce((total, row) => total + row.xp, 0));
        store.setUnlockedKitIds(kitIds);
        store.logIn();
      } catch (error) {
        if (!active || current !== revision) return;
        console.error("Error loading Maker account", error);
        clearUserData();
      } finally {
        if (active && current === revision)
          useBoundStore.getState().setAuthReady(true);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const current = ++revision;
      clearTimeout(timer);
      if (event === "SIGNED_OUT" || session === null) {
        clearUserData();
        useBoundStore.getState().setAuthReady(true);
        return;
      }
      if (useBoundStore.getState().supabaseUserId !== session.user.id) {
        clearUserData();
        useBoundStore.getState().setAuthReady(false);
      }
      // Run API calls after the Auth callback releases its session lock.
      timer = setTimeout(() => {
        void hydrateSession(session.user.id, session.user.email ?? "", current);
      }, 0);
    });

    return () => {
      active = false;
      revision++;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);
};
