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
