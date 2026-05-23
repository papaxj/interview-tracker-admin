<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Rank } from '@element-plus/icons-vue'
import {
  getInterviewRoundList,
  updateInterviewRound,
  type InterviewRoundSaveRequest,
  type InterviewRoundVo,
} from '@/api/interview'
import { getJobApplicationList } from '@/api/application'
import { getCompanyList } from '@/api/company'
import { KANBAN_COLUMNS, KANBAN_COLUMN_THEME } from '@/constants/enums'
import { useAppStore } from '@/stores/app'
import { formatDate } from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const loading = ref(false)
const savingId = ref<number | null>(null)
const rounds = ref<InterviewRoundVo[]>([])
const appMap = ref<Record<number, string>>({})
const draggingId = ref<number | null>(null)
const dragOverColumn = ref<string | null>(null)

const columns = computed(() =>
  KANBAN_COLUMNS.map((col) => ({
    key: col,
    title: col,
    theme: KANBAN_COLUMN_THEME[col],
    items: rounds.value.filter((r) => (r.result || '待安排') === col),
  })),
)

function columnHeaderStyle(col: (typeof columns.value)[number]) {
  return {
    color: col.theme.color,
    background: col.theme.bg,
    borderBottomColor: col.theme.border,
    boxShadow: `inset 3px 0 0 ${col.theme.color}`,
  }
}

function columnBodyStyle(col: (typeof columns.value)[number], isDragOver: boolean) {
  return {
    background: isDragOver ? col.theme.bg : undefined,
  }
}

function columnTagStyle(col: (typeof columns.value)[number]) {
  return {
    color: col.theme.tagColor,
    background: col.theme.tagBg,
    borderColor: col.theme.border,
  }
}

function buildPayload(item: InterviewRoundVo, result: string): InterviewRoundSaveRequest {
  return {
    applicationId: item.applicationId!,
    roundNo: item.roundNo ?? 1,
    roundType: item.roundType,
    interviewer: item.interviewer,
    interviewerTitle: item.interviewerTitle,
    interviewMethod: item.interviewMethod,
    meetingLink: item.meetingLink,
    interviewTime: item.interviewTime,
    durationMinutes: item.durationMinutes,
    result,
    score: item.score,
    summary: item.summary,
    feedback: item.feedback,
    nextRoundTime: item.nextRoundTime,
  }
}

async function loadData() {
  loading.value = true
  try {
    const userId = appStore.currentUserId
    const [roundRes, appRes, companyRes] = await Promise.all([
      getInterviewRoundList({ page: 1, size: 100 }),
      getJobApplicationList({ page: 1, size: 100, userId }),
      getCompanyList({ page: 1, size: 100, userId }),
    ])
    const companyMap = Object.fromEntries(companyRes.content.map((c) => [c.id, c.name]))
    const appIds = new Set(appRes.content.map((a) => Number(a.id)))
    rounds.value = roundRes.content.filter(
      (r) => r.applicationId != null && appIds.has(Number(r.applicationId)),
    )
    appMap.value = Object.fromEntries(
      appRes.content.map((a) => {
        const companyName = a.companyId ? companyMap[a.companyId] : undefined
        const label = `${a.positionName ?? ''}${companyName ? ` (${companyName})` : ''}`.trim()
        return [a.id, label || `#${a.id}`]
      }),
    )
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '加载失败')
  } finally {
    loading.value = false
  }
}

async function moveCard(item: InterviewRoundVo, newResult: string) {
  const current = item.result || '待安排'
  if (current === newResult || savingId.value === item.id) return

  const prev = item.result
  item.result = newResult
  savingId.value = item.id

  try {
    await updateInterviewRound(item.id, buildPayload(item, newResult))
    ElMessage.success(`已移至「${newResult}」`)
  } catch (e) {
    item.result = prev
    ElMessage.error(e instanceof Error ? e.message : '更新失败')
  } finally {
    savingId.value = null
  }
}

function onCardDragStart(item: InterviewRoundVo, e: DragEvent) {
  if (savingId.value != null) {
    e.preventDefault()
    return
  }
  draggingId.value = item.id
  e.dataTransfer?.setData('text/plain', String(item.id))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onCardDragEnd() {
  draggingId.value = null
  dragOverColumn.value = null
}

function onColumnDragOver(colKey: string) {
  dragOverColumn.value = colKey
}

function onColumnDragLeave(colKey: string, e: DragEvent) {
  const related = e.relatedTarget as Node | null
  const current = e.currentTarget as HTMLElement
  if (related && current.contains(related)) return
  if (dragOverColumn.value === colKey) dragOverColumn.value = null
}

async function onColumnDrop(colKey: string, e: DragEvent) {
  e.preventDefault()
  dragOverColumn.value = null
  draggingId.value = null

  const id = Number(e.dataTransfer?.getData('text/plain'))
  if (!id) return

  const item = rounds.value.find((r) => r.id === id)
  if (!item) return

  await moveCard(item, colKey)
}

function goBack() {
  router.push('/interview')
}

onMounted(loadData)
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <template #header>
      <div class="page-header">
        <span>面试看板</span>
        <div>
          <span class="kanban-hint">拖拽卡片到目标列即可变更状态</span>
          <el-button @click="loadData">刷新</el-button>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </div>
    </template>

    <div class="kanban">
      <div
        v-for="col in columns"
        :key="col.key"
        class="kanban-column"
        :class="{ 'kanban-column--drag-over': dragOverColumn === col.key }"
        :style="{ borderTopColor: col.theme.color }"
      >
        <div class="kanban-column__header" :style="columnHeaderStyle(col)">
          <span class="kanban-column__title">{{ col.title }}</span>
          <span class="kanban-column__count" :style="columnTagStyle(col)">{{ col.items.length }}</span>
        </div>
        <div
          class="kanban-column__body"
          :style="columnBodyStyle(col, dragOverColumn === col.key)"
          @dragover.prevent="onColumnDragOver(col.key)"
          @dragleave="onColumnDragLeave(col.key, $event)"
          @drop="onColumnDrop(col.key, $event)"
        >
          <div
            v-for="item in col.items"
            :key="item.id"
            class="kanban-card"
            :class="{
              'kanban-card--dragging': draggingId === item.id,
              'kanban-card--saving': savingId === item.id,
            }"
            draggable="true"
            @dragstart="onCardDragStart(item, $event)"
            @dragend="onCardDragEnd"
          >
            <div class="kanban-card__head">
              <el-icon class="kanban-card__handle" :size="14"><Rank /></el-icon>
              <div class="kanban-card__title">
                {{ appMap[item.applicationId!] ?? `投递#${item.applicationId}` }}
              </div>
            </div>
            <div class="kanban-card__meta">
              第{{ item.roundNo }}轮 · {{ item.roundType || '面试' }}
            </div>
            <div class="kanban-card__meta">{{ formatDate(item.interviewTime) }}</div>
            <div v-if="item.interviewer" class="kanban-card__meta">面试官：{{ item.interviewer }}</div>
          </div>
          <el-empty v-if="!col.items.length" description="拖入此处" :image-size="48" />
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.kanban-hint {
  font-size: 12px;
  color: #999;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .kanban-hint {
    display: none;
  }
}

.kanban {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 16px;
  -webkit-overflow-scrolling: touch;
}

.kanban-column {
  flex: 0 0 min(240px, 78vw);
  background: #fafbfc;
  border: 1px solid #e0e6ed;
  border-top: 3px solid;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s, background 0.15s;

  &--drag-over {
    box-shadow: 0 0 0 2px rgba(26, 140, 255, 0.25);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px 10px 14px;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid;
  }

  &__title {
    letter-spacing: 0.02em;
  }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 11px;
    border: 1px solid;
  }

  &__body {
    min-height: 80px;
    padding: 8px;
    overflow: visible;
    transition: background 0.15s;
  }
}

.kanban-card {
  background: #fff;
  border: 1px solid #eef1f5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: grab;
  transition: opacity 0.15s, box-shadow 0.15s, transform 0.15s;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }

  &--dragging {
    opacity: 0.45;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &--saving {
    opacity: 0.7;
    pointer-events: none;
  }

  &:hover {
    border-color: #e0e6ed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 4px;
  }

  &__handle {
    flex-shrink: 0;
    margin-top: 2px;
    color: #999;
  }

  &__title {
    flex: 1;
    font-weight: 600;
    font-size: 13px;
    color: #333;
    line-height: 1.4;
  }

  &__meta {
    font-size: 12px;
    color: #999;
    line-height: 1.6;
    padding-left: 20px;
  }
}
</style>
