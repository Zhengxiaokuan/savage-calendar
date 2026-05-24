const { getWorkoutByDate, saveWorkout, getExercisesByCategory } = require('../../utils/db')

Page({
  data: {
    date: '',
    exercises: [],
    note: '',
    showExercisePicker: false,
    exerciseCategories: {},
    currentCategory: '',
    selectedExercises: [],
    saving: false
  },

  onLoad(options) {
    const date = options.date || this.getTodayStr()
    this.setData({ date })

    // 加载动作库
    this.loadExercises()

    // 加载已有记录
    if (options.date) {
      this.loadExisting(options.date)
    }
  },

  getTodayStr() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  },

  loadExercises() {
    getExercisesByCategory().then(categories => {
      this.setData({ exerciseCategories: categories })
      const keys = Object.keys(categories)
      if (keys.length > 0 && !this.data.currentCategory) {
        this.setData({ currentCategory: keys[0] })
      }
    }).catch(() => {
      wx.showToast({ title: '加载动作库失败', icon: 'none' })
    })
  },

  loadExisting(date) {
    getWorkoutByDate(date).then(record => {
      if (record) {
        // 确保每个 set 都有 sort 字段
        record.exercises.forEach(ex => {
          ex.sets.forEach((s, i) => {
            if (!s.sort) s.sort = i + 1
          })
        })
        this.setData({
          exercises: record.exercises,
          note: record.note || ''
        })
      }
    }).catch(() => {})
  },

  // 打开动作选择器
  onOpenExercisePicker() {
    this.setData({ showExercisePicker: true })
  },

  // 关闭动作选择器
  onCloseExercisePicker() {
    this.setData({ showExercisePicker: false })
  },

  // 切换分类
  onSwitchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
  },

  // 选择要添加的动作
  onToggleExercise(e) {
    const { exercise } = e.currentTarget.dataset
    const { selectedExercises } = this.data
    const idx = selectedExercises.findIndex(e => e._id === exercise._id)
    if (idx > -1) {
      selectedExercises.splice(idx, 1)
    } else {
      selectedExercises.push(exercise)
    }
    this.setData({ selectedExercises })
  },

  // 确认添加选中动作
  onConfirmAddExercises() {
    const { exercises, selectedExercises } = this.data
    const existingIds = new Set(exercises.map(e => e.exerciseId))

    selectedExercises.forEach(ex => {
      if (!existingIds.has(ex._id)) {
        exercises.push({
          exerciseId: ex._id,
          name: ex.name,
          category: ex.category,
          sets: [{ reps: 10, weight: 0, sort: 1 }]
        })
        existingIds.add(ex._id)
      }
    })

    this.setData({
      exercises,
      selectedExercises: [],
      showExercisePicker: false
    })
  },

  // 删除动作
  onRemoveExercise(e) {
    const idx = e.currentTarget.dataset.index
    const { exercises } = this.data
    exercises.splice(idx, 1)
    this.setData({ exercises })
  },

  // 修改次数
  onRepsChange(e) {
    const { exIndex, setIndex } = e.currentTarget.dataset
    const value = e.detail
    const key = `exercises[${exIndex}].sets[${setIndex}].reps`
    this.setData({ [key]: value })
  },

  // 修改重量
  onWeightChange(e) {
    const { exIndex, setIndex } = e.currentTarget.dataset
    const value = e.detail
    const key = `exercises[${exIndex}].sets[${setIndex}].weight`
    this.setData({ [key]: value })
  },

  // 删除一组
  onRemoveSet(e) {
    const { exIndex, setIndex } = e.currentTarget.dataset
    const key = `exercises[${exIndex}]`
    const exercise = this.data.exercises[exIndex]
    exercise.sets.splice(setIndex, 1)
    // 重新排序
    exercise.sets.forEach((s, i) => { s.sort = i + 1 })
    // 如果组数为0则删除该动作
    if (exercise.sets.length === 0) {
      this.onRemoveExercise(e)
    } else {
      this.setData({ [key]: exercise })
    }
  },

  // 添加一组
  onAddSet(e) {
    const { exIndex } = e.currentTarget.dataset
    const key = `exercises[${exIndex}]`
    const exercise = this.data.exercises[exIndex]
    const lastSet = exercise.sets[exercise.sets.length - 1]
    exercise.sets.push({
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 0,
      sort: exercise.sets.length + 1
    })
    this.setData({ [key]: exercise })
  },

  // 修改备注
  onNoteChange(e) {
    this.setData({ note: e.detail.value })
  },

  // 保存
  onSave() {
    const { date, exercises, note } = this.data

    if (exercises.length === 0) {
      wx.showToast({ title: '请至少添加一个动作', icon: 'none' })
      return
    }

    // 检查每组数据有效性
    for (const ex of exercises) {
      for (const s of ex.sets) {
        if (s.reps < 1) {
          wx.showToast({ title: `${ex.name} 次数不能为0`, icon: 'none' })
          return
        }
      }
    }

    this.setData({ saving: true })

    saveWorkout({ date, exercises, note }).then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      console.error('保存失败', err)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }).finally(() => {
      this.setData({ saving: false })
    })
  },

  // 该动作是否已被选中（在动作选择器中）
  isSelected(exerciseId) {
    return this.data.selectedExercises.some(e => e._id === exerciseId)
  }
})
