import type { BoundStateCreator } from "~/hooks/useBoundStore";

export type TeslaSlice = {
  teslas: number;
  increaseTeslas: (by: number) => void;
};

export const createTeslaSlice: BoundStateCreator<TeslaSlice> = (set) => ({
  teslas: 0,
  increaseTeslas: (by: number) =>
    set(({ teslas }) => ({ teslas: teslas + by })),
});
