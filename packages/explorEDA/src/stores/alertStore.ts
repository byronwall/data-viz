import { create } from "zustand";

type AlertStore = {
  isOpen: boolean;
  title: string;
  description: string;
  resolve: ((value: boolean) => void) | null;
  id: number;
  showAlert: (title: string, description: string) => Promise<boolean>;
  closeAlert: (result: boolean) => void;
};

export const useAlertStore = create<AlertStore>((set, get) => ({
  isOpen: false,
  title: "",
  description: "",
  resolve: null,
  id: 0,

  showAlert: async (title: string, description: string) => {
    return new Promise<boolean>((resolve) => {
      const { id } = get();
      set({
        isOpen: true,
        title,
        description,
        resolve,
        id: id + 1,
      });
    });
  },

  closeAlert: (result: boolean) => {
    const { resolve } = get();
    if (resolve) {
      resolve(result);
    }
    set({
      isOpen: false,
      title: "",
      description: "",
      resolve: null,
    });
  },
}));
