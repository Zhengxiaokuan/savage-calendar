const db = wx.cloud.database()
const _ = db.command
const workoutCollection = db.collection('workout_records')
const exerciseCollection = db.collection('exercises')

/**
 * 获取指定日期的训练记录
 */
function getWorkoutByDate(date) {
  return workoutCollection.where({ date }).get().then(res => {
    return res.data.length > 0 ? res.data[0] : null
  })
}

/**
 * 获取指定月份的所有训练记录（用于日历标记）
 * 返回: ['2026-05-01', '2026-05-03', ...]
 */
function getWorkoutDatesInMonth(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${endDate}`
  return workoutCollection.where({
    date: _.gte(start).and(_.lte(end))
  }).field({ date: true }).get().then(res => {
    return res.data.map(item => item.date)
  })
}

/**
 * 保存训练记录（新增或覆盖）
 */
function saveWorkout(record) {
  const { date, exercises, note } = record
  // 先查是否存在，存在则更新，不存在则新增
  return workoutCollection.where({ date }).get().then(res => {
    if (res.data.length > 0) {
      return workoutCollection.doc(res.data[0]._id).update({
        data: {
          exercises,
          note: note || '',
          updateTime: db.serverDate()
        }
      })
    } else {
      return workoutCollection.add({
        data: {
          date,
          exercises,
          note: note || '',
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    }
  })
}

/**
 * 获取指定年份的训练汇总：天数、动作数、组数
 */
function getYearStats(year) {
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  return workoutCollection.where({
    date: _.gte(start).and(_.lte(end))
  }).field({ exercises: true }).get().then(res => {
    let totalExercises = 0
    let totalSets = 0
    res.data.forEach(record => {
      record.exercises.forEach(ex => {
        totalExercises++
        totalSets += ex.sets.length
      })
    })
    return {
      totalDays: res.data.length,
      totalExercises,
      totalSets
    }
  })
}

/**
 * 获取所有动作
 */
function getExercises() {
  return exerciseCollection.orderBy('createTime', 'asc').get().then(res => {
    return res.data
  })
}

/**
 * 按分类获取动作
 */
function getExercisesByCategory() {
  return exerciseCollection.orderBy('createTime', 'asc').get().then(res => {
    const categories = {}
    res.data.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = []
      }
      categories[item.category].push(item)
    })
    return categories
  })
}

/**
 * 新增自定义动作
 */
function addExercise(name, category) {
  return exerciseCollection.add({
    data: {
      name,
      category,
      isCustom: true,
      createTime: db.serverDate()
    }
  })
}

/**
 * 删除自定义动作
 */
function deleteExercise(id) {
  return exerciseCollection.doc(id).remove()
}

module.exports = {
  getWorkoutByDate,
  getWorkoutDatesInMonth,
  getYearStats,
  saveWorkout,
  getExercises,
  getExercisesByCategory,
  addExercise,
  deleteExercise
}
