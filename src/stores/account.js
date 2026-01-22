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
      }
    ],
    // 当前选中的账号
    selectedAccounts: []
  }),
  getters: {
    // 获取正常状态的账号
    activeAccounts: (state) => {
      return state.accounts.filter(account => account.status === 1)
    },
    // 根据分组获取账号
    getAccountsByGroup: (state) => (groupId) => {
      return state.accounts.filter(account => account.group_id === groupId)
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
    }
  }
})
