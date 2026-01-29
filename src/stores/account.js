import { defineStore } from 'pinia'

// 账号管理store
export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: [],
    groups: [],
    selectedAccounts: [],
    userInfo: {
      id: null,
      username: '',
      nickname: '',
      email: '',
      phone: '',
      avatar: '',
      role: '',
      created_at: ''
    },
    isLoggedIn: false,
    loading: false
  }),
  getters: {
    activeAccounts: (state) => {
      return state.accounts.filter(account => account.status === 1)
    },
    getAccountsByGroup: (state) => (groupId) => {
      return state.accounts.filter(account => account.group_id === groupId)
    }
  },
  actions: {
    // 从数据库加载初始数据
    async loadInitialData() {
      if (!window.electronAPI) return;
      this.loading = true;
      try {
        const [accounts, groups] = await Promise.all([
          window.electronAPI.account.getAll(),
          window.electronAPI.account.getGroups()
        ]);
        this.accounts = accounts || [];
        this.groups = groups || [];
      } catch (error) {
        console.error('Failed to load accounts/groups:', error);
      } finally {
        this.loading = false;
      }
    },

    // 添加账号
    async addAccount(account) {
      if (!window.electronAPI) return;
      try {
        const newId = await window.electronAPI.account.add(account);
        this.accounts.push({ id: newId, ...account });
      } catch (error) {
        console.error('Failed to add account:', error);
        throw error;
      }
    },

    // 更新账号
    async updateAccount(id, account) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.account.update(id, account);
        const index = this.accounts.findIndex(a => a.id === id);
        if (index !== -1) {
          this.accounts[index] = { ...this.accounts[index], ...account };
        }
      } catch (error) {
        console.error('Failed to update account:', error);
        throw error;
      }
    },

    // 删除账号
    async deleteAccount(id) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.account.delete(id);
        this.accounts = this.accounts.filter(a => a.id !== id);
      } catch (error) {
        console.error('Failed to delete account:', error);
        throw error;
      }
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

    // 分组操作
    async addGroup(group) {
      if (!window.electronAPI) return;
      try {
        const newId = await window.electronAPI.group.add(group);
        this.groups.push({ id: newId, ...group });
      } catch (error) {
        console.error('Failed to add group:', error);
        throw error;
      }
    },
    async updateGroup(id, group) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.group.update(id, group);
        const index = this.groups.findIndex(g => g.id === id);
        if (index !== -1) {
          this.groups[index] = { ...this.groups[index], ...group };
        }
      } catch (error) {
        console.error('Failed to update group:', error);
        throw error;
      }
    },
    async deleteGroup(id) {
      if (!window.electronAPI) return;
      try {
        await window.electronAPI.group.delete(id);
        this.groups = this.groups.filter(g => g.id !== id);
        // 更新账号列表中的 group_id
        this.accounts.forEach(account => {
          if (account.group_id === id) {
            account.group_id = null;
          }
        });
      } catch (error) {
        console.error('Failed to delete group:', error);
        throw error;
      }
    },

    // 用户信息相关
    setUserInfo(userInfo) {
      // 兼容旧数据结构，将 name 映射到 nickname
      if (userInfo.name && !userInfo.nickname) {
        userInfo.nickname = userInfo.name;
      }
      this.userInfo = { ...this.userInfo, ...userInfo }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },
    setLoginStatus(status) {
      this.isLoggedIn = status
      // 不再持久化登录状态到 localStorage，确保应用重启后默认需要登录
    },
    logout() {
      this.userInfo = {
        id: null,
        username: '',
        nickname: '',
        email: '',
        phone: '',
        avatar: '',
        role: '',
        created_at: ''
      }
      this.isLoggedIn = false
      localStorage.removeItem('userInfo')
    },
    initLoginStatus() {
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedUserInfo) {
        try {
          this.userInfo = JSON.parse(savedUserInfo)
        } catch (e) {
          console.error('Failed to parse user info:', e)
        }
      }
      // 默认不从 localStorage 读取登录状态
      this.isLoggedIn = false
    },

    // 更新用户头像
    async updateAvatar(base64Data) {
      if (!this.userInfo.id) return;
      
      if (!window.electronAPI) {
         // Fallback for browser preview
         this.setUserInfo({ avatar: base64Data });
         return true;
      }

      try {
        const result = await window.electronAPI.auth.saveAvatar(this.userInfo.id, base64Data);
        if (result.success) {
          this.setUserInfo({ avatar: result.avatarUrl });
          return true;
        }
        throw new Error(result.message);
      } catch (error) {
        console.error('Failed to update avatar:', error);
        throw error;
      }
    },

    // 更新用户资料
    async updateProfile(data) {
      if (!window.electronAPI || !this.userInfo.id) return;
      try {
        const result = await window.electronAPI.auth.updateProfile(this.userInfo.id, data);
        if (result.success) {
          this.setUserInfo(result.user);
          return true;
        }
        throw new Error(result.message);
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    }
  }
})
