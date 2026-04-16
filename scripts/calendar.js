/**
 * Calendar Rendering Logic
 */
const Calendar = {
  // Ottawa timezone (America/Toronto)
  _ottawaOffset: -5, // 渥太华标准时区偏移

  _getOttawaDate() {
    // 获取渥太华时区的当前日期
    const now = new Date();
    const ottawaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
    return ottawaTime;
  },

  _getOttawaDateParts() {
    const d = this._getOttawaDate();
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      date: d.getDate()
    };
  },

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

    // 使用渥太华时间初始化
    const ottawa = this._getOttawaDateParts();
    this.currentYear = ottawa.year;
    this.currentMonth = ottawa.month;

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
    this._updateStatusBar();
    // 每分钟更新一次状态栏
    if (!this._statusTimer) {
      this._statusTimer = setInterval(() => this._updateStatusBar(), 60000);
    }
  },

  _updateStatusBar() {
    const timeEl = document.getElementById('status-time');
    const shiftEl = document.getElementById('status-shift');
    if (!timeEl || !shiftEl) return;

    const now = this._getOttawaDate();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 显示当前时间
    timeEl.textContent = `现在是渥太华时间 ${month}月${date}日 ${hours}点${minutes}分`;

    // 查找今天的排班
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const todaySchedule = this.schedules.find(s => s.date === todayStr);

    if (!todaySchedule) {
      shiftEl.textContent = '今日无排班记录';
      shiftEl.className = 'status-shift';
      return;
    }

    const type = todaySchedule.type;

    // 白班: 7:30 ~ 19:30
    // 夜班: 19:30 ~ 次日 7:30
    const dayStart = 7 * 60 + 30;  // 7:30 = 450分钟
    const dayEnd = 19 * 60 + 30;   // 19:30 = 1170分钟
    const nightStart = 19 * 60 + 30; // 19:30 = 1170分钟
    const nightEnd = 7 * 60 + 30;   // 次日 7:30 = 450分钟

    const currentMinutes = hours * 60 + minutes;

    if (type === 'day') {
      // 白班
      if (currentMinutes >= dayStart && currentMinutes < dayEnd) {
        // 正在上班
        const remaining = dayEnd - currentMinutes;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = `你现在正在上班，还有 ${rh}小时${rm}分钟下班`;
        shiftEl.className = 'status-shift working';
      } else if (currentMinutes < dayStart) {
        // 白班还没开始
        const remaining = dayStart - currentMinutes;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = `白班还没开始，还有 ${rh}小时${rm}分钟上班`;
        shiftEl.className = 'status-shift resting';
      } else {
        // 白班已结束
        shiftEl.textContent = '白班已结束';
        shiftEl.className = 'status-shift';
      }
    } else if (type === 'night') {
      // 夜班
      if (currentMinutes >= nightStart || currentMinutes < nightEnd) {
        // 正在上夜班
        let remaining;
        if (currentMinutes >= nightStart) {
          remaining = (24 * 60 - currentMinutes) + nightEnd;
        } else {
          remaining = nightEnd - currentMinutes;
        }
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = `你现在正在上夜班，还有 ${rh}小时${rm}分钟下班`;
        shiftEl.className = 'status-shift working';
      } else {
        // 夜班还没开始
        const remaining = nightStart - currentMinutes;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = `夜班还没开始，还有 ${rh}小时${rm}分钟上班`;
        shiftEl.className = 'status-shift resting';
      }
    } else if (type === 'rest') {
      // 休息日 - 查找下一个工作日
      const { days, hours: nh, minutes: nm } = this._getNextWorkStart(now, todayStr);
      shiftEl.textContent = `你现在处于休息时间，还有 ${days}天${nh}小时${nm}分钟上班`;
      shiftEl.className = 'status-shift resting';
    } else {
      // 事假、病假、年假等
      shiftEl.textContent = `今日排班：${todaySchedule.text}`;
      shiftEl.className = 'status-shift';
    }
  },

  _getNextWorkStart(now, todayStr) {
    // 从排班表中找到下一个工作日
    const nowMs = now.getTime();
    let minDiff = Infinity;
    let nextSchedule = null;

    for (const s of this.schedules) {
      if (s.type === 'day' || s.type === 'night') {
        const [y, m, d] = s.date.split('-').map(Number);
        // 白班工作开始时间
        let workStart;
        if (s.type === 'day') {
          workStart = new Date(y, m - 1, d, 7, 30).getTime();
        } else {
          // 夜班开始时间是当天19:30
          workStart = new Date(y, m - 1, d, 19, 30).getTime();
        }
        const diff = workStart - nowMs;
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          nextSchedule = s;
        }
      }
    }

    if (!nextSchedule) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const totalMinutes = Math.floor(minDiff / 60000);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    return { days, hours, minutes };
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

    const today = this._getOttawaDate();
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
