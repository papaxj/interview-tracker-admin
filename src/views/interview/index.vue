<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getJobApplicationList, type JobApplicationVo } from '@/api/application'
import { getCompanyList, type CompanyVo } from '@/api/company'
import {
  createInterviewRound,
  deleteInterviewRound,
  getInterviewRoundList,
  updateInterviewRound,
  type InterviewRoundSaveRequest,
  type InterviewRoundVo,
} from '@/api/interview'
import { usePagination } from '@/composables/usePagination'
import { INTERVIEW_RESULT } from '@/constants/enums'
import { useAppStore } from '@/stores/app'
import { formatDate } from '@/utils/format'

const router = useRouter()
const appStore = useAppStore()
const applications = ref<JobApplicationVo[]>([])
const companies = ref<CompanyVo[]>([])
const filterApplicationId = ref<number>()
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const companyMap = computed(() =>
  Object.fromEntries(companies.value.map((c) => [c.id, c.name])),
)

const appMap = computed(() =>
  Object.fromEntries(
    applications.value.map((a) => {
      const companyName = a.companyId ? companyMap.value[a.companyId] : undefined
      const label = `${a.positionName ?? ''}${companyName ? ` (${companyName})` : ''}`.trim()
      return [a.id, label || `#${a.id}`]
    }),
  ),
)

const { loading, list, total, page, size, load, handlePageChange, handleSizeChange } =
  usePagination<InterviewRoundVo>((p, s) => {
    const params: Record<string, unknown> = { page: p, size: s }
    if (filterApplicationId.value) params.applicationId = filterApplicationId.value
    return getInterviewRoundList(params)
  })

const defaultForm = (): InterviewRoundSaveRequest => ({
  applicationId: filterApplicationId.value ?? applications.value[0]?.id ?? 0,
  roundNo: 1,
  roundType: '技术面试',
  interviewMethod: '视频',
  result: '待安排',
})

const form = reactive<InterviewRoundSaveRequest>(defaultForm())

const rules: FormRules = {
  applicationId: [{ required: true, message: '请选择投递', trigger: 'change' }],
  roundNo: [{ required: true, message: '请输入轮次', trigger: 'blur' }],
}

const dialogTitle = ref('新增面试')

async function fetchApplications() {
  const [res, companyRes] = await Promise.all([
    getJobApplicationList({ page: 1, size: 100, userId: appStore.currentUserId }),
    getCompanyList({ page: 1, size: 100, userId: appStore.currentUserId }),
  ])
  applications.value = res.content
  companies.value = companyRes.content
}

function openCreate() {
  editingId.value = null
  dialogTitle.value = '新增面试'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: InterviewRoundVo) {
  editingId.value = row.id
  dialogTitle.value = '编辑面试'
  Object.assign(form, {
    applicationId: row.applicationId ?? 0,
    roundNo: row.roundNo ?? 1,
    roundType: row.roundType ?? '',
    interviewer: row.interviewer ?? '',
    interviewerTitle: row.interviewerTitle ?? '',
    interviewMethod: row.interviewMethod ?? '',
    meetingLink: row.meetingLink ?? '',
    interviewTime: row.interviewTime?.slice(0, 16) ?? '',
    durationMinutes: row.durationMinutes,
    result: row.result ?? '待安排',
    score: row.score,
    summary: row.summary ?? '',
    feedback: row.feedback ?? '',
    nextRoundTime: row.nextRoundTime?.slice(0, 16) ?? '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingId.value) {
      await updateInterviewRound(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createInterviewRound({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: InterviewRoundVo) {
  await ElMessageBox.confirm('确定删除该面试轮次？', '提示', { type: 'warning' })
  await deleteInterviewRound(row.id)
  ElMessage.success('删除成功')
  load()
}

function goKanban() {
  router.push('/interview/kanban')
}

onMounted(async () => {
  await fetchApplications()
  await load()
})
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>面试管理</span>
        <div>
          <el-button @click="goKanban">看板视图</el-button>
          <el-button type="primary" :disabled="!applications.length" @click="openCreate">
            新增面试
          </el-button>
        </div>
      </div>
    </template>

    <div class="toolbar">
      <el-select
        v-model="filterApplicationId"
        placeholder="筛选投递"
        clearable
        style="width: 220px"
        @change="load"
      >
        <el-option
          v-for="app in applications"
          :key="app.id"
          :label="appMap[app.id] || app.positionName"
          :value="app.id"
        />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="roundNo" label="轮次" width="60" />
      <el-table-column label="投递" min-width="120">
        <template #default="{ row }">{{ appMap[row.applicationId!] ?? row.applicationId }}</template>
      </el-table-column>
      <el-table-column prop="roundType" label="类型" width="100" />
      <el-table-column prop="interviewer" label="面试官" width="90" />
      <el-table-column prop="interviewMethod" label="方式" width="80" />
      <el-table-column label="面试时间" width="150">
        <template #default="{ row }">{{ formatDate(row.interviewTime) }}</template>
      </el-table-column>
      <el-table-column prop="result" label="结果" width="90">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="row.result === '通过' ? 'success' : row.result === '未通过' ? 'danger' : 'info'"
          >
            {{ row.result || '待安排' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="评分" width="70" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      :current-page="page"
      :page-size="size"
      :page-sizes="[10, 20, 50]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </el-card>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="投递" prop="applicationId">
        <el-select v-model="form.applicationId" style="width: 100%">
          <el-option
            v-for="app in applications"
            :key="app.id"
            :label="appMap[app.id] || app.positionName"
            :value="app.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="轮次" prop="roundNo">
            <el-input-number v-model="form.roundNo" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型">
            <el-input v-model="form.roundType" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="面试官">
        <el-input v-model="form.interviewer" />
      </el-form-item>
      <el-form-item label="面试方式">
        <el-input v-model="form.interviewMethod" />
      </el-form-item>
      <el-form-item label="面试时间">
        <el-date-picker
          v-model="form.interviewTime"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="结果">
        <el-select v-model="form.result" style="width: 100%">
          <el-option v-for="r in INTERVIEW_RESULT" :key="r.value" :label="r.label" :value="r.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="评分">
        <el-input-number v-model="form.score" :min="0" :max="100" :precision="1" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
