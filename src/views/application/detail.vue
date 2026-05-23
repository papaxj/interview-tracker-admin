<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getJobApplicationDetail,
  type JobApplicationVo,
} from '@/api/application'
import { getCompanyDetail } from '@/api/company'
import {
  createInterviewRound,
  deleteInterviewRound,
  getInterviewRoundList,
  updateInterviewRound,
  type InterviewRoundSaveRequest,
  type InterviewRoundVo,
} from '@/api/interview'
import { getOffersByApplication } from '@/api/offer'
import type { OfferInfoVo } from '@/api/offer'
import { getDictItemsByTypeCode } from '@/api/dict'
import type { SysDictItemVo } from '@/api/dict'
import { INTERVIEW_RESULT } from '@/constants/enums'
import { formatDate, formatSalary } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const applicationId = computed(() => Number(route.params.id))

const loading = ref(true)
const application = ref<JobApplicationVo | null>(null)
const companyName = ref('')
const rounds = ref<InterviewRoundVo[]>([])
const offers = ref<OfferInfoVo[]>([])

const roundDialogVisible = ref(false)
const editingRoundId = ref<number | null>(null)
const roundFormRef = ref<FormInstance>()
const roundSubmitting = ref(false)

// 从数据字典加载面试方式选项
const interviewMethodOptions = ref<SysDictItemVo[]>([])

async function fetchDictOptions() {
  try {
    const items = await getDictItemsByTypeCode('interview_method')
    interviewMethodOptions.value = items ?? []
  } catch {
    interviewMethodOptions.value = []
  }
}

const defaultRoundForm = (): InterviewRoundSaveRequest => ({
  applicationId: applicationId.value,
  roundNo: rounds.value.length + 1,
  roundType: '技术面试',
  interviewMethod: '视频',
  result: '待安排',
})

const roundForm = reactive<InterviewRoundSaveRequest>(defaultRoundForm())

const roundRules: FormRules = {
  roundNo: [{ required: true, message: '请输入轮次', trigger: 'blur' }],
}

const roundDialogTitle = computed(() => (editingRoundId.value ? '编辑面试轮次' : '新增面试轮次'))

async function loadData() {
  loading.value = true
  try {
    application.value = await getJobApplicationDetail(applicationId.value)
    if (application.value?.companyId) {
      const company = await getCompanyDetail(application.value.companyId)
      companyName.value = company.name
    }
    const roundRes = await getInterviewRoundList({
      page: 1,
      size: 50,
      applicationId: applicationId.value,
    })
    rounds.value = roundRes.content
    offers.value = await getOffersByApplication(applicationId.value)
  } finally {
    loading.value = false
  }
}

function openRoundCreate() {
  editingRoundId.value = null
  Object.assign(roundForm, defaultRoundForm())
  roundDialogVisible.value = true
}

function openRoundEdit(row: InterviewRoundVo) {
  editingRoundId.value = row.id
  Object.assign(roundForm, {
    applicationId: applicationId.value,
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
  roundDialogVisible.value = true
}

async function handleRoundSubmit() {
  const valid = await roundFormRef.value?.validate().catch(() => false)
  if (!valid) return

  roundForm.applicationId = applicationId.value
  roundSubmitting.value = true
  try {
    if (editingRoundId.value) {
      await updateInterviewRound(editingRoundId.value, { ...roundForm })
      ElMessage.success('更新成功')
    } else {
      await createInterviewRound({ ...roundForm })
      ElMessage.success('创建成功')
    }
    roundDialogVisible.value = false
    loadData()
  } finally {
    roundSubmitting.value = false
  }
}

async function handleRoundDelete(row: InterviewRoundVo) {
  await ElMessageBox.confirm('确定删除该面试轮次？', '提示', { type: 'warning' })
  await deleteInterviewRound(row.id)
  ElMessage.success('删除成功')
  loadData()
}

function goBack() {
  router.push('/application')
}

onMounted(async () => {
  await fetchDictOptions()
  await loadData()
})
</script>

<template>
  <div v-loading="loading">
    <el-page-header class="mb-16" @back="goBack">
      <template #content>
        <span>{{ application?.positionName ?? '投递详情' }}</span>
        <el-tag v-if="application?.status" class="ml-8" size="small">{{ application?.status }}</el-tag>
      </template>
    </el-page-header>

    <el-row :gutter="16">
      <el-col :span="24">
        <el-card shadow="never" class="mb-16">
          <template #header>基本信息</template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="公司">{{ companyName || application?.companyId }}</el-descriptions-item>
            <el-descriptions-item label="岗位">{{ application?.positionName }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ application?.department || '-' }}</el-descriptions-item>
            <el-descriptions-item label="城市">{{ application?.workCity || '-' }}</el-descriptions-item>
            <el-descriptions-item label="薪资">
              {{ formatSalary(application?.salaryMin, application?.salaryMax, application?.salaryMonths) }}
            </el-descriptions-item>
            <el-descriptions-item label="阶段">{{ application?.currentStage || '-' }}</el-descriptions-item>
            <el-descriptions-item label="投递日期">{{ formatDate(application?.applyDate)?.slice(0, 10) }}</el-descriptions-item>
            <el-descriptions-item label="来源">{{ application?.source || '-' }}</el-descriptions-item>
            <el-descriptions-item label="链接">
              <a v-if="application?.sourceLink" :href="application.sourceLink" target="_blank">查看</a>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="3">{{ application?.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never" class="mb-16">
          <template #header>
            <div class="page-header">
              <span>面试轮次</span>
              <el-button type="primary" size="small" @click="openRoundCreate">新增轮次</el-button>
            </div>
          </template>
          <el-table :data="rounds" stripe>
            <el-table-column prop="roundNo" label="轮次" width="60" />
            <el-table-column prop="roundType" label="类型" width="100" />
            <el-table-column prop="interviewer" label="面试官" width="90" />
            <el-table-column label="面试时间" width="150">
              <template #default="{ row }">{{ formatDate(row.interviewTime) }}</template>
            </el-table-column>
            <el-table-column prop="result" label="结果" width="90">
              <template #default="{ row }">
                <el-tag size="small" :type="row.result === '通过' ? 'success' : row.result === '未通过' ? 'danger' : 'info'">
                  {{ row.result || '待安排' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="评分" width="70" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="openRoundEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleRoundDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>关联 Offer</template>
          <el-empty v-if="!offers.length" description="暂无 Offer" />
          <div v-for="offer in offers" :key="offer.id" class="offer-item">
            <div class="offer-item__salary">基础薪资：{{ offer.baseSalary ?? '-' }} 元</div>
            <div>状态：{{ offer.status || '-' }}</div>
            <div>Offer日期：{{ formatDate(offer.offerDate)?.slice(0, 10) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="roundDialogVisible" :title="roundDialogTitle" width="560px" destroy-on-close>
      <el-form ref="roundFormRef" :model="roundForm" :rules="roundRules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="轮次" prop="roundNo">
              <el-input-number v-model="roundForm.roundNo" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型">
              <el-input v-model="roundForm.roundType" placeholder="技术面试/HR面" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="面试官">
          <el-input v-model="roundForm.interviewer" />
        </el-form-item>
        <el-form-item label="面试方式">
          <el-select v-model="roundForm.interviewMethod" placeholder="请选择" style="width: 100%" clearable>
            <el-option v-for="m in interviewMethodOptions" :key="m.id" :label="m.label" :value="m.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试时间">
          <el-date-picker
            v-model="roundForm.interviewTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="roundForm.result" style="width: 100%">
            <el-option v-for="r in INTERVIEW_RESULT" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="评分">
          <el-input-number v-model="roundForm.score" :min="0" :max="100" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="总结">
          <el-input v-model="roundForm.summary" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roundDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="roundSubmitting" @click="handleRoundSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.mb-16 {
  margin-bottom: 16px;
}

.ml-8 {
  margin-left: 8px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.offer-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  line-height: 1.8;

  &:last-child {
    border-bottom: none;
  }

  &__salary {
    font-weight: 600;
  }
}
</style>
