import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import { getMyUserList } from '@/api/my-user'
import { setCurrentUserId } from '@/utils/user'

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

export interface LoginParams {
  username: string
  password: string
}

/** 登录：优先匹配系统用户，否则匹配 my_user 名称 */
export async function login(data: LoginParams) {
  const sysPage = await request.get<PageResult<SysUserVo>>('/sys-users', {
    params: { page: 1, size: 100 },
  })
  const sysUser = sysPage.content.find((u) => u.username === data.username)
  if (sysUser) {
    return { user: sysUser, token: String(sysUser.id), type: 'sys' as const }
  }

  const myPage = await getMyUserList({ page: 1, size: 100 })
  const myUser = myPage.content.find(
    (u) => u.name === data.username || u.asName === data.username,
  )
  if (myUser) {
    setCurrentUserId(myUser.id)
    return { user: myUser, token: `my-${myUser.id}`, type: 'my' as const }
  }

  throw new Error('用户不存在，请检查用户名')
}

export function getSysUserList(params?: PageParams) {
  return request.get<PageResult<SysUserVo>>('/sys-users', { params })
}

export function getSysUserDetail(id: string | number) {
  return request.get<SysUserVo>(`/sys-users/${id}`)
}

export function getProfile() {
  const token = localStorage.getItem('it_admin_token')
  if (!token) {
    return Promise.reject(new Error('未登录'))
  }
  if (token.startsWith('my-')) {
    return Promise.resolve({
      id: Number(token.replace('my-', '')),
      username: token,
      nickname: '业务用户',
    } as SysUserVo)
  }
  return getSysUserDetail(token)
}
