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
        
        // 解析 accounts 中的 extra_json
        this.accounts = (accounts || []).map(account => {
          if (account.extra_json) {
            try {
              const extra = JSON.parse(account.extra_json);
              return { ...account, ...extra };
            } catch (e) {
              console.error('Failed to parse extra_json for account', account.id, e);
              return account;
            }
          }
          return account;
        });
        
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
        
        // 解析 extra_json 以便在 UI 中显示
        let newAccount = { id: newId, ...account };
        if (newAccount.extra_json) {
          try {
            const extra = JSON.parse(newAccount.extra_json);
            newAccount = { ...newAccount, ...extra };
          } catch (e) {
             console.error('Failed to parse extra_json for new account', e);
          }
        }
        
        this.accounts.unshift(newAccount);
      } catch (error) {
        console.error('Failed to add account:', error);
        throw error;
      }
    },

    // 更新账号
    async updateAccount(id, account) {
      if (!window.electronAPI) return;
      console.log('Store: updateAccount called', id);
      try {
        await window.electronAPI.account.update(id, account);
        console.log('Store: IPC update returned');
        const index = this.accounts.findIndex(a => a.id === id);
        if (index !== -1) {
          // 解析 extra_json 以便更新 UI 状态
          let updatedFields = { ...account };
          if (updatedFields.extra_json) {
            try {
              const extra = JSON.parse(updatedFields.extra_json);
              updatedFields = { ...updatedFields, ...extra };
            } catch (e) {
              console.error('Failed to parse extra_json for updated account', e);
            }
          }
          this.accounts[index] = { ...this.accounts[index], ...updatedFields };
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
    setLoginStatus(status, remember = false) {
      this.isLoggedIn = status
      if (remember && status) {
        localStorage.setItem('isLoggedIn', 'true')
      } else {
        localStorage.removeItem('isLoggedIn')
      }
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
      localStorage.removeItem('isLoggedIn')
    },
    // 初始化登录状态
    initLoginStatus() {
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedUserInfo) {
        try {
          const parsed = JSON.parse(savedUserInfo)
          // 验证数据完整性，必须包含 id
          if (parsed && parsed.id) {
            this.userInfo = parsed
          } else {
            // 数据无效，清理缓存
            localStorage.removeItem('userInfo')
            localStorage.removeItem('isLoggedIn')
          }
        } catch (e) {
          console.error('Failed to parse user info:', e)
          localStorage.removeItem('userInfo')
        }
      }
      // 从 localStorage 读取登录状态
      // 注意：为了安全性或用户要求，这里不再自动恢复 isLoggedIn 状态
      // 用户每次打开应用都需要重新登录
      this.isLoggedIn = false 
      // this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    },

    // 从数据库获取最新用户信息
    async fetchUserInfo() {
      if (!window.electronAPI || !this.userInfo.id) return { success: false, message: '环境或ID缺失' };
      
      // 检查 API 是否存在（处理热更新未生效的情况）
      if (!window.electronAPI.auth || !window.electronAPI.auth.getUser) {
        console.warn('getUser API not found. Restart required.');
        return { success: false, code: 'RESTART_REQUIRED', message: '请重启应用' };
      }

      try {
        const result = await window.electronAPI.auth.getUser(this.userInfo.id);
        if (result.success) {
          this.setUserInfo(result.user);
        } else {
          console.error('Failed to fetch user info:', result.message);
        }
        return result;
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        return { success: false, message: error.message };
      }
    },

    // 更新用户头像
    async updateAvatar(base64Data) {
      if (!window.electronAPI || !this.userInfo.id) return;
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
