/**
 * Export / Print Functionality
 */
const Export = {
  init() {
    document.getElementById('btn-export').addEventListener('click', () => this.print());
  },

  print() {
    window.print();
  }
};
