import { useEffect } from "react";
import create from "zustand";

import { ls } from "./utils/localStorage";

export type ReportStore = {
  selectedPull: number;
  setSelectedPull: (id: number) => void;
};

export const useReportStore = create<ReportStore>((set) => {
  return {
    selectedPull: 1,
    setSelectedPull: (id: number) => {
      set(() => ({
        selectedPull: id,
      }));
    },
  };
});

// text-green-500
const defaultPullConnectionLineColor = "#10b981";
// text-red-500
const defaultInvisPullConnectionLineColor = "#ef4444";

export type MapOptionsStore = {
  visible: boolean;
  mapChangeColor: null | string;
  renderPullConnectionLines: boolean;
  renderMapChangeLines: boolean;
  renderPOIs: boolean;
  pullConnectionLineColor: string;
  invisPullConnectionLineColor: string;

  toggleMapOptions: () => void;
  togglePullConnectionLines: () => void;
  toggleMapChangeLines: () => void;
  togglePOIs: () => void;
  setPullConnectionLineColor: (value: string) => void;
  setInvisPullConnectionLineColor: (value: string) => void;
  resetPullConnectionLineColor: () => void;
  resetInvisPullConnectionLineColor: () => void;
  restoreFromLocalStorage: () => void;
};

export const useMapOptions = create<MapOptionsStore>((set) => {
  return {
    visible: false,
    mapChangeColor: null,
    renderPullConnectionLines: true,
    renderMapChangeLines: true,
    renderPOIs: true,

    toggleMapChangeLines: () => {
      set((state) => {
        persistMapOptions(
          "renderMapChangeLines",
          state.renderMapChangeLines ? "0" : true
        );

        return {
          renderMapChangeLines: !state.renderMapChangeLines,
        };
      });
    },
    togglePOIs: () => {
      set((state) => {
        persistMapOptions("renderPOIs", state.renderPOIs ? "0" : true);

        return {
          renderPOIs: !state.renderPOIs,
        };
      });
    },
    togglePullConnectionLines: () => {
      set((state) => {
        persistMapOptions(
          "renderPullConnectionLines",
          state.renderPullConnectionLines ? "0" : true
        );

        return {
          renderPullConnectionLines: !state.renderPullConnectionLines,
        };
      });
    },
    toggleMapOptions: () => {
      set((state) => {
        return {
          visible: !state.visible,
        };
      });
    },

    pullConnectionLineColor: defaultPullConnectionLineColor,
    setPullConnectionLineColor: (value: string) => {
      set({
        pullConnectionLineColor: value,
      });

      persistMapOptions("pullConnectionLineColor", value);
    },
    resetPullConnectionLineColor: () => {
      set({
        pullConnectionLineColor: defaultPullConnectionLineColor,
      });

      persistMapOptions("pullConnectionLineColor", true);
    },

    invisPullConnectionLineColor: defaultInvisPullConnectionLineColor,
    resetInvisPullConnectionLineColor: () => {
      set({
        invisPullConnectionLineColor: defaultInvisPullConnectionLineColor,
      });

      persistMapOptions("invisPullConnectionLineColor", true);
    },
    setInvisPullConnectionLineColor: (value: string) => {
      set({
        invisPullConnectionLineColor: value,
      });

      persistMapOptions("invisPullConnectionLineColor", value);
    },

    restoreFromLocalStorage: () => {
      const mapOptionsString = ls.get(lsMapOptionsKey);

      if (!mapOptionsString) {
        return;
      }

      try {
        const mapOptionsRaw = JSON.parse(mapOptionsString);

        const mapOptions = Object.fromEntries(
          Object.entries(mapOptionsRaw).map(([key, value]) => [
            key,
            value === "0" ? false : value,
          ])
        ) as Parameters<typeof set>[0];

        set(mapOptions);
      } catch {
        // eslint-disable-next-line no-console
        console.error(
          "[Keystone Heroes] - failed to restore settings from localStorage"
        );
      }
    },
  };
});

const lsMapOptionsKey = "mapOptions";

const persistMapOptions = (key: string, valueOrDropFlag: string | boolean) => {
  const mapOptionsString = ls.get(lsMapOptionsKey);

  if (mapOptionsString) {
    const mapOptions = JSON.parse(mapOptionsString);
    const nextMapOptions =
      typeof valueOrDropFlag === "string"
        ? {
            ...mapOptions,
            [key]: valueOrDropFlag,
          }
        : Object.fromEntries(
            Object.entries(mapOptions).filter((dataset) => dataset[0] !== key)
          );

    if (Object.keys(nextMapOptions).length === 0) {
      ls.remove(lsMapOptionsKey);
      return;
    }

    ls.set(lsMapOptionsKey, JSON.stringify(nextMapOptions));
    return;
  }

  if (typeof valueOrDropFlag === "string") {
    const initialOptions = { [key]: valueOrDropFlag };

    ls.set(lsMapOptionsKey, JSON.stringify(initialOptions));
  }
};

export const useRestoreMapOptions = (): void => {
  const restoreFromLocalStorage = useMapOptions(
    (state) => state.restoreFromLocalStorage
  );

  useEffect(restoreFromLocalStorage, [restoreFromLocalStorage]);
};
