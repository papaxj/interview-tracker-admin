import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

// ---------- 字典类型 ----------
export interface SysDictTypeVo {
  id: number
  dictName: string
  dictCode: string
  status?: number
  remark?: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

export interface SysDictTypeSaveRequest {
  dictName: string
  dictCode: string
  status?: number
  remark?: string
}

export function getDictTypeList(params?: PageParams) {
  return request.get<PageResult<SysDictTypeVo>>('/sys-dict-types', { params })
}

export function getDictTypeDetail(id: string | number) {
  return request.get<SysDictTypeVo>(`/sys-dict-types/${id}`)
}

export function getDictTypeByCode(dictCode: string) {
  return request.get<SysDictTypeVo>(`/sys-dict-types/code/${encodeURIComponent(dictCode)}`)
}

export function createDictType(data: SysDictTypeSaveRequest) {
  return request.post<SysDictTypeVo>('/sys-dict-types', data)
}

export function updateDictType(id: string | number, data: SysDictTypeSaveRequest) {
  return request.put<SysDictTypeVo>(`/sys-dict-types/${id}`, data)
}

export function deleteDictType(id: string | number) {
  return request.delete<void>(`/sys-dict-types/${id}`)
}

// ---------- 字典数据项 ----------
export interface SysDictItemVo {
  id: number
  dictTypeCode: string
  label: string
  value: string
  sortOrder?: number
  isDefault?: number
  status?: number
  remark?: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

export interface SysDictItemSaveRequest {
  dictTypeCode: string
  label: string
  value: string
  sortOrder?: number
  isDefault?: number
  status?: number
  remark?: string
}

export function getDictItemList(params?: PageParams & { dictTypeCode?: string }) {
  return request.get<PageResult<SysDictItemVo>>('/sys-dict-items', { params })
}

export function getDictItemsByTypeCode(dictTypeCode: string) {
  return request.get<SysDictItemVo[]>(
    `/sys-dict-items/items/${encodeURIComponent(dictTypeCode)}`,
  )
}

export function getDictItemDetail(id: string | number) {
  return request.get<SysDictItemVo>(`/sys-dict-items/${id}`)
}

export function createDictItem(data: SysDictItemSaveRequest) {
  return request.post<SysDictItemVo>('/sys-dict-items', data)
}

export function updateDictItem(id: string | number, data: SysDictItemSaveRequest) {
  return request.put<SysDictItemVo>(`/sys-dict-items/${id}`, data)
}

export function deleteDictItem(id: string | number) {
  return request.delete<void>(`/sys-dict-items/${id}`)
}
