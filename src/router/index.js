import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/account'
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/account/Account.vue'),
    meta: { title: '账号管理' }
  },
  {
    path: '/form',
    name: 'Form',
    component: () => import('../views/form/Form.vue'),
    meta: { title: '表单填写' }
  },
  {
    path: '/formList',
    name: 'FormList',
    component: () => import('../views/formList/FormList.vue'),
    meta: { title: '表单列表' }
  },
  {
    path: '/data',
    name: 'Data',
    component: () => import('../views/data/Data.vue'),
    meta: { title: '数据管理' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/settings/Settings.vue'),
    meta: { title: '基础设置' }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/help/Help.vue'),
    meta: { title: '帮助与反馈' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫，设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 多账号表单自动填写工具`
  }
  next()
})

export default router
