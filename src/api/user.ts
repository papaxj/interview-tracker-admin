import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface SysUserVo {
  id: number
  username: string
  nickname?: string
  email?: string
  avatar?: string
  phone?: string
  status?: number
  lastLoginTime?: string
  createdAt?: string
  updatedAt?: string
}

export function getSysUserList(params?: PageParams) {
  return request.get<PageResult<SysUserVo>>('/sys-users', { params })
}

export function getSysUserDetail(id: string | number) {
  return request.get<SysUserVo>(`/sys-users/${id}`)
}
