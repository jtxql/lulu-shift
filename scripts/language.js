/**
 * Language Toggle (English / Chinese)
 */
const Language = {
  STORAGE_KEY: 'lulu-shift-lang',
  currentLang: 'en',

  translations: {
    en: {
      appTitle: "LULU's Schedule",
      printExport: 'Print / Export',
      darkMode: 'Dark Mode',
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      legend: {
        day: 'Day Shift',
        night: 'Night Shift',
        rest: 'Day Off',
        personal: 'Personal Leave',
        sick: 'Sick Leave',
        annual: 'Annual Leave',
        holiday: 'Holiday'
      },
      status: {
        noSchedule: 'No schedule record for today',
        onShift: 'You are on shift. {h}h {m}m until shift ends',
        shiftNotStarted: 'Shift not started. {h}h {m}m until shift begins',
        shiftEnded: 'Shift has ended',
        dayShiftNotStarted: 'Day shift not started. {h}h {m}m until shift begins',
        dayShiftEnded: 'Day shift has ended',
        nightShiftNotStarted: 'Night shift not started. {h}h {m}m until shift begins',
        restDay: 'You are on a rest day. {d}d {h}h {m}m until next shift',
        scheduleLabel: 'Schedule: ',
        payday: 'Next pay day: {date} ({days} days)'
      },
      modal: {
        delete: 'Delete',
        save: 'Save',
        pleaseSelect: 'Please select a shift status',
        chargeNurse: 'Charge Nurse',
        preceptorNurse: 'Preceptor Nurse'
      },
      toast: {
        saved: 'Saved successfully',
        deleted: 'Deleted'
      },
      summary: {
        title: 'Summary',
        period: 'Period',
        days: 'Days',
        workHours: 'Work Hours',
        dayShifts: 'Day Shifts',
        nightShifts: 'Night Shifts',
        hourlyRate: 'Hourly Rate',
        eveningAllowance: 'Evening Premium (15-23h)',
        nightShiftAllowance: 'Night Premium (23-07h)',
        weekendAllowance: 'Weekend Premium',
        chargeAllowance: 'Charge Nurse Premium',
        preceptorAllowance: 'Preceptor Premium',
        holidayOvertime: 'Holiday Overtime (1.5x)',
        totalPayWithAllowance: 'Total (incl. premiums)',
        allowanceNote: 'Premiums calculated separately',
        noWork: 'No work shifts in selected period'
      },
      payStub: {
        title: 'Pay Stub',
        payPeriod: 'Pay Period',
        income: 'Income',
        dayShiftIncome: 'Day Shifts',
        nightShiftIncome: 'Night Shifts',
        eveningPremium: 'Evening Premium',
        nightPremium: 'Night Premium',
        weekendPremium: 'Weekend Premium',
        chargePremium: 'Charge Nurse Premium',
        preceptorPremium: 'Preceptor Premium',
        holidayOvertime: 'Holiday Overtime',
        grossPay: 'Gross Pay',
        deductions: 'Deductions',
        cpp: 'CPP',
        ei: 'EI',
        federalTax: 'Federal Tax',
        provincialTax: 'Provincial Tax',
        totalDeductions: 'Total Deductions',
        netPay: 'Net Pay',
        payDate: 'Pay Date',
        biweekly: 'Bi-weekly'
      },
      ottawaTime: 'Ottawa time: {m}/{d}({w}) {h}:{i}'
    },
    zh: {
      appTitle: 'LULU的排班表',
      printExport: '打印/导出',
      darkMode: '深色模式',
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      legend: {
        day: '白班',
        night: '夜班',
        rest: '休息',
        personal: '事假',
        sick: '病假',
        annual: '年假',
        holiday: '法定假日'
      },
      status: {
        noSchedule: '今日无排班记录',
        onShift: '你正在上班，还有 {h}小时{m}分钟下班',
        shiftNotStarted: '还没开始上班，还有 {h}小时{m}分钟上班',
        shiftEnded: '班次已结束',
        dayShiftNotStarted: '白班还没开始，还有 {h}小时{m}分钟上班',
        dayShiftEnded: '白班已结束',
        nightShiftNotStarted: '夜班还没开始，还有 {h}小时{m}分钟上班',
        restDay: '你正在休息，还有 {d}天{h}小时{m}分钟上班',
        scheduleLabel: '今日排班：',
        payday: '下一个发薪日：{date}（还有{days}天）'
      },
      modal: {
        delete: '删除',
        save: '保存',
        pleaseSelect: '请选择班次状态',
        chargeNurse: '领班护士',
        preceptorNurse: '带实习生护士'
      },
      toast: {
        saved: '保存成功',
        deleted: '已删除'
      },
      summary: {
        title: '汇总',
        period: '时间段',
        days: '共计',
        workHours: '工作时长',
        dayShifts: '日班次数',
        nightShifts: '夜班次数',
        hourlyRate: '时薪',
        eveningAllowance: '晚班津贴 (15-23点)',
        nightShiftAllowance: '夜班津贴 (23-07点)',
        weekendAllowance: '周末津贴',
        chargeAllowance: '领班护士津贴',
        preceptorAllowance: '带实习生护士津贴',
        holidayOvertime: '法定假日加班费 (1.5倍)',
        totalPayWithAllowance: '工资合计(含津贴)',
        allowanceNote: '津贴另行计算',
        noWork: '所选时间段内无工作排班'
      },
      payStub: {
        title: '工资条',
        payPeriod: '发薪周期',
        income: '收入',
        dayShiftIncome: '白班',
        nightShiftIncome: '夜班',
        eveningPremium: '晚班津贴',
        nightPremium: '夜班津贴',
        weekendPremium: '周末津贴',
        chargePremium: '领班护士津贴',
        preceptorPremium: '带实习生护士津贴',
        holidayOvertime: '法定假日加班费',
        grossPay: '税前总工资',
        deductions: '扣除',
        cpp: 'CPP退休金',
        ei: 'EI就业保险',
        federalTax: '联邦税',
        provincialTax: '省税',
        totalDeductions: '扣除合计',
        netPay: '实际到账',
        payDate: '发薪日',
        biweekly: '每双周'
      },
      ottawaTime: '渥太华时间 {m}月{d}日({w}) {h}:{i}'
    }
  },

  init() {
    this.btn = document.getElementById('btn-lang');
    this.applySavedPreference();
    this.bindEvents();
  },

  applySavedPreference() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.currentLang = saved || 'en';
    this.updateUI();
  },

  bindEvents() {
    this.btn.addEventListener('click', () => this.toggle());
  },

  toggle() {
    this.currentLang = this.currentLang === 'en' ? 'zh' : 'en';
    localStorage.setItem(this.STORAGE_KEY, this.currentLang);
    this.updateUI();
  },

  t(key) {
    const keys = key.split('.');
    let val = this.translations[this.currentLang];
    for (const k of keys) {
      val = val[k];
    }
    return val || key;
  },

  updateUI() {
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang;

    // Update app title
    document.querySelector('.app-title').textContent = this.t('appTitle');

    // Update button titles
    document.getElementById('btn-export').title = this.t('printExport');
    document.getElementById('btn-dark-mode').title = this.t('darkMode');
    document.getElementById('btn-lang').title = this.currentLang === 'en' ? '切换中文' : 'Switch to English';

    // Update button icons - show language icon with text
    const langBtn = document.getElementById('btn-lang');
    langBtn.innerHTML = this.currentLang === 'en' ? '中' : 'EN';

    // Update weekday headers
    const weekdayEls = document.querySelectorAll('.weekday');
    const weekdays = this.t('weekdays');
    weekdayEls.forEach((el, i) => {
      el.textContent = weekdays[i];
    });

    // Update legend
    const legendItems = document.querySelectorAll('.legend-item');
    const legendKeys = ['day', 'night', 'rest', 'personal', 'sick', 'annual', 'holiday'];
    legendItems.forEach((el, i) => {
      if (i >= legendKeys.length) return;
      const key = legendKeys[i];
      const color = key === 'holiday' ? '#dc2626' : `var(--color-${key === 'day' ? 'day' : key})`;
      el.innerHTML = `<span class="legend-dot" style="background: ${color}"></span>${this.t('legend.' + key)}`;
    });

    // Update modal buttons
    document.getElementById('btn-delete').innerHTML = `<i data-lucide="trash-2"></i> ${this.t('modal.delete')}`;
    document.getElementById('btn-save').innerHTML = `<i data-lucide="save"></i> ${this.t('modal.save')}`;

    // Update modal status buttons
    const statusBtns = document.querySelectorAll('.status-btn');
    const statusKeys = ['day', 'night', 'rest', 'personal', 'sick', 'annual'];
    statusBtns.forEach((btn, i) => {
      const span = btn.querySelector('span');
      const dotColor = span ? span.style.background : '';
      btn.innerHTML = `<span class="status-dot" style="background: ${dotColor}"></span>${this.t('legend.' + statusKeys[i])}`;
    });

    // Update checkbox labels
    document.getElementById('label-charge').textContent = this.t('modal.chargeNurse');
    document.getElementById('label-preceptor').textContent = this.t('modal.preceptorNurse');

    // Update title (month/year)
    this.updateTitle();

    // Update status bar (if visible)
    if (typeof Calendar !== 'undefined' && Calendar._updateStatusBar) {
      Calendar._updateStatusBar();
    }

    lucide.createIcons();
  },

  updateTitle() {
    const monthNames = this.t('monthNames');
    document.getElementById('month-title').textContent = `${monthNames[Calendar.currentMonth - 1]} ${Calendar.currentYear}`;
  },

  formatTime(hours, minutes) {
    const m = Calendar._getOttawaDate();
    const month = m.getMonth() + 1;
    const date = m.getDate();
    const day = m.getDay(); // 0=Sun ... 6=Sat
    const weekday = this.t('weekdays')[day === 0 ? 6 : day - 1]; // Mon=0 ... Sun=6
    const template = this.t('ottawaTime');
    return template
      .replace('{m}', month)
      .replace('{d}', date)
      .replace('{w}', weekday)
      .replace('{h}', hours)
      .replace('{i}', String(minutes).padStart(2, '0'));
  },

  formatShiftStatus(template, params) {
    let text = template;
    for (const [key, val] of Object.entries(params)) {
      text = text.replace(`{${key}}`, val);
    }
    return text;
  }
};
