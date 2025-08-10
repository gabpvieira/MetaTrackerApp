import { useEffect } from "react";
import { create } from "zustand";

type SidebarState = { 
  isOpen: boolean; 
  setOpen: (v: boolean) => void; 
  toggle: () => void; 
};

export const useSidebar = create<SidebarState>((set) => ({
  isOpen: JSON.parse(localStorage.getItem("sbOpen") ?? "true"),
  setOpen: (v) => {
    localStorage.setItem("sbOpen", JSON.stringify(v));
    set({ isOpen: v });
  },
  toggle: () => {
    set(s => {
      const v = !s.isOpen;
      localStorage.setItem("sbOpen", JSON.stringify(v));
      return { isOpen: v };
    });
  },
}));

// Fechar ao navegar (mobile)
export function useCloseSidebarOnRouteChange() {
  const setOpen = useSidebar(s => s.setOpen);
  
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) return;
    
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [setOpen]);
}