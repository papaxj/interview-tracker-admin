import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface CompanyVo {
  id: number
  userId?: number
  name: string
  industry?: string
  website?: string
  city?: string
  companySize?: string
  financingStage?: string
  address?: string
  hrName?: string
  hrContact?: string
  remark?: string
  status?: number
  latitude?: number
  longitude?: number
  createdAt?: string
  updatedAt?: string
}

export interface CompanySaveRequest {
  userId: number
  name: string
  industry?: string
  website?: string
  city?: string
  companySize?: string
  financingStage?: string
  address?: string
  hrName?: string
  hrContact?: string
  remark?: string
  status?: number
}

export function getCompanyList(params?: PageParams) {
  return request.get<PageResult<CompanyVo>>('/companies', { params })
}

export function getCompanyDetail(id: string | number) {
  return request.get<CompanyVo>(`/companies/${id}`)
}

export function createCompany(data: CompanySaveRequest) {
  return request.post<CompanyVo>('/companies', data)
}

export function updateCompany(id: string | number, data: CompanySaveRequest) {
  return request.put<CompanyVo>(`/companies/${id}`, data)
}

export function deleteCompany(id: string | number) {
  return request.delete<void>(`/companies/${id}`)
}
