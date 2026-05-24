# 野蛮日历 (savage-calendar)

> 一款基于微信云开发的健身训练记录小程序，用日历直观呈现你的训练频率与年度积累。

## ✨ 功能

- **日历视图**：标记有训练记录的日期，点击查看当日训练摘要
- **训练记录**：按动作 / 组数 / 次数 / 重量记录，支持新增、编辑、覆盖保存
- **动作库**：内置 27 个预设动作（推/拉/腿/肩/核心/有氧），支持自定义增删
- **历史详情**：查看任意一天的完整训练数据
- **年度统计**：训练天数、总动作数、总组数

## 🛠 技术栈

- 微信小程序（基础库 3.6.0）
- 微信云开发 —— 云数据库 + 云函数
- [Vant Weapp](https://vant-ui.github.io/vant-weapp/) `^1.11.0`

## 📁 目录结构

```
savage-calendar/
├── miniprogram/
│   ├── app.js / app.json / app.wxss     # 入口（深色主题）
│   ├── pages/
│   │   ├── calendar/    # 首页：月历 + 当日训练 + 年度统计
│   │   ├── workout/     # 新增/编辑训练记录
│   │   ├── exercise/    # 动作库管理
│   │   └── history/     # 训练历史详情
│   ├── components/calendar/   # 自定义月历组件
│   ├── utils/db.js      # 云数据库封装（数据层）
│   └── style/
├── cloudfunctions/
│   └── seedExercises/   # 预设动作初始化（幂等）
└── project.config.json
```

## 🗄 数据模型

### `workout_records` —— 训练记录（按日期一日一条）

```js
{
  date: '2026-05-25',           // 主键
  exercises: [
    {
      exerciseId: '...',
      name: '俯卧撑',
      category: '推力',
      sets: [{ reps: 10, weight: 0, sort: 1 }]
    }
  ],
  note: '',
  createTime, updateTime
}
```

### `exercises` —— 动作字典

```js
{ name: '俯卧撑', category: '推力', isCustom: false, createTime }
```

## 🚀 本地运行

1. **克隆代码**
   ```bash
   git clone https://github.com/Zhengxiaokuan/savage-calendar.git
   ```

2. **微信开发者工具打开项目根目录**

3. **替换云环境 ID**
   编辑 `miniprogram/app.js`，把 `YOUR_CLOUD_ENV_ID` 改为你在云开发控制台拿到的环境 ID。

4. **构建 npm**
   开发者工具菜单：**工具 → 构建 npm**（生成 `miniprogram_npm/`，Vant Weapp 需要）。

5. **部署云函数**
   右键 `cloudfunctions/seedExercises` → **上传并部署：云端安装依赖**。

6. **初始化动作库**
   云开发控制台找到 `seedExercises`，点击"云端测试"执行一次。该函数幂等：
   - 首次执行：插入 27 条预设动作
   - 重复执行：返回 `skipped` 计数，不会产生重复数据

7. **集合权限**
   在云开发控制台为 `workout_records` 和 `exercises` 设置合适的权限（默认"仅创建者可读写"通常即可）。

## 📝 License

MIT
