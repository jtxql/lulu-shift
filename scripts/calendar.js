/**
 * Calendar Rendering Logic
 */
const Calendar = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  schedules: [],

  grid: null,
  titleEl: null,

  selectedDate: null,
  selectedStatus: null,

  modal: null,
  overlay: null,
  modalDate: null,
  statusOptions: null,

  init() {
    this.grid = document.getElementById('calendar-grid');
    this.titleEl = document.getElementById('month-title');
    this.modal = document.getElementById('status-modal');
    this.overlay = document.getElementById('modal-overlay');
    this.modalDate = document.getElementById('modal-date');
    this.statusOptions = document.getElementById('status-options');

    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.getElementById('btn-prev-month').addEventListener('click', () => this.prevMonth());
    document.getElementById('btn-next-month').addEventListener('click', () => this.nextMonth());

    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.closeModal();
    });

    this.statusOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.status-btn');
      if (btn) {
        this.selectStatus(btn.dataset.status);
      }
    });

    document.getElementById('btn-save').addEventListener('click', () => this.saveStatus());
    document.getElementById('btn-delete').addEventListener('click', () => this.deleteStatus());
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.render();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.render();
  },

  setData(schedules) {
    this.schedules = schedules || [];
    this.render();
  },

  render() {
    this.updateTitle();
    this.renderGrid();
  },

  updateTitle() {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    this.titleEl.textContent = `${this.currentYear}年${monthNames[this.currentMonth - 1]}`;
  },

  renderGrid() {
    this.grid.innerHTML = '';

    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0 ... Sunday = 6
    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const today = new Date();
    const isCurrentMonth = (
      today.getFullYear() === this.currentYear &&
      today.getMonth() + 1 === this.currentMonth
    );
    const todayDate = today.getDate();

    // ===== Render cells for previous month =====
    const prevMonth = this.currentMonth === 1 ? 12 : this.currentMonth - 1;
    const prevYear = this.currentMonth === 1 ? this.currentYear - 1 : this.currentYear;
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth - 1, 0).getDate();

    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const schedule = this.schedules.find(s => s.date === dateStr);
      const cell = this.createDayCell(day, dateStr, schedule, true);
      this.grid.appendChild(cell);
    }

    // ===== Render cells for current month =====
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const schedule = this.schedules.find(s => s.date === dateStr);

      const cell = this.createDayCell(day, dateStr, schedule, false);

      // Weekend check
      const date = new Date(this.currentYear, this.currentMonth - 1, day);
      const weekday = date.getDay();
      if (weekday === 0 || weekday === 6) {
        cell.classList.add('weekend');
      }

      // Today check
      if (isCurrentMonth && day === todayDate) {
        cell.classList.add('today');
      }

      this.grid.appendChild(cell);
    }

    // ===== Render cells for next month =====
    const totalCells = startWeekday + daysInMonth;
    const remaining = (6 * 7) - totalCells;
    const nextMonth = this.currentMonth === 12 ? 1 : this.currentMonth + 1;
    const nextYear = this.currentMonth === 12 ? this.currentYear + 1 : this.currentYear;

    for (let day = 1; day <= remaining; day++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const schedule = this.schedules.find(s => s.date === dateStr);
      const cell = this.createDayCell(day, dateStr, schedule, true);
      this.grid.appendChild(cell);
    }
  },

  createDayCell(day, dateStr, schedule, isAdjacent) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (isAdjacent) {
      cell.classList.add('adjacent-month');
    }

    cell.dataset.date = dateStr;

    if (schedule) {
      cell.classList.add('has-status', schedule.type);
      cell.innerHTML = `
        <span class="day-number">${day}</span>
        <span class="day-status ${schedule.type}"></span>
      `;
    } else {
      cell.innerHTML = `<span class="day-number">${day}</span>`;
    }

    cell.addEventListener('click', () => this.openModal(dateStr, schedule));
    return cell;
  },

  openModal(dateStr, schedule) {
    this.selectedDate = dateStr;

    // Parse date for display
    const [, month, day] = dateStr.split('-');
    this.modalDate.textContent = `${parseInt(month)}月${parseInt(day)}日`;

    // Set current status
    this.selectedStatus = schedule ? schedule.type : null;
    this.updateStatusSelection();

    // Show modal
    this.overlay.classList.add('active');
  },

  closeModal() {
    this.overlay.classList.remove('active');
    this.selectedDate = null;
    this.selectedStatus = null;
  },

  selectStatus(status) {
    this.selectedStatus = status;
    this.updateStatusSelection();
  },

  updateStatusSelection() {
    const buttons = this.statusOptions.querySelectorAll('.status-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.status === this.selectedStatus);
    });
  },

  async saveStatus() {
    if (!this.selectedDate || !this.selectedStatus) {
      App.showToast('请选择班次状态');
      return;
    }

    const statusText = {
      day: '白班',
      night: '夜班',
      rest: '休息',
      personal: '事假',
      sick: '病假',
      annual: '年假'
    };

    // Remove existing schedule for this date
    this.schedules = this.schedules.filter(s => s.date !== this.selectedDate);

    // Add new schedule
    this.schedules.push({
      date: this.selectedDate,
      type: this.selectedStatus,
      text: statusText[this.selectedStatus]
    });

    // Save to Gist
    App.showLoading(true);
    const success = await Gist.save(this.schedules);
    App.showLoading(false);
    if (success) {
      App.showToast('保存成功');
      this.closeModal();
      this.render();
    }
  },

  async deleteStatus() {
    if (!this.selectedDate) return;

    // Remove schedule for this date
    this.schedules = this.schedules.filter(s => s.date !== this.selectedDate);

    // Save to Gist
    App.showLoading(true);
    const success = await Gist.save(this.schedules);
    App.showLoading(false);
    if (success) {
      App.showToast('已删除');
      this.closeModal();
      this.render();
    }
  }
};
