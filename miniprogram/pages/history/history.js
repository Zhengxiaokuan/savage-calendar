const { getWorkoutByDate } = require('../../utils/db')

Page({
  data: {
    date: '',
    record: null,
    stats: { totalExercises: 0, totalSets: 0 },
    loading: true
  },

  onLoad(options) {
    const date = options.date || ''
    this.setData({ date })
    if (date) {
      this.loadRecord(date)
    }
  },

  loadRecord(date) {
    this.setData({ loading: true })
    getWorkoutByDate(date).then(record => {
      if (record) {
        // 计算统计
        let totalSets = 0
        record.exercises.forEach(ex => {
          totalSets += ex.sets.length
        })
        this.setData({
          record,
          stats: {
            totalExercises: record.exercises.length,
            totalSets
          }
        })
      } else {
        wx.showToast({ title: '未找到训练记录', icon: 'none' })
      }
    }).catch(err => {
      console.error('加载训练详情失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 跳转到编辑
  onEdit() {
    const { date } = this.data
    wx.navigateTo({
      url: `/pages/workout/workout?date=${date}`
    })
  }
})
