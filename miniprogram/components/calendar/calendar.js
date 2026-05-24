const { buildCalendarGrid } = require('../../utils/util')

Component({
  properties: {
    year: {
      type: Number,
      value: new Date().getFullYear()
    },
    month: {
      type: Number,
      value: new Date().getMonth() + 1
    },
    markedDates: {
      type: Array,
      value: []
    }
  },

  data: {
    days: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六']
  },

  observers: {
    'year, month, markedDates': function () {
      this.buildDays()
    }
  },

  methods: {
    buildDays() {
      const { year, month, markedDates } = this.data
      const days = buildCalendarGrid(year, month)
      days.forEach(d => {
        d.isMarked = markedDates.includes(d.date)
      })
      this.setData({ days })
    },

    prevMonth() {
      let { year, month } = this.data
      if (month === 1) {
        year--
        month = 12
      } else {
        month--
      }
      this.setData({ year, month })
      this.triggerEvent('monthChange', { year, month })
    },

    nextMonth() {
      let { year, month } = this.data
      if (month === 12) {
        year++
        month = 1
      } else {
        month++
      }
      this.setData({ year, month })
      this.triggerEvent('monthChange', { year, month })
    },

    onDateTap(e) {
      const { date, isCurrentMonth } = e.currentTarget.dataset
      if (!isCurrentMonth) return
      this.triggerEvent('dateTap', { date })
    }
  }
})
