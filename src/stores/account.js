import { defineStore } from 'pinia'

// 账号管理store
export const useAccountStore = defineStore('account', {
  state: () => ({
    // 账号列表
    accounts: [
      {
        id: 1,
        group_id: 1,
        blogger_name: '张三',
        account_nickname: '测试账号1',
        account_type: '抖音',
        account_id: '123456789',
        homepage_url: 'https://www.douyin.com/123456789',
        fans_count: 100000,
        avg_read_count: 5000,
        like_count: 1000,
        comment_count: 200,
        quote_single: 1000.00,
        quote_package: 5000.00,
        cooperation_type: '图文,视频',
        is_swap: 1,
        contact: '13800138001',
        remark: '优质账号',
        status: 1
      },
      {
        id: 2,
        group_id: 1,
        blogger_name: '李四',
        account_nickname: '测试账号2',
        account_type: '小红书',
        account_id: '987654321',
        homepage_url: 'https://www.xiaohongshu.com/user/profile/987654321',
        fans_count: 50000,
        avg_read_count: 2000,
        like_count: 500,
        comment_count: 100,
        quote_single: 500.00,
        quote_package: 2000.00,
        cooperation_type: '图文',
        is_swap: 0,
        contact: '13900139001',
        remark: '潜力账号',
        status: 1
      },
      {
        id: 3,
        group_id: 2,
        blogger_name: '王五',
        account_nickname: '美妆达人',
        account_type: '小红书',
        account_id: '112233445',
        homepage_url: 'https://www.xiaohongshu.com/user/profile/112233445',
        fans_count: 150000,
        avg_read_count: 8000,
        like_count: 1500,
        comment_count: 300,
        quote_single: 1500.00,
        quote_package: 6000.00,
        cooperation_type: '图文,视频',
        is_swap: 1,
        contact: '13700137001',
        remark: '美妆领域优质账号',
        status: 1
      },
      {
        id: 4,
        group_id: 2,
        blogger_name: '赵六',
        account_nickname: '健身教练',
        account_type: '抖音',
        account_id: '556677889',
        homepage_url: 'https://www.douyin.com/556677889',
        fans_count: 200000,
        avg_read_count: 10000,
        like_count: 2000,
        comment_count: 400,
        quote_single: 2000.00,
        quote_package: 8000.00,
        cooperation_type: '视频',
        is_swap: 1,
        contact: '13600136001',
        remark: '健身领域头部账号',
        status: 1
      },
      {
        id: 5,
        group_id: 1,
        blogger_name: '孙七',
        account_nickname: '美食探店',
        account_type: '视频号',
        account_id: '998877665',
        homepage_url: 'https://channels.weixin.qq.com/web/pages/profile?username=998877665',
        fans_count: 80000,
        avg_read_count: 3000,
        like_count: 800,
        comment_count: 150,
        quote_single: 800.00,
        quote_package: 3000.00,
        cooperation_type: '图文,视频',
        is_swap: 0,
        contact: '13500135001',
        remark: '美食领域账号',
        status: 1
      },
      {
        id: 6,
        group_id: 2,
        blogger_name: '周八',
        account_nickname: '科技评测',
        account_type: 'B站',
        account_id: '445566778',
        homepage_url: 'https://space.bilibili.com/445566778',
        fans_count: 250000,
        avg_read_count: 12000,
        like_count: 2500,
        comment_count: 500,
        quote_single: 2500.00,
        quote_package: 10000.00,
        cooperation_type: '视频',
        is_swap: 1,
        contact: '13400134001',
        remark: '科技领域优质账号',
        status: 1
      },
      {
        id: 7,
        group_id: 1,
        blogger_name: '吴九',
        account_nickname: '母婴育儿',
        account_type: '小红书',
        account_id: '778899001',
        homepage_url: 'https://www.xiaohongshu.com/user/profile/778899001',
        fans_count: 90000,
        avg_read_count: 4000,
        like_count: 900,
        comment_count: 180,
        quote_single: 900.00,
        quote_package: 3500.00,
        cooperation_type: '图文',
        is_swap: 0,
        contact: '13300133001',
        remark: '母婴领域账号',
        status: 1
      },
      {
        id: 8,
        group_id: 2,
        blogger_name: '郑十',
        account_nickname: '旅行博主',
        account_type: '微博',
        account_id: '223344556',
        homepage_url: 'https://weibo.com/223344556',
        fans_count: 180000,
        avg_read_count: 6000,
        like_count: 1200,
        comment_count: 250,
        quote_single: 1800.00,
        quote_package: 7000.00,
        cooperation_type: '图文,视频',
        is_swap: 1,
        contact: '13200132001',
        remark: '旅行领域账号',
        status: 1
      }
    ],
    // 账号分组
    groups: [
      {
        id: 1,
        group_name: '抖音账号组',
        description: '抖音平台账号'
      },
      {
        id: 2,
        group_name: '小红书账号组',
        description: '小红书平台账号'
      },
      {
        id: 3,
        group_name: '视频号账号组',
        description: '微信视频号平台账号'
      },
      {
        id: 4,
        group_name: 'B站账号组',
        description: 'B站平台账号'
      },
      {
        id: 5,
        group_name: '微博账号组',
        description: '微博平台账号'
      }
    ],
    // 当前选中的账号
    selectedAccounts: [],
    // 用户信息
    userInfo: {
      username: '',
      name: ''
    },
    // 登录状态
    isLoggedIn: false
  }),
  getters: {
    // 获取正常状态的账号
    activeAccounts: (state) => {
      return state.accounts.filter(account => account.status === 1)
    },
    // 根据分组获取账号
    getAccountsByGroup: (state) => (groupId) => {
      return state.accounts.filter(account => account.group_id === groupId)
    },
    // 获取用户信息
    getUserInfo: (state) => {
      return state.userInfo
    },
    // 获取登录状态
    getLoginStatus: (state) => {
      return state.isLoggedIn
    }
  },
  actions: {
    // 添加账号
    addAccount(account) {
      const newId = Math.max(...this.accounts.map(a => a.id), 0) + 1
      this.accounts.push({ id: newId, ...account })
    },
    // 更新账号
    updateAccount(id, account) {
      const index = this.accounts.findIndex(a => a.id === id)
      if (index !== -1) {
        this.accounts[index] = { ...this.accounts[index], ...account }
      }
    },
    // 删除账号
    deleteAccount(id) {
      this.accounts = this.accounts.filter(a => a.id !== id)
    },
    // 选择账号
    selectAccount(id) {
      if (!this.selectedAccounts.includes(id)) {
        this.selectedAccounts.push(id)
      }
    },
    // 取消选择账号
    unselectAccount(id) {
      this.selectedAccounts = this.selectedAccounts.filter(aid => aid !== id)
    },
    // 全选账号
    selectAllAccounts() {
      this.selectedAccounts = this.activeAccounts.map(a => a.id)
    },
    // 取消全选
    unselectAllAccounts() {
      this.selectedAccounts = []
    },
    // 添加分组
    addGroup(group) {
      const newId = Math.max(...this.groups.map(g => g.id), 0) + 1
      this.groups.push({ id: newId, ...group })
    },
    // 更新分组
    updateGroup(id, group) {
      const index = this.groups.findIndex(g => g.id === id)
      if (index !== -1) {
        this.groups[index] = { ...this.groups[index], ...group }
      }
    },
    // 删除分组
    deleteGroup(id) {
      this.groups = this.groups.filter(g => g.id !== id)
      // 同时更新该分组下的账号
      this.accounts.forEach(account => {
        if (account.group_id === id) {
          account.group_id = null
        }
      })
    },
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    // 设置登录状态
    setLoginStatus(status) {
      this.isLoggedIn = status
      localStorage.setItem('isLoggedIn', status.toString())
    },
    // 退出登录
    logout() {
      this.userInfo = {
        username: '',
        name: ''
      }
      this.isLoggedIn = false
      localStorage.removeItem('userInfo')
      localStorage.removeItem('isLoggedIn')
    },
    // 初始化登录状态
    initLoginStatus() {
      const savedUserInfo = localStorage.getItem('userInfo')
      const savedLoginStatus = localStorage.getItem('isLoggedIn')
      
      if (savedUserInfo) {
        this.userInfo = JSON.parse(savedUserInfo)
      }
      
      this.isLoggedIn = savedLoginStatus === 'true'
    }
  }
})
