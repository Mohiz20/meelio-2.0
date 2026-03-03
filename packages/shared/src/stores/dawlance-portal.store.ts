import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  DawlancePortalData,
  DawlancePortalSettings,
  DawlancePortalStore,
} from "../types/dawlance-portal.types";
import {
  DEFAULT_DAWLANCE_PORTAL_DATA,
  DEFAULT_DAWLANCE_PORTAL_SETTINGS,
} from "../types/dawlance-portal.types";

export const useDawlancePortalStore = create<DawlancePortalStore>()(
  persist(
    (set, get) => ({
      data: DEFAULT_DAWLANCE_PORTAL_DATA,
      settings: DEFAULT_DAWLANCE_PORTAL_SETTINGS,
      isLoading: false,
      isFetching: false,

      fetchData: async () => {
        set({ isFetching: true });
        try {
          console.log("Fetching Dawlance Portal data...");

          // Import service dynamically to avoid issues
          const { DawlancePortalService } = await import(
            "../services/dawlance-portal.service.js"
          );

          // Fetch data from portal
          const portalData = await DawlancePortalService.fetchAllData();
          console.log('portalData', portalData)
          // Update state with fetched data
          set((state) => ({
            data: {
              ...state.data,
              ...portalData,
              lastUpdated: Date.now(),
            },
            isFetching: false,
          }));

          console.log("Dawlance Portal data fetched successfully");
        } catch (error) {
          console.error("Failed to fetch Dawlance Portal data:", error);
          set((state) => ({
            data: {
              ...state.data,
              error: error instanceof Error ? error.message : "Failed to fetch data",
            },
            isFetching: false,
          }));
        }
      },

      updateSettings: (newSettings: Partial<DawlancePortalSettings>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_DAWLANCE_PORTAL_SETTINGS });
      },

      clearData: () => {
        set({ data: DEFAULT_DAWLANCE_PORTAL_DATA });
      },
    }),
    {
      name: "meelio:local:dawlance-portal",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        data: state.data,
        settings: state.settings,
      }),
    }
  )
);
