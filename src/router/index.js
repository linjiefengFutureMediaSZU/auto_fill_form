import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import i18n from '../i18n'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { title: 'routes.login', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/login/Register.vue'),
    meta: { title: 'routes.register', requiresAuth: false }
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('../views/login/ForgetPassword.vue'),
    meta: { title: 'routes.forgetPassword', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/account',
        name: 'Account',
        component: () => import('../views/account/Account.vue'),
        meta: { title: 'routes.account', requiresAuth: true }
      },
      {
        path: '/form',
        name: 'Form',
        component: () => import('../views/form/Form.vue'),
        meta: { title: 'routes.form', requiresAuth: true }
      },
      {
        path: '/formList',
        name: 'FormList',
        component: () => import('../views/formList/FormList.vue'),
        meta: { title: 'routes.formList', requiresAuth: true }
      },
      {
        path: '/data',
        name: 'Data',
        component: () => import('../views/data/Data.vue'),
        meta: { title: 'routes.data', requiresAuth: true }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/settings/Settings.vue'),
        meta: { title: 'routes.settings', requiresAuth: true }
      },
      {
          path: '/help',
          name: 'Help',
          component: () => import('../views/help/Help.vue'),
          meta: { title: 'routes.help', requiresAuth: true }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('../views/profile/Profile.vue'),
          meta: { title: 'routes.profile', requiresAuth: true }
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
    document.title = `${i18n.global.t(to.meta.title)} - ${i18n.global.t('appTitle')}`
  }
  
  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth !== false
  
  // 从 store 中获取登录状态，而不是仅依赖 localStorage
  // 注意：在路由守卫中访问 store 需要在 app.use(pinia) 之后
  // 这里我们保持逻辑简单，既然 store 不再持久化 isLoggedIn，
  // 我们在 App.vue 挂载时会处理初始跳转
  const isLoggedIn = localStorage.getItem('userInfo') !== null
  
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
