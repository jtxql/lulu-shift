/**
 * Dark Mode Toggle
 */
const DarkMode = {
  STORAGE_KEY: 'lulu-shift-dark-mode',
  btn: null,
  iconSun: null,
  iconMoon: null,

  init() {
    this.btn = document.getElementById('btn-dark-mode');
    this.applySavedPreference();
    this.bindEvents();
  },

  applySavedPreference() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'true') {
      document.body.classList.add('dark-mode');
      this.updateIcon(true);
    }
  },

  bindEvents() {
    this.btn.addEventListener('click', () => this.toggle());
  },

  toggle() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem(this.STORAGE_KEY, isDark);
    this.updateIcon(isDark);
  },

  updateIcon(isDark) {
    const icon = this.btn.querySelector('i');
    if (isDark) {
      icon.setAttribute('data-lucide', 'sun');
    } else {
      icon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons();
  }
};
