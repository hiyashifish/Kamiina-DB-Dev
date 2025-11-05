// src/types/window.d.ts
export {};

declare global {
  interface Window {
    openMobileMenu: () => void;
    closeMobileMenu: () => void;
  }
}
