import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/login/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/account',
        name: 'Account',
        component: () => import('../views/account/Account.vue'),
        meta: { title: '账号管理', requiresAuth: true }
      },
      {
        path: '/form',
        name: 'Form',
        component: () => import('../views/form/Form.vue'),
        meta: { title: '表单填写', requiresAuth: true }
      },
      {
        path: '/formList',
        name: 'FormList',
        component: () => import('../views/formList/FormList.vue'),
        meta: { title: '表单列表', requiresAuth: true }
      },
      {
        path: '/data',
        name: 'Data',
        component: () => import('../views/data/Data.vue'),
        meta: { title: '数据管理', requiresAuth: true }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/settings/Settings.vue'),
        meta: { title: '基础设置', requiresAuth: true }
      },
      {
          path: '/help',
          name: 'Help',
          component: () => import('../views/help/Help.vue'),
          meta: { title: '帮助与反馈', requiresAuth: true }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('../views/profile/Profile.vue'),
          meta: { title: '个人中心', requiresAuth: true }
        }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫，设置页面标题和登录验证
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 多账号表单自动填写工具`
  }
  
  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth !== false
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    // 已登录但访问登录页，跳转到首页
    next('/account')
  } else {
    // 其他情况正常跳转
    next()
  }
})

export default router
