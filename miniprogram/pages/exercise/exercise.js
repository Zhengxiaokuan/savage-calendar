const { getExercisesByCategory, addExercise, deleteExercise } = require('../../utils/db')

Page({
  data: {
    categories: {},
    currentCategory: '',
    showAddDialog: false,
    newExerciseName: '',
    selectedCategory: '',
    categoryKeys: ['推力', '拉力', '腿部', '肩部', '核心', '有氧']
  },

  onLoad() {
    this.loadExercises()
  },

  onShow() {
    this.loadExercises()
  },

  loadExercises() {
    getExercisesByCategory().then(categories => {
      this.setData({ categories })
      const keys = Object.keys(categories)
      if (keys.length > 0 && !this.data.currentCategory) {
        this.setData({ currentCategory: keys[0] })
      }
    }).catch(err => {
      console.error('加载动作库失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  // 切换分类
  onSwitchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
  },

  // 打开新增动作弹窗
  onOpenAddDialog() {
    const { currentCategory } = this.data
    this.setData({
      showAddDialog: true,
      newExerciseName: '',
      selectedCategory: currentCategory || this.data.categoryKeys[0]
    })
  },

  // 关闭新增弹窗
  onCloseAddDialog() {
    this.setData({ showAddDialog: false })
  },

  // 输入动作名
  onNameInput(e) {
    this.setData({ newExerciseName: e.detail.value })
  },

  // 选择分类
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ selectedCategory: category })
  },

  // 确认新增
  onConfirmAdd() {
    const { newExerciseName, selectedCategory } = this.data
    if (!newExerciseName.trim()) {
      wx.showToast({ title: '请输入动作名称', icon: 'none' })
      return
    }

    addExercise(newExerciseName.trim(), selectedCategory).then(() => {
      wx.showToast({ title: '添加成功', icon: 'success' })
      this.setData({
        showAddDialog: false,
        newExerciseName: ''
      })
      this.loadExercises()
    }).catch(err => {
      console.error('添加动作失败', err)
      wx.showToast({ title: '添加失败', icon: 'none' })
    })
  },

  // 删除动作
  onDeleteExercise(e) {
    const { id, name, isCustom } = e.currentTarget.dataset
    if (!isCustom) {
      wx.showToast({ title: '预设动作不可删除', icon: 'none' })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteExercise(id).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadExercises()
          }).catch(err => {
            console.error('删除失败', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          })
        }
      }
    })
  }
})
