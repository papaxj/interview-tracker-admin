<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getJobApplicationList, type JobApplicationVo } from '@/api/application'
import {
  createOffer,
  deleteOffer,
  getOfferList,
  updateOffer,
  type OfferInfoSaveRequest,
  type OfferInfoVo,
} from '@/api/offer'
import { usePagination } from '@/composables/usePagination'
import { OFFER_STATUS } from '@/constants/enums'
import { useAppStore } from '@/stores/app'
import { formatDate, formatMoney } from '@/utils/format'

const appStore = useAppStore()
const applications = ref<JobApplicationVo[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const filterStatus = ref('')

const appMap = computed(() =>
  Object.fromEntries(applications.value.map((a) => [a.id, a.positionName ?? `#${a.id}`])),
)

const { loading, list, total, page, size, load, handlePageChange, handleSizeChange } =
  usePagination<OfferInfoVo>((p, s) => {
    const params: Record<string, unknown> = { page: p, size: s }
    if (filterStatus.value) params.status = filterStatus.value
    return getOfferList(params)
  })

const defaultForm = (): OfferInfoSaveRequest => ({
  applicationId: applications.value[0]?.id ?? 0,
  status: '待确认',
})

const form = reactive<OfferInfoSaveRequest>(defaultForm())

const rules: FormRules = {
  applicationId: [{ required: true, message: '请选择投递', trigger: 'change' }],
}

const dialogTitle = computed(() => (editingId.value ? '编辑 Offer' : '新增 Offer'))

async function fetchApplications() {
  const res = await getJobApplicationList({ page: 1, size: 100, userId: appStore.currentUserId })
  applications.value = res.content
}

function openCreate() {
  editingId.value = null
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: OfferInfoVo) {
  editingId.value = row.id
  Object.assign(form, {
    applicationId: row.applicationId ?? 0,
    baseSalary: row.baseSalary,
    bonusSalary: row.bonusSalary,
    stockValue: row.stockValue,
    signBonus: row.signBonus,
    otherBenefits: row.otherBenefits ?? '',
    offerDate: row.offerDate?.slice(0, 10) ?? '',
    deadlineDate: row.deadlineDate?.slice(0, 10) ?? '',
    joinDate: row.joinDate?.slice(0, 10) ?? '',
    status: row.status ?? '待确认',
    remark: row.remark ?? '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingId.value) {
      await updateOffer(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createOffer({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: OfferInfoVo) {
  await ElMessageBox.confirm('确定删除该 Offer？', '提示', { type: 'warning' })
  await deleteOffer(row.id)
  ElMessage.success('删除成功')
  load()
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
        <span>Offer 管理</span>
        <el-button type="primary" :disabled="!applications.length" @click="openCreate">
          新增 Offer
        </el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 140px" @change="load">
        <el-option v-for="s in OFFER_STATUS" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="投递" min-width="120">
        <template #default="{ row }">{{ appMap[row.applicationId!] ?? row.applicationId }}</template>
      </el-table-column>
      <el-table-column label="基础薪资" width="120">
        <template #default="{ row }">{{ formatMoney(row.baseSalary) }}</template>
      </el-table-column>
      <el-table-column label="奖金" width="100">
        <template #default="{ row }">{{ formatMoney(row.bonusSalary) }}</template>
      </el-table-column>
      <el-table-column label="签字费" width="100">
        <template #default="{ row }">{{ formatMoney(row.signBonus) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Offer日期" width="110">
        <template #default="{ row }">{{ formatDate(row.offerDate)?.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="截止日期" width="110">
        <template #default="{ row }">{{ formatDate(row.deadlineDate)?.slice(0, 10) }}</template>
      </el-table-column>
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
            :label="appMap[app.id]"
            :value="app.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="基础薪资">
            <el-input-number v-model="form.baseSalary" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="奖金">
            <el-input-number v-model="form.bonusSalary" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="股票价值">
            <el-input-number v-model="form.stockValue" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="签字费">
            <el-input-number v-model="form.signBonus" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="Offer日期">
            <el-date-picker v-model="form.offerDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="截止日期">
            <el-date-picker v-model="form.deadlineDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职日期">
            <el-date-picker v-model="form.joinDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="form.status" style="width: 100%">
              <el-option v-for="s in OFFER_STATUS" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="其他福利">
        <el-input v-model="form.otherBenefits" type="textarea" :rows="2" />
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

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
