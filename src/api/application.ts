import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface JobApplicationVo {
  id: number
  userId?: number
  companyId?: number
  positionName?: string
  department?: string
  employmentType?: string
  workCity?: string
  salaryMin?: number
  salaryMax?: number
  salaryMonths?: number
  jobDesc?: string
  source?: string
  sourceLink?: string
  applyDate?: string
  currentStage?: string
  status?: string
  priorityLevel?: number
  expectedSalary?: number
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface JobApplicationSaveRequest {
  userId: number
  companyId: number
  positionName: string
  department?: string
  employmentType?: string
  workCity?: string
  salaryMin?: number
  salaryMax?: number
  salaryMonths?: number
  jobDesc?: string
  source?: string
  sourceLink?: string
  applyDate?: string
  currentStage?: string
  status?: string
  priorityLevel?: number
  expectedSalary?: number
  remark?: string
}

export function getJobApplicationList(params?: PageParams) {
  return request.get<PageResult<JobApplicationVo>>('/job-applications', { params })
}

export function getJobApplicationDetail(id: string | number) {
  return request.get<JobApplicationVo>(`/job-applications/${id}`)
}

export function createJobApplication(data: JobApplicationSaveRequest) {
  return request.post<JobApplicationVo>('/job-applications', data)
}

export function updateJobApplication(id: string | number, data: JobApplicationSaveRequest) {
  return request.put<JobApplicationVo>(`/job-applications/${id}`, data)
}

export function deleteJobApplication(id: string | number) {
  return request.delete<void>(`/job-applications/${id}`)
}
