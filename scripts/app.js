/**
 * Main Application Entry
 */
const App = {
  toast: null,
  toastMessage: null,
  loadingOverlay: null,

  async init() {
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toast-message');
    this.loadingOverlay = document.getElementById('loading-overlay');

    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize modules
    DarkMode.init();
    Language.init();
    Calendar.init();
    Export.init();
    Weather.init();

    // Reload button (clear all caches, unregister SW, then reload)
    document.getElementById('btn-reload').addEventListener('click', async () => {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      // Unregister all service workers
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      // Clear localStorage (except lang preference)
      const savedLang = localStorage.getItem('lulu-shift-lang');
      localStorage.clear();
      if (savedLang) localStorage.setItem('lulu-shift-lang', savedLang);
      // Reload with cache-busting URL to skip SW cache
      const url = (window.location.href.split('?')[0]) + '?t=' + Date.now();
      window.location.replace(url);
    });

    // Load data from Gist
    await this.loadData();
  },

  async loadData() {
    this.showLoading(true);
    const data = await Gist.load();
    Calendar.setData(data.schedules || []);
    this.showLoading(false);
  },

  showLoading(show) {
    if (show) {
      this.loadingOverlay.style.display = 'flex';
    } else {
      this.loadingOverlay.style.display = 'none';
    }
  },

  showToast(message) {
    this.toastMessage.textContent = message;
    this.toast.classList.add('show');

    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2500);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
