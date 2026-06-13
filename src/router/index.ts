import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
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
        path: 'offer',
        name: 'Offer',
        component: () => import('@/views/offer/index.vue'),
        meta: { title: 'Offer' },
      },
      {
        path: 'identity',
        name: 'Identity',
        component: () => import('@/views/identity/index.vue'),
        meta: { title: '身份信息查询' },
      },
      {
        path: 'dict',
        name: 'Dict',
        component: () => import('@/views/dict/index.vue'),
        meta: { title: '数据字典' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
