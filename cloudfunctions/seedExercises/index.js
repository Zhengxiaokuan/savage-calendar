// 云函数入口文件 - 初始化预设动作库（幂等：重复执行只插入缺失项）
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

const PRESET_EXERCISES = [
  // 推力
  { name: '俯卧撑', category: '推力' },
  { name: '哑铃卧推', category: '推力' },
  { name: '哑铃飞鸟', category: '推力' },
  { name: '臂屈伸', category: '推力' },
  { name: '窄距俯卧撑', category: '推力' },

  // 拉力
  { name: '引体向上', category: '拉力' },
  { name: '哑铃划船', category: '拉力' },
  { name: '面拉', category: '拉力' },

  // 腿部
  { name: '深蹲', category: '腿部' },
  { name: '弓步蹲', category: '腿部' },
  { name: '罗马尼亚硬拉', category: '腿部' },
  { name: '提踵', category: '腿部' },
  { name: '保加利亚分腿蹲', category: '腿部' },

  // 肩部
  { name: '哑铃推举', category: '肩部' },
  { name: '侧平举', category: '肩部' },
  { name: '前平举', category: '肩部' },
  { name: '俯身飞鸟', category: '肩部' },

  // 核心
  { name: '平板支撑', category: '核心' },
  { name: '卷腹', category: '核心' },
  { name: '俄罗斯转体', category: '核心' },
  { name: '悬垂举腿', category: '核心' },
  { name: '登山者', category: '核心' },

  // 有氧
  { name: '跳绳', category: '有氧' },
  { name: '波比跳', category: '有氧' },
  { name: '开合跳', category: '有氧' },
  { name: '高抬腿', category: '有氧' },
]

exports.main = async () => {
  const collection = db.collection('exercises')

  // 云数据库单次 get 默认上限 100/20，这里动作量级很小，一次足够
  const existing = await collection.field({ name: true }).get()
  const existingNames = new Set(existing.data.map(item => item.name))

  const toInsert = PRESET_EXERCISES.filter(ex => !existingNames.has(ex.name))

  if (toInsert.length === 0) {
    return { total: PRESET_EXERCISES.length, skipped: PRESET_EXERCISES.length, inserted: 0 }
  }

  const results = await Promise.all(
    toInsert.map(ex => collection.add({
      data: { ...ex, isCustom: false, createTime: db.serverDate() }
    }))
  )

  return {
    total: PRESET_EXERCISES.length,
    skipped: PRESET_EXERCISES.length - toInsert.length,
    inserted: results.filter(r => r._id).length
  }
}
