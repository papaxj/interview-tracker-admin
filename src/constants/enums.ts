export const APPLICATION_STATUS = [
  { label: '进行中', value: '进行中' },
  { label: '已投递', value: '已投递' },
  { label: '面试中', value: '面试中' },
  { label: '已拒绝', value: '已拒绝' },
  { label: '已录用', value: '已录用' },
  { label: '已放弃', value: '已放弃' },
]

export const APPLICATION_STAGE = [
  { label: '简历筛选', value: '简历筛选' },
  { label: '笔试', value: '笔试' },
  { label: '一面', value: '一面' },
  { label: '二面', value: '二面' },
  { label: '三面', value: '三面' },
  { label: 'HR面', value: 'HR面' },
  { label: 'OC', value: 'OC' },
]

export const INTERVIEW_RESULT = [
  { label: '待安排', value: '待安排' },
  { label: '进行中', value: '进行中' },
  { label: '通过', value: '通过' },
  { label: '未通过', value: '未通过' },
  { label: '待定', value: '待定' },
]

export const OFFER_STATUS = [
  { label: '待确认', value: '待确认' },
  { label: '已接受', value: '已接受' },
  { label: '已拒绝', value: '已拒绝' },
  { label: '已过期', value: '已过期' },
]

export const PRIORITY_LEVEL = [
  { label: '低', value: 1 },
  { label: '中', value: 2 },
  { label: '高', value: 3 },
]

export const KANBAN_COLUMNS = ['待安排', '进行中', '通过', '未通过', '待定']

/** 看板列主题色 */
export const KANBAN_COLUMN_THEME: Record<
  (typeof KANBAN_COLUMNS)[number],
  { color: string; bg: string; border: string; tagColor: string; tagBg: string }
> = {
  待安排: {
    color: '#606266',
    bg: '#f5f7fa',
    border: '#dcdfe6',
    tagColor: '#606266',
    tagBg: '#eef1f5',
  },
  进行中: {
    color: '#1a8cff',
    bg: '#e8f4ff',
    border: '#b3d8ff',
    tagColor: '#1a8cff',
    tagBg: '#d9ecff',
  },
  通过: {
    color: '#22a04c',
    bg: '#e8f8ef',
    border: '#b7e4c7',
    tagColor: '#22a04c',
    tagBg: '#d4edda',
  },
  未通过: {
    color: '#f56c6c',
    bg: '#fef0f0',
    border: '#fbc4c4',
    tagColor: '#f56c6c',
    tagBg: '#fde2e2',
  },
  待定: {
    color: '#e6a23c',
    bg: '#fdf6ec',
    border: '#f5dab1',
    tagColor: '#e6a23c',
    tagBg: '#faecd8',
  },
}
