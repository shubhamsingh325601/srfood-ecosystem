import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DeliveryState {
  trainNumber: string | null;
  trainName: string | null;
  setTrain: (trainNumber: string, trainName?: string) => void;
  clearTrain: () => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      trainNumber: null,
      trainName: null,
      setTrain: (trainNumber, trainName) => set({ trainNumber, trainName: trainName ?? null }),
      clearTrain: () => set({ trainNumber: null, trainName: null }),
    }),
    { name: "srfood_delivery_v1" },
  ),
);
