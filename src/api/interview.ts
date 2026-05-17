import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface InterviewRoundVo {
  id: number
  applicationId?: number
  roundNo?: number
  roundType?: string
  interviewer?: string
  interviewerTitle?: string
  interviewMethod?: string
  meetingLink?: string
  interviewTime?: string
  durationMinutes?: number
  result?: string
  score?: number
  summary?: string
  feedback?: string
  nextRoundTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface InterviewRoundSaveRequest {
  applicationId: number
  roundNo: number
  roundType?: string
  interviewer?: string
  interviewerTitle?: string
  interviewMethod?: string
  meetingLink?: string
  interviewTime?: string
  durationMinutes?: number
  result?: string
  score?: number
  summary?: string
  feedback?: string
  nextRoundTime?: string
}

export function getInterviewRoundList(params?: PageParams) {
  return request.get<PageResult<InterviewRoundVo>>('/interview-rounds', { params })
}

export function getInterviewRoundDetail(id: string | number) {
  return request.get<InterviewRoundVo>(`/interview-rounds/${id}`)
}

export function createInterviewRound(data: InterviewRoundSaveRequest) {
  return request.post<InterviewRoundVo>('/interview-rounds', data)
}

export function updateInterviewRound(id: string | number, data: InterviewRoundSaveRequest) {
  return request.put<InterviewRoundVo>(`/interview-rounds/${id}`, data)
}

export function deleteInterviewRound(id: string | number) {
  return request.delete<void>(`/interview-rounds/${id}`)
}
