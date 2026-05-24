/**
 * 日期格式化 yyyy-MM-dd
 */
function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 获取当前年月日对象
 */
function getToday() {
  return new Date()
}

/**
 * 获取指定年月的天数
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/**
 * 获取指定年月的第一天是星期几 (0=日, 1=一, ..., 6=六)
 */
function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * 生成月份日历数据
 * 返回: [{ date: '2026-05-01', day: 1, isCurrentMonth: true, isToday: false }]
 */
function buildCalendarGrid(year, month) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = getToday()
  const todayStr = formatDate(today)
  const days = []

  // 上月补齐
  const prevMonthDays = getDaysInMonth(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1)
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const m = month === 1 ? 12 : month - 1
    const y = month === 1 ? year - 1 : year
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === todayStr })
  }

  // 当前月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: dateStr, day: d, isCurrentMonth: true, isToday: dateStr === todayStr })
  }

  // 下月补齐 (6行 x 7列 = 42)
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 12 ? 1 : month + 1
    const y = month === 12 ? year + 1 : year
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === todayStr })
  }

  return days
}

module.exports = {
  formatDate,
  getToday,
  getDaysInMonth,
  getFirstDayOfMonth,
  buildCalendarGrid
}
