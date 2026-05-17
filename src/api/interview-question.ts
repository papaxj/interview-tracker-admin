import request from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface InterviewQuestionVo {
  id: number
  roundId?: number
  category?: string
  question?: string
  myAnswer?: string
  correctAnswer?: string
  difficultyLevel?: number
  isAnsweredCorrectly?: number
  remark?: string
  createdAt?: string
}

export interface InterviewQuestionSaveRequest {
  roundId: number
  category?: string
  question: string
  myAnswer?: string
  correctAnswer?: string
  difficultyLevel?: number
  isAnsweredCorrectly?: number
  remark?: string
}

export function getInterviewQuestionList(params?: PageParams) {
  return request.get<PageResult<InterviewQuestionVo>>('/interview-questions', { params })
}

export function createInterviewQuestion(data: InterviewQuestionSaveRequest) {
  return request.post<InterviewQuestionVo>('/interview-questions', data)
}

export function updateInterviewQuestion(id: string | number, data: InterviewQuestionSaveRequest) {
  return request.put<InterviewQuestionVo>(`/interview-questions/${id}`, data)
}

export function deleteInterviewQuestion(id: string | number) {
  return request.delete<void>(`/interview-questions/${id}`)
}
