/**
 * PWA Registration and Service Worker
 */
const PWA = {
  init() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        this.registerServiceWorker();
      });
    }
    this.setupInstallPrompt();
  },

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('SW registered:', registration.scope);
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  },

  setupInstallPrompt() {
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('Install prompt saved');
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      console.log('App installed');
    });
  }
};

PWA.init();
