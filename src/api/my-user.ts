import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface MyUserVo {
  id: number
  name: string
  asName?: string
  birthday?: string
  sex?: string
  email?: string
  address?: string
  age?: number
}

export function getMyUserList(params?: PageParams) {
  return request.get<PageResult<MyUserVo>>('/my-users', { params })
}

export function getMyUserDetail(id: string | number) {
  return request.get<MyUserVo>(`/my-users/${id}`)
}
