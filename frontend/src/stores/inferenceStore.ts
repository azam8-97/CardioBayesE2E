import { create } from "zustand";

type InferenceState = {
  lastJobId: string | null;
  setLastJobId: (id: string | null) => void;
};

export const useInferenceStore = create<InferenceState>((set) => ({
  lastJobId: null,
  setLastJobId: (id) => set({ lastJobId: id }),
}));
