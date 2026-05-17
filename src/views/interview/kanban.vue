<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getInterviewRoundList, updateInterviewRound, type InterviewRoundVo } from '@/api/interview'
import { getJobApplicationList } from '@/api/application'
import { getCompanyList } from '@/api/company'
import { KANBAN_COLUMNS } from '@/constants/enums'
import { useAppStore } from '@/stores/app'
import { formatDate } from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const loading = ref(false)
const rounds = ref<InterviewRoundVo[]>([])
const appMap = ref<Record<number, string>>({})

const columns = computed(() =>
  KANBAN_COLUMNS.map((col) => ({
    key: col,
    title: col,
    items: rounds.value.filter((r) => (r.result || '待安排') === col),
  })),
)

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
  if (item.result === newResult) return
  await updateInterviewRound(item.id, {
    applicationId: item.applicationId!,
    roundNo: item.roundNo ?? 1,
    roundType: item.roundType,
    interviewer: item.interviewer,
    interviewerTitle: item.interviewerTitle,
    interviewMethod: item.interviewMethod,
    meetingLink: item.meetingLink,
    interviewTime: item.interviewTime,
    durationMinutes: item.durationMinutes,
    result: newResult,
    score: item.score,
    summary: item.summary,
    feedback: item.feedback,
    nextRoundTime: item.nextRoundTime,
  })
  item.result = newResult
  ElMessage.success('已更新状态')
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
      >
        <div class="kanban-column__header">
          <span>{{ col.title }}</span>
          <el-tag size="small" type="info">{{ col.items.length }}</el-tag>
        </div>
        <div class="kanban-column__body">
          <div
            v-for="item in col.items"
            :key="item.id"
            class="kanban-card"
          >
            <div class="kanban-card__title">
              {{ appMap[item.applicationId!] ?? `投递#${item.applicationId}` }}
            </div>
            <div class="kanban-card__meta">
              第{{ item.roundNo }}轮 · {{ item.roundType || '面试' }}
            </div>
            <div class="kanban-card__meta">{{ formatDate(item.interviewTime) }}</div>
            <div v-if="item.interviewer" class="kanban-card__meta">面试官：{{ item.interviewer }}</div>
            <el-select
              :model-value="item.result || '待安排'"
              size="small"
              class="kanban-card__select"
              @change="(v: string) => moveCard(item, v)"
            >
              <el-option v-for="c in KANBAN_COLUMNS" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <el-empty v-if="!col.items.length" description="暂无" :image-size="48" />
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
}

.kanban {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  min-height: 480px;
}

.kanban-column {
  flex: 0 0 240px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    font-weight: 600;
    font-size: 14px;
  }

  &__body {
    flex: 1;
    padding: 0 8px 8px;
    overflow-y: auto;
  }
}

.kanban-card {
  background: #fff;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

  &__title {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 4px;
  }

  &__meta {
    font-size: 12px;
    color: #909399;
    line-height: 1.6;
  }

  &__select {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
