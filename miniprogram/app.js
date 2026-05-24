App({
  globalData: {
    dbInitialized: false
  },

  onLaunch() {
    wx.cloud.init({
      env: 'YOUR_CLOUD_ENV_ID',
      traceUser: true
    })
    this.globalData.dbInitialized = true
  }
})
