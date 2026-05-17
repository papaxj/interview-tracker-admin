import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface OfferInfoVo {
  id: number
  applicationId?: number
  baseSalary?: number
  bonusSalary?: number
  stockValue?: number
  signBonus?: number
  otherBenefits?: string
  offerDate?: string
  deadlineDate?: string
  joinDate?: string
  status?: string
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface OfferInfoSaveRequest {
  applicationId: number
  baseSalary?: number
  bonusSalary?: number
  stockValue?: number
  signBonus?: number
  otherBenefits?: string
  offerDate?: string
  deadlineDate?: string
  joinDate?: string
  status?: string
  remark?: string
}

export function getOfferList(params?: PageParams) {
  return request.get<PageResult<OfferInfoVo>>('/offers', { params })
}

export function getOffersByApplication(applicationId: string | number) {
  return request.get<OfferInfoVo[]>(`/offers/by-application/${applicationId}`)
}

export function getOfferDetail(id: string | number) {
  return request.get<OfferInfoVo>(`/offers/${id}`)
}

export function createOffer(data: OfferInfoSaveRequest) {
  return request.post<OfferInfoVo>('/offers', data)
}

export function updateOffer(id: string | number, data: OfferInfoSaveRequest) {
  return request.put<OfferInfoVo>(`/offers/${id}`, data)
}

export function deleteOffer(id: string | number) {
  return request.delete<void>(`/offers/${id}`)
}
