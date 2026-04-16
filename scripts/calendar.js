/**
 * Calendar Rendering Logic
 */
const Calendar = {
  // Ottawa timezone (America/Toronto)
  _ottawaOffset: -5, // Ottawa standard timezone offset

  _getOttawaDate() {
    // Get current date in Ottawa timezone
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

  // Multi-day selection state
  _isSelecting: false,
  _selectionStart: null,
  _selectedDates: new Set(),
  _lastSelectedDate: null,
  _selectionTimer: null,
  _isLongPress: false,

  // Summary modal refs
  _summaryOverlay: null,
  _summaryBody: null,
  _summaryTitle: null,

  // Pay calculation constants
  DAILY_HOURS: 11.75,
  HOURLY_RATE: 43.24,

  init() {
    this.grid = document.getElementById('calendar-grid');
    this.titleEl = document.getElementById('month-title');
    this.modal = document.getElementById('status-modal');
    this.overlay = document.getElementById('modal-overlay');
    this.modalDate = document.getElementById('modal-date');
    this.statusOptions = document.getElementById('status-options');

    // Summary modal refs
    this._summaryOverlay = document.getElementById('summary-overlay');
    this._summaryBody = document.getElementById('summary-body');
    this._summaryTitle = document.getElementById('summary-title');

    // Initialize with Ottawa time
    const ottawa = this._getOttawaDateParts();
    this.currentYear = ottawa.year;
    this.currentMonth = ottawa.month;

    this.bindEvents();
    this.bindSelectionEvents();
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

    // Summary modal close
    document.getElementById('summary-close').addEventListener('click', () => this._closeSummary());
    this._summaryOverlay.addEventListener('click', (e) => {
      if (e.target === this._summaryOverlay) this._closeSummary();
    });
  },

  // ===== Multi-Day Selection =====
  bindSelectionEvents() {
    // Mouse events
    this.grid.addEventListener('mousedown', (e) => this._startSelection(e));
    this.grid.addEventListener('mousemove', (e) => this._updateSelection(e));
    document.addEventListener('mouseup', (e) => this._endSelection(e));

    // Touch events - need passive: false to prevent scroll during drag
    this.grid.addEventListener('touchstart', (e) => this._startSelection(e), { passive: false });
    this.grid.addEventListener('touchmove', (e) => this._updateSelection(e), { passive: false });
    document.addEventListener('touchend', (e) => this._endSelection(e));
    document.addEventListener('touchcancel', (e) => this._endSelection(e));
  },

  _getCellFromEvent(e) {
    // For touch events, use touches[0] to get the current touch point
    let target;
    if (e.touches && e.touches.length > 0) {
      target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      target = e.target;
    }
    target = target ? target.closest('.day-cell') : null;
    if (!target) return null;
    return {
      dateStr: target.dataset.date,
      element: target
    };
  },

  _startSelection(e) {
    // Prevent default to stop scrolling/zooming on touch devices
    if (e.touches) e.preventDefault();

    const cell = this._getCellFromEvent(e);
    if (!cell) return;

    // Close any open modals first
    this.closeModal();
    this._closeSummary();

    this._isLongPress = false;
    this._selectionStart = cell.dateStr;
    this._selectedDates.clear();
    this._selectedDates.add(cell.dateStr);
    this._lastSelectedDate = cell.dateStr;
    this._updateSelectionUI();

    // Start long press timer (500ms for long press to trigger summary)
    this._selectionTimer = setTimeout(() => {
      this._isLongPress = true;
      // Long press - show summary immediately
      if (this._selectedDates.size > 0) {
        this._showSummary();
        this._clearSelectionUI();
      }
    }, 500);

    this._isSelecting = true;
  },

  _updateSelection(e) {
    if (!this._isSelecting) return;

    // Prevent default to stop scrolling while dragging on touch devices
    if (e.touches) e.preventDefault();

    // Cancel long press timer on any movement
    if (this._selectionTimer) {
      clearTimeout(this._selectionTimer);
      this._selectionTimer = null;
    }

    const cell = this._getCellFromEvent(e);
    if (!cell || cell.dateStr === this._lastSelectedDate) return;

    // Fill in all dates between _lastSelectedDate and cell.dateStr
    const dates = this._getDateRange(this._lastSelectedDate, cell.dateStr);
    dates.forEach(d => this._selectedDates.add(d));

    this._lastSelectedDate = cell.dateStr;
    this._updateSelectionUI();
  },

  _endSelection(e) {
    if (!this._isSelecting) return;

    // Cancel long press timer
    if (this._selectionTimer) {
      clearTimeout(this._selectionTimer);
      this._selectionTimer = null;
    }

    this._isSelecting = false;

    if (this._isLongPress) {
      // Long press already triggered summary in _startSelection
      this._isLongPress = false;
      this._clearSelectionUI();
      return;
    }

    // Drag selection (multiple dates) → show summary
    if (this._selectedDates.size > 1) {
      this._showSummary();
      this._clearSelectionUI();
      return;
    }

    // Single date short press → open modal
    this._clearSelectionUI();
    if (this._selectionStart) {
      const dateStr = this._selectionStart;
      const schedule = this.schedules.find(s => s.date === dateStr);
      this.openModal(dateStr, schedule);
    }
  },

  _getDateRange(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      // Swap if selection goes backwards
      [start, end] = [end, start];
    }

    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  },

  _updateSelectionUI() {
    // Remove selecting class from all cells first
    this.grid.querySelectorAll('.day-cell.selecting, .day-cell.selected').forEach(cell => {
      cell.classList.remove('selecting', 'selected');
    });

    // Add selecting class to all selected cells
    this._selectedDates.forEach(dateStr => {
      const cell = this.grid.querySelector(`.day-cell[data-date="${dateStr}"]`);
      if (cell) {
        cell.classList.add('selected');
      }
    });
  },

  _clearSelectionUI() {
    this.grid.querySelectorAll('.day-cell.selecting, .day-cell.selected').forEach(cell => {
      cell.classList.remove('selecting', 'selected');
    });
    this._selectedDates.clear();
  },

  _showSummary() {
    const sortedDates = Array.from(this._selectedDates).sort();
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];
    const totalDays = sortedDates.length;

    // Calculate work statistics
    let dayShiftCount = 0;
    let nightShiftCount = 0;
    let workDays = 0;

    sortedDates.forEach(dateStr => {
      const schedule = this.schedules.find(s => s.date === dateStr);
      if (schedule && (schedule.type === 'day' || schedule.type === 'night')) {
        workDays++;
        if (schedule.type === 'day') dayShiftCount++;
        else if (schedule.type === 'night') nightShiftCount++;
      }
    });

    const totalWorkHours = (dayShiftCount + nightShiftCount) * this.DAILY_HOURS;
    const totalPay = totalWorkHours * this.HOURLY_RATE;

    // Format date range display
    const startParts = startDate.split('-');
    const endParts = endDate.split('-');
    const startFmt = Language.currentLang === 'zh'
      ? `${parseInt(startParts[1])}月${parseInt(startParts[2])}日`
      : `${parseInt(startParts[1])}/${parseInt(startParts[2])}`;
    const endFmt = Language.currentLang === 'zh'
      ? `${parseInt(endParts[1])}月${parseInt(endParts[2])}日`
      : `${parseInt(endParts[1])}/${parseInt(endParts[2])}`;

    const periodStr = startDate === endDate ? startFmt : `${startFmt} - ${endFmt}`;

    // Build summary HTML
    let html = `
      <div class="summary-row">
        <span class="summary-label">${Language.t('summary.period')}</span>
        <span class="summary-value">${periodStr}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${Language.t('summary.days')}</span>
        <span class="summary-value">${totalDays} ${Language.currentLang === 'zh' ? '天' : 'days'}</span>
      </div>
    `;

    if (workDays > 0) {
      html += `
        <div class="summary-breakdown">
          <div class="summary-breakdown-row">
            <span>${Language.t('summary.dayShifts')}</span>
            <span>${dayShiftCount} × 11.75h</span>
          </div>
          <div class="summary-breakdown-row">
            <span>${Language.t('summary.nightShifts')}</span>
            <span>${nightShiftCount} × 11.75h</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-label">${Language.t('summary.workHours')}</span>
          <span class="summary-value">${totalWorkHours.toFixed(2)} h</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">${Language.t('summary.hourlyRate')}</span>
          <span class="summary-value">$${this.HOURLY_RATE.toFixed(2)} CAD</span>
        </div>
        <div class="summary-row total">
          <span class="summary-label">${Language.t('summary.totalPay')}</span>
          <span class="summary-value">$${totalPay.toFixed(2)} CAD</span>
        </div>
        <div class="summary-note">${Language.t('summary.allowanceNote')}</div>
      `;
    } else {
      html += `<div class="summary-note">${Language.t('summary.noWork')}</div>`;
    }

    this._summaryTitle.textContent = Language.t('summary.title');
    this._summaryBody.innerHTML = html;
    this._summaryOverlay.classList.add('active');
  },

  _closeSummary() {
    this._summaryOverlay.classList.remove('active');
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
    // Update status bar every minute
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

    // Display current time
    timeEl.textContent = Language.formatTime(hours, minutes);

    // Display version from manifest
    const versionEl = document.getElementById('status-version');
    if (versionEl && !versionEl.textContent) {
      fetch('manifest.json')
        .then(r => r.json())
        .then(data => {
          versionEl.textContent = 'v' + data.version;
        })
        .catch(() => {});
    }

    // Find today's schedule
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const todaySchedule = this.schedules.find(s => s.date === todayStr);

    if (!todaySchedule) {
      shiftEl.textContent = Language.t('status.noSchedule');
      shiftEl.className = 'status-shift';
      return;
    }

    const type = todaySchedule.type;

    // Day shift: 7:30 ~ 19:30
    // Night shift: 19:30 ~ next day 7:30
    const dayStart = 7 * 60 + 30;  // 7:30 = 450 minutes
    const dayEnd = 19 * 60 + 30;   // 19:30 = 1170 minutes
    const nightStart = 19 * 60 + 30; // 19:30 = 1170 minutes
    const nightEnd = 7 * 60 + 30;   // Next day 7:30 = 450 minutes

    const currentMinutes = hours * 60 + minutes;

    if (type === 'day') {
      // Day shift
      if (currentMinutes >= dayStart && currentMinutes < dayEnd) {
        // Currently on shift
        const remaining = dayEnd - currentMinutes;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = Language.formatShiftStatus(Language.t('status.onShift'), { h: rh, m: rm });
        shiftEl.className = 'status-shift working';
      } else if (currentMinutes < dayStart) {
        // Day shift not started yet
        const remaining = dayStart - currentMinutes;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = Language.formatShiftStatus(Language.t('status.dayShiftNotStarted'), { h: rh, m: rm });
        shiftEl.className = 'status-shift resting';
      } else {
        // Day shift ended
        shiftEl.textContent = Language.t('status.dayShiftEnded');
        shiftEl.className = 'status-shift';
      }
    } else if (type === 'night') {
      // Night shift
      if (currentMinutes >= nightStart) {
        // 19:30 ~ 23:59 on night shift
        const remaining = 24 * 60 - currentMinutes + nightEnd;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = Language.formatShiftStatus(Language.t('status.onShift'), { h: rh, m: rm });
        shiftEl.className = 'status-shift working';
      } else if (currentMinutes < nightEnd) {
        // 00:00 ~ 07:30 on night shift (spans midnight)
        const remaining = nightEnd - currentMinutes;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = Language.formatShiftStatus(Language.t('status.onShift'), { h: rh, m: rm });
        shiftEl.className = 'status-shift working';
      } else {
        // 07:30 ~ 19:30 night shift not started
        const remaining = nightStart - currentMinutes;
        const rh = Math.floor(remaining / 60);
        const rm = remaining % 60;
        shiftEl.textContent = Language.formatShiftStatus(Language.t('status.nightShiftNotStarted'), { h: rh, m: rm });
        shiftEl.className = 'status-shift resting';
      }
    } else if (type === 'rest') {
      // Rest day - find next work day
      const { days, hours: nh, minutes: nm } = this._getNextWorkStart(now, todayStr);
      shiftEl.textContent = Language.formatShiftStatus(Language.t('status.restDay'), { d: days, h: nh, m: nm });
      shiftEl.className = 'status-shift resting';
    } else {
      // Personal leave, sick leave, annual leave, etc.
      shiftEl.textContent = Language.t('status.scheduleLabel') + Language.t('legend.' + type);
      shiftEl.className = 'status-shift';
    }
  },

  _getNextWorkStart(now, todayStr) {
    // Find the next work day from the schedule
    const nowMs = now.getTime();
    let minDiff = Infinity;
    let nextSchedule = null;

    for (const s of this.schedules) {
      if (s.type === 'day' || s.type === 'night') {
        const [y, m, d] = s.date.split('-').map(Number);
        // Day shift work start time
        let workStart;
        if (s.type === 'day') {
          workStart = new Date(y, m - 1, d, 7, 30).getTime();
        } else {
          // Night shift starts at 19:30 on the same day
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
    Language.updateTitle();
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
      const statusLabel = schedule.type === 'day' ? 'D' : schedule.type === 'night' ? 'N' : '';
      cell.innerHTML = `
        <span class="day-number">${day}</span>
        <span class="day-status ${schedule.type}">${statusLabel}</span>
      `;
    } else {
      cell.innerHTML = `<span class="day-number">${day}</span>`;
    }

    // Only bind click for single date selection (not during drag)
    cell.addEventListener('click', (e) => {
      if (!this._isSelecting) {
        this.openModal(dateStr, schedule);
      }
    });
    return cell;
  },

  openModal(dateStr, schedule) {
    this.selectedDate = dateStr;

    // Parse date for display
    const [, month, day] = dateStr.split('-');
    this.modalDate.textContent = `${month}/${day}`;

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
      App.showToast(Language.t('modal.pleaseSelect'));
      return;
    }

    const statusText = {
      day: 'Day Shift',
      night: 'Night Shift',
      rest: 'Day Off',
      personal: 'Personal Leave',
      sick: 'Sick Leave',
      annual: 'Annual Leave'
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
      App.showToast(Language.t('toast.saved'));
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
      App.showToast(Language.t('toast.deleted'));
      this.closeModal();
      this.render();
    }
  }
};
