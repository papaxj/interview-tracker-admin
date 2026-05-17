import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import { getToken } from '@/utils/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: 'company',
        name: 'Company',
        component: () => import('@/views/company/index.vue'),
        meta: { title: '公司管理' },
      },
      {
        path: 'company/form/:id?',
        name: 'CompanyForm',
        component: () => import('@/views/company/form.vue'),
        meta: { title: '公司表单' },
      },
      {
        path: 'application',
        name: 'Application',
        component: () => import('@/views/application/index.vue'),
        meta: { title: '投递记录' },
      },
      {
        path: 'application/:id',
        name: 'ApplicationDetail',
        component: () => import('@/views/application/detail.vue'),
        meta: { title: '投递详情' },
      },
      {
        path: 'interview',
        name: 'Interview',
        component: () => import('@/views/interview/index.vue'),
        meta: { title: '面试管理' },
      },
      {
        path: 'interview/kanban',
        name: 'InterviewKanban',
        component: () => import('@/views/interview/kanban.vue'),
        meta: { title: '面试看板' },
      },
      {
        path: 'offer',
        name: 'Offer',
        component: () => import('@/views/offer/index.vue'),
        meta: { title: 'Offer' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  if (to.meta.public) {
    next()
    return
  }
  if (!getToken()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
