/** 统一类型导出 —— 所有实体类型集中管理，视图层统一从此引入 */

export type { JobApplicationVo, JobApplicationSaveRequest } from '@/api/application'
export type { CompanyVo, CompanySaveRequest } from '@/api/company'
export type { SysDictTypeVo, SysDictTypeSaveRequest, SysDictItemVo, SysDictItemSaveRequest } from '@/api/dict'
export type { InterviewRoundVo, InterviewRoundSaveRequest } from '@/api/interview'
export type { InterviewQuestionVo, InterviewQuestionSaveRequest } from '@/api/interview-question'
export type { OfferInfoVo, OfferInfoSaveRequest } from '@/api/offer'
export type { MyUserVo } from '@/api/my-user'
export type { SysUserVo, LoginParams } from '@/api/user'
