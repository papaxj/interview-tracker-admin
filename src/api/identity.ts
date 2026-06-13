import request from '@/utils/request'

/** 身份信息视图 */
export interface IdentityInfoVo {
  id: number
  name: string
  idCard: string
  gender: string
  birthday: string
  address: string
  mobile: string
  email: string
  createTime: string
}

/** 滚动分页结果 */
export interface ScrollPageResultIdentityInfoVo {
  content: IdentityInfoVo[]
  size: number
  nextCursor: number
  hasMore: boolean
}

export interface ScrollQueryParams {
  size?: number
  cursor?: number
  keyword?: string
}

/** 滚动分页查询身份信息 */
export function scrollQueryIdentity(params?: ScrollQueryParams) {
  return request.get<ScrollPageResultIdentityInfoVo>('/identity-infos', { params })
}
