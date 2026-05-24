const { getWorkoutDatesInMonth, getWorkoutByDate, getYearStats } = require('../../utils/db')

Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    markedDates: [],
    selectedDate: '',
    selectedWorkout: null,
    isToday: false,
    stats: { totalDays: 0, totalExercises: 0, totalSets: 0 },
    loading: false
  },

  onLoad() {
    const today = new Date()
    const dateStr = this.formatDateStr(today)
    this.setData({
      selectedDate: dateStr,
      isToday: true
    })
    this.loadMonthData()
    this.checkSelectedDate()
  },

  onShow() {
    // 从其他页面返回时刷新数据
    this.loadMonthData()
    this.checkSelectedDate()
  },

  // 加载当前月份的标记日期和统计数据
  loadMonthData() {
    const { year, month } = this.data
    this.setData({ loading: true })

    getWorkoutDatesInMonth(year, month).then(dates => {
      this.setData({ markedDates: dates })
    }).catch(err => {
      console.error('加载训练日期失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })

    // 计算年度统计
    this.loadYearStats(year)
  },

  loadYearStats(year) {
    getYearStats(year).then(stats => {
      this.setData({ stats })
    }).catch(() => {})
  },

  // 检查选中日期是否有训练记录
  checkSelectedDate() {
    const { selectedDate } = this.data
    if (!selectedDate) return

    getWorkoutByDate(selectedDate).then(record => {
      this.setData({ selectedWorkout: record })
    }).catch(() => {})
  },

  // 日历月份切换
  onMonthChange(e) {
    const { year, month } = e.detail
    this.setData({ year, month })
    this.loadMonthData()
  },

  // 点击日期
  onDateTap(e) {
    const { date } = e.detail
    this.setData({ selectedDate: date }, () => {
      this.checkSelectedDate()
    })
  },

  // 添加训练
  onAddWorkout() {
    const { selectedDate } = this.data
    wx.navigateTo({
      url: `/pages/workout/workout?date=${selectedDate}`
    })
  },

  // 编辑训练
  onEditWorkout() {
    const { selectedDate } = this.data
    wx.navigateTo({
      url: `/pages/workout/workout?date=${selectedDate}`
    })
  },

  // 查看详情
  onViewDetail() {
    const { selectedDate } = this.data
    wx.navigateTo({
      url: `/pages/history/history?date=${selectedDate}`
    })
  },

  // 管理动作库
  onManageExercises() {
    wx.navigateTo({
      url: '/pages/exercise/exercise'
    })
  },

  formatDateStr(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
})
