<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createJobApplication,
  deleteJobApplication,
  getJobApplicationList,
  updateJobApplication,
  type JobApplicationSaveRequest,
  type JobApplicationVo,
} from '@/api/application'
import { getCompanyList, type CompanyVo } from '@/api/company'
import { getDictItemsByTypeCode } from '@/api/dict'
import type { SysDictItemVo } from '@/api/dict'
import { usePagination } from '@/composables/usePagination'
import { APPLICATION_STATUS, PRIORITY_LEVEL } from '@/constants/enums'
import { useAppStore } from '@/stores/app'
import { formatDate, formatSalary } from '@/utils/format'

const router = useRouter()
const appStore = useAppStore()
const companies = ref<CompanyVo[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const filterCompanyId = ref<number>()

// 从数据字典加载当前阶段选项
const stageOptions = ref<SysDictItemVo[]>([])

async function fetchStageOptions() {
  try {
    const items = await getDictItemsByTypeCode('application_stage')
    stageOptions.value = items ?? []
  } catch {
    // 接口异常时保持空数组，不影响页面使用
    stageOptions.value = []
  }
}

const companyMap = computed(() =>
  Object.fromEntries(companies.value.map((c) => [c.id, c.name])),
)

const { loading, list, total, page, size, load, handlePageChange, handleSizeChange } =
  usePagination<JobApplicationVo>((p, s) => {
    const params: Record<string, unknown> = {
      page: p,
      size: s,
      userId: appStore.currentUserId,
    }
    if (filterCompanyId.value) params.companyId = filterCompanyId.value
    return getJobApplicationList(params)
  })

const defaultForm = (): JobApplicationSaveRequest => ({
  userId: appStore.currentUserId,
  companyId: companies.value[0]?.id ?? 0,
  positionName: '',
  department: '',
  employmentType: '全职',
  workCity: '',
  salaryMin: undefined,
  salaryMax: undefined,
  salaryMonths: 12,
  source: '',
  sourceLink: '',
  applyDate: new Date().toISOString().slice(0, 10),
  currentStage: stageOptions.value[0]?.label ?? '',
  status: '进行中',
  priorityLevel: 2,
  expectedSalary: undefined,
  remark: '',
})

const form = reactive<JobApplicationSaveRequest>(defaultForm())

const rules: FormRules = {
  companyId: [{ required: true, message: '请选择公司', trigger: 'change' }],
  positionName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
}

const dialogTitle = computed(() => (editingId.value ? '编辑投递' : '新增投递'))

async function fetchCompanies() {
  const res = await getCompanyList({ page: 1, size: 100, userId: appStore.currentUserId })
  companies.value = res.content
}

async function fetchList() {
  await load()
}

function openCreate() {
  editingId.value = null
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: JobApplicationVo) {
  editingId.value = row.id
  Object.assign(form, {
    userId: row.userId ?? appStore.currentUserId,
    companyId: row.companyId ?? 0,
    positionName: row.positionName ?? '',
    department: row.department ?? '',
    employmentType: row.employmentType ?? '',
    workCity: row.workCity ?? '',
    salaryMin: row.salaryMin,
    salaryMax: row.salaryMax,
    salaryMonths: row.salaryMonths ?? 12,
    jobDesc: row.jobDesc ?? '',
    source: row.source ?? '',
    sourceLink: row.sourceLink ?? '',
    applyDate: row.applyDate?.slice(0, 10) ?? '',
    currentStage: row.currentStage ?? '',
    status: row.status ?? '',
    priorityLevel: row.priorityLevel ?? 2,
    expectedSalary: row.expectedSalary,
    remark: row.remark ?? '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  form.userId = appStore.currentUserId
  submitting.value = true
  try {
    if (editingId.value) {
      await updateJobApplication(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createJobApplication({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: JobApplicationVo) {
  await ElMessageBox.confirm(`确定删除投递「${row.positionName}」？`, '提示', { type: 'warning' })
  await deleteJobApplication(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

function goDetail(id: number) {
  router.push(`/application/${id}`)
}

onMounted(async () => {
  await fetchStageOptions()
  await fetchCompanies()
  await fetchList()
})
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>投递记录</span>
        <el-button type="primary" :disabled="!companies.length" @click="openCreate">
          新增投递
        </el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-select
        v-model="filterCompanyId"
        placeholder="筛选公司"
        clearable
        style="width: 180px"
        @change="fetchList"
      >
        <el-option v-for="c in companies" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-button @click="fetchList">刷新</el-button>
    </div>

    <el-alert
      v-if="!companies.length"
      title="请先在「公司管理」中添加公司"
      type="warning"
      show-icon
      :closable="false"
      class="mb-16"
    />

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="positionName" label="岗位" min-width="120" />
      <el-table-column label="公司" min-width="120">
        <template #default="{ row }">{{ companyMap[row.companyId!] ?? row.companyId }}</template>
      </el-table-column>
      <el-table-column prop="workCity" label="城市" width="80" />
      <el-table-column label="薪资" width="130">
        <template #default="{ row }">
          {{ formatSalary(row.salaryMin, row.salaryMax, row.salaryMonths) }}
        </template>
      </el-table-column>
      <el-table-column prop="currentStage" label="阶段" width="90" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="优先级" width="80">
        <template #default="{ row }">
          {{ PRIORITY_LEVEL.find((p) => p.value === row.priorityLevel)?.label ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column label="投递日期" width="110">
        <template #default="{ row }">{{ formatDate(row.applyDate)?.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row.id)">详情</el-button>
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

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="公司" prop="companyId">
        <el-select v-model="form.companyId" placeholder="选择公司" style="width: 100%">
          <el-option v-for="c in companies" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位名称" prop="positionName">
        <el-input v-model="form.positionName" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="部门">
            <el-input v-model="form.department" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工作城市">
            <el-input v-model="form.workCity" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item label="最低薪资">
            <el-input-number v-model="form.salaryMin" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="最高薪资">
            <el-input-number v-model="form.salaryMax" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="薪资月数">
            <el-input-number v-model="form.salaryMonths" :min="12" :max="24" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="当前阶段">
            <el-select v-model="form.currentStage" style="width: 100%">
              <el-option v-for="s in stageOptions" :key="s.id" :label="s.label" :value="s.label" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="form.status" style="width: 100%">
              <el-option v-for="s in APPLICATION_STATUS" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="投递日期">
        <el-date-picker v-model="form.applyDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item label="来源">
        <el-input v-model="form.source" placeholder="Boss直聘 / 内推等" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
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

.mb-16 {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
