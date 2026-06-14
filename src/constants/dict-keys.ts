/** 字典编码常量 —— 统一管理所有字典码，避免魔法字符串 */
export const DICT = {
  INDUSTRY: 'industry',
  CITY: 'city',
  SCALE: 'scale',
  FINANCING_STAGE: 'financing_stage',
  SOURCE: 'source',
  INTERVIEW_METHOD: 'interview_method',
  GENDER: 'gender',
} as const

/** 各页面所需的字典列表 */
export const DASHBOARD_DICTS: string[] = ['industry', 'city']
export const COMPANY_LIST_DICTS: string[] = ['industry', 'city', 'scale', 'financing_stage']
export const COMPANY_FORM_DICTS: string[] = ['financing_stage', 'scale', 'city', 'industry']
export const APPLICATION_DICTS: string[] = ['city', 'source']
export const APPLICATION_DETAIL_DICTS: string[] = ['interview_method', 'city', 'source']
export const IDENTITY_DICTS: string[] = ['gender']
